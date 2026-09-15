const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const progress = document.querySelector('.reading-progress span');
const navigation = [...document.querySelectorAll('.nav a')].map(link => ({ link, section: document.querySelector(link.hash) })).filter(item => item.section);
const chapters = [...document.querySelectorAll('[data-chapter]')];
const chapterLinks = [...document.querySelectorAll('[data-chapter-link]')];
let framePending = false;
let currentSection = '';
let currentChapter = '';
const slides = [...document.querySelectorAll('[data-slide]')];
const slideControls = document.querySelector('.slide-controls');
const slidePosition = slideControls.querySelector('.slide-position');
const slideTitle = slideControls.querySelector('.slide-title');
const previousSlide = slideControls.querySelector('[data-slide-prev]');
const nextSlide = slideControls.querySelector('[data-slide-next]');
let currentSlide = -1;
slideControls.hidden = false;
function moveSlide(direction) {
  const target = slides[Math.max(0, Math.min(slides.length - 1, currentSlide + direction))];
  history.replaceState(null, '', `#${target.id}`);
  target.scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'start' });
}
previousSlide.addEventListener('click', () => moveSlide(-1));
nextSlide.addEventListener('click', () => moveSlide(1));

function updatePosition() {
  framePending = false;
  const max = document.documentElement.scrollHeight - innerHeight;
  const ratio = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
  const section = navigation.filter(item => item.section.getBoundingClientRect().top <= 180).at(-1)?.section.id || '';
  const chapter = chapters.filter(item => item.getBoundingClientRect().top <= innerHeight * .55).at(-1)?.id || chapters[0]?.id;
  const slideIndex = Math.max(0, slides.findLastIndex(item => item.getBoundingClientRect().top <= innerHeight * .35));
  if (slideIndex !== currentSlide) {
    currentSlide = slideIndex;
    slidePosition.textContent = `${String(slideIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    slideTitle.textContent = slides[slideIndex].dataset.slide;
    previousSlide.disabled = slideIndex === 0;
    nextSlide.disabled = slideIndex === slides.length - 1;
  }
  progress.style.transform = `scaleX(${ratio})`;
  if (section !== currentSection) {
    currentSection = section;
    for (const item of navigation) {
      if (item.section.id === section) item.link.setAttribute('aria-current', 'location');
      else item.link.removeAttribute('aria-current');
    }
  }
  if (chapter !== currentChapter) {
    currentChapter = chapter;
    for (const link of chapterLinks) {
      if (link.dataset.chapterLink === chapter) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    }
    for (const item of chapters) item.classList.toggle('is-current', item.id === chapter);
  }
}
function queuePosition() {
  if (framePending) return;
  framePending = true;
  requestAnimationFrame(updatePosition);
}
addEventListener('scroll', queuePosition, { passive: true });
addEventListener('resize', queuePosition);
new ResizeObserver(queuePosition).observe(document.body);
updatePosition();

const reveal = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('is-revealed');
    reveal.unobserve(entry.target);
  }
}, { threshold: 0, rootMargin: '0px 0px -32px 0px' });
if (!motion.matches) {
  for (const block of document.querySelectorAll('.section-heading, .neurocad-feature, .clinical-feature, .research-row, .research-gallery figure, .mission-chapter, .profile-layout, .patent-list')) {
    if (block.getBoundingClientRect().top < innerHeight) continue;
    reveal.observe(block);
    block.classList.add('will-reveal');
  }
}
function showRemaining() {
  reveal.disconnect();
  for (const block of document.querySelectorAll('.will-reveal')) block.classList.add('is-revealed');
}
motion.addEventListener('change', event => { if (event.matches) showRemaining(); });
document.addEventListener('focusin', event => {
  const block = event.target.closest('.will-reveal');
  if (block) block.classList.add('is-revealed');
});
