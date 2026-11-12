import { content } from './content.mjs';
import { clinicalScene } from './clinical-scenes.mjs';
import { scholarOverview } from './scholar-overview.mjs';
import { peopleOverview } from './people-overview.mjs';
import { identityLogo } from './identity.mjs';
import { neurocadProof } from './neurocad-evidence.mjs';

export function slideOverviews(lang, asset, escape, records) {
  const c = content[lang];
  const text = (ko, en) => lang === 'ko' ? ko : en;
  const researchIds = ['research', 'research-imaging', 'research-signals'];
  const detailButton = (target, label, title = label, style = 'action') => `
    <button type="button" class="${style}" data-read="${target}" data-title="${escape(title)}" aria-haspopup="dialog">${escape(label)}</button>`;
  const frame = (id, title, lead, summary, actions) => `
    <div class="deck-page deck-curated deck-${id}">
      <header class="deck-heading"><h2>${escape(title)}</h2>${lead ? `<p class="deck-lead">${escape(lead)}</p>` : ''}</header>
      <div class="deck-body"><div class="deck-summary">${summary}</div></div>
      <div class="deck-actions">${actions}</div>
    </div>`;

  const pages = {};
  pages.welcome = `
    <div class="page-composition page-welcome identity-opening">
      <div class="page-copy">
        <p class="page-eyebrow">${escape(c.hero.eyebrow)}</p>
        <h1 class="identity-title" lang="en"><span><span>From <span class="identity-initial">T</span>oo <span class="identity-initial">M</span>uch <span class="identity-initial">I</span>nformation</span></span> <span><span>to <span class="identity-initial">T</span>ranslational <span class="identity-initial">M</span>edical <span class="identity-initial">I</span>ntelligence</span></span></h1>
        <p class="page-lead">${escape(c.hero.description)} ${detailButton('detail-mission', text('연구실 개요', 'About the lab'), undefined, 'intro-detail')}</p>
      </div>
      <div class="identity-visual">${identityLogo(lang,asset,escape)}</div>
      <div class="identity-directions"><span class="identity-directions-label">${text('연구 목표','Research goals')}</span>${c.research.items.map((r,i)=>`<a href="#${researchIds[i]}">${escape(r.title)}</a>`).join('')}</div>
      <div class="page-actions"><a class="action" href="#translation">${c.hero.primary} <span aria-hidden="true">↓</span></a><a class="text-link" href="#research">${c.hero.secondary}</a></div>
    </div>`;

  pages.translation = frame(
    'translation', 'AVIEW NeuroCAD',
    text('뇌 CT에서 출혈이 의심되는 환자를 먼저 판독하도록 돕습니다.',
         'Flagging suspected hemorrhage on brain CT for priority review.'),
    `<div class="transfer-summary"><p class="transfer-partner">${text('2024년 · 코어라인소프트 기술이전', '2024 · Technology transfer to Coreline Soft')}</p>
      ${neurocadProof(lang, escape)}</div>${clinicalScene('triage', lang, asset, escape)}`,
    detailButton('detail-translation', text('NeuroCAD 자세히 보기', 'Explore NeuroCAD'), 'AVIEW NeuroCAD') +
    detailButton('detail-transfers', text('다른 기술이전 사례', 'Other transfers'), text('기술이전 사례', 'Technology transfers'), 'text-link')
  );

  const scenes = ['workflow', 'twin', 'precision'];
  const questions = [
    text('판독에서 놓치기 쉬운 변화를 어떻게 찾을 수 있을까?', 'How can we spot changes that are easy to miss in radiology reports?'),
    text('환자마다 다른 치료 후 변화를 미리 볼 수 있을까?', 'Can we predict how an individual patient will change after treatment?'),
    text('같은 진단을 받은 환자들의 위험과 치료 반응은 어떻게 다를까?', 'How do risk and treatment response vary among patients with the same diagnosis?')
  ];
  const summaries = [
    text('이전 검사와 추적 검사 판독문을 비교해 서로 맞지 않는 기록을 찾는 AI를 연구합니다.',
         'We compare earlier and follow-up reports to find inconsistencies that need a second look.'),
    text('수술 전 영상과 임상정보로 수술 후의 해부학적 변화를 예측하는 환자별 모델을 연구합니다.',
         'We use preoperative images and clinical data to study how each patient’s anatomy may change after surgery.'),
    text('영상·생체신호·전자의무기록(EMR)에서 환자별 위험과 치료 반응을 파악할 디지털 바이오마커를 찾습니다.',
         'We look for digital biomarkers of risk and treatment response in images, biosignals and electronic medical records (EMR).')
  ];
  c.research.items.forEach((r, i) => {
    const id = researchIds[i];
    pages[id] = frame(id, r.title, questions[i],
      `<p class="study-summary">${escape(summaries[i])}</p>${clinicalScene(scenes[i], lang, asset, escape)}`,
      detailButton(`detail-${id}`, text('연구 자료와 근거', 'Study & evidence'), r.title));
  });

  pages.publications = frame(
    'publications', text('연구 성과', 'Research output'), '',
    scholarOverview(lang, escape),
    detailButton('publication-content', text('전체 논문 · 검색', 'All papers & search'), text('논문', 'Publications')) +
    detailButton('patent-content', text('전체 특허 보기', 'View patents'), text('특허', 'Patents'), 'text-link')
  );
  pages.people = frame(
    'people', text('구성원 소개', 'People'), '',
    peopleOverview(lang, asset, escape, records),
    detailButton('detail-people', text('학력 · 주요 경력 · 수행과제', 'Education · Career · Project'), c.people.name)
  );
  pages.contact = frame(
    'contact', text('연구 협력 및 문의', 'Research collaboration'), '',
    `<div class="page-copy"><p class="page-lead">${text('의료영상·생체신호·멀티모달 AI 공동연구', 'Collaborative research in medical imaging, biosignals and multimodal AI')}</p></div>
     <div class="page-contact"><a href="mailto:kevinkwshin@inha.ac.kr">kevinkwshin@inha.ac.kr</a><p>${escape(c.contact.location)}</p><p class="meta">${escape(c.footer.affiliation)}</p></div>`,
    '<p class="page-copyright">© 2026 Translational Medical Intelligence Lab</p>'
  );
  return pages;
}
