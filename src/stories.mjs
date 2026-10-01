import {content} from './content.mjs';
import {researchEvidence} from './research.mjs';
import {clinicalScene} from './clinical-scenes.mjs';

export function researchStories(lang, asset, escape) {
  const ko = lang === 'ko';
  const c = content[lang];
  const text = (kr, en) => ko ? kr : en;
  const p = (copy, cls = '') => `<p class="${cls}">${escape(copy)}</p>`;
  const fact = (label, copy) => `<div><dt>${label}</dt><dd>${escape(copy)}</dd></div>`;
  const route = steps => `<ol class="clinical-route" aria-label="${text('연구가 연결하는 임상 흐름','Clinical pathway addressed by the research')}">${steps.map(([label,body])=>`<li><span>${label}</span><strong>${body}</strong></li>`).join('')}</ol>`;
  const figure = (name, alt, caption, cls = '') => `<figure class="evidence-figure ${cls}"><a class="evidence-media" data-zoom href="${asset(name)}" aria-label="${text('그림 확대','Enlarge figure')}: ${escape(alt)}"><img src="${asset(name)}" alt="${escape(alt)}" loading="lazy"><span class="evidence-zoom" aria-hidden="true"><span class="evidence-zoom-label">${text('그림 확대','Enlarge')}</span><svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3H3v4m10-4h4v4M3 13v4h4m10-4v4h-4"/></svg></span></a>${caption ? `<figcaption>${escape(caption)}</figcaption>` : ''}</figure>`;
  const sheet = (markup, cls = '') => `<article class="story-sheet ${cls}">${markup}</article>`;
  const variants = (wide, narrow, short = wide) => `<div class="story-templates" hidden><div data-story-pages="wide">${wide}</div><div data-story-pages="narrow">${narrow}</div><div data-story-pages="wide-short">${short}</div></div>`;
  const stories = {};

  const neuroRoute = route(ko ? [['검사','뇌 CT 촬영'],['AI Triage','출혈 의심 영상 알림'],['의료진','우선 검토 · 치료 판단']] : [['Acquisition','Brain CT'],['AI triage','Flag suspected bleeding'],['Clinician','Review & treatment decision']]);
  const neuroImage = clinicalScene('triage', lang, asset, escape);
  const neuroBody = text('응급실의 판독 대기는 치료 판단을 늦출 수 있습니다. 뇌 CT의 출혈 의심 부위와 출혈량을 분석하고 우선 검토를 지원해, 뇌출혈 환자의 골든타임을 놓치는 상황을 줄이는 것이 목표입니다.','Waiting for a CT report can delay treatment decisions. By analyzing suspected hemorrhage and its volume, NeuroCAD supports priority review, aiming to reduce delays during the critical treatment window.');
  const neuroProof = `<div class="translation-proof"><strong>100<span>+</span></strong><div>${text('응급실에서 사용','emergency departments')}<p>${text('식약처 혁신의료기기 지정','MFDS Innovative Medical Device')}</p></div></div>`;
  const neuroIdentity = text('AVIEW NeuroCAD · 2024 코어라인소프트 기술이전','AVIEW NeuroCAD · Coreline Soft transfer, 2024');
  const neuroCopy = `<div class="story-narrative">${p(neuroIdentity,'story-status')}${p(neuroBody)}${neuroProof}<a class="text-link" href="https://doi.org/10.1016/j.media.2022.102489" target="_blank" rel="noopener noreferrer">Medical Image Analysis · 2022 ↗</a></div>`;
  stories.translation = variants(
    sheet(`${neuroCopy}<div class="story-visual">${neuroImage}${neuroRoute}</div>`,'story-feature story-triage'),
    sheet(`${p('AVIEW NeuroCAD','story-status')}${neuroImage}${neuroProof}`,'story-mobile-opening story-triage-opening')+
    sheet(`<div class="story-narrative">${p(neuroIdentity,'story-status')}${p(neuroBody,'story-goal')}</div>${neuroRoute}<a class="text-link" href="https://doi.org/10.1016/j.media.2022.102489" target="_blank" rel="noopener noreferrer">Medical Image Analysis · 2022 ↗</a>`,'story-mobile-context')
  );

  const transferImages = {
    GreyNet:['shoulder-landmarks',text('Grashey X-ray의 해부학적 랜드마크','Anatomical landmarks in a Grashey X-ray'),text('GreyNet · 촬영 품질 평가를 위한 어깨 X-ray 랜드마크','GreyNet · Shoulder landmarks for image quality assessment')],
    FlatNet:['foot-landmarks',text('체중 부하 족부 X-ray 랜드마크','Landmarks in weight-bearing foot X-rays'),text('FlatNet · 평발 평가를 위한 체중 부하 족부 X-ray 랜드마크','FlatNet · Weight-bearing foot landmarks for flatfoot assessment')],
    ProRetina:['retinal-vessels',text('망막 혈관 분할 비교','Retinal vessel segmentation comparison'),researchEvidence[lang][2].images[0].caption]
  };
  const transfers = c.translation.items.filter(t=>t.name!=='AVIEW NeuroCAD');
  const transfer = t => `<div class="illustrated-transfer">${figure(...transferImages[t.name])}<div class="transfer-story-copy"><p class="story-status">${t.year} · ${escape(t.recipient)}</p><h3>${t.name}</h3><p class="transfer-purpose">${escape(t.impact)}</p>${p(t.body)}${t.source ? `<a class="text-link" href="${t.source}" target="_blank" rel="noopener noreferrer">${text('비교 연구 읽기','Read the comparative study')} ↗</a>` : ''}</div></div>`;
  stories.transfers = variants(sheet(transfers.map(transfer).join(''),'story-transfer-grid'),transfers.map(t=>sheet(transfer(t),'story-transfer-single')).join(''),transfers.map(t=>sheet(transfer(t),'story-transfer-feature')).join(''));

  const missionStages = `<ol class="mission-process">${c.approach.steps.map((step,i)=>`<li><span class="mission-index" aria-hidden="true">${i+1}</span><div><h3>${escape(step.title)}</h3>${p(step.body)}</div></li>`).join('')}</ol>`;
  const missionImage = clinicalScene('mission', lang, asset, escape);
  const missionPurpose = `<div class="mission-purpose">${missionImage}${p(c.intro.body)}</div>`;
  stories.mission = variants(sheet(`${missionPurpose}${missionStages}`,'story-mission'),sheet(missionPurpose,'story-mobile-context story-mission-opening')+sheet(missionStages,'story-mobile-context'));

  const routes = ko ? [
    [['데이터','영상·판독문'],['분석','품질·오류 평가'],['목표','적시에 임상 검토']],
    [['관찰','해부학적 변화'],['모델','환자별 예측'],['목표','수술 계획의 근거']],
    [['측정','영상·생체신호'],['해석','정량값과 신뢰도'],['목표','환자별 치료 근거']]
  ] : [
    [['Data','Images & reports'],['Analysis','Quality & errors'],['Goal','Timely clinical review']],
    [['Observe','Anatomical change'],['Model','Individual prediction'],['Goal','Surgical planning']],
    [['Measure','Images & biosignals'],['Interpret','Value & confidence'],['Goal','Individual evidence']]
  ];
  c.research.items.forEach((r,i)=>{
    const id = ['research','research-imaging','research-signals'][i];
    const e = researchEvidence[lang][i];
    const images = e.images.map(f=>figure(f.name,f.alt,f.caption,f.layout==='comparison'?'evidence-comparison':''));
    const comparisonIndex = e.images.findIndex(f=>f.layout==='comparison');
    const concept = clinicalScene(['workflow','twin','precision'][i], lang, asset, escape);
    const facts = `<dl class="story-facts">${fact(text('연구 방법','Approach'),e.method)}${fact(text('임상적 의의','Clinical significance'),e.value)}</dl>`;
    const narrative = `<div class="story-narrative">${p(text('연구 목표','Research goal'),'story-label')}${p(r.body,'story-goal')}${facts}<div class="story-evidence-note"><h3>${escape(e.study)}</h3>${p(e.note)}</div></div>`;
    const supportingImages = images.filter((_,index)=>index!==comparisonIndex).join('');
    const visualFigures = comparisonIndex < 0 ? `${concept}<div class="research-evidence-strip ${images.length>1?'story-figures-pair':''}">${images.join('')}</div>` : `${concept}<div class="research-supporting">${images[comparisonIndex]}<div class="research-evidence-strip">${supportingImages}</div></div>`;
    const visual = `<div class="story-visual research-visual"><div class="research-images${comparisonIndex>=0?' research-comparison':''}">${visualFigures}</div>${route(routes[i])}</div>`;
    const conceptVisual = `<div class="story-visual">${concept}${route(routes[i])}</div>`;
    const opening = `<div class="story-mobile-intent">${p(e.value)}</div>${concept}`;
    const note = `<div class="story-evidence-note"><h3>${escape(e.study)}</h3>${p(e.note)}</div>`;
    const context = `<div class="story-narrative">${p(r.body,'story-goal')}<dl class="story-facts">${fact(text('연구 방법','Approach'),e.method)}</dl></div>${route(routes[i])}`;
    const compactNarrative = `<div class="story-narrative">${p(text('연구 목표','Research goal'),'story-label')}${p(r.body,'story-goal')}${facts}</div>`;
    const foundationFigures = `<div class="story-figures ${images.length>1?'story-figures-pair':''}">${images.join('')}</div>`;
    const foundation = sheet(`<div class="story-narrative">${p(text('기반 연구 · 다음 단계','Foundational work · Next steps'),'story-label')}${note}</div><div class="story-visual">${foundationFigures}</div>`,'story-feature');
    const evidencePages = comparisonIndex>=0
      ? sheet(images.join(''),'story-original-evidence story-evidence-combined')+sheet(note,'story-mobile-context')
      : images.map((image,index)=>sheet(`${image}${index===0?note:''}`,'story-mobile-opening story-original-evidence')).join('');
    stories[id] = variants(sheet(narrative+visual,'story-feature story-research'),sheet(opening,'story-mobile-opening')+sheet(context,'story-mobile-context')+evidencePages,sheet(compactNarrative+conceptVisual,'story-feature story-research')+foundation);
  });
  return stories;
}
