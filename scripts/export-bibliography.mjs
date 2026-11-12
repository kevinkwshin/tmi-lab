import {readFile, writeFile, rename, rm, mkdir} from 'node:fs/promises';
import {createHash, randomUUID} from 'node:crypto';
import {dirname} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {publications as sitePublications} from '../src/publications.mjs';

export const bibliographyMetadataPath = fileURLToPath(new URL('../src/bibliography-metadata.json', import.meta.url));
export const bibliographyOutputPath = fileURLToPath(new URL('../dist/publications.bib', import.meta.url));
export const bibliographyCoverage = 'DOIs in the website publication list only; this is not a complete career bibliography.';
const doiPattern = /^10\.\d{4,9}\/[^\s<>"?#{}\\]+$/i;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const sourceFields = new Set(['doi', 'type', 'title', 'journal', 'authors', 'dates', 'date', 'year', 'published', 'volume', 'issue', 'pages', 'articleNumber', 'url', 'source', 'verified']);
const manualFields = record => Object.fromEntries(Object.entries(record).filter(([key]) => !sourceFields.has(key)));

export function normalizeDOI(value) {
  const doi = String(value || '').trim().replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '').toLowerCase();
  if (!doiPattern.test(doi)) throw new Error('Invalid DOI.');
  return doi;
}

function plainText(value) {
  if (typeof value !== 'string') return '';
  const entities = {amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' '};
  return value.replace(/<[^>]*>/g, '').replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (match, name) => {
    if (!name.startsWith('#')) return entities[name.toLowerCase()] ?? match;
    const point = name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : Number(name.slice(1));
    return point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff) ? String.fromCodePoint(point) : '';
  }).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
}

function dateString(parts) {
  if (!Array.isArray(parts) || parts.length < 1 || parts.length > 3 || parts.some(part => !Number.isInteger(part))) {
    throw new Error('Missing or invalid publication date.');
  }
  const [year, month = 1, day = 1] = parts;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (year < 1000 || year > 9999 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error('Missing or invalid publication date.');
  }
  return parts.map((part, index) => String(part).padStart(index ? 2 : 4, '0')).join('-');
}

function parseAuthor(author) {
  if (!object(author)) throw new Error('Missing structured author metadata.');
  const result = {};
  for (const field of ['family', 'given', 'name', 'suffix']) {
    const value = plainText(author[field]);
    if (value) result[field] = value;
  }
  if (!result.family && !result.name) throw new Error('Missing structured author name.');
  if (/\bet\s+al\.?\s*$/i.test(result.family || result.name)) throw new Error('Abbreviated author metadata is not exportable.');
  if (author.ORCID) {
    const orcid = String(author.ORCID).replace(/^https?:\/\/orcid\.org\//i, '').replace(/\/$/, '');
    if (/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/i.test(orcid)) result.orcid = orcid;
  }
  return result;
}

export function parseCrossrefWork(payload, expectedDOI, verified = new Date().toISOString().slice(0, 10)) {
  const item = payload?.message;
  const doi = normalizeDOI(expectedDOI);
  if (payload?.status !== 'ok' || !object(item) || normalizeDOI(item.DOI) !== doi || item.type !== 'journal-article') {
    throw new Error('Crossref did not return the requested journal article.');
  }
  const title = plainText(item.title?.[0]);
  const journal = plainText(item['container-title']?.[0]);
  if (!title || title.length > 2000 || !journal || journal.length > 500 || !Array.isArray(item.author) || !item.author.length) {
    throw new Error('Incomplete Crossref title, journal, or structured authors.');
  }
  const authors = item.author.map(parseAuthor);
  const dates = {};
  for (const [input, output] of [['published', 'published'], ['published-online', 'online'], ['published-print', 'print']]) {
    if (item[input]?.['date-parts'] !== undefined) dates[output] = dateString(item[input]['date-parts'][0]);
  }
  const comparableDate = value => {
    const [year, month = '01', day = '01'] = value.split('-');
    return `${year}-${month}-${day}`;
  };
  const candidates = Object.values(dates).sort((a, b) => comparableDate(a).localeCompare(comparableDate(b)) || b.length - a.length);
  if (!candidates.length) throw new Error('Missing publication date.');
  // Preserve the precision deposited by the publisher; never invent January 1.
  const date = candidates[0];
  const record = {doi, type: 'journal-article', title, journal, authors, dates, date, year: Number(date.slice(0, 4))};
  for (const [input, output] of [['volume', 'volume'], ['issue', 'issue'], ['page', 'pages'], ['article-number', 'articleNumber']]) {
    const value = plainText(item[input]);
    if (value) record[output] = value;
  }
  return {...record, url: `https://doi.org/${doi}`, source: `https://api.crossref.org/works/${encodeURIComponent(doi)}`, verified};
}

export const normalizeCrossrefMetadata = parseCrossrefWork;

function emptyCache() {
  return {version: 1, coverage: bibliographyCoverage, checked: null, records: {}, failures: []};
}

function validateCache(cache) {
  if (!object(cache) || cache.version !== 1 || !object(cache.records)) throw new Error('Invalid bibliography metadata cache.');
  for (const [doi, record] of Object.entries(cache.records)) {
    if (!object(record) || normalizeDOI(doi) !== doi || normalizeDOI(record.doi) !== doi || record.type !== 'journal-article' ||
        !record.title || !record.journal || !Array.isArray(record.authors) || !record.authors.length ||
        !/^\d{4}(?:-\d{2})?(?:-\d{2})?$/.test(record.date) || dateString(record.date.split('-').map(Number)) !== record.date ||
        record.year !== Number(record.date.slice(0, 4)) || !/^\d{4}-\d{2}-\d{2}$/.test(record.verified || '') ||
        record.source !== `https://api.crossref.org/works/${encodeURIComponent(doi)}`) {
      throw new Error(`Invalid cached bibliography record: ${doi}`);
    }
    record.authors.forEach(parseAuthor);
  }
  return cache;
}

export async function loadBibliographyMetadata(path = bibliographyMetadataPath) {
  try { return validateCache(JSON.parse(await readFile(path, 'utf8'))); }
  catch (error) {
    if (error.code === 'ENOENT') return emptyCache();
    throw error;
  }
}

/** Join locally confirmed DOI imports without a network request or source mutation. */
export function mergeEnteredBibliography(metadata, enteredEntries = []) {
  validateCache(metadata);
  if (!Array.isArray(enteredEntries)) throw new Error('Invalid entered bibliography records.');
  const merged = structuredClone(metadata);
  for (const entered of enteredEntries) {
    const doi = normalizeDOI(entered?.doi);
    // Locally entered records must have the same full metadata and provenance as
    // an official cache record. Display labels containing "et al." cannot pass.
    validateCache({version: 1, records: {[doi]: entered}});
    const current = merged.records[doi];
    const source = !current || entered.verified > current.verified ? entered : current;
    // New registry metadata must never overwrite locally maintained role flags
    // or English equivalents, including explicit removal via an empty array.
    merged.records[doi] = structuredClone({...source, ...manualFields(current || {}), ...manualFields(entered)});
  }
  return validateCache(merged);
}

export function citationKeyForDOI(doi) {
  // A title, author correction, or online-to-print date change cannot change the key.
  return `tmi_${createHash('sha256').update(normalizeDOI(doi)).digest('hex').slice(0, 16)}`;
}

export function escapeBibTeX(value) {
  const escapes = {'\\': '\\textbackslash{}', '{': '\\{', '}': '\\}', '&': '\\&', '%': '\\%', '$': '\\$', '#': '\\#', '_': '\\_', '~': '\\textasciitilde{}', '^': '\\textasciicircum{}'};
  return [...String(value)].map(character => escapes[character] || character).join('');
}

function bibAuthor(author) {
  if (!author.family) return `{${escapeBibTeX(author.name)}}`;
  // Group only literal delimiters; ordinary given names remain initializable by .bst styles.
  const namePart = value => /,|\band\b/i.test(value) ? `{${escapeBibTeX(value)}}` : escapeBibTeX(value);
  const family = namePart(author.family);
  const given = author.given ? namePart(author.given) : '';
  if (author.suffix) return `${family}, ${namePart(author.suffix)}, ${given}`;
  return given ? `${family}, ${given}` : family;
}

function bibEntry(entry) {
  const fields = [
    ['author', entry.authors.map(bibAuthor).join(' and ')],
    ['title', `{${escapeBibTeX(entry.title)}}`],
    ['journal', escapeBibTeX(entry.journal)],
    ['year', String(entry.year)],
    ['date', entry.date],
    ['doi', escapeBibTeX(entry.doi)],
    ['url', escapeBibTeX(entry.url)]
  ];
  for (const [field, value] of [['volume', entry.volume], ['number', entry.issue], ['pages', entry.pages], ['eid', entry.articleNumber]]) {
    if (value && !(field === 'pages' && value === entry.articleNumber)) {
      fields.push([field, escapeBibTeX(field === 'pages' ? value.replace(/(?<=\d)[–−-](?=\d)/g, '--') : value)]);
    }
  }
  return `@article{${entry.citationKey},\n${fields.map(([field, value]) => `  ${field} = {${value}}`).join(',\n')}\n}`;
}

export function generateBibliography(papers, metadata) {
  validateCache(metadata);
  const entries = [];
  const missing = [];
  const seen = new Set();
  const bibliographicFields = new Set(['doi', 'year', 'published', 'title', 'journal', 'authors']);
  for (const paper of papers) {
    let doi;
    try { doi = normalizeDOI(paper.doi); }
    catch { missing.push({doi: String(paper.doi || ''), reason: 'Invalid DOI in website publication list.'}); continue; }
    if (seen.has(doi)) continue;
    seen.add(doi);
    const record = metadata.records[doi];
    if (!record) {
      missing.push({doi, reason: 'No verified full Crossref metadata is cached; omitted from BibTeX.'});
      continue;
    }
    const manual = structuredClone({...manualFields(record), ...Object.fromEntries(Object.entries(paper).filter(([key]) => !bibliographicFields.has(key)))});
    entries.push({...structuredClone(record), citationKey: citationKeyForDOI(doi), manual});
  }
  entries.sort((a, b) => b.date.localeCompare(a.date) || a.doi.localeCompare(b.doi));
  const coverage = {scope: bibliographyCoverage, requested: seen.size + missing.filter(item => !doiPattern.test(item.doi)).length, exported: entries.length, missing: missing.length};
  const header = [
    '% TMI-lab selected website publication bibliography (UTF-8).',
    `% ${bibliographyCoverage}`,
    `% Verified full author metadata: ${coverage.exported}/${coverage.requested} DOIs.`,
    '% Generated offline from saved Crossref metadata; do not edit this output.',
    '% Citation keys derive from DOI and remain stable when metadata changes.',
    ...missing.map(item => `% OMITTED: ${item.doi.replace(/[\r\n]/g, ' ')} — ${item.reason}`)
  ].join('\n');
  return {bibtex: `${header}\n\n${entries.map(bibEntry).join('\n\n')}${entries.length ? '\n' : ''}`, entries, missing, coverage};
}

async function atomicWrite(output, value) {
  await mkdir(dirname(output), {recursive: true});
  const temporary = `${output}.${process.pid}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, value, {encoding: 'utf8', flag: 'wx'});
    await rename(temporary, output);
  } finally { await rm(temporary, {force: true}); }
}

export async function refreshBibliographyMetadata({papers = sitePublications, fetchImpl = fetch, output = bibliographyMetadataPath, now = new Date()} = {}) {
  const previous = await loadBibliographyMetadata(output);
  const records = structuredClone(previous.records);
  const verified = now.toISOString().slice(0, 10);
  const failures = [];
  let updated = 0;
  for (const doi of [...new Set(papers.map(paper => normalizeDOI(paper.doi)))].sort()) {
    try {
      const response = await fetchImpl(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
        headers: {'User-Agent': 'TMI-lab-bibliography/1.0 (+https://tmi-lab.org/)', 'Accept': 'application/json'},
        redirect: 'error', signal: AbortSignal.timeout(30_000)
      });
      if (!response.ok) throw new Error(`Crossref request failed (HTTP ${response.status}).`);
      const body = await response.text();
      if (body.length > 2_000_000) throw new Error('Crossref response is unexpectedly large.');
      const incoming = parseCrossrefWork(JSON.parse(body), doi, verified);
      // Nonbibliographic, manually maintained fields such as authorRoles/cv survive refreshes.
      const old = records[doi] || {};
      const manual = manualFields(old);
      records[doi] = {...manual, ...incoming};
      updated++;
    } catch (error) {
      failures.push({doi, attempted: verified, reason: String(error.message).replace(/[\r\n]/g, ' ').slice(0, 300)});
    }
  }
  const cache = {...previous, version: 1, coverage: bibliographyCoverage, checked: failures.length ? previous.checked : verified, lastAttempt: verified, records, failures};
  validateCache(cache);
  await atomicWrite(output, `${JSON.stringify(cache, null, 2)}\n`);
  return {cache, updated, failures, coverage: generateBibliography(papers, cache).coverage};
}

export async function exportBibliography({papers = sitePublications, metadataPath = bibliographyMetadataPath, output = bibliographyOutputPath, enteredEntries = []} = {}) {
  const metadata = mergeEnteredBibliography(await loadBibliographyMetadata(metadataPath), enteredEntries);
  const report = generateBibliography(papers, metadata);
  await atomicWrite(output, report.bibtex);
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const flags = process.argv.slice(2);
    if (flags.length > 1 || flags.some(flag => flag !== '--refresh')) throw new Error('Usage: node scripts/export-bibliography.mjs [--refresh]');
    if (flags.includes('--refresh')) {
      const result = await refreshBibliographyMetadata();
      console.log(`Bibliography metadata: ${result.updated} verified; ${result.failures.length} failed. Cached coverage ${result.coverage.exported}/${result.coverage.requested}.`);
      for (const failure of result.failures) console.error(`${failure.doi}: ${failure.reason}`);
      if (result.failures.length) process.exitCode = 1;
    } else {
      const recordsPath = new URL('../src/cv-records.json', import.meta.url);
      const {journalEntries} = JSON.parse(await readFile(recordsPath, 'utf8'));
      if (!Array.isArray(journalEntries)) throw new Error('Invalid local DOI import list.');
      const result = await exportBibliography({enteredEntries: journalEntries});
      console.log(`Exported ${result.coverage.exported}/${result.coverage.requested} website publication DOIs to dist/publications.bib.`);
      for (const item of result.missing) console.error(`${item.doi}: ${item.reason}`);
    }
  } catch (error) {
    console.error(`Bibliography operation failed. ${error.message}`);
    process.exitCode = 1;
  }
}
