export function clinicalScene(kind, lang, asset, escape) {
  const text = (ko, en) => escape(lang === 'ko' ? ko : en);
  const illustrations = {
    mission: ['mission-clinical-research','mission-illustration',text('임상 질문에서 연구 협업과 진료 적용으로 이어지고, 임상 피드백이 다시 연구로 돌아오는 순환 개념도','Concept: clinical questions lead to collaborative research and evaluation in care; clinical feedback returns to research.')],
    twin: ['research-twin-concept','research-illustration',text('환자의 해부학적 모델에서 두 가지 가상의 수술 후 상태를 번갈아 비교하는 디지털 트윈 연구 개념도','Digital twin research concept comparing two hypothetical surgical outcomes from a patient-specific anatomical model.')],
    precision: ['research-precision-concept','research-illustration',text('안저 영상, 생체신호와 의료영상의 근거를 함께 해석하고 환자별 임상 판단으로 연결하는 멀티모달 연구 개념도','Multimodal research concept: retinal images, biosignals and medical images converge for interpretation and individual clinical decisions.')]
  };
  if (illustrations[kind]) {
    const [name, cls, alt] = illustrations[kind];
    const arrow = part => `<g class="scene-arrow" data-scene-part="${part}"><path class="scene-arrow-edge" d="M-16-11 0 0-16 11"/><path d="M-16-11 0 0-16 11"/></g>`;
    const packet = part => `<g class="scene-packet" data-scene-part="${part}"><circle r="17" class="scene-packet-halo"/><circle r="6"/></g>`;
    const layers = {
      mission: `${arrow('mission-forward-a')}${arrow('mission-forward-b')}${arrow('mission-return')}`,
      twin: `<g class="scene-option" data-scene-part="twin-option-a"><path d="M1060 378V230Q1060 220 1073 215L1187 177Q1195 174 1205 179L1319 223Q1330 227 1330 239V387"/><ellipse cx="1198" cy="400" rx="85" ry="34"/></g><g class="scene-option" data-scene-part="twin-option-b"><path d="M1071 678V522Q1071 513 1082 508L1203 458Q1211 455 1221 460L1326 502Q1337 507 1337 520V684"/><ellipse cx="1211" cy="709" rx="86" ry="33"/></g>${packet('twin-branch-a')}${packet('twin-branch-b')}`,
      precision: `<g class="scene-connections"><path d="M602 374Q680 414 805 398M752 382 805 398M919 415Q864 424 805 398"/></g>${packet('precision-retina')}${packet('precision-signal')}${packet('precision-imaging')}<g class="scene-junction" data-scene-part="precision-junction"><circle cx="805" cy="398" r="22"/><circle cx="805" cy="398" r="7"/></g>${packet('precision-care')}`
    };
    return `<figure class="evidence-figure clinical-scene ${cls}" data-clinical-scene="${kind}"><a class="evidence-media scene-art" data-zoom href="${asset(name)}" aria-label="${text('그림 확대','Enlarge figure')}: ${alt}"><img src="${asset(name)}" width="1536" height="1024" alt="${alt}" loading="lazy"><svg class="scene-overlay" viewBox="0 0 1536 1024" aria-hidden="true">${layers[kind]}</svg><span class="evidence-zoom" aria-hidden="true">${text('그림 확대','Enlarge')} ↗</span></a></figure>`;
  }
  if (kind === 'triage') {
    const alt = text('대기열 뒤쪽의 출혈 의심 뇌 CT를 앞으로 옮겨 의료진의 우선 검토로 연결하는 개념도','Concept: a late queued CT study with suspected bleeding moves to the front for priority clinical review');
    return `<figure class="evidence-figure clinical-scene triage-illustration" data-clinical-scene="triage">
      <a class="evidence-media scene-triage-art" data-zoom href="${asset('neurocad-triage-journey')}" aria-label="${text('그림 확대','Enlarge figure')}: ${alt}">
        <img src="${asset('neurocad-triage-journey')}" width="1536" height="1024" alt="${alt}" loading="lazy">
        <svg class="scene-overlay scene-triage-motion" viewBox="0 0 1536 1024" aria-hidden="true">
          <image href="${asset('neurocad-triage-clean')}" width="1536" height="1024"/>
          <g data-scene-part="triage-priority" class="scene-priority"><svg x="718" y="390" width="130" height="212" viewBox="718 390 130 212"><image href="${asset('neurocad-triage-journey')}" width="1536" height="1024" style="clip-path:path('M724 416Q727 409 736 413L770 425C762 391 809 391 807 435L831 444Q842 448 841 465L839 584Q838 598 826 593L734 560Q721 556 722 541Z')"/></svg></g>
          <g data-scene-part="triage-route" class="scene-traveller"><circle cx="780" cy="588" r="22"/><path d="M772 577h11l6 6v16h-17z M783 577v7h6 M776 589h9m-9 5h9"/></g>
          <g data-scene-part="triage-review" class="scene-review"><path d="M1164 415 L1347 477 L1345 617 L1162 554 Z"/><circle cx="1372" cy="487" r="24"/><path d="m1360 487 8 8 16-18"/></g>
        </svg>
        <span class="evidence-zoom" aria-hidden="true">${text('그림 확대','Enlarge')} ↗</span>
      </a>
    </figure>`;
  }
  const scanAlt = text('합성 복부 CT 비교 예시. 왼쪽 이전 검사보다 오른쪽 추적 검사에서 같은 간 병변이 크게 보입니다. 실제 환자 영상이나 측정 결과가 아닙니다.','Synthetic abdominal CT comparison: the same liver focus appears larger in the right follow-up than in the left prior exam. These are not patient scans or measured results.');
  const report = (period, part, current) => `<div class="scene-report" data-scene-part="${part}">
    <div class="report-heading"><strong>${period}</strong><span lang="en">CT</span></div>
    <a class="report-scan" data-zoom href="${asset('workflow-ct-comparison')}" aria-label="${period} · ${text('비교 영상 확대','Enlarge comparison')}">
      <span class="report-scan-frame${current ? ' report-scan-followup' : ''}"><img src="${asset('workflow-ct-comparison')}" width="1774" height="887" alt="${scanAlt}" loading="lazy"><svg viewBox="0 0 1000 1000" aria-hidden="true"><g data-scene-part="workflow-match"><circle cx="${current ? '306' : '309'}" cy="389" r="${current ? '48' : '37'}"/></g></svg></span>
      <span class="report-scan-enlarge" aria-hidden="true">↗</span>
    </a>
    <div class="report-row report-match" data-scene-part="workflow-match"><span>${text('간 병변','Liver focus')}</span><strong class="report-measure" lang="en">${current ? '16' : '10'} mm</strong></div>
    <div class="report-row${current ? ' report-difference' : ''}" ${current ? 'data-scene-part="workflow-difference"' : ''}><span>${text('판독문','Report')}</span><span>${current ? text('“변화 없음”','“No change”') : text('기준 검사','Baseline')}</span></div>
  </div>`;
  return `<figure class="evidence-figure clinical-scene research-illustration" data-clinical-scene="workflow">
    <div class="scene-comparison-header"><p class="scene-example-label">${text('CT 비교 예시','Illustrative CT comparison')}</p></div>
    <div class="scene-comparison" role="group" aria-label="${text('설명용 CT와 가상의 판독문 예시: 10 mm에서 16 mm로 달라진 기록과 변화 없음이라는 서술의 불일치를 비교합니다. LLM의 분석 대상은 판독문입니다.','Illustrative CT and fictional report example: compare the recorded change from 10 mm to 16 mm with the contradictory no-change statement. The LLM analyzes report text.')}">
      <div class="scene-reports">${report(text('이전 검사','Prior exam'),'workflow-prior',false)}${report(text('추적 검사','Follow-up'),'workflow-current',true)}</div>
      <div class="scene-review-note" data-scene-part="workflow-review"><svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="8" cy="8" r="5"/><path d="m12 12 5 5"/></svg><span>${text('LLM 판독문 비교 → 불일치 확인 → 의료진 검토','LLM report comparison → Discrepancy → Clinical review')}</span></div>
    </div>
  </figure>`;
}
