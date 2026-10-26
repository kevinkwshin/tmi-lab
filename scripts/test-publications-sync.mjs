import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, writeFile, readdir, rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {orcid, firstYear, parsePublications, refreshPublications} from './update-publications.mjs';
import {mergePublications, publications} from '../src/publications.mjs';
import {content} from '../src/content.mjs';

const now = new Date('2026-10-26T05:00:00Z');
const paper = {
  DOI: '10.1007/s00261-026-05813-6', type: 'journal-article',
  title: ['Deep learning-based detection of pneumoperitoneum on computed tomography: performance and clinical feasibility'],
  'container-title': ['Abdominal Radiology'],
  'published-online': {'date-parts': [[2026, 10, 22]]},
  'published-print': {'date-parts': [[2027, 1]]},
  author: [
    {given: 'Hyo Seon', family: 'Ryu'}, {given: 'Se Hoon', family: 'Jung'},
    {given: 'Keewon', family: 'Shin', ORCID: `https://orcid.org/${orcid}`}
  ]
};
const payload = items => ({status: 'ok', message: {'total-results': items.length, items}});
const change = overrides => ({...structuredClone(paper), ...overrides});

test('reads an ORCID-linked journal article, preserving the online year and PI in the author list', () => {
  const [result] = parsePublications(payload([paper]), now);
  assert.deepEqual(result, {
    year: 2026, published: '2026-10-22', title: paper.title[0], journal: 'Abdominal Radiology',
    doi: paper.DOI, authors: 'Ryu HS, Jung SH, Shin K'
  });
});

test('does not add namesakes, missing identity, conference material, notices, or unpublished future papers', () => {
  const items = [
    change({author: [{given: 'Keewon', family: 'Shin', ORCID: 'https://orcid.org/0000-0000-0000-0000'}]}),
    change({author: [{given: 'Keewon', family: 'Shin'}]}),
    change({type: 'proceedings-article'}),
    change({title: ['Correction: An earlier paper']}),
    change({'update-to': [{type: 'retraction'}]}),
    change({'published-online': {'date-parts': [[2026, 11, 1]]}, 'published-print': undefined}),
    change({'published-online': {'date-parts': [[2025, 12, 1]]}, 'published-print': undefined})
  ];
  assert.deepEqual(parsePublications(payload(items), now), []);
});

test('deduplicates DOI case variants and accepts a bare ORCID', () => {
  const duplicate = change({DOI: paper.DOI.toUpperCase()});
  duplicate.author[2].ORCID = orcid;
  assert.equal(parsePublications(payload([paper, duplicate]), now).length, 1);
});

for (const [label, invalid] of [
  ['missing title', change({title: []})],
  ['missing journal', change({'container-title': []})],
  ['invalid DOI', change({DOI: 'javascript:alert(1)'})],
  ['missing date', change({'published-online': undefined, 'published-print': undefined})],
  ['invalid date', change({'published-online': {'date-parts': [[2026, 2, 30]]}})],
  ['missing author name', change({author: [{ORCID: orcid}]})]
]) {
  test(`rejects ${label} without accepting partial records`, () => {
    assert.throws(() => parsePublications(payload([paper, invalid]), now));
  });
}

async function withSnapshot(run) {
  const folder = await mkdtemp(join(tmpdir(), 'tmi-publications-'));
  const output = join(folder, 'papers.json');
  const original = JSON.stringify({orcid, checked: '2026-10-19', publications: [{
    year: 2026, published: '2026-01-01', doi: '10.1000/previous', title: 'Previously verified paper',
    journal: 'Journal', authors: 'Shin K'
  }]});
  await writeFile(output, original);
  try { await run({folder, output, original}); } finally { await rm(folder, {recursive: true, force: true}); }
}

test('refresh merges new articles without deleting an earlier index omission and saves atomically', async () => {
  await withSnapshot(async ({folder, output}) => {
    let requests = 0;
    const result = await refreshPublications({output, now, fetchImpl: async (url, options) => {
      requests++;
      const request = new URL(url);
      assert.equal(request.origin, 'https://api.crossref.org');
      assert.match(request.searchParams.get('filter'), new RegExp(`orcid:${orcid}`));
      assert.match(request.searchParams.get('filter'), new RegExp(`from-pub-date:${firstYear}-01-01`));
      assert.equal(options.redirect, 'error');
      return new Response(JSON.stringify(payload([paper])));
    }});
    assert.equal(requests, 1);
    assert.equal(result.checked, '2026-10-26');
    assert.deepEqual(result.publications.map(p => p.doi), [paper.DOI, '10.1000/previous']);
    assert.deepEqual(JSON.parse(await readFile(output, 'utf8')), result);
    assert.deepEqual(await readdir(folder), ['papers.json']);
  });
});

for (const [label, fetchImpl] of [
  ['HTTP 403', async () => new Response('denied', {status: 403})],
  ['rate limit', async () => new Response('limited', {status: 429})],
  ['timeout', async () => { throw new DOMException('timeout', 'TimeoutError'); }],
  ['invalid JSON', async () => new Response('<html>Challenge</html>')],
  ['partial response', async () => new Response(JSON.stringify({status: 'ok', message: {'total-results': 1001, items: [paper]}}))],
  ['invalid metadata', async () => new Response(JSON.stringify(payload([paper, change({title: []})])))]
]) {
  test(`${label} preserves the previous list and checked date without retries`, async () => {
    await withSnapshot(async ({folder, output, original}) => {
      let requests = 0;
      await assert.rejects(refreshPublications({output, now, fetchImpl: (...args) => { requests++; return fetchImpl(...args); }}));
      assert.equal(requests, 1);
      assert.equal(await readFile(output, 'utf8'), original);
      assert.deepEqual(await readdir(folder), ['papers.json']);
    });
  });
}

test('curated entries retain their category, automatic additions are searchable, and dates sort newest first', () => {
  const incoming = parsePublications(payload([paper]), now);
  const automatic = {...incoming[0], doi: '10.1000/new', published: '2026-10-25'};
  const curated = {...incoming[0], doi: paper.DOI.toUpperCase(), category: 'imaging', authors: 'Reviewed author label'};
  const merged = mergePublications([curated], [...incoming, automatic]);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].doi, '10.1000/new');
  assert.equal(merged[0].category, 'other');
  assert.equal(merged[1].category, 'imaging');
  assert.equal(merged[1].authors, 'Reviewed author label');
  for (const lang of ['ko', 'en']) {
    for (const item of [...merged, ...publications]) assert(content[lang].publications.filters[item.category]);
  }
  assert(publications.some(p => p.doi === '10.1007/s00256-026-05328-7'));
});
