export function identityLogo(lang, asset, escape) {
  const ko = lang === 'ko';
  const src = asset('tmi-logo');
  const alt = escape(ko ? '용과 거위 캐릭터가 있는 TMI-lab 로고' : 'TMI-lab dragon and goose logo');
  return `<figure class="page-figure page-logo"><div class="brand-mark" data-brand-mark>
    <img class="brand-poster" src="${src}" width="1200" height="810" alt="${alt}" fetchpriority="high">
    <svg class="brand-motion" viewBox="0 0 1200 810" aria-hidden="true">
      <defs>
        <clipPath id="welcome-goose-clip"><path d="M909 112H997V244L1044 290H1079V412L1045 437V466H899V436L860 405V339L883 285L909 252Z"/></clipPath>
        <filter id="welcome-face-edge" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2"/></filter>
        <mask id="welcome-smile-mask" maskUnits="userSpaceOnUse" x="195" y="177" width="144" height="94"><rect x="203" y="185" width="128" height="78" rx="20" fill="white" filter="url(#welcome-face-edge)"/></mask>
        <mask id="welcome-goose-base" maskUnits="userSpaceOnUse" x="0" y="0" width="1200" height="810"><path fill="white" d="M0 0H1200V810H0Z"/><path fill="black" d="M868 100H1086V463H868Z"/></mask>
      </defs>
      <image href="${src}" width="1200" height="810" mask="url(#welcome-goose-base)"/>
      <g class="mascot-smile" data-mascot-smile><image href="${asset('tmi-logo-smile')}" width="1200" height="810" preserveAspectRatio="none" mask="url(#welcome-smile-mask)"/></g>
      <g class="mascot-goose" data-mascot-goose><image href="${src}" width="1200" height="810" clip-path="url(#welcome-goose-clip)"/>
        <g class="mascot-blink mascot-blink-goose" data-mascot-blink="goose"><ellipse cx="941" cy="168" rx="8" ry="11"/><ellipse cx="968" cy="170" rx="8" ry="11"/><path d="M936 169q5 4 10 0m17 2q5 4 10 0"/></g>
      </g>
    </svg>
  </div></figure>`;
}
