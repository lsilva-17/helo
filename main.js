/* =========================================================
   TEMA CLARO / ESCURO
   ========================================================= */
(function () {
  const toggle = document.querySelector('[data-theme-toggle]');
  const root   = document.documentElement;
  let theme    = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  root.setAttribute('data-theme', theme);

  function setIcon(value) {
    const sun  = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
    const moon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79Z"/></svg>';

    toggle.innerHTML = value === 'dark' ? sun : moon;
    toggle.setAttribute(
      'aria-label',
      value === 'dark' ? 'Alternar para modo claro' : 'Alternar para modo escuro'
    );
  }

  setIcon(theme);

  toggle.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', theme);
    setIcon(theme);
  });
})();

/* =========================================================
   LINK ATIVO NO MENU CONFORME SCROLL
   ========================================================= */
(function () {
  const navLinks = document.querySelectorAll('.nav a');
  const sections = [...document.querySelectorAll('main section[id]')];

  function updateActiveLink() {
    const current =
      sections.findLast(section => window.scrollY + 120 >= section.offsetTop)
      || sections[0];

    navLinks.forEach(link => {
      const isActive = link.getAttribute('href') === '#' + current.id;
      isActive
        ? link.setAttribute('aria-current', 'page')
        : link.removeAttribute('aria-current');
    });
  }

  updateActiveLink();
  document.addEventListener('scroll', updateActiveLink, { passive: true });
})();
