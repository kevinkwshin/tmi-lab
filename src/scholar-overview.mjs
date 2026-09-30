import { scholarProfile } from './scholar.mjs';

export function scholarOverview(lang, escape) {
  const ko = lang === 'ko';
  const text = (kr, en) => ko ? kr : en;
  const checkedYear = Number(scholarProfile.checked.slice(0, 4));
  const ceiling = Math.ceil(Math.max(...scholarProfile.trend.map(point => point.count)) / 100) * 100;
  const checked = `<time datetime="${escape(scholarProfile.checked)}">${escape(scholarProfile.checked)}</time>`;
  const title = text('논문', 'Publications');
  const partial = text('집계 중', 'Partial year');
  const bars = scholarProfile.trend.map(point => {
    const isPartial = point.year === checkedYear;
    return `<li class="scholar-year${isPartial ? ' scholar-year-partial' : ''}" aria-label="${point.year}: ${point.count} ${text('회 인용', 'citations')}${isPartial ? ` · ${partial}` : ''}"><div class="scholar-bar-space" aria-hidden="true"><div class="scholar-bar" style="height:${point.count / ceiling * 100}%"><span class="scholar-bar-value">${point.count}</span></div></div><span class="scholar-year-label" aria-hidden="true">${point.year}${isPartial ? '*' : ''}</span></li>`;
  }).join('');
  return `<div class="page-composition page-scholar">
    <div class="page-copy"><p class="page-eyebrow">${text('연구 성과', 'Research output')}</p><h2>${title}</h2><p class="page-lead">${text('연구의 확산을 보여주는 인용 기록.', 'A growing body of research, cited across the field.')}</p></div>
    <div class="scholar-overview">
      <div class="scholar-overview-top"><p class="scholar-source">Google Scholar <span>${text('신기원 교수 연구 프로필', 'Keewon Shin · Research profile')}</span></p><p class="scholar-checked">${text('확인일', 'Checked')} ${checked}</p></div>
      <dl class="scholar-overview-metrics"><div class="scholar-total"><dt>${text('총 인용', 'Total citations')}</dt><dd>${scholarProfile.citations.toLocaleString('en-US')}</dd></div><div><dt>h-index</dt><dd>${scholarProfile.hIndex}</dd></div><div><dt>i10-index</dt><dd>${scholarProfile.i10Index}</dd></div></dl>
      <figure class="scholar-overview-chart" aria-label="${text('연도별 인용 횟수', 'Annual citation counts')}">
        <div class="scholar-chart-heading"><h3>${text('연도별 인용 추세', 'Citations by year')}</h3><span>${text('인용 횟수', 'Citations')}</span></div>
        <div class="scholar-plot"><div class="scholar-grid" aria-hidden="true">${[ceiling, ceiling * 2 / 3, ceiling / 3, 0].map(value => `<span>${Math.round(value)}</span>`).join('')}</div><ol class="scholar-years">${bars}</ol></div>
        <figcaption>* ${checkedYear}${text('년은 ', ': ')}${text('집계 중 · ', 'partial year · ')}${text('확인일까지의 인용 횟수입니다.', 'citations through the checked date.')} <span>${text('지표는 전체 기간 기준입니다.', 'Metrics cover all time.')}</span></figcaption>
      </figure>
    </div>
    <div class="page-actions"><button class="action" data-read="publication-content" data-title="${title}">${text('전체 논문 · 검색', 'All papers & search')} <span aria-hidden="true">↗</span></button><a class="text-link" href="${escape(scholarProfile.url)}" target="_blank" rel="noopener noreferrer">Google Scholar <span aria-hidden="true">↗</span></a></div>
  </div>`;
}
