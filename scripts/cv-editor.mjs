import {createServer} from 'node:http';
import {randomBytes, timingSafeEqual} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {cvRecordsPath, loadCvRecords, saveCvRecords, cvRecordsRevision, seoulDate} from './cv-records.mjs';
import {normalizeDOI, parseCrossrefWork} from './export-bibliography.mjs';

const htmlPath = fileURLToPath(new URL('./cv-editor.html', import.meta.url));
const sameToken = (a, b) => typeof a === 'string' && Buffer.byteLength(a) === Buffer.byteLength(b) && timingSafeEqual(Buffer.from(a), Buffer.from(b));

async function readJSON(request) {
  if (request.headers['content-type']?.split(';')[0] !== 'application/json') {
    throw Object.assign(new Error('JSON 형식으로 보내주세요.'), {statusCode: 415});
  }
  const chunks = [];
  let length = 0;
  await new Promise((resolve, reject) => {
    request.on('data', chunk => {length += chunk.length; if (length <= 512 * 1024) chunks.push(chunk); else chunks.length = 0;});
    request.on('end', () => length > 512 * 1024 ? reject(Object.assign(new Error('입력 데이터가 너무 큽니다.'), {statusCode: 413})) : resolve());
    request.on('error', reject);
  });
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw Object.assign(new Error('JSON 데이터를 읽을 수 없습니다.'), {statusCode: 400}); }
}

export function createCvEditorServer({recordsPath = cvRecordsPath, fetchImpl = fetch, now = () => new Date()} = {}) {
  const token = randomBytes(32).toString('hex');
  const nonce = randomBytes(24).toString('base64');
  let writeQueue = Promise.resolve();
  const server = createServer(async (request, response) => {
    const origin = `http://127.0.0.1:${server.address().port}`;
    const send = (status, data, type = 'application/json; charset=utf-8') => {
      response.writeHead(status, {'Content-Type': type, 'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer',
        'Content-Security-Policy': `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'`});
      response.end(type.startsWith('application/json') ? JSON.stringify(data) : data);
    };
    try {
      if (request.headers.host !== new URL(origin).host ||
          (request.headers.origin && request.headers.origin !== origin) ||
          request.headers['sec-fetch-site'] === 'cross-site') return send(403, {error: '이 편집기는 이 컴퓨터에서만 사용할 수 있습니다.'});
      const route = new URL(request.url, origin).pathname;
      if (request.method === 'GET' && route === '/') {
        const html = (await readFile(htmlPath, 'utf8')).replaceAll('__CV_EDITOR_NONCE__', nonce).replace('__CV_EDITOR_TOKEN__', JSON.stringify(token));
        return send(200, html, 'text/html; charset=utf-8');
      }
      if (!sameToken(request.headers['x-cv-token'], token)) return send(403, {error: '편집기 세션이 만료되었습니다. 페이지를 새로고침하세요.'});
      if (request.method === 'GET' && route === '/api/records') {
        const records = await loadCvRecords(recordsPath);
        return send(200, {records, revision: cvRecordsRevision(records)});
      }
      if (request.method === 'POST' && request.headers.origin !== origin) return send(403, {error: '편집기 페이지에서 저장해주세요.'});
      if (request.method === 'POST' && route === '/api/records') {
        const body = await readJSON(request);
        if (typeof body.revision !== 'string' || !/^[a-f0-9]{64}$/.test(body.revision)) return send(400, {error: '데이터를 새로고침한 뒤 저장해주세요.'});
        const pending = writeQueue.then(() => saveCvRecords(body.records, {path: recordsPath, expectedRevision: body.revision, now: now()}));
        writeQueue = pending.catch(() => {});
        const records = await pending;
        return send(200, {records, revision: cvRecordsRevision(records)});
      }
      if (request.method === 'POST' && route === '/api/lookup') {
        const body = await readJSON(request);
        const doi = normalizeDOI(body.doi);
        const result = await fetchImpl(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
          headers: {'Accept': 'application/json', 'User-Agent': 'TMI-lab-CV-editor/1.0 (+https://tmi-lab.org/)'},
          signal: AbortSignal.timeout(15000), redirect: 'error'
        });
        if (!result.ok) return send(502, {error: `Crossref 조회에 실패했습니다(HTTP ${result.status}). DOI를 확인하거나 나중에 다시 시도하세요.`});
        const metadata = parseCrossrefWork(await result.json(), doi, seoulDate(now()));
        return send(200, {entry: {...metadata, published: metadata.date}});
      }
      return send(404, {error: '지원하지 않는 요청입니다.'});
    } catch (error) {
      const status = error.statusCode || (error.code ? 500 : 400);
      const message = status >= 500 ? '파일을 저장하거나 읽지 못했습니다. 터미널에서 오류를 확인하세요.' : error.message;
      if (status >= 500) console.error(error);
      if (!response.headersSent) send(status, {error: message});
      else response.end();
    }
  });
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.CV_EDITOR_PORT || 4174);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('CV_EDITOR_PORT는 1024–65535 범위여야 합니다.');
  const server = createCvEditorServer();
  server.on('error', error => { console.error(`CV 편집기를 시작하지 못했습니다: ${error.message}`); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => {
    console.log(`CV 입력 편집기: http://127.0.0.1:${port}/`);
    console.log('저장한 공개 기록은 src/cv-records.json에 반영됩니다. 사이트 반영은 GitHub에 변경을 올린 후 이루어집니다.');
    console.log('종료: Ctrl+C');
  });
}
