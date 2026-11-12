import { content } from './content.mjs';
import cvRecords from './cv-records.json' with {type: 'json'};
import {grantSummaries} from './cv-summary.mjs';

export function peopleOverview(lang, asset, escape, records = cvRecords) {
  const person = content[lang].people;
  const text = (ko, en) => lang === 'ko' ? ko : en;
  const project = grantSummaries(lang, records.grants)[0];
  return `<article class="faculty-profile" aria-label="${escape(person.name)}">
      <figure class="faculty-portrait"><img src="${asset('keewon-shin')}" width="640" height="795" loading="lazy" alt="${text('신기원 교수', 'Professor Keewon Shin')}"><figcaption>${text('연구책임자', 'Principal Investigator')}</figcaption></figure>
      <div class="faculty-content">
        <header class="faculty-identity"><p class="faculty-kicker">${text('의료 AI 중개연구', 'Translational medical AI')}</p><h3>${escape(person.name)} <a class="text-link" href="cv/" aria-label="${text('신기원 교수 이력서 보기', 'View Keewon Shin’s curriculum vitae')}">CV ↗</a></h3><p class="faculty-role">${escape(person.role)}</p><p class="faculty-affiliation">${escape(person.affiliation)}</p></header>
        <p class="faculty-bio">${escape(person.bio)}</p><p class="faculty-bio-short">${text('의료영상·생체신호·멀티모달 AI를 임상 워크플로우 개선과 근거기반 치료로 연결합니다.', 'Connecting medical imaging, biosignals and multimodal AI with clinical workflows and evidence-based treatment.')}</p>
        <div class="faculty-credentials">
          <section class="faculty-education"><h4>${text('학력', 'Education')}</h4><p><span class="faculty-date">2023</span><strong>${text('의공학 박사', 'PhD · Biomedical Engineering')}</strong><span>${text('울산대학교', 'University of Ulsan')}</span></p><p class="faculty-earlier">${text('한양대학교 기계공학 석사·학사', 'MS / BS · Mechanical Engineering, Hanyang University')}</p></section>
          <section class="faculty-service"><h4>${text('학술 활동', 'Academic service')}</h4><p><span class="faculty-date">2024–</span><strong>MICCAI</strong><span>Area/Program Chair</span></p><p><span class="faculty-date">2025–</span><strong>${text('대한의료인공지능학회', 'Korean Society of AI in Medicine')}</strong><span>${text('학술위원', 'Scientific Committee Member')}</span></p></section>
        </div>
        ${project ? `<aside class="faculty-project"><p class="faculty-project-label">${text('연구과제', 'Research project')}<span>${escape(project.role)} · ${escape(project.period)}</span></p><p class="faculty-project-full">${escape(project.title)}</p><p class="faculty-project-short">${escape(project.title)}</p></aside>` : ''}
      </div>
    </article>`;
}
