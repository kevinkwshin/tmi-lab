import { content } from './content.mjs';
import { publications } from './publications.mjs';
import { patents } from './patents.mjs';

const scholar = 'https://scholar.google.com/citations?user=prJCNYoAAAAJ&hl=en';
const profile = 'https://medicine.inha.ac.kr/medicine/9606/subview.do';
const arrow = '<span class="arrow" aria-hidden="true">↗</span>';
export const escape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const lines = (value) => escape(value).replaceAll('\n', '<br>');
const link = (url, label, cls = 'text-link') => `<a class="${cls}" href="${escape(url)}">${escape(label)} ${arrow}</a>`;
const heading = (section) => `<div class="section-heading"><div><p class="eyebrow">${escape(section.label)}</p><h2>${lines(section.title)}</h2>${section.intro ? `<p>${escape(section.intro)}</p>` : ''}</div></div>`;

export function renderPage(lang, siteUrl) {
  const c = content[lang];
  const ko = lang === 'ko';
  const root = ko ? './' : '../';
  const pageUrl = new URL(ko ? './' : 'en/', siteUrl).href;
  const asset = (name) => `${root}assets/${name}.webp`;
  const patentRow = (p) => `<article class="patent rule-row"><time class="meta" datetime="${p.year}">${p.year}</time><div><p class="patent-number" lang="en">${p.number}<span class="patent-status" lang="${lang}">${ko ? (p.granted ? '등록공보' : '출원공개') : (p.granted ? 'Granted patent' : 'Published application')}</span></p><h3>${link(`https://patents.google.com/patent/${p.number}/${lang}`, p.title[lang], 'paper-title')}</h3><p class="meta" lang="ko">${escape(p.inventors)}</p>${p.related.length ? `<div class="cluster">${p.related.map(f=>link(`https://patents.google.com/patent/${f.number}/en`, `${f.number} · ${f.year} · ${ko ? (f.granted ? '미국 등록' : '국제출원 공개') : (f.granted ? 'US grant' : 'PCT publication')}`)).join('')}</div>` : ''}</div></article>`;
  const title = ko ? 'TMI-lab | Translational Medical Intelligence · 인하대학교 신기원' : 'TMI-lab | Translational Medical Intelligence · Inha University';
  const imageLabel = ko ? '연구 이미지 원본 보기' : 'View research image';
  const schema = { '@context': 'https://schema.org', '@type': 'ResearchOrganization', name: 'Translational Medical Intelligence Lab', alternateName: 'TMI-lab', url: siteUrl, email: 'kevinkwshin@inha.ac.kr', parentOrganization: { '@type': 'CollegeOrUniversity', name: 'Inha University' }, founder: { '@type': 'Person', name: 'Keewon Shin', jobTitle: 'Assistant Professor', sameAs: [scholar, 'https://orcid.org/0000-0002-5028-5716'] } };
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}</title><meta name="description" content="${escape(c.hero.description)}">
<meta name="theme-color" content="#1269b5">
<link rel="canonical" href="${pageUrl}">
<link rel="alternate" hreflang="ko" href="${siteUrl}"><link rel="alternate" hreflang="en" href="${new URL('en/', siteUrl).href}"><link rel="alternate" hreflang="x-default" href="${siteUrl}">
<meta property="og:image" content="${new URL('assets/tmi-logo.webp', siteUrl).href}"><meta property="og:image:alt" content="TMI-lab"><meta name="twitter:card" content="summary_large_image"><meta property="og:type" content="website"><meta property="og:site_name" content="TMI-lab"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(c.hero.description)}"><meta property="og:url" content="${pageUrl}"><meta property="og:locale" content="${ko ? 'ko_KR' : 'en_US'}">
<link rel="icon" href="${root}favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${root}styles.css"><script src="${root}site.js" defer></script><script src="${root}scroll.js" defer></script>
<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script>
</head>
<body>
<a class="skip action" href="#main">${c.ui.skip}</a>
<header class="site-header"><div class="header-inner container">
<a class="brand" href="${root}" aria-label="${c.ui.home}"><span class="brand-mark" lang="en">TMI-lab</span><span class="brand-description" lang="en">Translational<br>Medical Intelligence</span></a>
<nav class="nav" id="main-nav" aria-label="${ko ? '주 메뉴' : 'Main navigation'}">${c.nav.map(n => `<a href="#${n.id}">${n.label}</a>`).join('')}</nav>
<div class="header-controls"><div class="language" role="group" aria-label="${c.ui.language}"><a href="${root}" data-language="ko" lang="ko" aria-label="KO · 한국어" ${ko ? 'aria-current="page"' : ''}>KO</a><a href="${root}en/" data-language="en" lang="en" aria-label="EN · English" ${!ko ? 'aria-current="page"' : ''}>EN</a></div><button class="menu-toggle" type="button" aria-controls="main-nav" aria-expanded="false" aria-label="${c.ui.menu}" data-open="${c.ui.menu}" data-close="${c.ui.close}"><span aria-hidden="true">☰</span></button></div>
</div><div class="reading-progress" aria-hidden="true"><span></span></div></header>
<main id="main">
<section class="hero container" id="welcome" data-slide="TMI-lab" aria-labelledby="hero-title">
<div><p class="eyebrow">${c.hero.eyebrow}</p><h1 id="hero-title">${c.hero.titleLines.map(v => `<span>${escape(v)}</span>`).join('')}</h1><p class="hero-expansion" lang="en">Translational<br>Medical Intelligence</p><p class="hero-description">${escape(c.hero.description)}</p><div class="hero-actions cluster">${link('#translation', c.hero.primary, 'action')}${link('#research', c.hero.secondary)}</div></div>
<figure class="hero-figure logo-figure"><img src="${asset('tmi-logo')}" width="1200" height="810" alt="${ko ? '의사 가운을 입은 용과 거위 캐릭터가 있는 TMI-lab 로고. Too Much Information에서 Translational Medical Intelligence로.' : 'TMI-lab logo with a dragon and goose in lab coats. From Too Much Information to Translational Medical Intelligence.'}" fetchpriority="high"><figcaption class="logo-caption">${ko ? '많은 의료 정보를, 진료에 도움이 되는 지능으로.' : 'Turning medical information into intelligence for care.'}</figcaption></figure>
</section>
<div class="affiliation-strip container"><strong>${escape(c.footer.affiliation)}</strong><span lang="en">Clinical questions. Real-world impact.</span></div>
<section class="section translation-section" id="translation" data-slide="${ko ? '기술이전' : 'Translation'}"><div class="container">
${heading(c.translation)}
<div class="neurocad-feature"><div class="neurocad-copy"><p class="eyebrow">2024 / CORELINE SOFT</p><h3 lang="en">AVIEW NeuroCAD</h3><p class="neurocad-subtitle">${ko ? '뇌출혈 진단 보조 AI' : 'AI for intracranial hemorrhage assessment'}</p><p>${ko ? '비조영 뇌 CT에서 뇌출혈 의심 영역을 탐지하고 출혈량을 분석하는 연구가 코어라인소프트의 AVIEW NeuroCAD로 이어졌습니다.' : 'Research in detecting suspected hemorrhage and quantifying its volume in non-contrast brain CT contributed to Coreline Soft’s AVIEW NeuroCAD.'}</p><div class="cluster">${link('https://corelinesoft.com/en/aview/brain/neurocad/', ko ? '코어라인소프트 제품 소개' : 'Explore the Coreline Soft product') }${link('https://doi.org/10.1016/j.media.2022.102489', ko ? '관련 연구 논문' : 'Related research')}</div></div><figure><img src="${asset('neurocad')}" width="1200" height="650" alt="${ko ? '코어라인소프트 AVIEW NeuroCAD의 뇌 CT 분석 화면' : 'Brain CT analysis interface of Coreline Soft AVIEW NeuroCAD'}" loading="lazy"><figcaption>${ko ? '제품 이미지: Coreline Soft · 공식 제품 소개' : 'Product image: Coreline Soft · official product page'}</figcaption></figure></div>
<div class="transfer-grid">${c.translation.items.filter(t => t.name !== 'AVIEW NeuroCAD').map(t => `<article class="transfer"><time class="meta">${t.year}</time><div><h3 lang="en">${escape(t.name)}</h3><span class="recipient">${escape(t.recipient)}</span><p>${escape(t.body)}</p>${t.name === 'AVIEW NeuroCAD' ? link('https://corelinesoft.com/en/aview/brain/neurocad/', ko ? '제품 소개' : 'About the product') : ''}</div></article>`).join('')}</div>
<div class="clinical-feature"><figure><a class="scan-frame image-link" href="${asset('shoulder-landmarks')}" aria-label="${imageLabel}: GreyNet"><img src="${asset('shoulder-landmarks')}" width="800" height="956" loading="lazy" alt="${ko ? '어깨 Grashey X-ray에 연구자와 AI 모델의 해부학적 랜드마크를 표시한 원본 연구 이미지' : 'Shoulder Grashey radiograph with anatomical landmarks from readers and an AI model'}"></a><figcaption>${ko ? '어깨 X-ray 랜드마크 연구 · 교수 연구 발표자료' : 'Shoulder radiograph landmark study · PI research presentation'}</figcaption></figure><div class="feature-copy"><p class="eyebrow">${ko ? '연구 사례 / 영상 품질' : 'RESEARCH IN FOCUS / IMAGE QUALITY'}</p><h3>${ko ? '촬영 단계부터,<br>더 일관된 의료영상을 위해.' : 'More consistent imaging,<br>starting at acquisition.'}</h3><p>${ko ? '해부학적 랜드마크를 자동으로 찾고 어깨 X-ray의 촬영 자세를 평가합니다. 진료 과정에서 발생하는 영상의 편차를 줄이는 데 도움이 될 수 있는 기술을 연구합니다.' : 'We detect anatomical landmarks and assess positioning in shoulder radiographs. This work investigates how AI can support more consistent image acquisition in clinical workflows.'}</p>${link('https://doi.org/10.1002/mp.70285', ko ? '관련 논문 읽기' : 'Read the study')}</div></div>
</div></section>

<section class="section container mission-story" id="mission" data-slide="${ko ? '연구 철학' : 'Our mission'}">
<div class="mission-sticky"><p class="eyebrow">${c.intro.label}</p><h2>${lines(c.intro.title)}</h2><p class="mission-intro">${escape(c.intro.body)}</p><nav class="chapter-index" aria-label="${ko ? '연구 과정' : 'Research process'}">${c.approach.steps.map((s,i)=>`<a href="#stage-${i+1}" data-chapter-link="stage-${i+1}"><span>0${i+1}</span>${escape(s.title)}</a>`).join('')}</nav></div>
<div class="mission-chapters">${c.approach.steps.map((s,i)=>`<article class="mission-chapter" id="stage-${i+1}" data-chapter><span class="chapter-number" aria-hidden="true">0${i+1}</span><p class="eyebrow" lang="en">${['Clinical questions','Data & methods','Clinical evaluation'][i]}</p><h3>${escape(s.title)}</h3><p>${escape(s.body)}</p></article>`).join('')}</div>
</section>
<section class="section research-section" id="research" data-slide="${ko ? '연구' : 'Research'}"><div class="container">
${heading(c.research)}
<div>${c.research.items.map((r, i) => `<article class="research-row rule-row"><span class="research-number" aria-hidden="true">0${i + 1}</span><h3>${escape(r.title)}</h3><div><p>${escape(r.body)}</p><div class="tags">${r.tags.map(t => `<span lang="en">${escape(t)}</span>`).join('')}</div></div></article>`).join('')}</div>
<div class="research-gallery"><figure><a class="image-link" href="${asset('foot-landmarks')}" aria-label="${imageLabel}: FlatNet"><img src="${asset('foot-landmarks')}" width="939" height="1024" alt="${ko ? '족부 X-ray에서 평발 평가를 위한 해부학적 랜드마크와 각도를 표시한 연구 이미지' : 'Research radiograph showing anatomical landmarks and angles for flatfoot assessment'}" loading="lazy"></a><figcaption>${ko ? '족부 X-ray의 랜드마크 검출 · 교수 연구 발표자료' : 'Landmark detection in foot radiographs · PI research presentation'}</figcaption></figure><figure><a class="image-link" href="${asset('ecg-attention')}" aria-label="${imageLabel}: DCAM"><img src="${asset('ecg-attention')}" width="1200" height="951" alt="${ko ? '심실 조기수축 탐지 연구의 심전도와 DCAM 주의집중 맵' : 'ECG signals and DCAM attention maps from premature ventricular contraction detection research'}" loading="lazy"></a><figcaption>${ko ? '심전도 분석과 모델의 주의집중 맵 · DCAM 연구' : 'ECG analysis and model attention maps · DCAM research'}</figcaption></figure></div>
</div></section>
<section class="section" id="publications" data-slide="${ko ? '논문' : 'Publications'}"><div class="container">
<div class="section-heading"><div><p class="eyebrow">${c.publications.label}</p><h2>${c.publications.title}</h2>${c.publications.intro ? `<p>${c.publications.intro}</p>` : ''}</div>${link(scholar, c.publications.all)}</div>
<div class="publication-controls" hidden><div class="filters" role="group" aria-label="${ko ? '연구 분야 필터' : 'Filter by research area'}">${Object.entries(c.publications.filters).map(([key, label]) => `<button class="filter" type="button" data-filter="${key}" aria-pressed="${key === 'all'}">${label}</button>`).join('')}</div><div class="search-wrap"><label for="publication-search" class="sr-only">${c.publications.search}</label><input id="publication-search" class="search" type="search" placeholder="${c.publications.searchPlaceholder}" autocomplete="off"></div></div>
<p class="result-count meta" id="publication-count" role="status" aria-live="polite" data-format="${c.publications.results}">${c.publications.results.replace('{count}', String(publications.length))}</p>
<div class="publication-list">${publications.map(p => `<article class="publication rule-row" data-paper data-category="${p.category}"><time class="meta">${p.year}</time><div><h3><a class="paper-title" lang="en" href="https://doi.org/${escape(p.doi)}">${escape(p.title)}</a></h3><p class="meta" lang="en">${escape(p.authors)}</p><p class="journal meta"><span lang="en">${escape(p.journal)}</span> · ${escape(c.publications.filters[p.category])}</p></div><span class="arrow" aria-hidden="true">↗</span></article>`).join('')}</div>
<div class="empty-state" id="publication-empty" hidden><p>${c.publications.empty}</p><button class="filter" id="reset-publications" type="button">${c.publications.reset}</button></div>
</div></section>
<section class="section patents-section" id="patents" data-slide="${ko ? '특허' : 'Patents'}"><div class="container"><div class="section-heading"><div><p class="eyebrow">05 / PATENTS</p><h2>${ko ? '특허' : 'Patents & applications'}</h2></div></div><div class="patent-list">${patents.filter(p=>p.area==='medical').map(patentRow).join('')}<details class="details"><summary>${ko ? '이전 산업 연구 특허' : 'Earlier industrial research patents'}</summary>${patents.filter(p=>p.area==='industry').map(patentRow).join('')}</details></div></div></section>
<section class="section people-section" id="people" data-slide="${ko ? '구성원' : 'People'}"><div class="container">
${heading(c.people)}
<div class="profile-layout"><figure class="portrait-wrap"><img src="${asset('keewon-shin')}" width="640" height="795" loading="lazy" alt="${ko ? '신기원 교수' : 'Professor Keewon Shin'}"></figure><div><h3 class="profile-name">${c.people.name} <span class="meta" lang="en">${ko ? 'Keewon Shin' : 'PhD'}</span></h3><p class="profile-role">${c.people.role}</p><p class="meta">${c.people.affiliation}</p><p class="profile-bio">${escape(c.people.bio)}</p><div class="profile-links cluster">${link(scholar, 'Google Scholar')}${link('https://github.com/kevinkwshin', 'GitHub')}${link('https://orcid.org/0000-0002-5028-5716', 'ORCID')}</div><details class="details"><summary>${c.people.educationLabel} · ${c.people.careerLabel}</summary><h4>${c.people.educationLabel}</h4><ul>${c.people.education.map(e => `<li>${escape(e)}</li>`).join('')}</ul><h4>${c.people.careerLabel}</h4><ul>${c.people.career.map(e => `<li>${escape(e)}</li>`).join('')}</ul>${link(profile, c.people.profileLink)}</details></div></div>
</div></section>
<section class="section contact-section" id="contact" data-slide="${ko ? '연락처' : 'Contact'}"><div class="container contact-layout"><div><p class="eyebrow">${c.contact.label}</p><h2>${lines(c.contact.title)}</h2><p>${escape(c.contact.body)}</p></div><dl class="contact-details"><dt>${c.contact.emailLabel}</dt><dd><a href="mailto:kevinkwshin@inha.ac.kr">kevinkwshin@inha.ac.kr ${arrow}</a></dd><dt>${c.contact.locationLabel}</dt><dd>${escape(c.contact.location)}</dd></dl></div></section>
</main>
<footer class="footer container"><div><span class="footer-brand" lang="en">TMI-lab</span><span>© 2026</span><p>${escape(c.footer.affiliation)}</p></div><p lang="en">Translational Medical Intelligence Lab<br>Inha University College of Medicine</p></footer>
<nav class="slide-controls" aria-label="${ko ? '섹션 이동' : 'Section navigation'}" hidden><span class="slide-position" aria-hidden="true">01 / 08</span><span class="slide-title">TMI-lab</span><button type="button" data-slide-prev aria-label="${ko ? '이전 섹션' : 'Previous section'}"><span aria-hidden="true">↑</span></button><button type="button" data-slide-next aria-label="${ko ? '다음 섹션' : 'Next section'}"><span aria-hidden="true">↓</span></button></nav>
</body></html>`;
}
