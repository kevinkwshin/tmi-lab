const deckSources = [...document.querySelectorAll('main > [data-slide]')];
const deckSummaries = new Map(deckSources.map(section => [section.id, section.querySelector('.slide-overview').cloneNode(true)]));
const deckKo = document.documentElement.lang === 'ko';

function deckClone(element) {
  const copy = element.cloneNode(true);
  for (const node of [copy, ...copy.querySelectorAll('*')]) {
    node.removeAttribute('id');
    node.removeAttribute('aria-labelledby');
    node.removeAttribute('data-paper');
    node.removeAttribute('hidden');
    if (node.matches('a[href^="http"],a.image-link')) {
      node.target = '_blank';
      node.rel = 'noopener noreferrer';
    }
  }
  return copy;
}

function deckBlock(...elements) {
  const block = document.createElement('article');
  block.className = 'deck-block';
  for (const element of elements) if (element) block.append(deckClone(element));
  return block;
}

function deckContent(section) {
  const narrow = innerWidth <= 760;
  const source = section.querySelector('.slide-detail');
  const select = selector => source.querySelector(selector);
  const all = selector => [...source.querySelectorAll(selector)];
  switch (section.id) {
    case 'translation':
      return [deckBlock(...all('.neurocad-copy > :not(h3):not(.eyebrow)')), deckBlock(select('.neurocad-feature figure'))];
    case 'transfers':
      return all('.transfer').map(element => deckBlock(element));
    case 'mission':
      return [deckBlock(select('.mission-intro')), ...all('.mission-chapter').map(element => deckBlock(element))];
    case 'research':
    case 'research-imaging':
    case 'research-signals': {
      if (narrow) return [deckBlock(select('.research-body')), deckBlock(select('.research-brief')), deckBlock(...all('.study-intro > *')), ...all('.research-plate').map(element => deckBlock(element))];
      const study = deckBlock(...all('.study-intro > *'), select('.research-plates'));
      study.classList.add('deck-study');
      return [deckBlock(select('.research-body'), select('.research-brief')), study];
    }
    case 'patents':
      return all('.patent').map(element => deckBlock(element));
    default:
      return [];
  }
}

function deckFrame(source, summary, pageIndex = 1) {
  const frame = document.createElement('div');
  frame.className = `deck-page deck-${source.id}`;
  const heading = document.createElement('header');
  heading.className = 'deck-heading';
  const title = summary.querySelector('h1,h2').cloneNode(true);
  heading.append(title);
  const question = source.querySelector('.research-question');
  const subtitle = question || (['translation', 'mission', 'publications', 'patents'].includes(source.id) && summary.querySelector('.page-lead'));
  if (subtitle) {
    const lead = deckClone(subtitle);
    lead.classList.add('deck-lead');
    heading.append(lead);
  }
  if (pageIndex > 1) {
    const continued = document.createElement('span');
    continued.className = 'meta';
    continued.textContent = `${deckKo ? '계속' : 'Continued'} · ${pageIndex}`;
    title.append(continued);
  }
  const body = document.createElement('div');
  body.className = 'deck-body';
  const actions = summary.querySelector('.page-actions').cloneNode(true);
  actions.className = 'deck-actions';
  frame.append(heading, body, actions);
  return frame;
}

function deckSummary(source, summary, compact) {
  const frame = deckFrame(source, summary);
  frame.classList.add('deck-curated');
  if (compact) frame.classList.add('deck-compact');
  const composition = summary.querySelector('.page-composition').cloneNode(true);
  composition.className = 'deck-summary';
  const copy = composition.querySelector('.page-copy');
  copy.querySelector('h1,h2').remove();
  copy.querySelector('.page-eyebrow')?.remove();
  if (frame.querySelector('.deck-lead')) copy.querySelector('.page-lead')?.remove();
  if (!copy.children.length) copy.remove();
  composition.querySelector('.page-actions').remove();
  frame.querySelector('.deck-body').append(composition);
  source.querySelector('.slide-overview').replaceChildren(frame);
}

function deckStoryPages(source, summary) {
  const narrow = innerWidth <= 760 || (innerWidth <= 1000 && innerHeight <= 900);
  const short = innerHeight <= 740 || (innerWidth <= 1200 && innerHeight <= 850);
  const variant = narrow ? 'narrow' : short ? 'wide-short' : 'wide';
  const sheets = summary.querySelector(`[data-story-pages="${variant}"]`);
  if (!sheets) return false;
  let section = source;
  [...sheets.children].forEach((sheet, index) => {
    if (index) {
      const continuation = document.createElement('section');
      continuation.className = source.className;
      continuation.id = `${source.id}--${index + 1}`;
      continuation.dataset.slide = source.dataset.slide;
      continuation.dataset.nav = source.dataset.nav || source.id;
      continuation.dataset.deckContinuation = source.id;
      section.after(continuation);
      section = continuation;
    }
    section.dataset.deckSource = source.id;
    const overview = document.createElement('div');
    overview.className = 'slide-overview';
    const frame = deckFrame(source, summary, index + 1);
    frame.classList.add('deck-story');
    frame.querySelector('.deck-body').append(deckClone(sheet));
    overview.append(frame);
    if (index) section.append(overview);
    else source.querySelector('.slide-overview').replaceWith(overview);
  });
  return true;
}

function buildDeck() {
  for (const page of document.querySelectorAll('[data-deck-continuation]')) page.remove();
  const compact = innerHeight < 560 || (innerWidth < 360 && innerHeight < 640);
  for (const source of deckSources) {
    source.querySelector('.slide-overview').replaceWith(deckSummaries.get(source.id).cloneNode(true));
    source.dataset.deckSource = source.id;
    if (source.id === 'welcome') continue;
    const summary = deckSummaries.get(source.id);
    if (!compact && deckStoryPages(source, summary)) continue;
    if (compact || ['contact', 'publications', 'people'].includes(source.id)) {
      deckSummary(source, summary, compact);
      continue;
    }
    const pending = deckContent(source);
    let section = source;
    let pageIndex = 0;
    let body;
    const newPage = () => {
      pageIndex++;
      if (pageIndex > 1) {
        const continuation = document.createElement('section');
        continuation.className = source.className;
        continuation.id = `${source.id}--${pageIndex}`;
        continuation.dataset.slide = source.dataset.slide;
        continuation.dataset.nav = source.dataset.nav || source.id;
        continuation.dataset.deckContinuation = source.id;
        section.after(continuation);
        section = continuation;
      }
      section.dataset.deckSource = source.id;
      const overview = document.createElement('div');
      overview.className = 'slide-overview';
      const frame = deckFrame(source, summary, pageIndex);
      body = frame.querySelector('.deck-body');
      overview.append(frame);
      if (pageIndex === 1) source.querySelector('.slide-overview').replaceWith(overview);
      else section.append(overview);
      section.classList.add('deck-measuring');
    };
    newPage();
    pending.forEach((block, index) => {
      block.dataset.deckBlock = String(index);
      body.append(block);
      if (body.scrollHeight > body.clientHeight + 1 && body.children.length > 1) {
        block.remove();
        section.classList.remove('deck-measuring');
        newPage();
        body.append(block);
      }
    });
    section.classList.remove('deck-measuring');
  }
  return [...document.querySelectorAll('main > [data-slide]')];
}
