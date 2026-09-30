(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Set();
  let activeScene;
  let repeatTimer;
  let resumeFrame;
  let printing = false;

  function visibleScene() {
    if (reduced.matches || document.hidden || printing || document.querySelector('dialog[open]')) return;
    if (root.classList.contains('presentation')) return document.querySelector('.is-current .deck-body [data-clinical-scene]');
    return [...document.querySelectorAll('.reading-content [data-clinical-scene]')].find(scene => {
      const rect = scene.getBoundingClientRect();
      return rect.height && rect.bottom > innerHeight * .25 && rect.top < innerHeight * .75;
    });
  }

  function settle() {
    clearTimeout(repeatTimer);
    cancelAnimationFrame(resumeFrame);
    for (const animation of running) animation.cancel();
    running.clear();
    if (activeScene) activeScene.dataset.sceneState = 'settled';
    activeScene = undefined;
  }

  function play(scene, entering = false) {
    settle();
    if (!scene || reduced.matches || document.hidden || !scene.getBoundingClientRect().height) return;
    const tokens = getComputedStyle(root);
    const duration = parseFloat(tokens.getPropertyValue('--scene-duration'));
    const delay = entering ? parseFloat(tokens.getPropertyValue('--scene-lead')) : 0;
    const easing = tokens.getPropertyValue('--scene-ease').trim();
    activeScene = scene;
    scene.dataset.sceneState = 'playing';

    function animate(part, frames) {
      for (const element of scene.querySelectorAll(`[data-scene-part="${part}"]`)) {
        if (!element.getBoundingClientRect().height) continue;
        const animation = element.animate(frames.map(frame => ({...frame, easing})), {duration, delay, fill:'both'});
        running.add(animation);
        animation.finished.then(() => {
          animation.cancel();
          if (!running.delete(animation)) return;
          if (!running.size && activeScene === scene) {
            scene.dataset.sceneState = 'settled';
            repeatTimer = setTimeout(() => {
              if (visibleScene() === scene) play(scene);
              else settle();
            }, parseFloat(tokens.getPropertyValue('--scene-rest')));
          }
        }, () => {});
      }
    }
    if (scene.dataset.clinicalScene === 'triage') {
      animate('triage-alert', [
        {opacity:0, transform:'scale(1.12)', offset:0},
        {opacity:0, transform:'scale(1.12)', offset:.12},
        {opacity:1, transform:'scale(1)', offset:.3},
        {opacity:.8, transform:'scale(1)', offset:1}
      ]);
      animate('triage-route', [
        {opacity:0, transform:'translate(0,0)', offset:0},
        {opacity:0, transform:'translate(0,0)', offset:.3},
        {opacity:1, transform:'translate(0,0)', offset:.35},
        {opacity:1, transform:'translate(22px,34px)', offset:.45},
        {opacity:1, transform:'translate(112px,76px)', offset:.58},
        {opacity:1, transform:'translate(190px,43px)', offset:.7},
        {opacity:1, transform:'translate(269px,0)', offset:.84},
        {opacity:0, transform:'translate(269px,0)', offset:.9},
        {opacity:0, transform:'translate(269px,0)', offset:1}
      ]);
      animate('triage-review', [
        {opacity:0, offset:0}, {opacity:0, offset:.7}, {opacity:.7, offset:.95}, {opacity:.7, offset:1}
      ]);
    } else {
      animate('workflow-prior', [
        {opacity:.35, transform:'translateX(-12px)', offset:0},
        {opacity:1, transform:'translateX(0)', offset:.22},
        {opacity:1, transform:'translateX(0)', offset:1}
      ]);
      animate('workflow-current', [
        {opacity:.35, transform:'translateX(12px)', offset:0},
        {opacity:.35, transform:'translateX(12px)', offset:.08},
        {opacity:1, transform:'translateX(0)', offset:.3},
        {opacity:1, transform:'translateX(0)', offset:1}
      ]);
      animate('workflow-match', [
        {opacity:.3, offset:0}, {opacity:.3, offset:.22}, {opacity:1, offset:.48}, {opacity:1, offset:1}
      ]);
      animate('workflow-difference', [
        {opacity:.2, offset:0}, {opacity:.2, offset:.46}, {opacity:1, offset:.7}, {opacity:1, offset:1}
      ]);
      animate('workflow-review', [
        {opacity:0, transform:'translateY(6px)', offset:0},
        {opacity:0, transform:'translateY(6px)', offset:.66},
        {opacity:1, transform:'translateY(0)', offset:.92},
        {opacity:1, transform:'translateY(0)', offset:1}
      ]);
    }
  }

  function resume(entering = false) {
    cancelAnimationFrame(resumeFrame);
    resumeFrame = requestAnimationFrame(() => {
      const scene = visibleScene();
      if (scene !== activeScene) play(scene, entering);
    });
  }

  document.addEventListener('deck:change', () => { settle(); resume(true); });
  document.addEventListener('deck:cancel', () => {
    settle();
    if (!root.classList.contains('presentation')) resume();
  });
  document.addEventListener('image:open', settle);
  document.addEventListener('close', () => resume(), true);
  document.addEventListener('visibilitychange', () => { if (document.hidden) settle(); else resume(); });
  document.addEventListener('scroll', () => { if (!root.classList.contains('presentation')) resume(); }, {passive:true});
  addEventListener('resize', settle);
  addEventListener('beforeprint', () => { printing = true; settle(); });
  addEventListener('afterprint', () => { printing = false; resume(); });
  reduced.addEventListener('change', () => { settle(); if (!reduced.matches) setTimeout(() => resume(), 0); });
})();
