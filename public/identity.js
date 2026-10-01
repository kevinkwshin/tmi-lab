(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Set();
  const imageLoads = new Map();
  let playbackVersion = 0;
  let activeMark;
  let activeSlide;
  let repeatTimer;
  let resumeFrame;
  let printing = false;
  const duration = name => parseFloat(getComputedStyle(root).getPropertyValue(name));

  function visibleSlide() {
    if (reduced.matches || document.hidden || printing || document.querySelector('dialog[open]') || !root.classList.contains('presentation')) return;
    return document.querySelector('.is-current:has(.identity-opening)');
  }

  function settle() {
    playbackVersion++;
    clearTimeout(repeatTimer);
    cancelAnimationFrame(resumeFrame);
    for (const animation of running) animation.cancel();
    running.clear();
    activeMark?.removeAttribute('data-mascot-active');
    activeMark = undefined;
    activeSlide = undefined;
  }

  function animate(element, frames, time, delay = 0) {
    if (!element?.getBoundingClientRect().height) return;
    const animation = element.animate(frames, {duration:time,delay,easing:'ease-in-out',fill:'both'});
    running.add(animation);
    animation.finished.then(() => {
      animation.cancel();
      if (!running.delete(animation)) return;
      if (!running.size) {
        activeMark?.removeAttribute('data-mascot-active');
        repeatTimer = setTimeout(() => {
          const slide = visibleSlide();
          if (slide && slide === activeSlide) enter(slide, false);
          else settle();
        }, duration('--mascot-rest'));
      }
    }, () => {});
  }

  function greet(mark, lead = 0) {
    if (!mark?.getBoundingClientRect().height) return;
    activeMark = mark;
    mark.setAttribute('data-mascot-active','');
    const time = duration('--mascot-duration');
    animate(mark.querySelector('[data-mascot-goose]'), [
      {transform:'rotate(0deg)',offset:0},
      {transform:'rotate(0deg)',offset:.24},
      {transform:'rotate(-6deg)',offset:.43},
      {transform:'rotate(3deg)',offset:.64},
      {transform:'rotate(0deg)',offset:.84},
      {transform:'rotate(0deg)',offset:1}
    ],time,lead);
    animate(mark.querySelector('[data-mascot-smile]'), [
      {opacity:0,offset:0},{opacity:0,offset:.08},
      {opacity:1,offset:.26},{opacity:1,offset:.74},
      {opacity:0,offset:.94},{opacity:0,offset:1}
    ],time,lead);
    animate(mark.querySelector('[data-mascot-blink="goose"]'), [
      {opacity:0,offset:0},{opacity:0,offset:.52},
      {opacity:1,offset:.54},{opacity:1,offset:.565},
      {opacity:0,offset:.59},{opacity:0,offset:1}
    ],time,lead);
  }

  async function enter(slide, entering = true) {
    settle();
    const opening = slide?.querySelector('.identity-opening');
    if (!opening || !visibleSlide()) return;
    const mark = opening.querySelector('[data-brand-mark]');
    const version = playbackVersion;
    const loaded = await Promise.all([...mark.querySelectorAll('svg image')].map(node => {
      const src = node.getAttribute('href');
      if (!imageLoads.has(src)) {
        const image = new Image();
        image.src = src;
        imageLoads.set(src,image.decode().then(() => true,() => false));
      }
      return imageLoads.get(src);
    }));
    if (version !== playbackVersion || loaded.includes(false) || visibleSlide() !== slide) return;
    activeSlide = slide;
    const lead = entering ? duration('--mascot-lead') : 0;
    greet(mark,lead);
  }

  function resume() {
    cancelAnimationFrame(resumeFrame);
    resumeFrame = requestAnimationFrame(() => {
      const slide = visibleSlide();
      if (slide !== activeSlide) enter(slide);
    });
  }

  document.addEventListener('deck:change',() => { settle(); resume(); });
  for (const event of ['deck:cancel','image:open']) document.addEventListener(event,settle);
  document.addEventListener('close',() => resume(),true);
  document.addEventListener('visibilitychange',() => { if (document.hidden) settle(); else resume(); });
  addEventListener('resize',settle);
  addEventListener('beforeprint',() => { printing = true; settle(); });
  addEventListener('afterprint',() => { printing = false; resume(); });
  reduced.addEventListener('change',() => { settle(); if (!reduced.matches) setTimeout(() => resume(),0); });
})();
