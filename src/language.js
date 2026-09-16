(() => {
  const current = document.documentElement.lang;
  const url = new URL(location.href);
  const requested = url.searchParams.get('lang');
  const explicit = requested === 'ko' || requested === 'en' ? requested : null;
  let saved = null;
  try {
    if (explicit) localStorage.setItem('tmi-lab-language', explicit);
    saved = localStorage.getItem('tmi-lab-language');
    if (explicit && saved === explicit) {
      url.searchParams.delete('lang');
      history.replaceState(history.state, '', url);
    }
  } catch {
    // The explicit URL choice still works when browser storage is unavailable.
  }
  const preferred = (navigator.languages || [navigator.language])
    .map(language => language.toLowerCase().split('-')[0])
    .find(language => language === 'ko' || language === 'en') || 'en';
  const remembered = saved === 'ko' || saved === 'en' ? saved : null;
  const targetLanguage = explicit || (current === 'en' ? 'en' : remembered || preferred);
  if (targetLanguage !== current) {
    const root = new URL(current === 'en' ? '../' : './', url);
    const target = new URL(targetLanguage === 'en' ? 'en/' : './', root);
    target.search = url.search;
    target.hash = url.hash;
    location.replace(target.href);
  }
})();
