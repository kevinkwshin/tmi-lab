(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Content is visible by default, including if observation is unavailable.
  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.08 });
    const elements = [...document.querySelectorAll('.research-card,.approach-grid article,.featured-paper')];
    for (const element of elements) {
      element.classList.add('reveal-ready');
      observer.observe(element);
    }
    reduced.addEventListener('change', () => {
      if (reduced.matches) {
        elements.forEach(element => element.classList.add('is-visible'));
        observer.disconnect();
      }
    });
  }

  const dialog = document.querySelector('.image-dialog');
  let source;
  document.addEventListener('click', event => {
    const link = event.target.closest('.image-link');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button) return;
    if (!dialog?.showModal) return;
    event.preventDefault();
    source = link;
    const image = dialog.querySelector('img');
    image.src = link.href;
    image.alt = link.querySelector('img').alt;
    document.dispatchEvent(new Event('image:open'));
    dialog.showModal();
    document.documentElement.classList.add('image-open');
  });
  dialog?.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog?.addEventListener('close', () => {
    document.documentElement.classList.remove('image-open');
    source?.focus({ preventScroll: true });
  });

  // Keep legacy deep links to the first research direction useful.
  if (location.hash === '#research-workflow') document.getElementById('research-workflow')?.scrollIntoView();
})();
