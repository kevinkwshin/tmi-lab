import { content } from './content.mjs';
import { researchEvidence } from './research.mjs';
import { publications } from './publications.mjs';
import { patents } from './patents.mjs';

// Full source material stays in the adjacent detail view and reading document.
export function slideOverviews(lang, asset, escape) {
  const c = content[lang];
  const ko = lang === 'ko';
  const text = (kr, en) => ko ? kr : en;
  const button = (id, title, label = text('자세히 보기', 'Explore in detail')) => `<button class="action" data-read="detail-${id}" data-title="${escape(title)}">${escape(label)} <span aria-hidden="true">↗</span></button>`;
  const sizes = Object.fromEntries(researchEvidence[lang].flatMap(e => e.images).map(f => [f.name, [f.width, f.height]]));
  Object.assign(sizes, {'tmi-logo':[1200,810], neurocad:[1200,650], 'shoulder-landmarks':[800,956], 'keewon-shin':[640,795]});
  const image = (name, alt, caption, cls = '') => `<figure class="page-figure ${cls}"><img src="${asset(name)}" width="${sizes[name][0]}" height="${sizes[name][1]}" alt="${escape(alt)}" ${name === 'tmi-logo' ? 'fetchpriority="high"' : 'loading="lazy"'}><figcaption>${escape(caption)}</figcaption></figure>`;
  const layout = (id, tag, title, body, visual, action, cls = '') => `<div class="page-composition ${cls}"><div class="page-copy"><p class="page-eyebrow">${escape(tag)}</p><${id === 'welcome' ? 'h1' : 'h2'}>${escape(title)}</${id === 'welcome' ? 'h1' : 'h2'}>${body ? `<p class="page-lead">${escape(body)}</p>` : ''}</div>${visual}<div class="page-actions">${action || button(id,title)}</div></div>`;
  const pages = {};
  pages.welcome = layout('welcome', c.hero.eyebrow, 'TMI-lab', c.hero.description,
    image('tmi-logo', text('용과 거위 캐릭터가 있는 TMI-lab 로고', 'TMI-lab dragon and goose logo'), 'Translational Medical Intelligence Lab', 'page-logo'),
    `<a class="action" href="#translation">${c.hero.primary} <span aria-hidden="true">↓</span></a><a class="text-link" href="#research">${c.hero.secondary}</a>`, 'page-welcome');
  pages.translation = layout('translation','Coreline Soft · 2024','AVIEW NeuroCAD',
    text('뇌출혈 환자의 골든타임을 위한 영상 기반 Triage.', 'Image-based triage for time-critical hemorrhage care.'),
    `${image('neurocad',text('AVIEW NeuroCAD 뇌 CT 분석 화면','AVIEW NeuroCAD brain CT analysis'), 'Coreline Soft · AVIEW NeuroCAD')}<div class="page-proof"><strong>100+</strong><div>${text('응급실에서 사용','emergency departments')}<small>${text('식약처 혁신의료기기 지정 · 도입 규모: 연구실 제공, 2026.09','MFDS Innovative Medical Device · Adoption: lab-provided, Sep 2026')}</small></div></div>`,null,'page-product');
  pages.transfers = layout('transfers',text('기술이전','Technology transfer'),text('연구가 이어진 기술들','A portfolio of translation'),'',
    `<div class="page-list">${c.translation.items.filter(t=>t.name!=='AVIEW NeuroCAD').map(t=>`<article><p class="meta">${t.year} · ${escape(t.recipient)}</p><h3>${escape(t.name)}</h3><p>${escape(t.impact)}</p></article>`).join('')}</div>`,null,'page-listing');
  pages.clinical = layout('clinical','GreyNet',text('촬영 직후, 품질 확인.','Quality checks at acquisition.'),
    text('Grashey X-ray의 자세를 평가해, 필요할 때 방사선사에게 즉시 재촬영을 요청합니다.','Checks Grashey X-ray positioning to request an immediate retake from the radiographer when needed.'),
    image('shoulder-landmarks',text('어깨 X-ray 랜드마크 연구','Shoulder X-ray landmark study'),text('연구 발표자료 · Grashey X-ray','Research presentation · Grashey X-ray')),null,'page-research');
  pages.mission = layout('mission','Our mission',text('정보를 지능으로, 연구를 임상으로.','From information to intelligence.'),
    text('임상 질문에서 출발해, 진료의 다음 결정을 돕는 근거를 만듭니다.','Start with a clinical question. Build evidence for the next decision.'),
    `<ol class="page-steps">${c.approach.steps.map(s=>`<li>${escape(s.title)}</li>`).join('')}</ol>`,null,'page-mission');
  c.research.items.forEach((r,i)=>{
    const id=['research','research-imaging','research-signals'][i];
    const e=researchEvidence[lang][i];
    const f=e.images[0];
    pages[id]=layout(id,text('연구 분야','Research'),r.title,r.question,
      `${image(f.name,f.alt,f.caption)}<p class="page-method">${escape(e.method)}</p>`,
      button(id,r.title,text('연구 방법과 의의','Methods & clinical relevance')),'page-research');
  });
  const paper=publications[0];
  pages.publications=layout('publications',text('연구 성과','Research output'),c.publications.title,'',
    `<article class="page-featured"><p class="meta">${paper.year} · ${escape(paper.journal)}</p><h3 lang="en">${escape(paper.title)}</h3><p>${text('AI의 의학 전문성을 확장하는 지식 주입 연구','Knowledge injection to expand medical expertise in AI')}</p></article>`,
    `${button('publications',c.publications.title,text('논문 목록 · 검색','Browse & search'))}<a class="text-link" href="https://scholar.google.com/citations?user=prJCNYoAAAAJ&hl=en" target="_blank" rel="noopener noreferrer">Google Scholar <span aria-hidden="true">↗</span></a>`,'page-listing');
  pages.patents=layout('patents',text('연구 성과','Research output'),text('특허','Patents & applications'),'',
    `<div class="page-list">${patents.filter(p=>p.area==='medical').slice(0,3).map((p,i)=>`<article><p class="meta">${p.year} · ${p.number}</p><h3>${text(['CT 영상 분류·분할','혈관 분석','심전도 분석'][i],['CT classification & segmentation','Vessel analysis','ECG analysis'][i])}</h3></article>`).join('')}</div>`,
    button('patents',text('특허','Patents'),text('전체 특허 보기','Browse all patents')),'page-listing');
  pages.people=layout('people',text('구성원 소개','People'),c.people.name,c.people.affiliation,
    `<div class="page-person">${image('keewon-shin',text('신기원 교수','Professor Keewon Shin'),c.people.role)}<div><p class="page-person-focus">${text('임상 워크플로우 · 디지털 트윈 · 정밀의료','Clinical workflow · Digital twins · Precision medicine')}</p><p class="meta">${escape(c.people.education[0])}</p><p class="meta">${escape(c.people.career[2])}</p><p class="page-project">${text('핵심연구A · 연구책임자','Core Research A · Principal Investigator')}<br>${text('멀티모달 추적관찰 기반 심혈관 질환 조기 예측','Early cardiovascular prediction from multimodal longitudinal data')}</p></div></div>`,
    button('people',text('구성원 · 학력 · 주요 경력 · 수행과제','People · Education · Career · Research project'),text('학력 · 주요 경력 · 수행과제','Education · Career · Project')),'page-people');
  pages.contact=layout('contact','Contact',text('연구 협력 및 문의','Research collaboration'),'',
    `<div class="page-contact"><a href="mailto:kevinkwshin@inha.ac.kr">kevinkwshin@inha.ac.kr</a><p>${escape(c.contact.location)}</p><p class="meta">${escape(c.footer.affiliation)}</p></div>`,
    `<p class="page-copyright">© 2026 Translational Medical Intelligence Lab</p>`,'page-contact-layout');
  return pages;
}
