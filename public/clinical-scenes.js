(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Set();
  const imageLoads = new Map();
  let playbackVersion = 0;
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
    playbackVersion++;
    clearTimeout(repeatTimer);
    cancelAnimationFrame(resumeFrame);
    for (const animation of running) animation.cancel();
    running.clear();
    if (activeScene) activeScene.dataset.sceneState = 'settled';
    activeScene = undefined;
  }

  async function play(scene, entering = false) {
    settle();
    if (!scene || reduced.matches || document.hidden || !scene.getBoundingClientRect().height) return;
    const version = playbackVersion;
    const loaded = await Promise.all([...scene.querySelectorAll('svg image')].map(node => {
      const src = node.getAttribute('href');
      if (!imageLoads.has(src)) {
        const image = new Image();
        image.src = src;
        imageLoads.set(src,image.decode().then(() => true,() => false));
      }
      return imageLoads.get(src);
    }));
    if (version !== playbackVersion || loaded.includes(false) || visibleScene() !== scene) return;
    const tokens = getComputedStyle(scene);
    const duration = parseFloat(tokens.getPropertyValue('--scene-duration'));
    const delay = entering ? parseFloat(tokens.getPropertyValue('--scene-lead')) : 0;
    const easing = tokens.getPropertyValue('--scene-ease').trim();
    activeScene = scene;
    scene.dataset.sceneState = 'playing';

    function animate(part, frames) {
      for (const element of scene.querySelectorAll(`[data-scene-part="${part}"]`)) {
        if (!element.getBoundingClientRect().height) continue;
        const animation = element.animate(frames.map(frame => ({easing, ...frame})), {duration, delay, fill:'both'});
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
    function travel(part, points) {
      animate(part, points.map(([offset,x,y,opacity,angle = 0]) => ({offset,opacity,transform:`translate(${x}px,${y}px) rotate(${angle}deg)`,easing:'linear'})));
    }
    function emphasize(part, start, peak, hold, end) {
      animate(part, [{opacity:0,offset:0},{opacity:0,offset:start},{opacity:1,offset:peak},{opacity:1,offset:hold},{opacity:0,offset:end},{opacity:0,offset:1}]);
    }
    if (scene.dataset.clinicalScene === 'triage') {
      animate('triage-priority', [
        {opacity:0,transform:'translate(270px,-230px) scale(.72)',offset:0},
        {opacity:1,transform:'translate(270px,-230px) scale(.72)',offset:.08},
        {opacity:1,transform:'translate(270px,-230px) scale(.72)',offset:.23},
        {opacity:1,transform:'translate(310px,-100px) scale(.82)',offset:.42},
        {opacity:1,transform:'translate(175px,-20px) scale(.94)',offset:.58},
        {opacity:1,transform:'translate(0,0) scale(1)',offset:.73},
        {opacity:1,transform:'translate(0,0) scale(1)',offset:1}
      ]);
      animate('triage-route', [
        {opacity:0, transform:'translate(0,0)', offset:0},
        {opacity:0, transform:'translate(0,0)', offset:.73},
        {opacity:1, transform:'translate(0,0)', offset:.76},
        {opacity:1, transform:'translate(22px,34px)', offset:.8},
        {opacity:1, transform:'translate(112px,76px)', offset:.86},
        {opacity:1, transform:'translate(190px,43px)', offset:.91},
        {opacity:1, transform:'translate(269px,0)', offset:.96},
        {opacity:0, transform:'translate(269px,0)', offset:.99},
        {opacity:0, transform:'translate(269px,0)', offset:1}
      ]);
      animate('triage-review', [
        {opacity:0, offset:0}, {opacity:0, offset:.9}, {opacity:.7, offset:.98}, {opacity:.7, offset:1}
      ]);
    } else if (scene.dataset.clinicalScene === 'mission') {
      travel('mission-forward-a', [[0,443,626,0,20],[.06,443,626,1,20],[.28,600,684,1,20],[.33,608,687,0,20],[1,608,687,0,20]]);
      travel('mission-forward-b', [[0,982,690,0,-25],[.28,982,690,0,-25],[.34,982,690,1,-25],[.53,1112,623,1,-30],[.58,1122,617,0,-30],[1,1122,617,0,-30]]);
      travel('mission-return', [[0,1200,737,0,155],[.55,1200,737,0,155],[.6,1200,737,1,155],[.71,1020,802,1,170],[.82,810,825,1,180],[.9,600,800,1,197],[.97,360,692,1,220],[1,277,617,0,230]]);
    } else if (scene.dataset.clinicalScene === 'twin') {
      travel('twin-branch-a', [[0,925,503,0],[.05,925,503,1],[.17,995,481,1],[.3,1098,416,1],[.36,1098,416,0],[1,1098,416,0]]);
      emphasize('twin-option-a', .16, .28, .42, .52);
      travel('twin-branch-b', [[0,930,538,0],[.5,930,538,0],[.55,930,538,1],[.65,981,558,1],[.72,1010,601,1],[.8,1066,633,1],[.85,1066,633,0],[1,1066,633,0]]);
      emphasize('twin-option-b', .65, .77, .9, 1);
    } else if (scene.dataset.clinicalScene === 'precision') {
      travel('precision-retina', [[0,602,374,0],[.06,602,374,1],[.23,691,401,1],[.4,805,398,1],[.45,805,398,0],[1,805,398,0]]);
      travel('precision-signal', [[0,752,382,0],[.13,752,382,0],[.19,752,382,1],[.43,805,398,1],[.48,805,398,0],[1,805,398,0]]);
      travel('precision-imaging', [[0,919,415,0],[.2,919,415,0],[.26,919,415,1],[.4,865,418,1],[.48,805,398,1],[.53,805,398,0],[1,805,398,0]]);
      animate('precision-junction', [{opacity:0,transform:'scale(.65)',offset:0},{opacity:0,transform:'scale(.65)',offset:.4},{opacity:1,transform:'scale(1)',offset:.55},{opacity:0,transform:'scale(1.5)',offset:.72},{opacity:0,transform:'scale(1.5)',offset:1}]);
      travel('precision-care', [[0,934,629,0],[.68,934,629,0],[.74,934,629,1],[.9,1015,586,1],[.97,1037,586,0],[1,1037,586,0]]);
    } else if (scene.dataset.clinicalScene === 'workflow') {
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
