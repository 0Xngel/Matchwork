// Sirve para login.html y register.html. Detecta los campos por su tipo,
// así que no importa cómo se llamen en tu HTML.
(() => {
  const isRegister = /register/i.test(location.pathname);
  const form = document.querySelector('form');
  if (!form) return;

  const field = (selector) => form.querySelector(selector);

  function showError(message) {
    let box = form.querySelector('[data-auth-error]');

    if (!box) {
      box = document.createElement('p');
      box.dataset.authError = '';
      box.setAttribute('role', 'alert');
      box.style.cssText =
        'margin:0 0 16px;padding:12px 14px;border:1px solid var(--color-coral);' +
        'border-radius:10px;background:rgb(255 107 107 / 14%);' +
        'color:var(--color-text);font-size:14px;font-weight:600;';
      form.prepend(box);
    }

    box.textContent = message;
  }

  // Se escucha en el documento (fase de captura) para ir antes que otros scripts de la página.
  document.addEventListener('submit', async (event) => {
    if (event.target !== form) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const email = field('input[type="email"], input[name*="mail" i], input[id*="mail" i]');
    const passwords = form.querySelectorAll('input[type="password"]');
    const button = field('button[type="submit"], input[type="submit"]');
    const originalLabel = button ? button.innerHTML : '';

    if (!email || passwords.length === 0) {
      showError('No se encontraron los campos de correo y contraseña en este formulario.');
      return;
    }

    if (button) {
      button.disabled = true;
      button.textContent = 'Procesando...';
    }

    try {
      if (isRegister) {
        if (passwords.length > 1 && passwords[0].value !== passwords[1].value) {
          throw new Error('Las contraseñas no coinciden.');
        }

        const name = field(
          'input[autocomplete="name"], input[name*="name" i], input[id*="name" i], ' +
          'input[name*="nombre" i], input[id*="nombre" i], input[type="text"]'
        );

        await Store.register({
          name: name ? name.value : '',
          email: email.value,
          password: passwords[0].value
        });
      } else {
        await Store.login(email.value, passwords[0].value);
      }

      // Si venías de una vacante, vuelves a ella. Solo se aceptan páginas de este mismo sitio.
      const next = new URLSearchParams(location.search).get('next');
      location.href = next && /^[\w-]+\.html(\?[\w=&%-]*)?$/.test(next) ? next : 'dashboard.html';
    } catch (error) {
      showError(error.message);

      if (button) {
        button.disabled = false;
        button.innerHTML = originalLabel;
      }
    }
  }, true);
})();
