const motion = matchMedia('(prefers-reduced-motion: reduce)');
const desktop = matchMedia('(min-width: 961px) and (min-height: 700px) and (pointer: fine)');
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
let frame = 0;
let moving = false;
let lastWheel = 0;
let wheelTotal = 0;
let gestureUsed = false;
let contentHome;
let trigger;
const duration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--slide-duration'));
const topOf = slide => slide.getBoundingClientRect().top + scrollY - header.offsetHeight;

function update() {
  if (!moving) current = slides.reduce((best, slide, index) => Math.abs(topOf(slide) - scrollY) < Math.abs(topOf(slides[best]) - scrollY) ? index : best, 0);
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
  cancelAnimationFrame(frame);
  current = Math.max(0, Math.min(slides.length - 1, index));
  const target = slides[current];
  const from = scrollY;
  const to = topOf(target);
  history.replaceState(null, '', `#${target.id}`);
  moving = true;
  update();
  if (!animate || motion.matches || !active) {
    scrollTo({top:to, behavior:'instant'});
    moving = false;
    return;
  }
  const start = performance.now();
  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
    scrollTo({top:from + (to - from) * eased, behavior:'instant'});
    if (t < 1) frame = requestAnimationFrame(tick);
    else { moving = false; update(); }
  }
  frame = requestAnimationFrame(tick);
}
function closeReading() {
  if (!contentHome) return;
  contentHome.append(dialog.querySelector('.reading-content'));
  contentHome = undefined;
  document.documentElement.classList.remove('dialog-open');
  trigger?.focus({preventScroll:true});
}
dialog.addEventListener('close', closeReading);
for (const button of document.querySelectorAll('[data-read]')) button.addEventListener('click', () => {
  const content = document.getElementById(button.dataset.read);
  contentHome = content.parentElement;
  trigger = button;
  dialog.querySelector('#reading-title').textContent = button.dataset.title;
  dialog.querySelector('.dialog-content').append(content);
  document.documentElement.classList.add('dialog-open');
  dialog.showModal();
});
function configure(align = true) {
  const wasActive = active;
  if (dialog.open) dialog.close();
  cancelAnimationFrame(frame);
  moving = false;
  document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
  active = desktop.matches && !reading;
  document.documentElement.classList.toggle('presentation', active);
  // Browser zoom and enlarged text must never crop a slide's real content.
  if (active && slides.some(slide => slide.scrollHeight > slide.clientHeight + 2)) {
    active = false;
    document.documentElement.classList.remove('presentation');
  }
  mode.hidden = !desktop.matches;
  mode.textContent = active ? mode.dataset.readingLabel : mode.dataset.slidesLabel;
  mode.setAttribute('aria-pressed', String(!active));
  if (align || active || wasActive) go(current, false);
  else update();
}
mode.addEventListener('click', () => { reading = active; configure(); });
previous.addEventListener('click', () => go(current - 1));
next.addEventListener('click', () => go(current + 1));
addEventListener('wheel', event => {
  if (!active || dialog.open || event.ctrlKey || event.metaKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
  event.preventDefault();
  const now = performance.now();
  if (!moving && now - lastWheel > 220) { gestureUsed = false; wheelTotal = 0; }
  lastWheel = now;
  if (moving || gestureUsed) return;
  wheelTotal += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
  if (Math.abs(wheelTotal) < 32) return;
  gestureUsed = true;
  go(current + Math.sign(wheelTotal));
}, {passive:false});
addEventListener('keydown', event => {
  if (!active || dialog.open || event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input,textarea,select,[contenteditable]') || (event.key === ' ' && event.target.closest('button,summary,a'))) return;
  const direction = {ArrowDown:1, PageDown:1, ' ':event.shiftKey ? -1 : 1, ArrowUp:-1, PageUp:-1}[event.key];
  if (!direction && !['Home','End'].includes(event.key)) return;
  event.preventDefault();
  if (moving || event.repeat) return;
  go(event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : current + direction);
});
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!active || !link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const target = document.getElementById(link.hash.slice(1));
  const slide = target?.closest('[data-slide]');
  if (!slide) return;
  event.preventDefault();
  go(slides.indexOf(slide));
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({preventScroll:true});
});
addEventListener('hashchange', () => {
  const target = document.getElementById(location.hash.slice(1))?.closest('[data-slide]');
  if (target) go(slides.indexOf(target), false);
});
document.addEventListener('focusin', event => {
  if (!active || dialog.open) return;
  const slide = event.target.closest('[data-slide]');
  if (slide && slides.indexOf(slide) !== current) go(slides.indexOf(slide), false);
});
addEventListener('scroll', () => {
  if (positionFrame) return;
  positionFrame = requestAnimationFrame(() => { positionFrame = 0; update(); });
}, {passive:true});
let resizeTimer;
addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => configure(false), 150); });
motion.addEventListener('change', () => { if (moving) go(current, false); });
const initial = document.getElementById(location.hash.slice(1))?.closest('[data-slide]');
if (initial) current = slides.indexOf(initial);
dock.hidden = false;
configure();
