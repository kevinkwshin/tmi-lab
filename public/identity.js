(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const initialized = new WeakSet();
  const failed = new WeakSet();
  const denied = new WeakSet();
  let activeVideo;
  let pending = false;
  let version = 0;
  let frame;
  let printing = false;
  let userPaused = false;

  function eligible(video) {
    if (!video.isConnected || reduced.matches || document.hidden || printing || document.querySelector('dialog[open]')) return false;
    const mark = video.closest('[data-brand-mark]');
    const bounds = mark.getBoundingClientRect();
    if (!bounds.width || !bounds.height || bounds.bottom <= 0 || bounds.top >= innerHeight) return false;
    return !root.classList.contains('presentation') || !!mark.closest('.is-current .identity-opening');
  }

  function controls(video) {
    const mark = video.closest('[data-brand-mark]');
    const button = mark.querySelector('[data-brand-toggle]');
    button.hidden = reduced.matches || failed.has(video);
    button.setAttribute('aria-label', mark.hasAttribute('data-brand-playing') ? button.dataset.pauseLabel : button.dataset.playLabel);
  }

  function settle() {
    version++;
    cancelAnimationFrame(frame);
    if (activeVideo) {
      activeVideo.pause();
      activeVideo.closest('[data-brand-mark]').removeAttribute('data-brand-playing');
      controls(activeVideo);
    }
    activeVideo = undefined;
    pending = false;
  }

  function initialize(video) {
    if (initialized.has(video)) return;
    initialized.add(video);
    video.muted = true;
    video.addEventListener('playing', () => {
      if (video !== activeVideo || userPaused || !eligible(video)) { video.pause(); return; }
      video.closest('[data-brand-mark]').setAttribute('data-brand-playing', '');
      controls(video);
    });
    video.addEventListener('pause', () => {
      video.closest('[data-brand-mark]').removeAttribute('data-brand-playing');
      controls(video);
    });
    video.addEventListener('error', () => {
      failed.add(video);
      if (video === activeVideo) settle();
      controls(video);
    });
  }

  function sync() {
    const videos = [...document.querySelectorAll('[data-brand-video]')];
    videos.forEach(video => { initialize(video); controls(video); });
    const video = videos.find(eligible);
    if (video !== activeVideo) settle();
    if (!video || userPaused || failed.has(video) || denied.has(video) || pending || (video === activeVideo && !video.paused)) return;
    activeVideo = video;
    pending = true;
    const request = ++version;
    if (!video.getAttribute('src')) video.src = video.dataset.src;
    video.muted = true;
    video.play().then(() => {
      if (request === version) pending = false;
    }, error => {
      if (request !== version) return;
      pending = false;
      if (error.name !== 'AbortError') denied.add(video);
      controls(video);
    });
  }

  function resume() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(sync);
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-brand-toggle]');
    if (!button) return;
    const video = button.closest('[data-brand-mark]').querySelector('[data-brand-video]');
    userPaused = video === activeVideo && (!video.paused || pending);
    settle();
    if (!userPaused) { denied.delete(video); sync(); }
  });
  document.addEventListener('deck:change', () => { settle(); resume(); });
  document.addEventListener('deck:cancel', settle);
  document.addEventListener('image:open', settle);
  document.addEventListener('close', resume, true);
  document.addEventListener('visibilitychange', () => { if (document.hidden) settle(); else resume(); });
  document.addEventListener('scroll', () => { if (!root.classList.contains('presentation')) resume(); }, {passive:true});
  addEventListener('resize', () => { settle(); resume(); });
  addEventListener('beforeprint', () => { printing = true; settle(); });
  addEventListener('afterprint', () => { printing = false; resume(); });
  reduced.addEventListener('change', () => { settle(); setTimeout(resume, 0); });
  resume();
})();
