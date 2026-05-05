/* ============================================================
   TEMA CLARO / ESCURO
   ============================================================ */
(function () {
  const toggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;

  let theme =
    root.getAttribute('data-theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  function sunIcon() {
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  }
  function moonIcon() {
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }

  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    if (toggle) {
      toggle.innerHTML = t === 'dark' ? sunIcon() : moonIcon();
      toggle.setAttribute(
        'aria-label',
        t === 'dark' ? 'Alternar para modo claro' : 'Alternar para modo escuro'
      );
    }
  }

  applyTheme(theme);

  if (toggle) {
    toggle.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      applyTheme(theme);
    });
  }
})();

/* ============================================================
   NAVEGAÇÃO ATIVA (destaca link conforme seção visível)
   ============================================================ */
(function () {
  const navLinks = Array.from(document.querySelectorAll('.nav a[href^="#"]'));
  const sections = Array.from(document.querySelectorAll('main section[id]'));

  if (!sections.length || !navLinks.length) return;

  function updateActive() {
    const scrollY = window.scrollY + 120;
    let current = sections[0];
    for (const section of sections) {
      if (scrollY >= section.offsetTop) current = section;
    }
    navLinks.forEach(link => {
      if (link.getAttribute('href') === '#' + current.id) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  updateActive();
  document.addEventListener('scroll', updateActive, { passive: true });
})();

/* ============================================================
   VALIDAÇÃO DO FORMULÁRIO DE LEADS
   ============================================================ */
(function () {
  const form = document.getElementById('lead-form');
  if (!form) return;

  function showError(input, msg) {
    input.classList.add('error');
    const errEl = input.parentElement.querySelector('.field-error');
    if (errEl) errEl.textContent = msg;
  }

  function clearError(input) {
    input.classList.remove('error');
    const errEl = input.parentElement.querySelector('.field-error');
    if (errEl) errEl.textContent = '';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    let valid = true;

    const nome    = form.querySelector('#nome');
    const celular = form.querySelector('#celular');

    clearError(nome);
    clearError(celular);

    if (!nome.value.trim() || nome.value.trim().length < 3) {
      showError(nome, 'Por favor, insira o nome completo.');
      valid = false;
    }

    const phoneRegex = /^[\d\s()\-+]{8,}$/;
    if (!celular.value.trim() || !phoneRegex.test(celular.value)) {
      showError(celular, 'Por favor, insira um celular válido.');
      valid = false;
    }

    if (valid) {
      /* Substitua este bloco pelo envio real (fetch para API, Formspree, etc.) */
      alert('Formulário enviado! Em produção, conecte aqui o serviço de envio.');
      form.reset();
    }
  });

  /* Limpa erros inline ao digitar */
  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', () => clearError(input));
  });
})();
