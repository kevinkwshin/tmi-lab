export function clinicalScene(kind, lang, asset, escape) {
  const text = (ko, en) => escape(lang === 'ko' ? ko : en);
  const replay = `<button type="button" class="scene-replay" data-scene-replay aria-label="${text('설명 애니메이션 다시 보기','Replay the explanatory animation')}"><svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 7a6 6 0 1 1-1 5M4 3v4h4"/></svg><span>${text('다시 보기','Replay')}</span></button>`;
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
      <figcaption class="scene-caption"><span>${text('우선 판독 과정 · AI 생성 개념도','Priority review · AI-generated concept')}</span>${replay}</figcaption>
    </figure>`;
  }
  const report = (period, part, current) => `<div class="scene-report" data-scene-part="${part}">
    <div class="report-heading"><svg width="18" height="22" viewBox="0 0 18 22" fill="none" stroke="currentColor" aria-hidden="true"><path d="M2 1h9l5 5v15H2z M11 1v6h5 M5 11h8m-8 4h8"/></svg><strong>${period}</strong></div>
    <div class="report-row"><span>${text('소견','Finding')}</span><span class="report-value">${current ? text('추적 소견','Follow-up') : text('이전 소견','Recorded')}</span></div>
    <div class="report-row report-match" data-scene-part="workflow-match"><span>${text('부위','Region')}</span><span class="report-value">${text('동일 부위','Matched')}</span><span class="report-correspondence" aria-hidden="true">${current ? '←' : '→'}</span></div>
    <div class="report-row report-difference" data-scene-part="workflow-difference"><span>${text('비교','Change')}</span><span class="report-value">${current ? text('차이 확인','Review') : text('기준 소견','Baseline')}</span><span class="report-attention" aria-hidden="true">!</span></div>
  </div>`;
  return `<figure class="evidence-figure clinical-scene research-illustration" data-clinical-scene="workflow">
    <div class="scene-comparison" role="img" aria-label="${text('설명용 예시: 이전 검사와 추적 검사 판독문에서 대응하는 정보를 비교하고 확인할 차이를 의료진에게 제시합니다.','Illustrative example: compare corresponding information in prior and follow-up reports and surface a difference for clinician review.')}">
      <div class="scene-reports" aria-hidden="true">${report(text('이전 검사','Prior exam'),'workflow-prior',false)}${report(text('추적 검사','Follow-up'),'workflow-current',true)}</div>
      <div class="scene-review-note" data-scene-part="workflow-review" aria-hidden="true"><svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="5"/><path d="m12 12 5 5"/></svg><span>${text('차이를 찾아, 의료진의 확인으로','Surface differences for clinician review')}</span></div>
    </div>
    <figcaption class="scene-caption"><span>${text('종단 판독문 비교 · 설명용 예시','Longitudinal report comparison · illustrative example')}</span>${replay}</figcaption>
  </figure>`;
}
