import {cvProfile as profile} from './cv-profile.mjs';
import {content} from './content.mjs';
import {patents} from './patents.mjs';

const localized = (value, lang) => typeof value === 'string' ? value : value?.[lang] ?? value?.en ?? '';
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const validDate = value => /^\d{4}(?:-\d{2})?(?:-\d{2})?$/.test(String(value ?? ''));

function date(value, lang) {
  if (!value) return '';
  if (!validDate(value)) return String(value);
  const [year, month, day] = value.split('-');
  if (lang === 'ko') return [year, month, day].filter(Boolean).join('.');
  return month ? `${day ? `${Number(day)} ` : ''}${months[Number(month)-1]} ${year}` : year;
}

function period(item, lang) {
  if (!item.from) return '';
  if (!('to' in item)) return date(item.from, lang);
  return `${date(item.from, lang)}–${item.to === null ? (lang === 'ko' ? '현재' : 'present') : date(item.to, lang)}`;
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}

function doiUrl(doi) {
  const value = String(doi ?? '').replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '').trim();
  return /^10\.\d{4,9}\/\S+$/i.test(value) ? `https://doi.org/${encodeURI(value).replace(/"/g, '%22').replace(/</g, '%3C').replace(/>/g, '%3E')}` : '';
}

function authorName(author) {
  if (typeof author === 'string') return author;
  return author?.name || [author?.given, author?.family, author?.suffix].filter(Boolean).join(' ');
}

function paperRecords(publications, bibliography, lang) {
  const entries = Array.isArray(bibliography) ? bibliography : bibliography?.entries ?? [];
  const metadata = new Map(entries.map(entry => [String(entry.doi).toLowerCase(), entry]));
  return [...publications].map(paper => {
    const entry = metadata.get(String(paper.doi).toLowerCase());
    const original = {
      ...paper,
      ...(entry || {}),
      authors: Array.isArray(entry?.authors) && entry.authors.length ? entry.authors : paper.authors,
      authorRoles: paper.ownRoles || entry?.manual?.ownRoles || []
    };
    if (lang !== 'en') return original;
    // English renderings are supplied by the author; canonical bibliography fields stay intact.
    const titleEn = paper.titleEn || entry?.manual?.titleEn;
    const journalEn = paper.journalEn || entry?.manual?.journalEn;
    const authorsEn = paper.authorsEn?.length ? paper.authorsEn : entry?.manual?.authorsEn;
    return {
      ...original,
      ...(titleEn ? {title:titleEn} : {}),
      ...(journalEn ? {journal:journalEn} : {}),
      ...(authorsEn?.length ? {authors:authorsEn} : {})
    };
  }).sort((a,b) => Number(b.year)-Number(a.year) || String(b.published || b.date || '').localeCompare(String(a.published || a.date || '')));
}

function authorList(paper) {
  return Array.isArray(paper.authors) ? paper.authors.map(authorName).filter(Boolean).join(', ') : String(paper.authors || '');
}

function authorsHtml(paper) {
  return escape(authorList(paper)).replace(/\b(?:Keewon Shin|Shin,? Keewon|Shin K)\b|신기원/g, name => `<strong>${name}</strong>`);
}

function authorsLatex(paper) {
  return escapeLatex(authorList(paper)).replace(/\b(Keewon Shin|Shin,? Keewon|Shin K)\b/g, '\\textbf{$1}');
}

function roleText(roles, lang) {
  const values = [];
  if (roles?.includes('cofirst')) values.push(lang === 'ko' ? '공동 제1저자' : 'Co-first author');
  if (roles?.includes('corresponding')) values.push(lang === 'ko' ? '교신저자' : 'Corresponding author');
  return values.join(' · ');
}

function extraGrants(records) {
  const bilingual = (value, english) => english ? {ko:value || english,en:english} : value;
  const roles = {PI:{ko:'연구책임자',en:'Principal Investigator'},'Co-I':{ko:'공동연구자',en:'Co-Investigator'},PM:{ko:'과제 관리자',en:'Project Manager'}};
  return (records?.grants || []).map(grant => ({
    from: grant.start, to: grant.end || null, title: bilingual(grant.title,grant.titleEn),
    institution: {ko:[grant.funder,grant.program].filter(Boolean).join(' · '),en:[grant.funderEn || grant.funder,grant.programEn || grant.program].filter(Boolean).join(' · ')},
    details: [roles[grant.role] || grant.role, grant.grantNumber ? `Grant ${grant.grantNumber}` : '', grant.publicAmount && grant.amount ? grant.amount : ''].filter(Boolean)
  }));
}

function extraConferences(records) {
  return (records?.conferences || []).map(item => ({
    ...item, title:item.titleEn ? {ko:item.title,en:item.titleEn} : item.title, event:item.eventEn ? {ko:item.event,en:item.eventEn} : item.event,
    authors: item.authorsEn?.length ? {ko:item.authors,en:item.authorsEn} : item.authors,
    presenter:item.presenterEn ? {ko:item.presenter,en:item.presenterEn} : item.presenter,
    year: item.date || item.year, format: item.type === 'oral' ? {ko:'구연',en:'Oral'} : item.type === 'poster' ? {ko:'포스터',en:'Poster'} : '',
    url: safeUrl(item.url) || doiUrl(item.doi)
  }));
}

function conferenceRecords(records) {
  return [...(profile.conferences || []), ...extraConferences(records)]
    .sort((a,b) => String(b.year).localeCompare(String(a.year)));
}

const labels = {
  ko: {title:'이력서', home:'TMI-lab 홈', print:'인쇄 / PDF 저장', pdf:'PDF 다운로드', tex:'LaTeX 다운로드', bib:'BibTeX 다운로드', updated:'프로필 갱신', recordUpdated:'추가 실적 갱신', metadata:'논문 서지 확인', appointments:'경력', research:'연구 관심 분야', education:'학력', papers:'주요 학술지 논문', paperNote:'학술지 논문을 선별한 목록입니다. 전체 연구 실적은 Google Scholar에서 확인할 수 있습니다.', authorNote:'굵은 글씨는 본인 이름입니다.', projects:'연구과제', transfers:'기술이전', transferNote:'이전 기관에서 수행한 연구를 포함한 개인 연구 이력입니다.', patents:'특허', patentNote:'특허군별 대표 문헌과 관련 문헌을 함께 표시합니다. 등록 특허와 공개 출원을 구분합니다.', granted:'등록', application:'공개 출원', teaching:'교육', service:'학술 활동', conferences:'주요 학술대회 기여', awards:'주요 수상 및 선정', skills:'연구·개발 역량', noPapers:'등록된 논문이 없습니다.', footer:'신기원 · 이력서', presenter:'발표자', skip:'이력서 본문으로 바로가기'},
  en: {title:'Curriculum vitae', home:'TMI-lab home', print:'Print / save PDF', pdf:'Download PDF', tex:'Download LaTeX', bib:'Download BibTeX', updated:'Profile updated', recordUpdated:'Additional records updated', metadata:'Publication metadata checked', appointments:'Appointments and experience', research:'Research interests', education:'Education', papers:'Selected journal publications', paperNote:'A selection of journal articles. The complete research record is available on Google Scholar.', authorNote:'Bold identifies Keewon Shin.', projects:'Research projects', transfers:'Technology transfer', transferNote:'Professional research record, including work undertaken at previous institutions.', patents:'Patents', patentNote:'Representative and related documents are grouped by patent family. Grants and published applications are distinguished.', granted:'Granted', application:'Published application', teaching:'Teaching', service:'Academic service', conferences:'Selected conference contributions', awards:'Selected honors and recognition', skills:'Research and technical skills', noPapers:'No publications are listed.', footer:'Keewon Shin · Curriculum vitae', presenter:'Presenter', skip:'Skip to the curriculum vitae'}
};

function styles(updatedAt) {
  return `:root{--paper:#fff;--ink:#102d50;--muted:#52657a;--blue:#1269b5;--sky:#edf7ff;--line:#d9e7f2;--focus:#bd5915;--sans:-apple-system,BlinkMacSystemFont,"Segoe UI","Apple SD Gothic Neo","Malgun Gothic",sans-serif;--serif:Georgia,"Times New Roman","AppleMyungjo",serif}
*{box-sizing:border-box}html{color-scheme:light;scroll-behavior:smooth}body{margin:0;color:var(--ink);background:var(--sky);font:16px/1.65 var(--serif);-webkit-font-smoothing:antialiased}a{color:var(--blue);text-underline-offset:3px;overflow-wrap:anywhere}a:hover{text-decoration-thickness:2px}a:focus-visible,button:focus-visible{outline:3px solid var(--focus);outline-offset:4px}button{font:inherit;cursor:pointer}p,h1,h2,h3{margin:0}ul,ol{margin:0;padding-left:1.3rem}li+li{margin-top:.35rem}:lang(ko){word-break:keep-all;overflow-wrap:anywhere}.skip{position:fixed;left:16px;top:12px;background:var(--paper);padding:12px;transform:translateY(-150%);z-index:2}.skip:focus{transform:none}.cv-toolbar{max-width:210mm;margin:20px auto 12px;padding:0 16px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 20px;font:13px/1.4 var(--sans)}.cv-controls,.cv-languages{display:flex;align-items:center;gap:4px 14px;flex-wrap:wrap}.cv-toolbar a,.cv-toolbar button{min-height:44px;display:inline-flex;align-items:center}.cv-toolbar button{padding:8px 12px;color:var(--ink);background:var(--paper);border:1px solid var(--line);border-radius:4px}.cv-languages a{padding:6px}.cv-languages [aria-current]{font-weight:700;text-decoration-thickness:2px}.cv-document{width:min(210mm,calc(100% - 32px));margin:0 auto 40px;padding:16mm 18mm;background:var(--paper);border-top:4px solid var(--ink)}.cv-kicker,.cv-date,.cv-meta,.cv-note,.cv-footer{font-family:var(--sans)}.cv-kicker{color:var(--muted);font-size:12px;letter-spacing:.13em;text-transform:uppercase}.cv-header{padding-bottom:24px;border-bottom:1px solid var(--ink)}h1{font-size:46px;line-height:1.16;font-weight:400;letter-spacing:-.035em;margin:8px 0 10px}.cv-degree{font:18px var(--serif);letter-spacing:0}.cv-role{font-size:18px;font-weight:600;line-height:1.45}.cv-affiliation{margin-top:4px}.cv-contact{display:flex;flex-wrap:wrap;gap:4px 16px;margin-top:12px;font:13px/1.6 var(--sans)}.cv-contact a{min-height:32px;display:inline-flex;align-items:center}.cv-summary{margin-top:16px}.cv-dates{display:flex;flex-wrap:wrap;gap:3px 16px;font-size:11px;color:var(--muted);margin-top:12px}.cv-section{margin-top:28px}h2{font-size:22px;font-weight:400;line-height:1.3;padding-bottom:6px;border-bottom:1px solid var(--line);margin-bottom:14px;break-after:avoid-page}h3{font-size:16px;font-weight:600;line-height:1.45}.cv-entry{display:grid;grid-template-columns:7.6rem minmax(0,1fr);column-gap:18px;margin-bottom:14px;break-inside:avoid-page}.cv-date{font-size:11px;color:var(--muted);padding-top:3px;line-height:1.5}.cv-entry-body{min-width:0}.cv-institution{font-size:14px;line-height:1.5;margin-top:2px}.cv-details{font-size:13px;margin-top:4px;color:var(--muted)}.cv-meta{font-size:12px;color:var(--muted);line-height:1.6}.cv-note{font-size:12px;color:var(--muted);margin:-3px 0 14px}.cv-note a{color:inherit}.cv-papers{padding-left:1.35rem}.cv-papers li{padding-left:4px;margin-bottom:16px;break-inside:avoid-page}.cv-paper-title{font-size:15px;line-height:1.5;margin-bottom:3px}.cv-authors{font-size:12px;line-height:1.6;color:var(--muted)}.cv-authors strong{font-weight:700;color:var(--ink)}.cv-citation{font-size:13px;line-height:1.5;margin-top:3px}.cv-doi{font-family:var(--sans);font-size:11px}.cv-role-note{font:11px/1.5 var(--sans);color:var(--muted);margin-top:3px}.cv-research li{font-size:14px}.cv-skills{display:grid;grid-template-columns:8rem minmax(0,1fr);gap:7px 18px;font-size:13px}.cv-skills dt{font-family:var(--sans);font-weight:600}.cv-skills dd{margin:0;overflow-wrap:anywhere}.cv-footer{margin-top:32px;padding-top:12px;border-top:1px solid var(--line);color:var(--muted);font-size:11px}.cv-footer p+p{margin-top:3px}[hidden]{display:none!important}
@media(max-width:620px){body{font-size:15px}.cv-document{padding:28px 20px;width:calc(100% - 20px)}.cv-toolbar{padding:0 14px;margin-top:8px}.cv-controls{gap:0 12px}.cv-controls a{font-size:12px}h1{font-size:38px}.cv-entry{grid-template-columns:1fr;gap:3px;margin-bottom:18px}.cv-date{padding:0}.cv-section{margin-top:25px}.cv-skills{grid-template-columns:1fr;gap:2px}.cv-skills dd{margin-bottom:9px}.cv-note{line-height:1.7}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
@page{size:A4;margin:16mm 18mm 18mm;@top-right{content:"Keewon Shin · Curriculum vitae";font:8pt sans-serif;color:#52657a}@bottom-left{content:"Profile: ${updatedAt}";font:8pt sans-serif;color:#52657a}@bottom-right{content:counter(page);font:8pt sans-serif;color:#52657a}}
@media print{html,body{background:#fff}body{font-size:10pt;line-height:1.45;color:#102d50}.cv-toolbar,.skip{display:none!important}.cv-document{width:auto;margin:0;padding:0;border-top:0}h1{font-size:30pt;margin-top:3pt}.cv-header{padding-bottom:12pt}.cv-role{font-size:12pt}.cv-affiliation{font-size:10pt}.cv-summary{margin-top:8pt}.cv-contact{margin-top:6pt;gap:2pt 12pt;font-size:8.5pt}.cv-contact a{min-height:0}.cv-dates{font-size:7.5pt;margin-top:6pt}.cv-section{margin-top:15pt}h2{font-size:15pt;margin-bottom:8pt;padding-bottom:3pt}.cv-entry{grid-template-columns:88pt minmax(0,1fr);gap:12pt;margin-bottom:8pt}.cv-date{font-size:8pt;padding-top:2pt}h3{font-size:10pt}.cv-institution{font-size:9pt}.cv-details{font-size:8.5pt}.cv-note{font-size:8pt;margin-bottom:8pt}.cv-papers li{margin-bottom:9pt}.cv-paper-title{font-size:10pt}.cv-authors,.cv-meta{font-size:8pt}.cv-citation{font-size:9pt}.cv-doi,.cv-role-note{font-size:7.5pt}.cv-research li,.cv-skills{font-size:9pt}.cv-footer{font-size:7.5pt;margin-top:15pt}a{color:inherit;text-decoration:none}p,li{orphans:3;widows:3}.cv-entry,.cv-papers li{break-inside:avoid-page;page-break-inside:avoid}h2{break-after:avoid-page;page-break-after:avoid}}`;
}

/** Standalone, no-network bilingual CV. bibliography accepts generateBibliography().entries. */
export function renderCv(lang = 'ko', {publications = [], bibliography = null, records = null, siteUrl = 'https://tmi-lab.org/', updatedAt = profile.updated, pdfAvailable = false} = {}) {
  if (!labels[lang]) throw new Error(`Unsupported CV language: ${lang}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(updatedAt)) throw new Error('CV updatedAt must be an ISO date');
  const c = labels[lang];
  const base = new URL(siteUrl);
  if (!base.pathname.endsWith('/')) base.pathname += '/';
  const path = value => new URL(value.replace(/^\//,''), base).href;
  const t = value => localized(value, lang);
  const papers = paperRecords(publications, bibliography, lang);
  const checked = papers.map(p => p.verified).filter(validDate).sort().at(-1);
  const section = (id, title, body, note = '') => `<section class="cv-section" aria-labelledby="${id}"><h2 id="${id}">${escape(title)}</h2>${note ? `<p class="cv-note">${note}</p>` : ''}${body}</section>`;
  const entry = item => `<article class="cv-entry"><p class="cv-date">${escape(period(item,lang))}</p><div class="cv-entry-body"><h3>${escape(t(item.title))}</h3><p class="cv-institution">${escape(t(item.institution))}</p>${item.details?.length ? `<p class="cv-details">${item.details.map(detail => escape(t(detail))).join(' · ')}</p>` : ''}</div></article>`;
  const rows = values => values.map(entry).join('');
  const grants = [...profile.projects,...extraGrants(records)];
  const paperHtml = papers.length ? `<ol class="cv-papers">${papers.map(paper => `<li><p class="cv-paper-title" lang="en">${escape(paper.title)}</p><p class="cv-authors" lang="en">${authorsHtml(paper)}</p><p class="cv-citation" lang="en"><em>${escape(paper.journal)}</em> · ${escape(paper.year)}${paper.volume ? `; ${escape(paper.volume)}${paper.issue ? `(${escape(paper.issue)})` : ''}` : ''}${paper.pages || paper.articleNumber ? `: ${escape(paper.pages || paper.articleNumber)}` : ''}</p>${doiUrl(paper.doi) ? `<a class="cv-doi" href="${escape(doiUrl(paper.doi))}">doi:${escape(paper.doi)}</a>` : ''}${roleText(paper.authorRoles,lang) ? `<p class="cv-role-note">${escape(roleText(paper.authorRoles,lang))}</p>` : ''}</li>`).join('')}</ol>` : `<p>${c.noPapers}</p>`;
  const transfers = content[lang].translation.items.map(item => entry({from:String(item.year), title:item.name, institution:item.recipient, details:[item.body]})).join('');
  const patentHtml = patents.map(patent => `<article class="cv-entry"><p class="cv-date">${patent.year}</p><div class="cv-entry-body"><h3>${escape(t(patent.title))}</h3><p class="cv-meta"><a href="https://patents.google.com/patent/${escape(patent.number)}/${lang}">${escape(patent.number)}</a> · ${patent.granted ? c.granted : c.application}</p>${patent.related.length ? `<p class="cv-meta">${patent.related.map(related => `<a href="https://patents.google.com/patent/${escape(related.number)}/${lang}">${escape(related.number)}</a> · ${related.granted ? c.granted : c.application} · ${related.year}`).join(' / ')}</p>` : ''}</div></article>`).join('');
  const conferences = conferenceRecords(records).map(item => {
    const authors = Array.isArray(item.authors) ? item.authors : item.authors?.[lang];
    return `<article class="cv-entry"><p class="cv-date">${escape(date(String(item.year),lang))}</p><div class="cv-entry-body"><h3>${escape(t(item.title))}</h3>${authors?.length ? `<p class="cv-authors">${authorsHtml({authors})}</p>` : ''}<p class="cv-institution">${escape(t(item.event))}${item.format ? ` · ${escape(t(item.format))}` : ''}</p>${item.presenter ? `<p class="cv-meta">${c.presenter}: ${escape(t(item.presenter))}</p>` : ''}${roleText(item.ownRoles,lang) ? `<p class="cv-role-note">${escape(roleText(item.ownRoles,lang))}</p>` : ''}${safeUrl(item.url) ? `<a class="cv-doi" href="${escape(safeUrl(item.url))}">${escape(item.url)}</a>` : ''}</div></article>`;
  }).join('');
  const canonical = path(lang === 'ko' ? 'cv/' : 'en/cv/');
  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${escape(t(profile.name))} · ${escape(t(profile.role))} · ${escape(c.title)}"><title>${escape(t(profile.name))} · ${c.title} · TMI-lab</title><link rel="canonical" href="${escape(canonical)}"><link rel="alternate" hreflang="ko" href="${escape(path('cv/'))}"><link rel="alternate" hreflang="en" href="${escape(path('en/cv/'))}"><link rel="alternate" hreflang="x-default" href="${escape(path('en/cv/'))}"><style>${styles(updatedAt)}</style></head>
<body><a class="skip" href="#cv">${c.skip}</a><nav class="cv-toolbar" aria-label="${lang === 'ko' ? '이력서 메뉴' : 'CV navigation'}"><a href="${escape(path(lang === 'ko' ? '' : 'en/'))}">← ${c.home}</a><div class="cv-controls"><button id="cv-print" type="button" hidden>${c.print}</button>${pdfAvailable ? `<a href="${escape(path('cv/keewon-shin-cv.pdf'))}" download>${c.pdf}</a>` : ''}<a href="${escape(path('cv/keewon-shin-cv.tex'))}" download>${c.tex}</a><a href="${escape(path('publications.bib'))}" download>${c.bib}</a></div><div class="cv-languages" aria-label="${lang === 'ko' ? '언어 선택' : 'Language'}"><a href="${escape(path('cv/'))}" lang="ko" hreflang="ko"${lang === 'ko' ? ' aria-current="page"' : ''}>한국어</a><a href="${escape(path('en/cv/'))}" lang="en" hreflang="en"${lang === 'en' ? ' aria-current="page"' : ''}>English</a></div></nav>
<main class="cv-document" id="cv"><header class="cv-header"><p class="cv-kicker">${c.title}</p><h1>${escape(t(profile.name))}<span class="cv-degree">, ${profile.degree}</span></h1><p class="cv-role">${escape(t(profile.role))}</p><p class="cv-affiliation">${escape(t(profile.affiliation))}</p><div class="cv-contact"><a href="mailto:${profile.email}">${profile.email}</a>${profile.links.map(link => `<a href="${escape(link.url)}">${escape(t(link.label))}</a>`).join('')}</div><p class="cv-summary">${escape(t(profile.summary))}</p><div class="cv-dates"><span>${c.updated}: <time datetime="${updatedAt}">${date(updatedAt,lang)}</time></span>${records?.updatedAt && validDate(records.updatedAt) ? `<span>${c.recordUpdated}: <time datetime="${escape(records.updatedAt)}">${escape(date(records.updatedAt,lang))}</time></span>` : ''}${checked ? `<span>${c.metadata}: <time datetime="${escape(checked)}">${escape(date(checked,lang))}</time></span>` : ''}</div></header>
${section('appointments',c.appointments,rows(profile.appointments))}
${section('research',c.research,`<ul class="cv-research">${profile.research.map(item => `<li>${escape(t(item))}</li>`).join('')}</ul>`)}
${section('education',c.education,rows(profile.education))}
${section('publications',c.papers,paperHtml,`${c.paperNote} <a href="${profile.links[0].url}">Google Scholar</a><br>${c.authorNote}`)}
${section('projects',c.projects,rows(grants))}
${section('transfers',c.transfers,transfers,c.transferNote)}
${section('patents',c.patents,patentHtml,c.patentNote)}
${section('teaching',c.teaching,rows(profile.teaching))}
${section('service',c.service,rows(profile.service))}
${conferences ? section('conferences',c.conferences,conferences) : ''}
${section('awards',c.awards,rows(profile.awards))}
${section('skills',c.skills,`<dl class="cv-skills">${profile.skills.map(item => `<dt>${escape(t(item.label))}</dt><dd>${escape(t(item.value))}</dd>`).join('')}</dl>`)}
<footer class="cv-footer"><p>${escape(t(profile.office))} · <a href="mailto:${profile.email}">${profile.email}</a></p><p>${c.footer} · <a href="${escape(path(''))}">tmi-lab.org</a></p></footer></main>
<script>const p=document.getElementById('cv-print');p.hidden=false;p.addEventListener('click',()=>window.print());</script></body></html>`;
}

/** Escape text rather than treating publication/editor content as TeX commands. */
export function escapeLatex(value) {
  return String(value ?? '').replace(/[‐‑–—]/g,'-').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/\u00a0/g,' ')
    .replace(/[\\{}$&#%_~^]/g, char => ({'\\':'\\textbackslash{}','{':'\\{','}':'\\}','$':'\\$','&':'\\&','#':'\\#','%':'\\%','_':'\\_','~':'\\textasciitilde{}','^':'\\textasciicircum{}'}[char]))
    .replaceAll('·', '\\textperiodcentered{}');
}

/** English self-contained TeX; no photo, external .bib, biber or network is required. */
export function renderCvLatex({publications = [], bibliography = null, records = null, updatedAt = profile.updated} = {}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(updatedAt)) throw new Error('CV updatedAt must be an ISO date');
  const e = escapeLatex;
  const t = value => localized(value,'en');
  const section = (title,body) => `\\section*{${e(title)}}\n${body}\n`;
  const row = item => `\\CVEntry{${e(period(item,'en'))}}{${e(t(item.title))}}{${e(t(item.institution))}}{${(item.details || []).map(item => e(t(item))).join(' \\textperiodcentered{} ')}}\n`;
  const rows = items => items.map(row).join('');
  const papers = paperRecords(publications,bibliography,'en');
  const paperHtml = papers.length ? `\\begin{enumerate}[leftmargin=*,label={[\\arabic*]},itemsep=8pt]\n${papers.map(paper => `\\item \\CVPublication{${authorsLatex(paper)}. ${e(paper.title)}. \\emph{${e(paper.journal)}}. ${e(paper.year)}${paper.volume ? `; ${e(paper.volume)}${paper.issue ? `(${e(paper.issue)})` : ''}` : ''}${paper.pages || paper.articleNumber ? `: ${e(paper.pages || paper.articleNumber)}` : ''}.${doiUrl(paper.doi) ? ` \\href{${e(doiUrl(paper.doi))}}{doi:${e(paper.doi)}}` : ''}${roleText(paper.authorRoles,'en') ? `\\par {\\footnotesize ${e(roleText(paper.authorRoles,'en'))}}` : ''}}\n`).join('')}\\end{enumerate}` : 'No publications are listed.';
  const transfers = content.en.translation.items.map(item => row({from:String(item.year),title:item.name,institution:item.recipient,details:[item.body]})).join('');
  const patentRows = patents.map(patent => row({from:String(patent.year),title:patent.title.en,institution:`${patent.number} - ${patent.granted ? 'Granted' : 'Published application'}`,details:patent.related.map(p => `${p.number} - ${p.granted ? 'Granted' : 'Published application'} (${p.year})`)})).join('');
  const conferenceRows = conferenceRecords(records).map(item => {
    const authors = Array.isArray(item.authors) ? item.authors : item.authors?.en;
    return row({from:String(item.year),title:item.title,institution:[t(item.event),t(item.format)].filter(Boolean).join(' - '),details:[authors?.map(authorName).join(', '),item.presenter ? `Presenter: ${t(item.presenter)}` : '',roleText(item.ownRoles,'en')].filter(Boolean)});
  }).join('');
  return `% Generated from the public TMI-lab CV data. Edit the source records, then rebuild.\n% Compile: pdflatex keewon-shin-cv.tex (twice for references/page totals).\n\\documentclass[a4paper,11pt]{article}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage{lmodern}
\\usepackage[a4paper,margin=19mm,headheight=14pt]{geometry}
\\usepackage{xcolor}
\\usepackage{tabularx}
\\usepackage{array}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{fancyhdr}
\\usepackage[hidelinks]{hyperref}
\\ifdefined\\pdfgentounicode
  \\IfFileExists{glyphtounicode.tex}{\\input{glyphtounicode}}{}
  \\pdfgentounicode=1
\\fi
\\definecolor{navy}{HTML}{102D50}
\\definecolor{muted}{HTML}{52657A}
\\hypersetup{pdftitle={Keewon Shin - Curriculum vitae},pdfauthor={Keewon Shin}}
\\urlstyle{same}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{3pt}
\\setlength{\\emergencystretch}{2em}
\\setlist[itemize]{leftmargin=*,itemsep=3pt,topsep=3pt}
\\titleformat{\\section}{\\large\\color{navy}\\bfseries}{}{0pt}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{15pt}{8pt}
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[R]{\\footnotesize\\color{muted}Keewon Shin -- Curriculum vitae}
\\fancyfoot[L]{\\footnotesize\\color{muted}Profile: ${e(updatedAt)}}
\\fancyfoot[R]{\\footnotesize\\thepage}
\\renewcommand{\\headrulewidth}{0pt}
% Keep ordinary citations on one page; unusually long author lists can still flow.
\\newsavebox{\\CVPublicationBox}
\\newcommand{\\CVPublication}[1]{%
  \\sbox{\\CVPublicationBox}{\\begin{minipage}[t]{\\linewidth}#1\\end{minipage}}%
  \\ifdim\\dimexpr\\ht\\CVPublicationBox+\\dp\\CVPublicationBox\\relax<.9\\textheight
    \\usebox{\\CVPublicationBox}%
  \\else
    #1%
  \\fi
}
\\newcommand{\\CVEntry}[4]{%
  \\par\\noindent\\begin{tabularx}{\\linewidth}{@{}>{\\raggedright\\arraybackslash}p{28mm} >{\\raggedright\\arraybackslash}X@{}}%
  {\\footnotesize\\color{muted}#1} & \\textbf{#2}\\\\%
  & {\\small #3}\\\\%
  \\if\\relax\\detokenize{#4}\\relax\\else & {\\footnotesize\\color{muted}#4}\\\\\\fi%
  \\end{tabularx}\\par\\addvspace{6pt}%
}
\\begin{document}
{\\footnotesize\\color{muted}CURRICULUM VITAE}\\par
{\\Huge\\color{navy}Keewon Shin}{\\large , PhD}\\par
\\textbf{${e(profile.role.en)}}\\par
${e(profile.affiliation.en)}\\par
{\\small\\href{mailto:${profile.email}}{${e(profile.email)}} \\textperiodcentered{} \\href{https://tmi-lab.org/}{tmi-lab.org} \\textperiodcentered{} \\href{${e(profile.links[0].url)}}{Google Scholar} \\textperiodcentered{} \\href{${e(profile.links[1].url)}}{ORCID} \\textperiodcentered{} \\href{${e(profile.links[2].url)}}{GitHub}}\\par
${e(profile.summary.en)}\\par
{\\footnotesize\\color{muted}Profile updated: ${e(date(updatedAt,'en'))}${records?.updatedAt && validDate(records.updatedAt) ? ` \\textperiodcentered{} Additional records: ${e(date(records.updatedAt,'en'))}` : ''}}
${section(labels.en.appointments,rows(profile.appointments))}
${section(labels.en.research,`\\begin{itemize}\n${profile.research.map(item => `\\item ${e(item.en)}`).join('\n')}\n\\end{itemize}`)}
${section(labels.en.education,rows(profile.education))}
${section(labels.en.papers,`{\\small ${e(labels.en.paperNote)} ${e(labels.en.authorNote)}}\n${paperHtml}`)}
${section(labels.en.projects,rows([...profile.projects,...extraGrants(records)]))}
${section(labels.en.transfers,`{\\small ${e(labels.en.transferNote)}}\n${transfers}`)}
${section(labels.en.patents,`{\\small ${e(labels.en.patentNote)}}\n${patentRows}`)}
${section(labels.en.teaching,rows(profile.teaching))}
${section(labels.en.service,rows(profile.service))}
${conferenceRows ? section(labels.en.conferences,conferenceRows) : ''}
${section(labels.en.awards,rows(profile.awards))}
${section(labels.en.skills,`\\begin{description}[leftmargin=0pt,labelindent=0pt,itemsep=3pt]\n${profile.skills.map(item => `\\item[${e(t(item.label))}] ${e(t(item.value))}`).join('\n')}\n\\end{description}`)}
\\vfill
{\\footnotesize\\color{muted}${e(profile.office.en)}\\par ${e(profile.email)}}
\\end{document}
`;
}
