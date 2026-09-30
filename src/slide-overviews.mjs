import { content } from './content.mjs';
import { researchEvidence } from './research.mjs';
import { patents } from './patents.mjs';
import { researchStories } from './stories.mjs';
import { scholarOverview } from './scholar-overview.mjs';
import { peopleOverview } from './people-overview.mjs';

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
  pages.welcome = `<div class="page-composition page-welcome identity-opening"><div class="page-copy"><p class="page-eyebrow">${escape(c.hero.eyebrow)}</p><h1 class="identity-title" lang="en"><span><span>From too much<br>information</span></span> <span><span>to Translational<br>Medical Intelligence.</span></span></h1><p class="page-lead">${escape(c.hero.description)}</p></div><div class="identity-visual">${image('tmi-logo', text('용과 거위 캐릭터가 있는 TMI-lab 로고', 'TMI-lab dragon and goose logo'),text('정보를 지능으로, 연구를 임상으로.','From complexity to clinical insight.'),'page-logo')}</div><div class="identity-directions">${c.research.items.map((r,i)=>`<a href="#${['research','research-imaging','research-signals'][i]}">${escape(r.title)}</a>`).join('')}</div><div class="page-actions"><a class="action" href="#translation">${c.hero.primary} <span aria-hidden="true">↓</span></a><a class="text-link" href="#research">${c.hero.secondary}</a></div></div>`;
  pages.translation = layout('translation',text('연구의 임상 적용','Clinical translation'),text('연구에서 임상으로, 생명을 위한 기술','From research to care. Technology for life.'),
    text('뇌출혈 환자의 골든타임을 위한 영상 기반 Triage.', 'Image-based triage for time-critical hemorrhage care.'),
    `${image('neurocad',text('AVIEW NeuroCAD 뇌 CT 분석 화면','AVIEW NeuroCAD brain CT analysis'), 'Coreline Soft · AVIEW NeuroCAD')}<div class="page-proof"><strong>100+</strong><div>${text('응급실에서 사용','emergency departments')}<small>${text('식약처 혁신의료기기 지정','MFDS Innovative Medical Device')}</small></div></div>`,
    `<a class="action" href="https://corelinesoft.com/en-gb/aview/brain/neurocad/" target="_blank" rel="noopener noreferrer">${text('공식 제품 소개','Product site')} <span aria-hidden="true">↗</span></a><button class="text-link evidence-button" data-read="translation-sources" data-title="${text('근거 및 출처','Evidence & sources')}">${text('근거 및 출처','Evidence & sources')}</button>`,
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
    pages[id]=layout(id,text('연구 분야','Research'),`${text('연구 목표','Research goal')} ${i+1}. ${r.title}`,r.question,
      `${image(f.name,f.alt,f.caption)}<dl class="page-brief"><div><dt>${text('연구 방법','Method')}</dt><dd>${escape(e.method)}</dd></div><div><dt>${text('임상적 의의','Clinical relevance')}</dt><dd>${escape(e.value)}</dd></div></dl>`,
      button(id,r.title,text('연구 자료와 근거','Study & evidence')),'page-research',paragraph(r.body,'page-extended')).replace(`<h2>${escape(`${text('연구 목표','Research goal')} ${i+1}. ${r.title}`)}</h2>`, `<h2><span class="research-goal-label">${text('연구 목표','Research goal')} ${i+1}.</span> ${escape(r.title)}</h2>`);
  });
  pages.publications=scholarOverview(lang,escape);
  pages.patents=layout('patents',text('연구 성과','Research output'),text('특허','Patents & applications'),text('의료영상과 생체신호의 분석 방법을 지식재산으로 연결합니다.','Translating imaging and biosignal methods into intellectual property.'),
    `<div class="page-list">${patents.filter(p=>p.area==='medical').slice(0,3).map((p,i)=>`<article><p class="meta">${p.year} · ${text(p.granted?'등록':'공개 출원',p.granted?'Granted':'Published application')}</p><h3>${text(['CT 영상 분류·분할','혈관 분석','심전도 분석'][i],['CT classification & segmentation','Vessel analysis','ECG analysis'][i])}</h3><p>${escape(p.summary[lang])}</p><p class="meta page-extended">${p.number}</p></article>`).join('')}</div>`,
    button('patents',text('특허','Patents'),text('전체 특허 보기','Browse all patents')),'page-listing');
  pages.people=peopleOverview(lang,asset,escape);
  pages.contact=layout('contact','Contact',text('연구 협력 및 문의','Research collaboration'),text('임상 질문을 함께 정의하고, 데이터 분석에서 검증까지 연구를 연결합니다.','Define a clinical question together, then connect data analysis with validation.'),
    `<div class="page-contact"><p class="page-contact-topics">${text('의료영상 · 생체신호 · 멀티모달 AI 공동연구','Research in medical imaging, biosignals and multimodal AI')}</p><a href="mailto:kevinkwshin@inha.ac.kr">kevinkwshin@inha.ac.kr</a><p>${escape(c.contact.location)}</p><p class="meta">${escape(c.footer.affiliation)}</p></div>`,
    `<p class="page-copyright">© 2026 Translational Medical Intelligence Lab</p>`,'page-contact-layout');
  for (const [id, stories] of Object.entries(researchStories(lang, asset, escape))) {
    pages[id] = pages[id].replace('<div class="page-actions">', `${stories}<div class="page-actions">`);
  }
  return pages;
}
