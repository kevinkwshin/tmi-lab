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
  const layout = (id, tag, title, body, visual, action, cls = '', context = '') => `<div class="page-composition ${cls}"><div class="page-copy"><p class="page-eyebrow">${escape(tag)}</p><${id === 'welcome' ? 'h1' : 'h2'}>${escape(title)}</${id === 'welcome' ? 'h1' : 'h2'}>${body ? `<p class="page-lead">${escape(body)}</p>` : ''}${context}</div>${visual}<div class="page-actions">${action || button(id,title)}</div></div>`;
  const paragraph = (body, cls = '') => `<p class="page-context ${cls}">${escape(body)}</p>`;
  const pages = {};
  pages.welcome = layout('welcome', c.hero.eyebrow, 'TMI-lab', c.hero.description,
    image('tmi-logo', text('용과 거위 캐릭터가 있는 TMI-lab 로고', 'TMI-lab dragon and goose logo'), 'Translational Medical Intelligence Lab', 'page-logo'),
    `<a class="action" href="#translation">${c.hero.primary} <span aria-hidden="true">↓</span></a><a class="text-link" href="#research">${c.hero.secondary}</a>`, 'page-welcome', paragraph(text('임상 워크플로우 개선 · 디지털 트윈 · 정밀의료', 'Clinical workflow · Digital twins · Precision medicine')));
  pages.translation = layout('translation','Coreline Soft · 2024','AVIEW NeuroCAD',
    text('뇌출혈 환자의 골든타임을 위한 영상 기반 Triage.', 'Image-based triage for time-critical hemorrhage care.'),
    `${image('neurocad',text('AVIEW NeuroCAD 뇌 CT 분석 화면','AVIEW NeuroCAD brain CT analysis'), 'Coreline Soft · AVIEW NeuroCAD')}<div class="page-proof"><strong>100+</strong><div>${text('응급실에서 사용','emergency departments')}<small>${text('식약처 혁신의료기기 지정 · 도입 규모: 연구실 제공, 2026.09','MFDS Innovative Medical Device · Adoption: lab-provided, Sep 2026')}</small></div></div>`,
    `<a class="action" href="https://corelinesoft.com/en-gb/aview/brain/neurocad/" target="_blank" rel="noopener noreferrer">${text('NeuroCAD 공식 제품 소개','Explore NeuroCAD at Coreline Soft')} <span aria-hidden="true">↗</span></a>`,
    'page-product', paragraph(c.translation.items.find(t=>t.name==='AVIEW NeuroCAD').body));
  pages.transfers = layout('transfers',text('기술이전','Technology transfer'),text('연구가 이어진 기술들','A portfolio of translation'),text('촬영 품질부터 정량적 평가까지, 진료 과정의 구체적인 문제를 해결합니다.','From image quality to quantitative assessment: AI for specific steps in care.'),
    `<div class="page-list">${c.translation.items.filter(t=>t.name!=='AVIEW NeuroCAD').map(t=>`<article><p class="meta">${t.year} · ${escape(t.recipient)}</p><h3>${escape(t.name)}</h3><p>${escape(t.summary)}</p></article>`).join('')}</div>`,null,'page-listing');
  pages.mission = layout('mission','Our mission',text('정보를 지능으로, 연구를 임상으로.','From information to intelligence.'),
    c.intro.body,
    `<ol class="page-steps">${c.approach.steps.map(s=>`<li><h3>${escape(s.title)}</h3><p>${escape(s.body)}</p></li>`).join('')}</ol>`,null,'page-mission');
  c.research.items.forEach((r,i)=>{
    const id=['research','research-imaging','research-signals'][i];
    const e=researchEvidence[lang][i];
    const f=e.images[0];
    pages[id]=layout(id,text('연구 분야','Research'),r.title,r.question,
      `${image(f.name,f.alt,f.caption)}<dl class="page-brief"><div><dt>${text('연구 방법','Method')}</dt><dd>${escape(e.method)}</dd></div><div><dt>${text('임상적 의의','Clinical relevance')}</dt><dd>${escape(e.value)}</dd></div></dl>`,
      button(id,r.title,text('연구 자료와 근거','Study & evidence')),'page-research',paragraph(r.body,'page-extended'));
  });
  const selectedPapers = [
    {paper:publications.find(p=>p.doi==='10.1016/j.xcrm.2026.103020'), topic:text('의료 전문지식을 학습하는 LLM','Medical knowledge injection for LLMs')},
    {paper:publications.find(p=>p.doi==='10.1002/mp.70285'), topic:text('Grashey X-ray의 촬영 품질 평가','Quality assessment of Grashey X-rays')},
    {paper:publications.find(p=>p.doi==='10.1016/j.compbiomed.2023.107532'), topic:text('새로운 데이터에서도 견고한 심전도 분석','ECG detection in unseen datasets')}
  ];
  pages.publications=layout('publications',text('연구 성과','Research output'),c.publications.title,
    text('의학 전문지식, 영상 품질, 생체신호. 임상 적용을 뒷받침하는 연구를 축적합니다.','Medical expertise, image quality and biosignals: building evidence for clinical AI.'),
    `<div class="page-list page-papers">${selectedPapers.map(({paper,topic})=>`<article><p class="meta">${paper.year} · ${escape(paper.journal)}</p><h3><a href="https://doi.org/${paper.doi}" target="_blank" rel="noopener noreferrer" aria-label="${escape(topic)}: ${escape(paper.title)}">${escape(topic)} <span aria-hidden="true">↗</span></a></h3><p class="page-extended" lang="en">${escape(paper.title)}</p></article>`).join('')}</div>`,
    `<button class="action" data-read="publication-content" data-title="${escape(c.publications.title)}">${text('전체 논문 · 검색','All publications & search')} <span aria-hidden="true">↗</span></button><a class="text-link" href="https://scholar.google.com/citations?user=prJCNYoAAAAJ&hl=en" target="_blank" rel="noopener noreferrer">Google Scholar <span aria-hidden="true">↗</span></a>`,'page-listing');
  pages.patents=layout('patents',text('연구 성과','Research output'),text('특허','Patents & applications'),text('의료영상과 생체신호의 분석 방법을 지식재산으로 연결합니다.','Translating imaging and biosignal methods into intellectual property.'),
    `<div class="page-list">${patents.filter(p=>p.area==='medical').slice(0,3).map((p,i)=>`<article><p class="meta">${p.year} · ${text(p.granted?'등록':'공개 출원',p.granted?'Granted':'Published application')}</p><h3>${text(['CT 영상 분류·분할','혈관 분석','심전도 분석'][i],['CT classification & segmentation','Vessel analysis','ECG analysis'][i])}</h3><p>${escape(p.summary[lang])}</p><p class="meta page-extended">${p.number}</p></article>`).join('')}</div>`,
    button('patents',text('특허','Patents'),text('전체 특허 보기','Browse all patents')),'page-listing');
  pages.people=layout('people',text('구성원 소개','People'),c.people.name,c.people.affiliation,
    `<div class="page-person">${image('keewon-shin',text('신기원 교수','Professor Keewon Shin'),c.people.role)}<div><h3 class="page-person-label">${text('학력 · 주요 경력','Education & academic service')}</h3><p class="meta">${escape(c.people.education[0])}</p><p class="meta">${escape(c.people.career[2])}</p><p class="meta">${escape(c.people.career[0])}</p><p class="meta">${escape(c.people.career[1])}</p><p class="page-project">${text('핵심연구A · 연구책임자','Core Research A · Principal Investigator')}<br>${text('멀티모달 추적관찰 기반 심혈관 질환 조기 예측','Early cardiovascular prediction from multimodal longitudinal data')}</p></div></div>`,
    button('people',text('구성원 · 학력 · 주요 경력 · 수행과제','People · Education · Career · Research project'),text('학력 · 주요 경력 · 수행과제','Education · Career · Project')),'page-people',paragraph(c.people.bio,'page-extended'));
  pages.contact=layout('contact','Contact',text('연구 협력 및 문의','Research collaboration'),text('임상 질문을 함께 정의하고, 데이터 분석에서 검증까지 연구를 연결합니다.','Define a clinical question together, then connect data analysis with validation.'),
    `<div class="page-contact"><p class="page-contact-topics">${text('의료영상 · 생체신호 · 멀티모달 AI 공동연구','Research in medical imaging, biosignals and multimodal AI')}</p><a href="mailto:kevinkwshin@inha.ac.kr">kevinkwshin@inha.ac.kr</a><p>${escape(c.contact.location)}</p><p class="meta">${escape(c.footer.affiliation)}</p></div>`,
    `<p class="page-copyright">© 2026 Translational Medical Intelligence Lab</p>`,'page-contact-layout');
  return pages;
}
