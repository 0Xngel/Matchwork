(() => {
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const themeColor = document.querySelector('meta[name="theme-color"]');

  const storageKey = 'matchwork-theme';
  const systemPreference = window.matchMedia('(prefers-color-scheme: dark)');

  // Recuperar una preferencia manual guardada.
  function getSavedTheme() {
    try {
      const saved = localStorage.getItem(storageKey);

      return saved === 'light' || saved === 'dark'
        ? saved
        : null;
    } catch {
      // La página seguirá funcionando si el almacenamiento no está disponible.
      return null;
    }
  }

  let savedTheme = getSavedTheme();

  // Detectar el tema del sistema cuando no existe una preferencia manual.
  function getPreferredTheme() {
    if (savedTheme) {
      return savedTheme;
    }

    return systemPreference.matches ? 'dark' : 'light';
  }

  // Aplicar el tema y actualizar los controles visuales.
  function applyTheme(theme) {
    root.dataset.theme = theme;

    const isDark = theme === 'dark';

    if (themeIcon) {
      // El icono indica el tema al que se puede cambiar.
      themeIcon.textContent = isDark ? '☀' : '☾';
    }

    if (themeToggle) {
      const nextTheme = isDark ? 'claro' : 'oscuro';

      themeToggle.setAttribute(
        'aria-label',
        `Cambiar a modo ${nextTheme}`
      );

      themeToggle.setAttribute(
        'title',
        `Cambiar a modo ${nextTheme}`
      );

      themeToggle.setAttribute('aria-pressed', String(isDark));
    }

    if (themeColor) {
      themeColor.setAttribute(
        'content',
        isDark ? '#11111f' : '#f7f7fc'
      );
    }
  }

  // Establecer el tema inicial.
  applyTheme(getPreferredTheme());

  // Cambiar de tema cuando el usuario pulse el botón.
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = root.dataset.theme;
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

      savedTheme = nextTheme;

      try {
        localStorage.setItem(storageKey, nextTheme);
      } catch {
        // El cambio visual seguirá funcionando durante esta sesión.
      }

      applyTheme(nextTheme);
    });
  }

  // Seguir los cambios del sistema mientras no exista una elección manual.
  systemPreference.addEventListener('change', () => {
    if (!savedTheme) {
      applyTheme(getPreferredTheme());
    }
  });
})();