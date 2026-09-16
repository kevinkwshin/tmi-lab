const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
function closeMenu(restoreFocus = false) {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', toggle.dataset.open);
  nav.classList.remove('is-open');
  if (restoreFocus) toggle.focus();
}
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? toggle.dataset.close : toggle.dataset.open);
  nav.classList.toggle('is-open', open);
});
nav.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
for (const link of document.querySelectorAll('[data-language]')) {
  link.addEventListener('click', () => {
    const url = new URL(link.href);
    url.hash = location.hash;
    link.href = url.href;
  });
}
const controls = document.querySelector('.publication-controls');
controls.hidden = false;
const search = document.querySelector('#publication-search');
const filters = [...document.querySelectorAll('[data-filter]')];
const papers = [...document.querySelectorAll('[data-paper]')];
const count = document.querySelector('#publication-count');
const empty = document.querySelector('#publication-empty');
let category = 'all';
function updatePublications() {
  const query = search.value.trim().toLocaleLowerCase();
  let visible = 0;
  for (const paper of papers) {
    const matches = (category === 'all' || paper.dataset.category === category) && paper.textContent.toLocaleLowerCase().includes(query);
    paper.hidden = !matches;
    if (matches) visible += 1;
  }
  for (const filter of filters) filter.setAttribute('aria-pressed', String(filter.dataset.filter === category));
  count.textContent = count.dataset.format.replace('{count}', String(visible));
  empty.hidden = visible !== 0;
}
search.addEventListener('input', updatePublications);
for (const filter of filters) filter.addEventListener('click', () => {
  category = filter.dataset.filter;
  updatePublications();
});
document.querySelector('#reset-publications').addEventListener('click', () => {
  search.value = '';
  category = 'all';
  updatePublications();
  search.focus();
});
updatePublications();
