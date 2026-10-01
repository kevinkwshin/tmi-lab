export const neurocadSources = {
  designation: 'https://www.hitnews.co.kr/news/articleView.html?idxno=31082',
  registry: 'https://kind.krx.co.kr/external/2025/05/30/000645/20250530001205/10601.htm',
  usage: 'https://v.daum.net/v/20260626103914343',
  hospital: 'https://www.dailymedi.com/dmedi/news/news_view.php?ca_id=2206&wr_id=935400'
};

export function neurocadProof(lang, escape) {
  const text = (ko, en) => lang === 'ko' ? ko : en;
  return `<div class="translation-proof">
    <a class="neurocad-designation" href="${escape(neurocadSources.designation)}" target="_blank" rel="noopener noreferrer">
      <strong>${text('식약처 혁신의료기기 지정', 'MFDS Innovative Medical Device')}</strong>
      <span class="neurocad-proof-meta"><span>${text('제7호 · 2020.11.17', 'No. 7 · 17 Nov 2020')}</span><span>${text('지정 기사', 'Designation news')} <span aria-hidden="true">↗</span></span></span>
    </a>
    <a class="neurocad-usage" href="${escape(neurocadSources.usage)}" target="_blank" rel="noopener noreferrer">
      <strong>50,000<span>+</span></strong>
      <span><b>${text('누적 임상 사용', 'Clinical uses')}</b><small>${text('2026.04 기준 · 관련 기사', 'As of Apr 2026 · News')} <span aria-hidden="true">↗</span></small></span>
    </a>
  </div>`;
}

export function neurocadHospitalLink(lang, escape) {
  return `<a class="text-link neurocad-hospital-link" href="${escape(neurocadSources.hospital)}" target="_blank" rel="noopener noreferrer">${lang === 'ko' ? '포항세명기독병원 응급실 도입 사례' : 'Emergency-care adoption at Pohang Semyung Christian Hospital'} <span aria-hidden="true">↗</span></a>`;
}

export function neurocadEvidence(lang, escape) {
  const text = (ko, en) => lang === 'ko' ? ko : en;
  const source = (url, label) => `<a class="text-link" href="${escape(url)}" target="_blank" rel="noopener noreferrer">${label} <span aria-hidden="true">↗</span></a>`;
  return `<div class="neurocad-source-list">
    <article><h4>${text('식약처 혁신의료기기 제7호 지정', 'MFDS Innovative Medical Device No. 7')}</h4><p>${text('AVIEW NeuroCAD의 최초 지정일은 2020년 11월 17일입니다. 2023년 통합심사·평가 및 혁신의료기술 선정과 구분되는 이력입니다.', 'AVIEW NeuroCAD was first designated on 17 November 2020. This precedes the separate integrated review and innovative medical technology designation in 2023.')}</p><div class="cluster">${source(neurocadSources.designation, text('히트뉴스 · 2020.11.18', 'Hit News · 18 Nov 2020'))}${source(neurocadSources.registry, text('지정일·번호 확인: 한국거래소 공시', 'Designation date & number: KRX filing'))}</div></article>
    <article><h4>${text('누적 5만 건 이상의 임상 사용', 'More than 50,000 clinical uses')}</h4><p>${text('2026년 6월 보도에 따르면, 같은 해 4월 기준 누적 사용 건수가 5만 건을 넘었습니다. 병원 수가 아닌 제품 사용 건수입니다.', 'A June 2026 report records more than 50,000 cumulative uses as of April 2026. This measures product use, not the number of hospitals.')}</p>${source(neurocadSources.usage, text('한스경제 · 2026.06.26', 'Hans Economy · 26 Jun 2026'))}</article>
    <article><h4>${text('응급 진료의 우선 판독을 지원', 'Supporting priority review in emergency care')}</h4><p>${text('포항세명기독병원은 응급 진료에 NeuroCAD를 도입했습니다. 뇌 CT의 출혈 의심 소견과 정량 정보를 의료진에게 전달해 초기 판단을 돕는 활용 사례입니다.', 'Pohang Semyung Christian Hospital has adopted NeuroCAD in emergency care. Alerts and quantitative findings from brain CT support clinicians’ initial review.')}</p>${source(neurocadSources.hospital, text('데일리메디 · 2026.04.07', 'Daily Medi · 7 Apr 2026'))}</article>
  </div>`;
}
