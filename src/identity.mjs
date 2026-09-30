export function identityFlow() {
  const tracks = [8,18,28,38,48,58,68,78,88].map((y,i) => `<path d="M${i % 3 * 16} ${y} H110 C180 ${y} 194 48 280 48"/>`).join('');
  return `<svg class="identity-flow" viewBox="0 0 640 96" preserveAspectRatio="xMinYMid meet" aria-hidden="true"><g class="identity-inputs">${tracks}</g><g class="identity-outputs" data-identity-output><path d="M280 48 H354 C420 48 416 18 478 18 H624"/><path d="M280 48 H624"/><path d="M280 48 H354 C420 48 416 78 478 78 H624"/></g><g class="identity-flow-pulse" data-identity-pulse><circle r="8" class="identity-pulse-halo"/><circle r="3"/></g></svg>`;
}

export function identityLogo(lang, asset, escape) {
  const ko = lang === 'ko';
  const src = asset('tmi-logo');
  const alt = escape(ko ? '용과 거위 캐릭터가 있는 TMI-lab 로고' : 'TMI-lab dragon and goose logo');
  const replay = escape(ko ? '로고 캐릭터 인사 다시 보기' : 'Replay the logo characters’ greeting');
  return `<figure class="page-figure page-logo"><div class="brand-mark" data-brand-mark>
    <img class="brand-poster" src="${src}" width="1200" height="810" alt="${alt}" fetchpriority="high">
    <svg class="brand-motion" viewBox="0 0 1200 810" aria-hidden="true">
      <defs><clipPath id="welcome-goose-clip"><path d="M868 100H1086V463H868Z"/></clipPath><mask id="welcome-goose-base" maskUnits="userSpaceOnUse" x="0" y="0" width="1200" height="810"><path fill="white" d="M0 0H1200V810H0Z"/><path fill="black" d="M868 100H1086V463H868Z"/></mask></defs>
      <image href="${src}" width="1200" height="810" mask="url(#welcome-goose-base)"/>
      <g class="mascot-goose" data-mascot-goose><image href="${src}" width="1200" height="810" clip-path="url(#welcome-goose-clip)"/>
        <g class="mascot-blink mascot-blink-goose" data-mascot-blink="goose"><ellipse cx="941" cy="168" rx="8" ry="11"/><ellipse cx="968" cy="170" rx="8" ry="11"/><path d="M936 169q5 4 10 0m17 2q5 4 10 0"/></g>
      </g>
      <g class="mascot-blink mascot-blink-dragon" data-mascot-blink="dragon"><ellipse cx="224" cy="214" rx="12" ry="12"/><ellipse cx="304" cy="204" rx="12" ry="12"/><path d="M216 215q8 6 16 0m64-10q8 6 16 0"/></g>
    </svg>
    <button class="brand-replay" type="button" data-brand-replay aria-label="${replay}" title="${replay}" hidden><svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 7a6 6 0 1 1-1 5M4 3v4h4"/></svg></button>
  </div></figure>`;
}
