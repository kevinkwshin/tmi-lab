import test from 'node:test';
import assert from 'node:assert/strict';
import {renderCv, renderCvLatex, escapeLatex} from '../src/cv.mjs';
import {patents} from '../src/patents.mjs';
import {renderPage} from '../src/render.mjs';

const publications = [{doi:'10.1234/example',title:'A selected study',journal:'Medical Journal',year:2026,authors:'Shin K, et al.'}];
const bibliography = [{doi:'10.1234/example',title:'A selected study',journal:'Medical Journal',year:2026,date:'2026-11-01',authors:[{given:'Amina',family:'Example'},{given:'Keewon',family:'Shin'},{given:'Luis',family:'Last'}],verified:'2026-11-10',volume:'12',issue:'3',pages:'44–52'}];

test('bilingual CV exposes selected coverage, correct contact and no private phone/email', () => {
  for (const lang of ['ko','en']) {
    const html = renderCv(lang,{publications,bibliography});
    assert.match(html,new RegExp(`<html lang="${lang}">`));
    assert.match(html,/mailto:kevinkwshin@inha\.ac\.kr/);
    assert.doesNotMatch(html,/8619|kevinkwshin@gmail|KeewonShinProfileImage|journal\.bib/);
    assert.match(html,/prJCNYoAAAAJ/);
    assert.match(html,/href="https:\/\/tmi-lab.org\/publications\.bib"/);
    assert.match(html,/href="https:\/\/tmi-lab.org\/cv\/keewon-shin-cv\.tex"/);
    assert.match(html,lang === 'ko' ? /학술지 논문을 선별한 목록/ : /A selection of journal articles/);
    assert.ok(html.indexOf('id="appointments"') < html.indexOf('id="education"'));
    assert.ok(html.indexOf('id="education"') < html.indexOf('id="publications"'));
  }
});

test('full official authors retain order and the PI name is identity emphasis only', () => {
  const html = renderCv('en',{publications,bibliography});
  assert.match(html,/Amina Example, <strong>Keewon Shin<\/strong>, Luis Last/);
  assert.doesNotMatch(html,/Shin K, et al\./);
  assert.match(html,/Bold identifies Keewon Shin/);
  assert.doesNotMatch(html,/class="cv-role-note"/);
  const tex = renderCvLatex({publications,bibliography});
  assert.match(tex,/Amina Example, \\textbf\{Keewon Shin\}, Luis Last/);
  assert.doesNotMatch(tex,/\\nocite|\\bibliography\{|\\includegraphics|\\today/);
  assert.match(tex,/\\documentclass\[a4paper,11pt\]/);
  assert.match(tex,/\\ifdefined\\pdfgentounicode/);
  assert.match(tex,/\\ifdefined\\pdfgentounicode\s+\\IfFileExists\{glyphtounicode\.tex\}\{\\input\{glyphtounicode\}\}\{\}\s+\\pdfgentounicode=1\s+\\fi/);
});

test('unavailable metadata preserves the existing abbreviated list without inventing authors', () => {
  const html = renderCv('en',{publications});
  assert.match(html,/<strong>Shin K<\/strong>, et al\./);
  assert.doesNotMatch(html,/Amina Example|Publication metadata checked/);
});

test('TeX keeps complete ordinary citations together but retains a flow fallback for oversized author lists', () => {
  const manyAuthors = Array.from({length:1500},(_,index) => ({name:`Researcher ${index+1}`}));
  const longPaper = {...publications[0],doi:'10.1234/long',title:'Long author-list study',authors:manyAuthors};
  const tex = renderCvLatex({publications:[...publications,longPaper]});
  assert.equal((tex.match(/\\item \\CVPublication\{/g) || []).length,2);
  assert.match(tex,/\\begin\{minipage\}\[t\]\{\\linewidth\}#1\\end\{minipage\}/);
  assert.match(tex,/\\ifdim\\dimexpr\\ht\\CVPublicationBox\+\\dp\\CVPublicationBox\\relax<\.9\\textheight\s+\\usebox\{\\CVPublicationBox\}%\s+\\else\s+#1%\s+\\fi/);
  assert.match(tex,/Researcher 1, Researcher 2/);
  assert.match(tex,/Researcher 1499, Researcher 1500\. Long author-list study/);
  assert.doesNotMatch(tex,/Researcher 1, et al/);
});

test('Korean journal metadata stays original in Korean CV while explicit English overrides feed English and TeX', () => {
  const paper = {doi:'10.1234/korean',title:'한국어 원래 논문 제목',journal:'한국어 학술지',authors:[{name:'김연구'},{name:'신기원'}],year:2026,ownRoles:['cofirst']};
  const overrides = {titleEn:'Author-supplied English title',journalEn:'Author-supplied English Journal',authorsEn:['Yeongu Kim','Keewon Shin']};
  const cache = [{...paper,verified:'2026-11-12',manual:overrides}];
  const original = structuredClone({paper,cache});
  const ko = renderCv('ko',{publications:[paper],bibliography:cache});
  assert.match(ko,/한국어 원래 논문 제목/);
  assert.match(ko,/한국어 학술지/);
  assert.match(ko,/김연구, <strong>신기원<\/strong>/);
  assert.doesNotMatch(ko,/Author-supplied English title|Author-supplied English Journal/);
  for (const output of [renderCv('en',{publications:[paper],bibliography:cache}),renderCvLatex({publications:[paper],bibliography:cache})]) {
    assert.match(output,/Author-supplied English title/);
    assert.match(output,/Author-supplied English Journal/);
    assert.match(output,/Yeongu Kim/);
    assert.match(output,/Keewon Shin/);
    assert.match(output,/Co-first author/);
    assert.doesNotMatch(output,/한국어 원래 논문 제목|한국어 학술지|김연구|신기원/);
  }
  assert.deepEqual({paper,cache},original);
  const manual = {...paper,...overrides};
  assert.match(renderCv('en',{publications:[manual]}),/Author-supplied English title/);
  assert.match(renderCv('ko',{publications:[manual]}),/한국어 원래 논문 제목/);
});

test('explicit PDF availability and nested hosting paths produce working download and language targets', () => {
  const options = {siteUrl:'https://example.org/tmi-lab/'};
  assert.doesNotMatch(renderCv('en',options),/keewon-shin-cv\.pdf/);
  const html = renderCv('en',{...options,pdfAvailable:true});
  assert.match(html,/href="https:\/\/example.org\/tmi-lab\/cv\/keewon-shin-cv\.pdf" download/);
  assert.match(html,/href="https:\/\/example.org\/tmi-lab\/en\/cv\/" lang="en" hreflang="en" aria-current="page"/);
  assert.match(html,/@page\{size:A4/);
  assert.match(html,/@media print/);
  assert.match(html,/break-inside:avoid-page/);
  assert.match(html,/content:counter\(page\)/);
});

test('patents use the reviewed public records and distinguish pending applications from grants', () => {
  const html = renderCv('en');
  for (const patent of patents) assert.match(html,new RegExp(patent.number));
  assert.match(html,/KR20240174814A<\/a> · Published application/);
  assert.match(html,/WO2024253395A1<\/a> · Published application/);
  assert.match(html,/US12591966B2<\/a> · Granted/);
  assert.doesNotMatch(html,/Korea, PCT|Designated as a Korean Innovative Medical Device \(2024\)/);
});

test('saved grants and conferences feed both outputs without publishing private grant amounts', () => {
  const records = {updatedAt:'2026-11-12',grants:[{title:'새 과제',titleEn:'New research project',funder:'지원기관',funderEn:'Research Funder',program:'연구사업',programEn:'Research Programme',role:'PI',start:'2027',end:'2029',grantNumber:'G_42',amount:'PRIVATE_12345',publicAmount:false}],conferences:[{title:'A new conference contribution',event:'Conference',date:'2027-05',type:'poster',authors:['Amina Example','Keewon Shin'],presenter:'Amina Example',ownRoles:['cofirst'],url:'https://example.org/abstract'}]};
  const html = renderCv('en',{records});
  const tex = renderCvLatex({records});
  for (const output of [html,tex]) {
    assert.match(output,/New research project/);
    assert.match(output,/Research Funder/);
    assert.match(output,/Principal Investigator/);
    assert.match(output,/A new conference contribution/);
    assert.match(output,/Co-first author/);
    assert.doesNotMatch(output,/PRIVATE_12345/);
  }
  assert.match(html,/May 2027/);
  assert.match(html,/Presenter: Amina Example/);
  assert.match(html,/Additional records updated/);
  assert.match(tex,/Grant G\\_42/);
  assert.match(renderCv('ko',{records}),/새 과제/);
  records.grants[0].publicAmount = true;
  assert.match(renderCv('en',{records}),/PRIVATE_12345/);
});

test('publication and editor text cannot inject HTML, links, or TeX commands', () => {
  const input = [{...publications[0],title:'<script>alert(1)</script> & \\input{secrets}_50%',authors:'Bad <img src=x onerror=alert(1)>'}];
  const html = renderCv('en',{publications:input,records:{conferences:[{title:'Safe',event:'Event',date:'2026',url:'javascript:alert(1)'}]}});
  assert.doesNotMatch(html,/<script>alert|<img src=x|href="javascript:/);
  assert.match(html,/&lt;script&gt;/);
  const tex = renderCvLatex({publications:input});
  assert.match(tex,/\\textbackslash\{\}input\\\{secrets\\\}\\_50\\%/);
  assert.doesNotMatch(tex,/\\input\{secrets\}/);
  assert.equal(escapeLatex('A & B_2 #50% $x$ {y} \\ ^ ~'),'A \\& B\\_2 \\#50\\% \\$x\\$ \\{y\\} \\textbackslash{} \\textasciicircum{} \\textasciitilde{}');
  assert.equal(escapeLatex('University · Institute'), 'University \\textperiodcentered{} Institute');
});

test('unsupported languages and unsafe update dates fail rather than creating malformed output', () => {
  assert.throws(() => renderCv('fr'),/Unsupported CV language/);
  assert.throws(() => renderCv('en',{updatedAt:'</style>'}),/ISO date/);
  assert.throws(() => renderCvLatex({updatedAt:'\\input{x}'}),/ISO date/);
});


test('editing or deleting a grant updates the homepage and CV from one saved record', () => {
  const records = {grants:[{title:'공통 과제',titleEn:'One shared grant',funder:'기관',funderEn:'Funding body',program:'',role:'Co-I',start:'2027',end:'2029'}],conferences:[],journalEntries:[]};
  for (const lang of ['ko','en']) {
    const title = lang === 'en' ? 'One shared grant' : '공통 과제';
    const home = renderPage(lang,'https://tmi-lab.org/','','styles.css',{records});
    const cv = renderCv(lang,{records});
    assert(home.includes(title)); assert(cv.includes(title));
    assert(!home.includes('Core Research A, National Research Foundation of Korea (2026'));
    records.grants = [];
    const empty = renderPage(lang,'https://tmi-lab.org/','','styles.css',{records});
    assert(!empty.includes('class="faculty-project"'));
    assert(!empty.includes('class="profile-project"'));
    records.grants = [{title:'공통 과제',titleEn:'One shared grant',funder:'기관',funderEn:'Funding body',program:'',role:'Co-I',start:'2027',end:'2029'}];
  }
});
