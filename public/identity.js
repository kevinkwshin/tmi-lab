(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Set();
  let activeMark;
  const duration = name => parseFloat(getComputedStyle(root).getPropertyValue(name));

  function settle() {
    for (const animation of running) animation.cancel();
    running.clear();
    activeMark?.removeAttribute('data-mascot-active');
    activeMark = undefined;
  }

  function animate(element, frames, time, delay = 0) {
    if (!element?.getBoundingClientRect().height) return;
    const animation = element.animate(frames, {duration:time,delay,easing:'ease-in-out',fill:'both'});
    running.add(animation);
    animation.finished.then(() => {
      animation.cancel();
      running.delete(animation);
      if (!running.size) settle();
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
      {transform:'rotate(-3deg)',offset:.43},
      {transform:'rotate(1deg)',offset:.64},
      {transform:'rotate(0deg)',offset:.84},
      {transform:'rotate(0deg)',offset:1}
    ],time,lead);
    for (const [kind,offset] of [['dragon',.18],['goose',.52]]) {
      animate(mark.querySelector(`[data-mascot-blink="${kind}"]`), [
        {opacity:0,offset:0}, {opacity:0,offset},
        {opacity:1,offset:offset+.02}, {opacity:1,offset:offset+.045},
        {opacity:0,offset:offset+.07}, {opacity:0,offset:1}
      ],time,lead);
    }
  }

  function enter(slide) {
    settle();
    const opening = slide?.querySelector('.identity-opening');
    if (!opening || document.hidden) return;
    const mark = opening.querySelector('[data-brand-mark]');
    const replay = mark?.querySelector('[data-brand-replay]');
    if (replay) replay.hidden = reduced.matches;
    if (reduced.matches) return;
    const time = duration('--identity-flow-duration');
    const lead = duration('--mascot-lead');
    animate(opening.querySelector('[data-identity-output]'),[
      {opacity:.25,transform:'scaleX(.03)'},
      {opacity:1,transform:'scaleX(1)'}
    ],time*.65,lead);
    animate(opening.querySelector('[data-identity-pulse]'),[
      {opacity:0,transform:'translate(60px,48px)',offset:0},
      {opacity:1,transform:'translate(160px,48px)',offset:.18},
      {opacity:1,transform:'translate(300px,48px)',offset:.45},
      {opacity:1,transform:'translate(600px,48px)',offset:.9},
      {opacity:0,transform:'translate(624px,48px)',offset:1}
    ],time,lead);
    greet(mark,lead);
  }

  document.addEventListener('deck:change',event => enter(event.detail.slide));
  document.addEventListener('click',event => {
    const button = event.target.closest?.('[data-brand-replay]');
    if (!button || reduced.matches || document.hidden) return;
    settle();
    greet(button.closest('[data-brand-mark]'));
  });
  for (const event of ['deck:cancel','image:open']) document.addEventListener(event,settle);
  document.addEventListener('visibilitychange',() => { if (document.hidden) settle(); });
  for (const event of ['resize','beforeprint']) addEventListener(event,settle);
  reduced.addEventListener('change',() => {
    settle();
    for (const button of document.querySelectorAll('[data-brand-replay]')) button.hidden = reduced.matches;
  });
})();
