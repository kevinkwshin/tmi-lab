import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, writeFile, rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {once} from 'node:events';
import {request as httpRequest} from 'node:http';
import {validateCvRecords, loadCvRecords, saveCvRecords, cvRecordsRevision, seoulDate, cvRecordsPath} from './cv-records.mjs';
import {createCvEditorServer} from './cv-editor.mjs';

const blank = () => ({version: 1, updatedAt: '2026-11-11', grants: [], conferences: [], journalEntries: []});
const project = () => ({id: 'test-grant', title: 'Clinical AI', titleEn: '', funder: 'NRF', funderEn: '', program: 'Core Research', programEn: '', role: 'PI', start: '2026', end: '2030', grantNumber: '', amount: '', publicAmount: false});
const talk = () => ({id: 'test-talk', title: 'Research & clinical AI', event: 'RSNA', date: '2026-11-29', type: 'oral', authors: ['Shin, Keewon', 'Kim, Namkug'], presenter: 'Shin, Keewon', ownRoles: ['corresponding'], doi: '', url: 'https://example.org/program'});
const crossref = () => ({status: 'ok', message: {DOI: '10.1234/test', type: 'journal-article', title: ['Research &amp; clinical AI'], 'container-title': ['Example Journal'], author: [{family: 'Shin', given: 'Keewon'}, {family: 'Kim', given: 'Namkug'}], published: {'date-parts': [[2026, 10]]}, volume: '12', issue: '3', page: '15-20'}});

test('CV records preserve date precision and verified own roles, and never store a private funding amount', () => {
  const input = blank(); input.grants = [{...project(), amount: 'Private total', publicAmount: false, internalBudget: 'secret'}]; input.conferences = [talk()];
  const parsed = validateCvRecords(input);
  assert.equal(parsed.grants[0].start, '2026');
  assert.equal(parsed.grants[0].amount, '');
  assert(!('internalBudget' in parsed.grants[0]));
  assert.deepEqual(parsed.conferences[0].authors, ['Shin, Keewon', 'Kim, Namkug']);
  assert.deepEqual(parsed.conferences[0].ownRoles, ['corresponding']);
  input.grants[0].publicAmount = true; input.grants[0].amount = 'KRW 300,000,000 (total)';
  assert.equal(validateCvRecords(input).grants[0].amount, 'KRW 300,000,000 (total)');
});

test('CV record validation rejects impossible dates, inverted funding periods, unsafe URLs and duplicate IDs', () => {
  const invalid = [
    {...blank(), conferences: [{...talk(), date: '2026-02-30'}]},
    {...blank(), grants: [{...project(), start: '2027-02', end: '2026-12'}]},
    {...blank(), conferences: [{...talk(), url: 'javascript:alert(1)'}]},
    {...blank(), conferences: [talk(), talk()]},
    {...blank(), conferences: [{...talk(), ownRoles: ['assumed-first-author']}]},
    {...blank(), grants: [{...project(), role: 'Invented role'}]},
    {...blank(), journalEntries: [{doi: '10.1234/test', authors: ['et al.']}]}
  ];
  for (const value of invalid) assert.throws(() => validateCvRecords(value));
});

test('Korean entries require English equivalents for the English PDF without changing the Korean original', () => {
  const input = blank(); input.grants = [{...project(), title: '임상 AI 연구'}];
  assert.throws(() => validateCvRecords(input), /영문 CV/);
  input.grants[0].titleEn = 'Clinical AI research';
  assert.equal(validateCvRecords(input).grants[0].title, '임상 AI 연구');
  input.conferences = [{...talk(), authors: ['신기원', '김남국']}];
  assert.throws(() => validateCvRecords(input), /영문 저자/);
  input.conferences[0].authorsEn = ['Shin, Keewon', 'Kim, Namkug'];
  assert.deepEqual(validateCvRecords(input).conferences[0].authorsEn, ['Shin, Keewon', 'Kim, Namkug']);
});

test('non-Latin journal metadata needs explicit English display overrides while original metadata stays intact', () => {
  const entry = {id: 'korean-paper',doi: '10.1234/korean',type: 'journal-article',title: '한국어 논문',journal: '한국학술지',
    authors: [{family: '신',given: '기원'}, {family: '김',given: '남국'}],date: '2026',published: '2026',year: 2026,
    source: 'https://api.crossref.org/works/10.1234%2Fkorean',verified: '2026-11-12',ownRoles: ['corresponding']};
  const input = {...blank(), journalEntries: [entry]};
  assert.throws(() => validateCvRecords(input), /논문 제목.*영문 CV/);
  entry.titleEn = 'Research article'; assert.throws(() => validateCvRecords(input), /학술지.*영문 CV/);
  entry.journalEn = 'Korean Journal'; assert.throws(() => validateCvRecords(input), /영문 저자/);
  entry.authorsEn = ['Keewon Shin']; assert.throws(() => validateCvRecords(input), /같은 순서/);
  entry.authorsEn.push('Namkug Kim');
  const result = validateCvRecords(input).journalEntries[0];
  assert.equal(result.title, '한국어 논문'); assert.equal(result.journal, '한국학술지');
  assert.deepEqual(result.authors, [{family:'신',given:'기원'},{family:'김',given:'남국'}]);
  assert.equal(result.titleEn, 'Research article'); assert.equal(result.journalEn, 'Korean Journal');
  assert.deepEqual(result.authorsEn, ['Keewon Shin','Namkug Kim']);
});

test('saving is atomic, sets the Seoul input date, and detects a stale editor without losing existing data', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'tmi-cv-records-')); t.after(() => rm(dir, {recursive: true, force: true}));
  const path = join(dir, 'records.json'); const initial = blank();
  await writeFile(path, JSON.stringify(initial));
  const revision = cvRecordsRevision(initial);
  const modified = {...initial, grants: [project()]};
  const result = await saveCvRecords(modified, {path, expectedRevision: revision, now: new Date('2026-11-12T16:00:00Z')});
  assert.equal(result.updatedAt, '2026-11-13');
  assert.equal(seoulDate(new Date('2026-11-12T14:59:00Z')), '2026-11-12');
  assert.equal((await loadCvRecords(path)).grants.length, 1);
  const committed = await readFile(path, 'utf8');
  await assert.rejects(() => saveCvRecords(initial, {path, expectedRevision: revision}), /다른 창/);
  assert.equal(await readFile(path, 'utf8'), committed);
  await assert.rejects(() => saveCvRecords({...initial, grants: [{...project(), role: 'fake'}]}, {path}), /역할/);
  assert.equal(await readFile(path, 'utf8'), committed);
});

async function editor(t, fetchImpl = async () => {throw new Error('Unexpected network request');}) {
  const dir = await mkdtemp(join(tmpdir(), 'tmi-cv-editor-')); const path = join(dir, 'records.json');
  await writeFile(path, JSON.stringify(blank()));
  const server = createCvEditorServer({recordsPath: path, fetchImpl, now: () => new Date('2026-11-12T01:00:00Z')});
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(async () => {server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); await rm(dir, {recursive: true, force: true});});
  const origin = `http://127.0.0.1:${server.address().port}`;
  const page = await fetch(origin); const html = await page.text();
  const token = html.match(/const token = "([a-f0-9]{64})";/)?.[1]; assert(token);
  const headers = {'X-CV-Token': token, Origin: origin, 'Content-Type': 'application/json'};
  const get = () => fetch(`${origin}/api/records`, {headers}).then(response => response.json());
  const post = (route, body, override = {}) => fetch(`${origin}${route}`, {method: 'POST', headers: {...headers,...override}, body: JSON.stringify(body)});
  return {server, path, origin, html, token, headers, get, post};
}

test('local editor blocks CSRF, foreign origins, DNS rebinding and unauthenticated data access', async t => {
  const app = await editor(t);
  assert.equal((await fetch(`${app.origin}/api/records`)).status, 403);
  assert.equal((await app.post('/api/records', {}, {'X-CV-Token': ''})).status, 403);
  assert.equal((await app.post('/api/records', {}, {Origin: 'https://example.com'})).status, 403);
  assert.equal((await app.post('/api/records', {}, {Origin: ''})).status, 403);
  const forgedHostStatus = await new Promise((resolve, reject) => {
    const request = httpRequest(app.origin, {headers: {Host: 'evil.example'}}, response => {response.resume(); resolve(response.statusCode);});
    request.on('error', reject); request.end();
  });
  assert.equal(forgedHostStatus, 403);
  const frame = await fetch(app.origin);
  assert.match(frame.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert(!app.html.includes('__CV_EDITOR_TOKEN__'));
});

test('local editor saves, edits and deletes records, and rejects stale concurrent writes', async t => {
  const app = await editor(t);
  let {records, revision} = await app.get(); records.grants.push(project());
  let response = await app.post('/api/records', {records, revision}); assert.equal(response.status, 200);
  const saved = await response.json(); assert.equal(saved.records.grants.length, 1);
  assert.equal(saved.records.updatedAt, '2026-11-12');
  assert.equal((await app.post('/api/records', {records: blank(), revision})).status, 409);
  saved.records.grants[0].title = 'Edited clinical AI';
  response = await app.post('/api/records', {records: saved.records, revision: saved.revision});
  const edited = await response.json(); assert.equal(edited.records.grants[0].title, 'Edited clinical AI');
  edited.records.grants = [];
  response = await app.post('/api/records', {records: edited.records, revision: edited.revision});
  assert.equal(response.status, 200); assert.equal((await loadCvRecords(app.path)).grants.length, 0);
  const next = await app.get(); next.records.conferences.push(talk());
  const attempts = await Promise.all([app.post('/api/records', next), app.post('/api/records', {...next, records: {...next.records, grants: [project()]}})]);
  assert.deepEqual(attempts.map(result => result.status).sort(), [200, 409]);
});

test('DOI preview uses only the official fixed endpoint and preserves every author before explicit save', async t => {
  const requests = [];
  const app = await editor(t, async (url, options) => {requests.push({url, options}); return {ok: true, json: async () => crossref()};});
  const response = await app.post('/api/lookup', {doi: 'https://doi.org/10.1234/TEST'});
  assert.equal(response.status, 200); const {entry} = await response.json();
  assert.equal(requests[0].url, 'https://api.crossref.org/works/10.1234%2Ftest');
  assert.equal(requests[0].options.redirect, 'error');
  assert.equal(entry.title, 'Research & clinical AI');
  assert.equal(entry.date, '2026-10'); assert.equal(entry.published, '2026-10');
  assert.deepEqual(entry.authors, [{family: 'Shin', given: 'Keewon'}, {family: 'Kim', given: 'Namkug'}]);
  assert.equal((await loadCvRecords(app.path)).journalEntries.length, 0, 'Lookup must not add the paper before confirmation');
  const {records, revision} = await app.get(); records.journalEntries.push({...entry, id: 'test-paper', ownRoles: ['cofirst']});
  const saved = await app.post('/api/records', {records, revision}); assert.equal(saved.status, 200);
  assert.deepEqual((await loadCvRecords(app.path)).journalEntries[0].ownRoles, ['cofirst']);
  assert.equal((await app.post('/api/lookup', {doi: 'http://127.0.0.1/private'})).status, 400);
  assert.equal(requests.length, 1);
});

test('failed DOI lookup and oversized input leave stored records unchanged', async t => {
  const app = await editor(t, async () => ({ok: false, status: 429}));
  const before = await readFile(app.path, 'utf8');
  assert.equal((await app.post('/api/lookup', {doi: '10.1234/test'})).status, 502);
  const response = await app.post('/api/records', {payload: 'x'.repeat(600 * 1024)});
  assert.equal(response.status, 413);
  assert.equal(await readFile(app.path, 'utf8'), before);
});

test('committed CV records validate and never contain a non-public funding amount', async () => {
  const raw = JSON.parse(await readFile(cvRecordsPath, 'utf8'));
  assert.doesNotThrow(() => validateCvRecords(raw));
  for (const grant of raw.grants) if (!grant.publicAmount) assert.equal(grant.amount || '', '');
});
