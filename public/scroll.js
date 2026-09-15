const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const progress = document.querySelector('.reading-progress span');
const navigation = [...document.querySelectorAll('.nav a')].map(link => ({ link, section: document.querySelector(link.hash) })).filter(item => item.section);
const chapters = [...document.querySelectorAll('[data-chapter]')];
const chapterLinks = [...document.querySelectorAll('[data-chapter-link]')];
let framePending = false;
let currentSection = '';
let currentChapter = '';

function updatePosition() {
  framePending = false;
  const max = document.documentElement.scrollHeight - innerHeight;
  const ratio = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
  const section = navigation.filter(item => item.section.getBoundingClientRect().top <= 180).at(-1)?.section.id || '';
  const chapter = chapters.filter(item => item.getBoundingClientRect().top <= innerHeight * .55).at(-1)?.id || chapters[0]?.id;
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
