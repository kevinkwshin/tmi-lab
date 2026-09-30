export function clinicalScene(kind, lang, asset, escape) {
  const text = (ko, en) => escape(lang === 'ko' ? ko : en);
  if (kind === 'triage') {
    const alt = text('대기 중인 뇌 CT에서 출혈 의심 영상을 표시하고 의료진의 우선 검토로 연결하는 개념도','Concept: a CT study with suspected bleeding is flagged in the queue and routed for priority clinical review');
    return `<figure class="evidence-figure clinical-scene triage-illustration" data-clinical-scene="triage">
      <a class="evidence-media scene-triage-art" data-zoom href="${asset('neurocad-triage-journey')}" aria-label="${text('그림 확대','Enlarge figure')}: ${alt}">
        <img src="${asset('neurocad-triage-journey')}" width="1536" height="1024" alt="${alt}" loading="lazy">
        <svg class="scene-triage-overlay" viewBox="0 0 1536 1024" aria-hidden="true">
          <g data-scene-part="triage-alert" class="scene-alert"><path d="M725 426 Q725 411 739 416 L826 448 Q840 453 838 469 L835 580 Q834 596 820 591 L736 559 Q723 554 724 538 Z"/><circle cx="788" cy="421" r="29"/></g>
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
