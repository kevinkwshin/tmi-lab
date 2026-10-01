import { content } from './content.mjs';

export function peopleOverview(lang, asset, escape) {
  const person = content[lang].people;
  const text = (ko, en) => lang === 'ko' ? ko : en;
  const title = text('구성원 소개', 'People');
  const project = text('건강진단의 멀티모달 추적관찰 데이터 기반 심혈관 질환 조기 예측 AI 시스템 개발', 'Development of an AI system for early cardiovascular disease prediction using multimodal longitudinal health screening data');
  return `<div class="page-composition page-people">
    <div class="page-copy people-fallback"><p class="page-eyebrow">People</p><h2>${title}</h2><p class="page-lead">${escape(person.name)} · ${escape(person.role)}<br>${escape(person.affiliation)}</p><p class="page-context">${text('의료영상·생체신호·멀티모달 AI를 임상으로 연결하는 중개연구.', 'Translational research connecting medical imaging, biosignals and multimodal AI with clinical practice.')}</p></div>
    <article class="faculty-profile" aria-label="${escape(person.name)}">
      <figure class="faculty-portrait"><img src="${asset('keewon-shin')}" width="640" height="795" loading="lazy" alt="${text('신기원 교수', 'Professor Keewon Shin')}"><figcaption>${text('연구책임자', 'Principal Investigator')}</figcaption></figure>
      <div class="faculty-content">
        <header class="faculty-identity"><p class="faculty-kicker">${text('의료 AI 중개연구', 'Translational medical AI')}</p><h3>${escape(person.name)}</h3><p class="faculty-role">${escape(person.role)}</p><p class="faculty-affiliation">${escape(person.affiliation)}</p></header>
        <p class="faculty-bio">${escape(person.bio)}</p><p class="faculty-bio-short">${text('의료영상·생체신호·멀티모달 AI를 임상 워크플로우 개선과 근거기반 치료로 연결합니다.', 'Connecting medical imaging, biosignals and multimodal AI with clinical workflows and evidence-based treatment.')}</p>
        <div class="faculty-credentials">
          <section class="faculty-education"><h4>${text('학력', 'Education')}</h4><p><span class="faculty-date">2023</span><strong>${text('의공학 박사', 'PhD · Biomedical Engineering')}</strong><span>${text('울산대학교', 'University of Ulsan')}</span></p><p class="faculty-earlier">${text('한양대학교 기계공학 석사·학사', 'MS / BS · Mechanical Engineering, Hanyang University')}</p></section>
          <section class="faculty-service"><h4>${text('학술 활동', 'Academic service')}</h4><p><span class="faculty-date">2024–</span><strong>MICCAI</strong><span>Area/Program Chair</span></p><p><span class="faculty-date">2025–</span><strong>${text('대한의료인공지능학회', 'Korean Society of AI in Medicine')}</strong><span>${text('학술위원', 'Scientific Committee Member')}</span></p></section>
        </div>
        <aside class="faculty-project"><p class="faculty-project-label">${text('수행과제', 'Current project')}<span>${text('핵심연구A · 연구책임자', 'Core Research A · Principal Investigator')}</span></p><p class="faculty-project-full">${project}</p><p class="faculty-project-short">${text('멀티모달 추적관찰 기반 심혈관 질환 조기 예측 AI', 'Multimodal longitudinal AI for early cardiovascular disease prediction')}</p></aside>
      </div>
    </article>
    <div class="page-actions"><button class="action" data-read="detail-people" data-title="${text('구성원 · 학력 · 주요 경력 · 수행과제', 'People · Education · Career · Research project')}">${text('학력 · 주요 경력 · 수행과제', 'Education · Career · Project')} <span aria-hidden="true">↗</span></button></div>
  </div>`;
}
