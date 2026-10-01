export function identityLogo(lang, asset, escape, figureClass = 'page-figure page-logo') {
  const ko = lang === 'ko';
  const poster = asset('tmi-logo-video-poster');
  const alt = escape(ko ? '용과 거위 캐릭터가 있는 TMI-lab 로고' : 'TMI-lab dragon and goose logo');
  const play = ko ? '로고 영상 재생' : 'Play logo video';
  const pause = ko ? '로고 영상 일시정지' : 'Pause logo video';
  return `<figure class="${figureClass}"><div class="brand-mark" data-brand-mark>
    <img class="brand-poster" src="${poster}" width="1280" height="720" alt="${alt}" fetchpriority="high">
    <video class="brand-video" data-brand-video data-src="${asset('tmi-logo-film')}" poster="${poster}" width="1280" height="720" muted loop playsinline preload="none" aria-hidden="true" disablepictureinpicture></video>
    <button class="brand-toggle" data-brand-toggle data-play-label="${play}" data-pause-label="${pause}" type="button" aria-label="${play}" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path class="brand-play-icon" d="m9 5 11 7-11 7Z"/><path class="brand-pause-icon" d="M7 5h4v14H7zm7 0h4v14h-4z"/></svg></button>
  </div></figure>`;
}
