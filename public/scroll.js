const motion = matchMedia('(prefers-reduced-motion: reduce)');
const slides = [...document.querySelectorAll('[data-slide]')];
const header = document.querySelector('.site-header');
const dock = document.querySelector('.slide-controls');
const previous = dock.querySelector('[data-slide-prev]');
const next = dock.querySelector('[data-slide-next]');
const mode = dock.querySelector('[data-reading]');
const progress = document.querySelector('.reading-progress span');
const navigation = [...document.querySelectorAll('.nav a')];
const dialog = document.querySelector('.reading-dialog');
let current = 0;
let rendered = -1;
let positionFrame = 0;
let reading = false;
let active = false;
let entrance;
let lastWheel = 0;
let lastDelta = 0;
let lastPage = 0;
let wheelTotal = 0;
let gestureUsed = false;
let decayingWheel = false;
let touch;
let contentHome;
let trigger;
const pageDuration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--page-duration'));
const topOf = slide => slide.getBoundingClientRect().top + scrollY - header.offsetHeight;
const overlayOpen = () => dialog.open || navigation[0]?.closest('.nav').classList.contains('is-open');

function update() {
  if (!active) current = slides.reduce((best, slide, index) => Math.abs(topOf(slide) - scrollY) < Math.abs(topOf(slides[best]) - scrollY) ? index : best, 0);
  if (rendered === current) return;
  rendered = current;
  const slide = slides[current];
  dock.querySelector('.slide-position').textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  dock.querySelector('.slide-title').textContent = slide.dataset.slide;
  previous.disabled = current === 0;
  next.disabled = current === slides.length - 1;
  progress.style.transform = `scaleX(${(current + 1) / slides.length})`;
  for (const link of navigation) {
    if (link.hash === `#${slide.dataset.nav || slide.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}
function go(index, animate = true) {
  entrance?.cancel();
  const old = current;
  const transferFocus = active && slides[old].contains(document.activeElement);
  current = Math.max(0, Math.min(slides.length - 1, index));
  const target = slides[current];
  for (const slide of slides) {
    slide.classList.toggle('is-current', slide === target);
    slide.inert = active && slide !== target;
  }
  history.replaceState(null, '', `#${target.id}`);
  if (active) {
    scrollTo({top:0, behavior:'instant'});
    if (animate && !motion.matches && old !== current) {
      const overview = target.querySelector('.slide-overview') || target;
      entrance = overview.animate([
        {opacity:0, transform:`translateY(${Math.sign(current - old) * 28}px)`},
        {opacity:1, transform:'translateY(0)'}
      ], {duration:pageDuration, easing:'cubic-bezier(.2,.7,.2,1)'});
    }
  } else scrollTo({top:topOf(target), behavior:'instant'});
  if (transferFocus && old !== current) {
    target.setAttribute('tabindex', '-1');
    target.focus({preventScroll:true});
  }
  update();
}
function closeReading() {
  if (!contentHome) return;
  contentHome.append(dialog.querySelector('.reading-content'));
  contentHome = undefined;
  document.documentElement.classList.remove('dialog-open');
  trigger?.focus({preventScroll:true});
}
dialog.addEventListener('close', closeReading);
function openReading(content, title, returnTarget) {
  contentHome = content.parentElement;
  trigger = returnTarget;
  dialog.querySelector('#reading-title').textContent = title;
  dialog.querySelector('.dialog-content').append(content);
  document.documentElement.classList.add('dialog-open');
  dialog.showModal();
  dialog.scrollTop = 0;
}
for (const button of document.querySelectorAll('[data-read]')) button.addEventListener('click', () => openReading(document.getElementById(button.dataset.read), button.dataset.title, button));
function configure(align = true) {
  const wasActive = active;
  entrance?.cancel();
  document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
  active = !reading;
  if (dialog.open) { dialog.close(); closeReading(); }
  document.documentElement.classList.toggle('presentation', active);
  lastWheel = lastDelta = wheelTotal = 0;
  gestureUsed = decayingWheel = false;
  mode.hidden = false;
  mode.textContent = active ? mode.dataset.readingLabel : mode.dataset.slidesLabel;
  mode.setAttribute('aria-pressed', String(!active));
  if (align || active || wasActive) go(current, false);
  else update();
}
mode.addEventListener('click', () => { reading = active; configure(); });
previous.addEventListener('click', () => go(current - 1));
next.addEventListener('click', () => go(current + 1));
addEventListener('wheel', event => {
  if (!active || overlayOpen() || event.ctrlKey || event.metaKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) return;
  event.preventDefault();
  const now = performance.now();
  const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? slides[current].clientHeight : 1);
  const gap = now - lastWheel;
  const reversed = Math.sign(delta) !== Math.sign(lastDelta) && Math.abs(delta) >= 32 && gap > 60;
  // Spaced, equal wheel impulses are distinct notches; a decaying trackpad tail stays consumed.
  const notch = event.deltaMode !== 0 || (gap >= 75 && Math.abs(delta) >= 40 && Math.abs(delta - lastDelta) < 1);
  const renewed = gap > 80 && Math.abs(delta) >= 32 && Math.abs(delta) > Math.abs(lastDelta) * 1.5;
  if (gap > (decayingWheel ? 650 : 220) || reversed || renewed || (notch && now - lastPage > 280)) {
    decayingWheel = false;
    gestureUsed = false;
    wheelTotal = 0;
  }
  if (gap < 80 && Math.sign(delta) === Math.sign(lastDelta) && Math.abs(delta) < Math.abs(lastDelta) * .95) decayingWheel = true;
  lastWheel = now;
  lastDelta = delta;
  if (gestureUsed) return;
  wheelTotal += delta;
  if (Math.abs(wheelTotal) < 32) return;
  gestureUsed = true;
  lastPage = now;
  go(current + Math.sign(wheelTotal));
}, {passive:false});
addEventListener('touchstart', event => {
  touch = undefined;
  if (!active || overlayOpen() || event.touches.length !== 1 || (visualViewport?.scale || 1) > 1 || event.target.closest('a,button,input,textarea,select,summary,[contenteditable],.site-header,.slide-controls')) return;
  if (event.target.closest('[data-slide]') !== slides[current]) return;
  const point = event.touches[0];
  touch = {x:point.clientX, y:point.clientY, used:false};
}, {passive:true});
addEventListener('touchmove', event => {
  if (!touch || event.touches.length !== 1) { touch = undefined; return; }
  const dx = event.touches[0].clientX - touch.x;
  const dy = touch.y - event.touches[0].clientY;
  if (Math.abs(dy) <= Math.abs(dx) * 1.25) return;
  if (event.cancelable) event.preventDefault();
  if (touch.used || Math.abs(dy) < 48) return;
  touch.used = true;
  go(current + Math.sign(dy));
}, {passive:false});
for (const type of ['touchend','touchcancel']) addEventListener(type, () => { touch = undefined; }, {passive:true});
addEventListener('keydown', event => {
  if (!active || overlayOpen() || event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input,textarea,select,[contenteditable]') || (event.key === ' ' && event.target.closest('button,summary,a'))) return;
  const direction = {ArrowDown:1, PageDown:1, ' ':event.shiftKey ? -1 : 1, ArrowUp:-1, PageUp:-1}[event.key];
  if (!direction && !['Home','End'].includes(event.key)) return;
  event.preventDefault();
  if (event.repeat) return;
  go(event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : current + direction);
});
function navigateTo(target, animate = true) {
  const detail = target?.closest('.slide-detail');
  const slide = target?.closest('[data-slide]') || document.getElementById(detail?.dataset.detail);
  if (!slide) return false;
  if (dialog.open && !dialog.contains(target)) { dialog.close(); closeReading(); }
  go(slides.indexOf(slide), animate);
  if (active && detail) {
    if (!dialog.open) {
      const button = slide.querySelector(`[data-read="${detail.id}"]`);
      if (!button) slide.setAttribute('tabindex', '-1');
      openReading(detail, button?.dataset.title || slide.dataset.slide, button || slide);
    }
    history.replaceState(null, '', `#${target.id}`);
    target.scrollIntoView({block:'start', behavior:'instant'});
  }
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({preventScroll:true});
  return true;
}
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!active || !link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (navigateTo(document.getElementById(link.hash.slice(1)))) event.preventDefault();
});
addEventListener('hashchange', () => navigateTo(document.getElementById(location.hash.slice(1)), false));
document.addEventListener('focusin', event => {
  if (!active || dialog.open) return;
  const slide = event.target.closest('[data-slide]');
  if (slide && slides.indexOf(slide) !== current) go(slides.indexOf(slide), false);
});
addEventListener('scroll', () => {
  if (active || positionFrame) return;
  positionFrame = requestAnimationFrame(() => { positionFrame = 0; update(); });
}, {passive:true});
let resizeTimer;
addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => configure(false), 150); });
motion.addEventListener('change', () => entrance?.cancel());
const initial = document.getElementById(location.hash.slice(1));
const initialSlide = initial?.closest('[data-slide]');
if (initialSlide) current = slides.indexOf(initialSlide);
dock.hidden = false;
configure();
if (initial && initial !== initialSlide) navigateTo(initial, false);
