import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, writeFile, mkdtemp, rm, readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {parseScholarProfile, refreshScholar, profileUrl} from './update-scholar.mjs';
import {scholarProfile} from '../src/scholar.mjs';
import {scholarView} from '../src/scholar-view.mjs';
import {scholarOverview} from '../src/scholar-overview.mjs';

const html = await readFile(new URL('./fixtures/scholar-profile.html', import.meta.url), 'utf8');
const now = new Date('2026-09-30T00:17:00Z');

test('reads all-time metrics and pairs the yearly graph from public profile markup', () => {
  assert.deepEqual(parseScholarProfile(html, now), {
    profileId: 'prJCNYoAAAAJ', checked: '2026-09-30', citations: 1091, hIndex: 15, i10Index: 18,
    trend: [{year:2020,count:34},{year:2021,count:86},{year:2022,count:128},{year:2023,count:171},{year:2024,count:201},{year:2025,count:274},{year:2026,count:176}]
  });
});

for (const [name, invalid] of [
  ['CAPTCHA page', '<html>Unusual traffic. Please verify you are human.</html>'],
  ['wrong researcher', html.replaceAll('Keewon Shin', 'Another Person')],
  ['missing metric', html.replace('>h-index<', '>unrecognized<')],
  ['missing year count', html.replace('<span class="gsc_g_al">176</span>', '')],
  ['duplicate year', html.replace('>2026<', '>2025<')],
  ['future year', html.replace('>2026<', '>2027<')],
  ['non-numeric metric', html.replace('>1,091<', '>N/A<')],
  ['negative metric', html.replace('>1,091<', '>-1<')],
  ['partial count', html.replace('>1,091<', '>1.1k<')],
  ['inconsistent totals', html.replace('>1,091<', '>100<')]
]) {
  test(`rejects ${name} without accepting partial data`, () => assert.throws(() => parseScholarProfile(invalid, now)));
}

async function withSnapshot(run) {
  const folder = await mkdtemp(join(tmpdir(), 'tmi-scholar-'));
  const output = join(folder, 'metrics.json');
  const original = JSON.stringify({checked:'2026-09-23', citations:1100});
  await writeFile(output, original);
  try { await run({folder, output, original}); } finally { await rm(folder, {recursive:true, force:true}); }
}

test('refresh performs one profile request, allows legitimate count decreases and atomically saves validated data', async () => {
  await withSnapshot(async ({folder, output}) => {
    let requests = 0;
    const metrics = await refreshScholar({output, now, fetchImpl:async (url, options) => {
      requests++;
      assert.equal(url, profileUrl);
      assert.match(url, /\/citations\?user=prJCNYoAAAAJ&hl=en$/);
      assert.equal(options.redirect, 'error');
      return new Response(html, {status:200});
    }});
    assert.equal(requests, 1);
    assert.equal(metrics.citations, 1091);
    assert.deepEqual(JSON.parse(await readFile(output, 'utf8')), metrics);
    assert.deepEqual(await readdir(folder), ['metrics.json']);
  });
});

for (const [name, fetchImpl] of [
  ['rate limit', async () => new Response('blocked', {status:429})],
  ['denied access', async () => new Response('blocked', {status:403})],
  ['HTTP 200 challenge', async () => new Response('<html>CAPTCHA</html>')],
  ['timeout', async () => { throw new DOMException('timeout', 'TimeoutError'); }],
  ['broken graph', async () => new Response(html.replace('>176<', '>NaN<'))]
]) {
  test(`${name} leaves the previous data and date byte-for-byte intact, with no retry`, async () => {
    await withSnapshot(async ({output, original}) => {
      let requests = 0;
      await assert.rejects(refreshScholar({output, now, fetchImpl:(...args) => { requests++; return fetchImpl(...args); }}));
      assert.equal(requests, 1);
      assert.equal(await readFile(output, 'utf8'), original);
    });
  });
}

test('citation charts scale with future counts and do not label a missing current year', () => {
  const prior = {trend:scholarProfile.trend, checked:scholarProfile.checked};
  try {
    scholarProfile.trend = [{year:2026, count:1234}];
    scholarProfile.checked = '2027-01-01';
    const detail = scholarView('en', String);
    const overview = scholarOverview('en', String);
    const height = Number(detail.match(/--bar-size:([\d.]+)%/)[1]);
    assert(height > 70 && height <= 85);
    assert.doesNotMatch(overview, /scholar-year-partial|\* 2027/);
    assert.match(overview, /2027-01-01/);
  } finally { Object.assign(scholarProfile, prior); }
});
