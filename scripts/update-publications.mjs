import {readFile, writeFile, rename, rm} from 'node:fs/promises';
import {fileURLToPath, pathToFileURL} from 'node:url';

export const orcid = '0000-0002-5028-5716';
export const firstYear = 2026;
export const worksUrl = new URL('https://api.crossref.org/works');
worksUrl.searchParams.set('filter', `orcid:${orcid},from-pub-date:${firstYear}-01-01,type:journal-article`);
worksUrl.searchParams.set('rows', '1000');
worksUrl.searchParams.set('select', 'DOI,title,container-title,author,published,published-online,published-print,type,update-to');
const snapshotPath = fileURLToPath(new URL('../src/publications-auto.json', import.meta.url));
const normalizeOrcid = value => String(value || '').replace(/^https?:\/\/orcid\.org\//i, '').replace(/\/$/, '');
const text = value => String(value || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const doiPattern = /^10\.\d{4,9}\/[^\s<>"?#]+$/i;

function publishedDate(item) {
  const dates = ['published-online', 'published-print', 'published'].flatMap(key => {
    const parts = item[key]?.['date-parts']?.[0];
    if (!Array.isArray(parts) || !Number.isInteger(parts[0])) return [];
    const [year, month = 1, day = 1] = parts;
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
      throw new Error('Crossref returned an invalid publication date.');
    }
    return [date.toISOString().slice(0, 10)];
  });
  if (!dates.length) throw new Error('Crossref returned no publication date.');
  return dates.sort()[0];
}

export function parsePublications(payload, now = new Date()) {
  const message = payload?.message;
  if (payload?.status !== 'ok' || !Array.isArray(message?.items) || !Number.isInteger(message['total-results']) ||
      message['total-results'] !== message.items.length || message.items.length > 1000) {
    throw new Error('Crossref returned an invalid or incomplete publication list.');
  }
  const publications = new Map();
  for (const item of message.items) {
    if (item.type !== 'journal-article' || !Array.isArray(item.author) ||
        !item.author.some(author => normalizeOrcid(author.ORCID) === orcid)) continue;
    // Publication notices are not new research articles.
    const title = text(item.title?.[0]);
    if (item['update-to']?.length || /^(?:correction|erratum|retraction|corrigendum|expression of concern)\b/i.test(title)) continue;
    const doi = String(item.DOI || '').toLowerCase();
    const journal = text(item['container-title']?.[0]);
    if (!doiPattern.test(doi) || !title || title.length > 2000 || !journal || journal.length > 500) {
      throw new Error('Crossref returned incomplete publication metadata.');
    }
    const published = publishedDate(item);
    const year = Number(published.slice(0, 4));
    if (year < firstYear || published > now.toISOString().slice(0, 10)) continue;
    const names = item.author.map(author => {
      const family = text(author.family);
      const initials = text(author.given).split(/[\s-]+/).filter(Boolean).map(part => [...part][0]).join('');
      return family ? `${family}${initials ? ` ${initials}` : ''}` : text(author.name);
    });
    if (names.some(name => !name)) throw new Error('Crossref returned incomplete author metadata.');
    // Keep the PI visible even when the full author list is abbreviated.
    const pi = names[item.author.findIndex(author => normalizeOrcid(author.ORCID) === orcid)];
    const shown = [...new Set([names[0], names[1], pi].filter(Boolean))];
    const authors = `${shown.join(', ')}${names.length > shown.length ? ', et al.' : ''}`;
    publications.set(doi, {year, published, title, journal, doi, authors});
  }
  return [...publications.values()].sort((a, b) => b.published.localeCompare(a.published) || a.doi.localeCompare(b.doi));
}

export async function refreshPublications({fetchImpl = fetch, output = snapshotPath, now = new Date()} = {}) {
  const previous = await readFile(output, 'utf8');
  const snapshot = JSON.parse(previous);
  if (snapshot.orcid !== orcid || !Array.isArray(snapshot.publications)) throw new Error('Invalid saved publication snapshot.');
  const response = await fetchImpl(worksUrl.href, {
    headers: {'User-Agent': 'TMI-lab-publications/1.0 (+https://tmi-lab.org/)', 'Accept': 'application/json'},
    redirect: 'error',
    signal: AbortSignal.timeout(30_000)
  });
  if (!response.ok) throw new Error(`Crossref request failed (HTTP ${response.status}).`);
  const body = await response.text();
  if (body.length > 5_000_000) throw new Error('Crossref response is unexpectedly large.');
  const incoming = parsePublications(JSON.parse(body), now);
  // Index omissions never remove previously verified articles.
  const merged = new Map(snapshot.publications.map(paper => [paper.doi.toLowerCase(), paper]));
  for (const paper of incoming) merged.set(paper.doi, paper);
  const next = {
    orcid, checked: now.toISOString().slice(0, 10),
    publications: [...merged.values()].sort((a, b) => b.published.localeCompare(a.published) || a.doi.localeCompare(b.doi))
  };
  const serialized = `${JSON.stringify(next, null, 2)}\n`;
  if (serialized !== previous) {
    const temporary = `${output}.${process.pid}.tmp`;
    try {
      await writeFile(temporary, serialized, 'utf8');
      await rename(temporary, output);
    } finally { await rm(temporary, {force: true}); }
  }
  return next;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const snapshot = await refreshPublications();
    console.log(`Publications verified ${snapshot.checked}: ${snapshot.publications.length} ORCID-linked journal articles.`);
  } catch (error) {
    console.error(`Publication refresh failed; the previous list is unchanged. ${error.message}`);
    process.exitCode = 1;
  }
}
