export function identityFlow() {
  const tracks = [8,18,28,38,48,58,68,78,88].map((y,i) => `<path d="M${i % 3 * 16} ${y} H110 C180 ${y} 194 48 280 48"/>`).join('');
  return `<svg class="identity-flow" viewBox="0 0 640 96" preserveAspectRatio="xMinYMid meet" aria-hidden="true"><g class="identity-inputs">${tracks}</g><g class="identity-outputs"><path d="M280 48 H354 C420 48 416 18 478 18 H624"/><path d="M280 48 H624"/><path d="M280 48 H354 C420 48 416 78 478 78 H624"/></g></svg>`;
}

export function identityLogo(lang, asset, escape) {
  const ko = lang === 'ko';
  const src = asset('tmi-logo');
  const alt = escape(ko ? '용과 거위 캐릭터가 있는 TMI-lab 로고' : 'TMI-lab dragon and goose logo');
  return `<figure class="page-figure page-logo"><div class="brand-mark" data-brand-mark>
    <img class="brand-poster" src="${src}" width="1200" height="810" alt="${alt}" fetchpriority="high">
    <svg class="brand-motion" viewBox="0 0 1200 810" aria-hidden="true">
      <defs>
        <clipPath id="welcome-goose-clip"><path d="M909 112H997V244L1044 290H1079V412L1045 437V466H899V436L860 405V339L883 285L909 252Z"/></clipPath>
        <clipPath id="welcome-arm-patch"><path d="M361 205H425V278L376 306L342 317L333 297L343 280L356 256Z"/></clipPath>
        <clipPath id="welcome-hand-clip"><path d="M363 237C359 223 370 215 385 213C404 210 419 220 417 235Q416 246 409 247Q403 249 400 240Q397 251 390 247Q386 247 385 240Q381 251 374 247Q369 248 369 237Z"/></clipPath>
        <mask id="welcome-goose-base" maskUnits="userSpaceOnUse" x="0" y="0" width="1200" height="810"><path fill="white" d="M0 0H1200V810H0Z"/><path fill="black" d="M868 100H1086V463H868Z"/></mask>
      </defs>
      <image href="${src}" width="1200" height="810" mask="url(#welcome-goose-base)"/>
      <image href="${asset('tmi-logo-motion-base')}" width="1200" height="810" preserveAspectRatio="none" clip-path="url(#welcome-arm-patch)"/>
      <path class="mascot-letter-repair" d="M363 229H418V272H363Z"/>
      <g class="mascot-wave" data-mascot-wave>
        <path class="mascot-sleeve" d="M329 277Q340 273 348 259L368 235Q379 232 390 246L376 270Q367 290 345 300"/>
        <image href="${src}" width="1200" height="810" clip-path="url(#welcome-hand-clip)"/>
      </g>
      <g class="mascot-goose" data-mascot-goose><image href="${src}" width="1200" height="810" clip-path="url(#welcome-goose-clip)"/>
        <g class="mascot-blink mascot-blink-goose" data-mascot-blink="goose"><ellipse cx="941" cy="168" rx="8" ry="11"/><ellipse cx="968" cy="170" rx="8" ry="11"/><path d="M936 169q5 4 10 0m17 2q5 4 10 0"/></g>
      </g>
      <g class="mascot-blink mascot-blink-dragon" data-mascot-blink="dragon"><ellipse cx="224" cy="214" rx="12" ry="12"/><ellipse cx="304" cy="204" rx="12" ry="12"/><path d="M216 215q8 6 16 0m64-10q8 6 16 0"/></g>
    </svg>
  </div></figure>`;
}
