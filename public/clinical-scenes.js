(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Set();
  let activeScene;
  root.classList.add('scene-motion-ready');

  function settle() {
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
          running.delete(animation);
          if (!running.size && activeScene === scene) {
            scene.dataset.sceneState = 'settled';
            activeScene = undefined;
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

  document.addEventListener('deck:change', event => {
    if (root.classList.contains('presentation')) play(event.detail.slide?.querySelector('[data-clinical-scene]'), true);
  });
  document.addEventListener('click', event => {
    const replay = event.target.closest?.('[data-scene-replay]');
    if (replay) play(replay.closest('[data-clinical-scene]'));
  });
  document.addEventListener('deck:cancel', settle);
  document.addEventListener('image:open', settle);
  document.addEventListener('visibilitychange', () => { if (document.hidden) settle(); });
  addEventListener('resize', settle);
  addEventListener('beforeprint', settle);
  reduced.addEventListener('change', settle);
})();
