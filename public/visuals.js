(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const korean = root.lang === 'ko';
  const entryAnimations = new Set();
  const masks = new Set();
  let openingShown = false;
  const token = (name, fallback) => getComputedStyle(root).getPropertyValue(name).trim() || fallback;
  const duration = name => parseFloat(token(name, '0'));
  const easing = () => token('--image-motion-ease', 'ease-out');

  function settleEntry() {
    for (const animation of entryAnimations) animation.cancel();
    entryAnimations.clear();
    for (const mask of masks) mask.remove();
    masks.clear();
  }

  function enter(slide, animate, direction) {
    settleEntry();
    if (!slide) return;
    const opening = slide.querySelector('.identity-opening');
    const firstOpening = opening && !openingShown;
    if (opening) openingShown = true;
    if ((!animate && !firstOpening) || reduced.matches) return;
    if (opening) {
      const words = [...opening.querySelectorAll('.identity-title>span>span')];
      words.forEach((word, index) => {
        const animation = word.animate([
          {transform:`translateY(${direction < 0 ? '-105%' : '105%'})`},
          {transform:'translateY(0)'}
        ], {duration:duration('--identity-duration') - index * 90, delay:index * 90, easing:easing(), fill:'backwards'});
        entryAnimations.add(animation);
        animation.finished.then(() => entryAnimations.delete(animation), () => {});
      });
      const logo = opening.querySelector('.identity-visual');
      if (logo?.getBoundingClientRect().height) {
        const animation = logo.animate([{opacity:.3,transform:'scale(.94)'},{opacity:1,transform:'scale(1)'}], {duration:duration('--identity-duration'), easing:easing()});
        entryAnimations.add(animation);
        animation.finished.then(() => entryAnimations.delete(animation), () => {});
      }
    }
    for (const anchor of slide.querySelectorAll('.evidence-media')) {
      if (anchor.closest('[data-clinical-scene]')) continue;
      const image = anchor.querySelector('img');
      if (!image || !anchor.getBoundingClientRect().height) continue;
      const mask = document.createElement('span');
      mask.className = 'evidence-reveal-mask';
      mask.setAttribute('aria-hidden', 'true');
      anchor.append(mask);
      masks.add(mask);
      const time = duration('--image-reveal-duration');
      const reveal = mask.animate([
        {transform:'translateX(0)'},
        {transform:`translateX(${direction < 0 ? '-101%' : '101%'})`}
      ], {duration:time, easing:easing(), fill:'both'});
      const scale = image.animate([
        {transform:`scale(${token('--image-entry-scale', '1.04')})`},
        {transform:'scale(1)'}
      ], {duration:time, easing:easing()});
      entryAnimations.add(reveal);
      entryAnimations.add(scale);
      reveal.finished.then(() => {
        mask.remove();
        masks.delete(mask);
        reveal.cancel();
        entryAnimations.delete(reveal);
      }, () => {});
      scale.finished.then(() => entryAnimations.delete(scale), () => {});
    }
    const stages = [...slide.querySelectorAll('.clinical-route li')];
    stages.forEach((stage, index) => {
      const time = duration('--route-emphasis-duration');
      const delay = stages.length > 1 ? index * (duration('--image-reveal-duration') - time) / (stages.length - 1) : 0;
      const animation = stage.animate([
        {opacity:.4, transform:'translateY(8px)'},
        {opacity:1, transform:'translateY(0)'}
      ], {duration:time, delay, easing:easing(), fill:'backwards'});
      entryAnimations.add(animation);
      animation.finished.then(() => entryAnimations.delete(animation), () => {});
    });
  }

  const dialog = document.createElement('dialog');
  dialog.className = 'image-dialog';
  dialog.setAttribute('aria-label', korean ? '연구 이미지 크게 보기' : 'Enlarged research image');
  const header = document.createElement('div');
  header.className = 'image-dialog-header';
  const title = document.createElement('p');
  title.textContent = korean ? '연구 이미지' : 'Research image';
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'image-dialog-close';
  close.textContent = korean ? '닫기' : 'Close';
  close.autofocus = true;
  header.append(title, close);
  const stage = document.createElement('div');
  stage.className = 'image-dialog-stage';
  const image = document.createElement('img');
  image.className = 'image-dialog-image';
  stage.append(image);
  const caption = document.createElement('p');
  caption.className = 'image-dialog-caption';
  dialog.append(header, stage, caption);
  document.body.append(dialog);
  let source;
  let zoom;
  let closing = false;

  function cancelZoom() {
    zoom?.cancel();
    zoom = undefined;
  }

  function sourceRect() {
    const original = source?.querySelector('img');
    if (!original) return null;
    const rect = original.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const style = getComputedStyle(original);
    const width = rect.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const height = rect.height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    const ratio = (original.naturalWidth || width) / (original.naturalHeight || height);
    const fittedWidth = Math.min(width, height * ratio);
    const fittedHeight = fittedWidth / ratio;
    return {left:rect.left + (rect.width - fittedWidth) / 2, top:rect.top + (rect.height - fittedHeight) / 2, width:fittedWidth, height:fittedHeight};
  }

  function fit() {
    const bounds = stage.getBoundingClientRect();
    const original = source?.querySelector('img');
    const ratio = (image.naturalWidth || original?.naturalWidth || 1) / (image.naturalHeight || original?.naturalHeight || 1);
    const width = Math.min(bounds.width, bounds.height * ratio);
    image.style.width = `${width}px`;
    image.style.height = `${width / ratio}px`;
  }

  function originTransform() {
    const from = sourceRect();
    const to = image.getBoundingClientRect();
    if (!from || !to.width || !to.height) return null;
    return `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`;
  }

  function finishClose() {
    cancelZoom();
    closing = false;
    if (dialog.open) dialog.close();
  }

  function dismiss(immediate = false) {
    if (!dialog.open || closing) return;
    const current = getComputedStyle(image).transform;
    cancelZoom();
    const destination = originTransform();
    if (immediate || reduced.matches || !destination) {
      finishClose();
      return;
    }
    closing = true;
    zoom = image.animate([{transform:current}, {transform:destination}], {
      duration:duration('--image-zoom-duration'), easing:easing(), fill:'forwards'
    });
    zoom.finished.then(finishClose, () => {});
  }

  document.addEventListener('click', event => {
    const anchor = event.target.closest?.('a[data-zoom]');
    if (!anchor || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    const original = anchor.querySelector('img');
    if (!original) return;
    event.preventDefault();
    document.dispatchEvent(new CustomEvent('image:open'));
    settleEntry();
    source = anchor;
    closing = false;
    cancelZoom();
    image.src = anchor.href;
    image.alt = original.alt;
    caption.textContent = anchor.closest('figure')?.querySelector('figcaption')?.textContent.trim() || original.alt;
    dialog.showModal();
    root.classList.add('image-dialog-open');
    fit();
    close.focus({preventScroll:true});
    const origin = originTransform();
    if (!reduced.matches && origin) {
      zoom = image.animate([{transform:origin}, {transform:'none'}], {
        duration:duration('--image-zoom-duration'), easing:easing()
      });
    }
  });
  close.addEventListener('click', () => dismiss());
  dialog.addEventListener('cancel', event => { event.preventDefault(); dismiss(); });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dismiss();
  });
  dialog.addEventListener('close', () => {
    cancelZoom();
    closing = false;
    root.classList.remove('image-dialog-open');
    const returnTarget = source?.isConnected ? source : [...document.querySelectorAll('.is-current a[data-zoom]')].find(anchor => anchor.href === source?.href);
    returnTarget?.focus({preventScroll:true});
    source = undefined;
    image.removeAttribute('src');
  });
  image.addEventListener('load', () => { if (dialog.open) fit(); });
  function settleViewport() {
    settleEntry();
    cancelZoom();
    if (closing) finishClose();
    else if (dialog.open) fit();
  }
  addEventListener('resize', settleViewport);
  reduced.addEventListener('change', settleViewport);
  document.addEventListener('deck:cancel', settleEntry);
  document.addEventListener('deck:change', event => {
    if (dialog.open) finishClose();
    const {slide, animate, direction} = event.detail;
    enter(slide, animate, direction);
  });
})();
