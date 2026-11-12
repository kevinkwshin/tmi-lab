import {readFile, writeFile, rename, rm, mkdir} from 'node:fs/promises';
import {createHash, randomUUID} from 'node:crypto';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {normalizeDOI} from './export-bibliography.mjs';

export const cvRecordsPath = fileURLToPath(new URL('../src/cv-records.json', import.meta.url));
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const roles = new Set(['cofirst', 'corresponding']);
const limits = {grants: 200, conferences: 1000, journalEntries: 1000};
// The generated English PDF uses a Latin font. Preserve non-Latin originals,
// but require an explicit English display value rather than losing characters.
const nonLatin = /[\p{Letter}--\p{Script=Latin}]/v;

function string(value, label, {required = false, max = 2000} = {}) {
  if (value === undefined || value === null) value = '';
  if (typeof value !== 'string' || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) {
    throw new Error(`${label}: 올바른 텍스트를 입력하세요.`);
  }
  const result = value.trim();
  if (required && !result) throw new Error(`${label}: 필수 항목입니다.`);
  return result;
}

export function validateDate(value, label = '날짜', required = false) {
  const result = string(value, label, {required, max: 10});
  if (!result && !required) return '';
  if (!/^\d{4}(?:-\d{2})?(?:-\d{2})?$/.test(result)) throw new Error(`${label}: YYYY, YYYY-MM 또는 YYYY-MM-DD 형식을 사용하세요.`);
  const [year, month = 1, day = 1] = result.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (year < 1000 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error(`${label}: 존재하지 않는 날짜입니다.`);
  }
  return result;
}

function url(value, label = '링크') {
  const result = string(value, label, {max: 2000});
  if (!result) return '';
  let parsed;
  try { parsed = new URL(result); } catch { throw new Error(`${label}: http(s) 주소를 입력하세요.`); }
  if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password) {
    throw new Error(`${label}: http(s) 주소를 입력하세요.`);
  }
  return parsed.href;
}

function id(value) {
  if (typeof value !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,79}$/i.test(value)) throw new Error('항목 ID가 올바르지 않습니다.');
  return value;
}

function ownRoles(value = []) {
  if (!Array.isArray(value) || value.some(role => !roles.has(role))) throw new Error('본인 기여 표기가 올바르지 않습니다.');
  return [...new Set(value)];
}

function englishEquivalent(value, translated, label) {
  const english = string(translated, `${label} 영문 표기`);
  if ((nonLatin.test(value) && !english) || nonLatin.test(english)) throw new Error(`${label}: 영문 CV/PDF용 영어 표기도 입력하세요.`);
  return english;
}

function grant(value) {
  if (!object(value)) throw new Error('과제 항목이 올바르지 않습니다.');
  const result = {id: id(value.id)};
  for (const field of ['title', 'titleEn', 'funder', 'funderEn', 'program', 'programEn', 'grantNumber']) {
    result[field] = string(value[field], field, {required: ['title', 'funder'].includes(field)});
  }
  for (const field of ['title', 'funder', 'program']) result[`${field}En`] = englishEquivalent(result[field], result[`${field}En`], field);
  if (!['PI', 'Co-I', 'PM', 'Collaborator'].includes(value.role)) throw new Error('과제 역할을 선택하세요.');
  result.role = value.role;
  result.start = validateDate(value.start, '과제 시작일', true);
  result.end = validateDate(value.end, '과제 종료일');
  if (result.end && result.end < result.start.slice(0, result.end.length)) throw new Error('과제 종료일은 시작일 이후여야 합니다.');
  result.publicAmount = value.publicAmount === true;
  // This file is committed to a public repository. Never persist a private amount.
  result.amount = result.publicAmount ? string(value.amount, '공개 연구비', {max: 200}) : '';
  if (nonLatin.test(result.amount) || nonLatin.test(result.grantNumber)) throw new Error('공개 연구비와 과제번호는 영문 CV용 통화·숫자·영문으로 입력하세요.');
  if (!result.amount) result.publicAmount = false;
  return result;
}

function conference(value) {
  if (!object(value)) throw new Error('학회발표 항목이 올바르지 않습니다.');
  const result = {
    id: id(value.id),
    title: string(value.title, '발표 제목', {required: true}),
    event: string(value.event, '학회명', {required: true, max: 500}),
    date: validateDate(value.date, '발표일', true),
    presenter: string(value.presenter, '발표자', {max: 300}),
    url: url(value.url),
    doi: value.doi ? normalizeDOI(value.doi) : '',
    ownRoles: ownRoles(value.ownRoles)
  };
  result.titleEn = englishEquivalent(result.title, value.titleEn, '발표 제목');
  result.eventEn = englishEquivalent(result.event, value.eventEn, '학회명');
  result.presenterEn = englishEquivalent(result.presenter, value.presenterEn, '발표자');
  if (!['oral', 'poster', 'other'].includes(value.type)) throw new Error('구두·포스터·기타 발표 유형을 선택하세요.');
  result.type = value.type;
  if (!Array.isArray(value.authors) || value.authors.length > 500) throw new Error('저자를 한 줄에 한 명씩 입력하세요.');
  result.authors = value.authors.map(name => string(name, '저자', {required: true, max: 300}));
  if (value.authorsEn !== undefined && (!Array.isArray(value.authorsEn) || value.authorsEn.length > 500)) throw new Error('영문 저자 목록을 확인하세요.');
  result.authorsEn = (value.authorsEn || []).map(name => string(name, '영문 저자', {required: true, max: 300}));
  if (((result.authors.some(name => nonLatin.test(name)) || result.authorsEn.length) && result.authorsEn.length !== result.authors.length) || result.authorsEn.some(name => nonLatin.test(name))) {
    throw new Error('저자: 같은 순서와 인원의 영문 저자 목록도 입력하세요.');
  }
  return result;
}

function journal(value) {
  if (!object(value)) throw new Error('논문 항목이 올바르지 않습니다.');
  const doi = normalizeDOI(value.doi);
  const date = validateDate(value.date || value.published, '출판일', true);
  const verified = validateDate(value.verified, '서지정보 확인일', true);
  if (verified.length !== 10 || value.type !== 'journal-article' || value.year !== Number(date.slice(0, 4)) ||
      value.source !== `https://api.crossref.org/works/${encodeURIComponent(doi)}`) {
    throw new Error('Crossref에서 DOI 서지정보를 다시 확인하세요.');
  }
  if (!Array.isArray(value.authors) || !value.authors.length || value.authors.length > 5000) throw new Error('전체 저자 정보가 필요합니다.');
  const authors = value.authors.map(author => {
    if (!object(author)) throw new Error('구조화된 전체 저자 정보가 필요합니다.');
    const parsed = {};
    for (const field of ['given', 'family', 'name', 'suffix', 'orcid']) {
      const text = string(author[field], '저자', {max: 300});
      if (text) parsed[field] = text;
    }
    if ((!parsed.family && !parsed.name) || /\bet\s+al\.?\s*$/i.test(parsed.family || parsed.name)) throw new Error('축약하지 않은 전체 저자명을 확인하세요.');
    return parsed;
  });
  const result = {id: id(value.id), doi, type: 'journal-article',
    title: string(value.title, '논문 제목', {required: true}),
    journal: string(value.journal, '학술지', {required: true, max: 500}),
    authors, date, published: date, year: Number(date.slice(0, 4)), url: `https://doi.org/${doi}`,
    source: value.source, verified, ownRoles: ownRoles(value.ownRoles)};
  result.titleEn = englishEquivalent(result.title, value.titleEn, '논문 제목');
  result.journalEn = englishEquivalent(result.journal, value.journalEn, '학술지');
  if (value.authorsEn !== undefined && (!Array.isArray(value.authorsEn) || value.authorsEn.length > 5000)) throw new Error('영문 저자 목록을 확인하세요.');
  result.authorsEn = (value.authorsEn || []).map(name => string(name, '영문 저자', {required: true, max: 300}));
  const needsEnglishAuthors = result.authors.some(author => ['family', 'given', 'name', 'suffix'].some(field => nonLatin.test(author[field] || '')));
  if (((needsEnglishAuthors || result.authorsEn.length) && result.authorsEn.length !== result.authors.length) || result.authorsEn.some(name => nonLatin.test(name))) {
    throw new Error('논문 저자: 원문과 같은 순서·인원의 영문 저자 목록도 입력하세요.');
  }
  result.dates = {};
  for (const key of ['published', 'online', 'print']) {
    if (value.dates?.[key]) result.dates[key] = validateDate(value.dates[key], '출판일', true);
  }
  if (!Object.keys(result.dates).length) result.dates.published = date;
  for (const field of ['volume', 'issue', 'pages', 'articleNumber']) {
    const text = string(value[field], field, {max: 200});
    if (text) result[field] = text;
  }
  return result;
}

export function validateCvRecords(value) {
  if (!object(value) || value.version !== 1) throw new Error('CV 데이터 버전을 확인하세요.');
  const updatedAt = validateDate(value.updatedAt, 'CV 갱신일', true);
  if (updatedAt.length !== 10) throw new Error('CV 갱신일은 YYYY-MM-DD 형식이어야 합니다.');
  const result = {version: 1, updatedAt};
  for (const [section, parse] of [['grants', grant], ['conferences', conference], ['journalEntries', journal]]) {
    if (!Array.isArray(value[section]) || value[section].length > limits[section]) throw new Error(`${section}: 항목 목록을 확인하세요.`);
    result[section] = value[section].map(parse);
    const keys = result[section].map(record => section === 'journalEntries' ? record.doi : record.id);
    if (new Set(keys).size !== keys.length) throw new Error(`${section}: 중복된 항목이 있습니다.`);
  }
  return result;
}

export function cvRecordsRevision(value) {
  return createHash('sha256').update(JSON.stringify(validateCvRecords(value))).digest('hex');
}

export function seoulDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'}).formatToParts(now);
  const part = key => parts.find(value => value.type === key).value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export async function loadCvRecords(path = cvRecordsPath) {
  return validateCvRecords(JSON.parse(await readFile(path, 'utf8')));
}

export async function saveCvRecords(value, {path = cvRecordsPath, expectedRevision, now = new Date()} = {}) {
  const result = validateCvRecords({...value, updatedAt: seoulDate(now)});
  if (expectedRevision !== undefined) {
    const previous = await loadCvRecords(path);
    if (cvRecordsRevision(previous) !== expectedRevision) {
      const error = new Error('다른 창에서 데이터가 변경되었습니다. 새로고침 후 다시 입력하세요.');
      error.statusCode = 409;
      throw error;
    }
  }
  await mkdir(dirname(path), {recursive: true});
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, `${JSON.stringify(result, null, 2)}\n`, {flag: 'wx'});
    await rename(temporary, path);
  } finally {
    await rm(temporary, {force: true});
  }
  return result;
}
