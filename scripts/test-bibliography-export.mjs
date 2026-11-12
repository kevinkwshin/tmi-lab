import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, writeFile, readdir, rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {
  normalizeDOI, parseCrossrefWork, citationKeyForDOI, escapeBibTeX,
  loadBibliographyMetadata, mergeEnteredBibliography, generateBibliography, refreshBibliographyMetadata, exportBibliography
} from './export-bibliography.mjs';
import {publications} from '../src/publications.mjs';

const now = new Date('2026-11-12T02:00:00Z');
const doi = '10.1000/full-authors';
const work = {
  DOI: doi, type: 'journal-article', title: ['AI &amp; CT: 50% {evaluation} #1_2'],
  'container-title': ['Journal of R&amp;D'],
  author: [
    {family: 'Ryu', given: 'Seung Min'},
    {family: 'Shin', given: 'Keewon', ORCID: 'https://orcid.org/0000-0002-5028-5716'},
    {name: 'Research and Development Consortium'},
    {family: 'Kim', given: 'Namkug'}
  ],
  'published-online': {'date-parts': [[2026, 10, 22]]},
  'published-print': {'date-parts': [[2027, 1]]},
  volume: '5', issue: '2', page: '10-20'
};
const payload = item => ({status: 'ok', message: structuredClone(item)});
const record = (overrides = {}) => ({...parseCrossrefWork(payload(work), doi, '2026-11-05'), ...overrides});
const cache = (records = {[doi]: record()}) => ({version: 1, checked: '2026-11-05', records, failures: []});
const displayed = [{doi, title: 'Short display title', authors: 'Ryu SM, Shin K, et al.', year: 2026, category: 'imaging', ownRoles: ['corresponding']}];

test('normalizes DOI links and rejects malformed identifiers', () => {
  assert.equal(normalizeDOI(' HTTPS://DOI.ORG/10.1000/FULL-AUTHORS '), doi);
  for (const value of ['', 'javascript:alert(1)', '10.1000/has space', '10.1000/{latex}', '10.1000/a?query=1']) {
    assert.throws(() => normalizeDOI(value));
  }
});

test('preserves structured author order, corporate authors, identifiers and publication date precision', () => {
  const result = parseCrossrefWork(payload(work), doi, '2026-11-12');
  assert.deepEqual(result.authors.map(author => author.family || author.name), ['Ryu', 'Shin', 'Research and Development Consortium', 'Kim']);
  assert.equal(result.authors[1].orcid, '0000-0002-5028-5716');
  assert.equal(result.date, '2026-10-22');
  assert.equal(result.dates.print, '2027-01');
  assert.equal(result.year, 2026);
  assert.equal(result.verified, '2026-11-12');
  assert.equal(result.title, 'AI & CT: 50% {evaluation} #1_2');
  assert.equal(result.source, 'https://api.crossref.org/works/10.1000%2Ffull-authors');
  const yearOnly = structuredClone(work);
  delete yearOnly['published-online'];
  delete yearOnly['published-print'];
  yearOnly.published = {'date-parts': [[2024]]};
  assert.equal(parseCrossrefWork(payload(yearOnly), doi).date, '2024');
});

for (const [label, changed] of [
  ['wrong DOI', {...work, DOI: '10.1000/somebody-else'}],
  ['missing authors', {...work, author: []}],
  ['abbreviated authors', {...work, author: [{name: 'Shin et al.'}]}],
  ['missing author names', {...work, author: [{given: 'Keewon'}]}],
  ['wrong publication type', {...work, type: 'posted-content'}],
  ['invalid date', {...work, 'published-online': {'date-parts': [[2026, 2, 30]]}}],
  ['missing title', {...work, title: []}]
]) {
  test(`rejects ${label} instead of manufacturing a bibliographic record`, () => {
    assert.throws(() => parseCrossrefWork(payload(changed), doi));
  });
}

test('escapes TeX special characters once without turning source text into commands', () => {
  assert.equal(escapeBibTeX('a\\b {c} 5% #1_2 & $ ~ ^'), 'a\\textbackslash{}b \\{c\\} 5\\% \\#1\\_2 \\& \\$ \\textasciitilde{} \\textasciicircum{}');
  const {bibtex} = generateBibliography(displayed, cache());
  assert.match(bibtex, /author = \{Ryu, Seung Min and Shin, Keewon and \{Research and Development Consortium\} and Kim, Namkug\}/);
  assert.match(bibtex, /title = \{\{AI \\& CT: 50\\% \\\{evaluation\\\} \\#1\\_2\}\}/);
  assert.match(bibtex, /pages = \{10--20\}/);
  assert.doesNotMatch(bibtex, /et al\.|Short display title/);
});

test('uses stable DOI-derived keys even if corrected title, author and publication year change', () => {
  assert.equal(citationKeyForDOI(doi), citationKeyForDOI(doi.toUpperCase()));
  const first = generateBibliography(displayed, cache()).entries[0];
  const corrected = record({title: 'Corrected', authors: [{family: 'Changed', given: 'Name'}], year: 2025, date: '2025'});
  const second = generateBibliography(displayed, cache({[doi]: corrected})).entries[0];
  assert.equal(first.citationKey, second.citationKey);
});

test('reports missing coverage and never falls back to abbreviated display authors', () => {
  const result = generateBibliography([...displayed, {doi: '10.1000/missing', authors: 'Shin K, et al.'}], cache());
  assert.equal(result.entries.length, 1);
  assert.deepEqual(result.coverage, {scope: 'DOIs in the website publication list only; this is not a complete career bibliography.', requested: 2, exported: 1, missing: 1});
  assert.equal(result.missing[0].doi, '10.1000/missing');
  assert.match(result.bibtex, /% OMITTED: 10\.1000\/missing/);
  assert.equal((result.bibtex.match(/@article\{/g) || []).length, 1);
});

test('preserves manually curated category and author-role flags without mutating their source', () => {
  const input = structuredClone(displayed);
  const result = generateBibliography(input, cache());
  assert.deepEqual(result.entries[0].manual, {category: 'imaging', ownRoles: ['corresponding']});
  result.entries[0].manual.ownRoles.push('cofirst');
  assert.deepEqual(input, displayed);
});

test('exports deterministically, deduplicates DOI variants and keeps article numbers separate from pages', () => {
  const otherDOI = '10.1000/older';
  const otherRecord = record({doi: otherDOI, source: 'https://api.crossref.org/works/10.1000%2Folder', date: '2025', year: 2025, pages: 'e100', articleNumber: 'e100'});
  const metadata = cache({[otherDOI]: otherRecord, [doi]: record()});
  const input = [...displayed, {doi: otherDOI}, {doi: doi.toUpperCase()}];
  const first = generateBibliography(input, metadata);
  const second = generateBibliography([...input].reverse(), metadata);
  assert.equal(first.bibtex, second.bibtex);
  assert.deepEqual(first.entries.map(entry => entry.doi), [doi, otherDOI]);
  assert.match(first.bibtex, /eid = \{e100\}/);
  assert.doesNotMatch(first.bibtex, /pages = \{e100\}/);
});

async function withCache(run) {
  const folder = await mkdtemp(join(tmpdir(), 'tmi-bibliography-'));
  const output = join(folder, 'metadata.json');
  const original = cache({[doi]: record({authorRoles: {corresponding: ['0000-0002-5028-5716']}, cv: {selected: true}})});
  await writeFile(output, JSON.stringify(original));
  try { await run({folder, output, original}); }
  finally { await rm(folder, {recursive: true, force: true}); }
}

test('partial network failure retains the previous verified record and saves only validated successes atomically', async () => {
  await withCache(async ({folder, output, original}) => {
    const freshDOI = '10.1000/new';
    let requests = 0;
    const result = await refreshBibliographyMetadata({papers: [...displayed, {doi: freshDOI}], output, now, fetchImpl: async (url, options) => {
      requests++;
      assert.equal(options.redirect, 'error');
      assert.equal(options.headers.Accept, 'application/json');
      if (decodeURIComponent(new URL(url).pathname).endsWith(doi)) return new Response('Unavailable', {status: 503});
      return new Response(JSON.stringify(payload({...work, DOI: freshDOI, title: ['New verified paper']})));
    }});
    assert.equal(requests, 2);
    assert.deepEqual(result.cache.records[doi], original.records[doi]);
    assert.equal(result.cache.records[freshDOI].verified, '2026-11-12');
    assert.equal(result.cache.checked, original.checked);
    assert.equal(result.failures.length, 1);
    assert.equal(result.failures[0].doi, doi);
    assert.deepEqual(await readdir(folder), ['metadata.json']);
    assert.deepEqual(JSON.parse(await readFile(output, 'utf8')), result.cache);
  });
});

test('successful metadata correction preserves nonbibliographic author-role flags and removes obsolete source fields', async () => {
  await withCache(async ({output}) => {
    const withoutPage = structuredClone(work);
    delete withoutPage.page;
    const result = await refreshBibliographyMetadata({papers: displayed, output, now, fetchImpl: async () => new Response(JSON.stringify(payload(withoutPage)))});
    assert.equal(result.failures.length, 0);
    assert.equal(result.cache.checked, '2026-11-12');
    assert.equal(result.cache.records[doi].pages, undefined);
    assert.deepEqual(result.cache.records[doi].authorRoles, {corresponding: ['0000-0002-5028-5716']});
    assert.deepEqual(result.cache.records[doi].cv, {selected: true});
  });
});

test('invalid response JSON never corrupts a previously verified record', async () => {
  await withCache(async ({folder, output, original}) => {
    const result = await refreshBibliographyMetadata({papers: displayed, output, now, fetchImpl: async () => new Response('<html>not metadata</html>')});
    assert.deepEqual(result.cache.records, original.records);
    assert.equal(result.failures.length, 1);
    assert.deepEqual(await readdir(folder), ['metadata.json']);
  });
});

test('invalid saved cache fails before fetching or overwriting it', async () => {
  await withCache(async ({output}) => {
    await writeFile(output, '{broken');
    let requests = 0;
    await assert.rejects(refreshBibliographyMetadata({papers: displayed, output, fetchImpl: async () => { requests++; }}));
    assert.equal(requests, 0);
    assert.equal(await readFile(output, 'utf8'), '{broken');
  });
});

test('offline file export produces the same bytes as pure generation', async () => {
  await withCache(async ({folder, output}) => {
    const destination = join(folder, 'publications.bib');
    const result = await exportBibliography({papers: displayed, metadataPath: output, output: destination});
    assert.equal(await readFile(destination, 'utf8'), result.bibtex);
    assert.deepEqual(await readdir(folder), ['metadata.json', 'publications.bib']);
  });
});

test('a locally confirmed new DOI exports offline before the separate registry cache is refreshed', async () => {
  await withCache(async ({folder, output, original}) => {
    const importedDOI = '10.1000/locally-confirmed';
    const imported = record({doi: importedDOI, source: 'https://api.crossref.org/works/10.1000%2Flocally-confirmed', ownRoles: ['cofirst'], titleEn: 'English title', authorsEn: ['First Author', 'Keewon Shin', 'Consortium', 'Last Author']});
    const destination = join(folder, 'publications.bib');
    const result = await exportBibliography({papers: [...displayed, {doi: importedDOI}], metadataPath: output, output: destination, enteredEntries: [imported]});
    assert.equal(result.coverage.exported, 2);
    assert.deepEqual(result.missing, []);
    assert.equal((result.bibtex.match(/@article\{/g) || []).length, 2);
    assert.deepEqual(result.entries.find(entry => entry.doi === importedDOI).manual.ownRoles, ['cofirst']);
    assert.equal(result.entries.find(entry => entry.doi === importedDOI).manual.titleEn, 'English title');
    assert.deepEqual(JSON.parse(await readFile(output, 'utf8')), original, 'Offline export must not write the metadata cache.');
  });
});

test('newest verified source metadata wins while manual roles and English equivalents survive', () => {
  const metadata = cache({[doi]: record({verified: '2026-11-12', title: 'Latest publisher title', ownRoles: ['corresponding']})});
  const entered = record({verified: '2026-11-05', title: 'Earlier publisher title', ownRoles: [], titleEn: 'Manually supplied English equivalent', authorsEn: ['A', 'B', 'C', 'D']});
  const original = structuredClone({metadata, entered});
  const merged = mergeEnteredBibliography(metadata, [entered]);
  assert.equal(merged.records[doi].title, 'Latest publisher title');
  assert.equal(merged.records[doi].verified, '2026-11-12');
  assert.deepEqual(merged.records[doi].ownRoles, []);
  assert.equal(merged.records[doi].titleEn, entered.titleEn);
  assert.deepEqual(merged.records[doi].authorsEn, ['A', 'B', 'C', 'D']);
  assert.deepEqual({metadata, entered}, original);
  assert.throws(() => mergeEnteredBibliography(metadata, [{...entered, authors: 'Shin K, et al.'}]));
});

test('saved official metadata exports verified names and accounts explicitly for any uncached site DOI', async () => {
  const result = generateBibliography(publications, await loadBibliographyMetadata());
  // A newly discovered article can temporarily lack full metadata. That must not
  // make unit tests prevent deployment of the previous verified bibliography.
  assert.equal(result.coverage.exported + result.coverage.missing, result.coverage.requested);
  assert.equal(result.coverage.requested, new Set(publications.map(paper => normalizeDOI(paper.doi))).size);
  assert(result.entries.every(entry => entry.authors.length && entry.source.startsWith('https://api.crossref.org/works/')));
});
