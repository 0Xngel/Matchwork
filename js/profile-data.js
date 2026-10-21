// Se agrega a profile.html: llena el formulario con los datos del usuario y los guarda.
(() => {
  const user = Store.requireUser();
  if (!user) return;

  const $ = (id) => document.getElementById(id);
  const form = $('profileForm');
  const container = $('skillsContainer');
  const feedback = $('profileFeedback');

  function showFeedback(message, type) {
    feedback.textContent = message;
    feedback.className = `profile-feedback ${type}`;
    feedback.hidden = false;
  }

  // Misma estructura que usan las habilidades de tu profile.html.
  function createChip(name) {
    const chip = document.createElement('span');
    chip.className = 'skill-chip';

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'skill-remove';
    remove.textContent = '×';
    remove.setAttribute('aria-label', `Eliminar ${name}`);

    chip.append(document.createTextNode(name), remove);
    return chip;
  }

  function resizeImage(file, size) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();

      image.onload = () => {
        const side = Math.min(image.width, image.height);
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        canvas.getContext('2d').drawImage(
          image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, size, size
        );

        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };

      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('No se pudo leer la imagen.'));
      };

      image.src = url;
    });
  }

  /* ---------- Cargar datos guardados ---------- */

  $('fullName').value = user.name;
  $('headline').value = user.profile.headline;
  $('bio').value = user.profile.bio;

  if (user.profile.avatar) $('avatarPreview').src = user.profile.avatar;
  if (user.profile.cvName) $('cvFileName').textContent = `PDF seleccionado: ${user.profile.cvName}`;

  // Quita las habilidades de ejemplo y muestra solo las del usuario.
  container.replaceChildren(...user.profile.skills.map(createChip));

  /* ---------- Guardar ---------- */

  document.addEventListener('submit', async (event) => {
    if (event.target !== form) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const name = $('fullName').value.trim();

    if (!name) {
      showFeedback('Escribe tu nombre completo antes de continuar.', 'error');
      $('fullName').focus();
      return;
    }

    const changes = {
      name,
      headline: $('headline').value.trim(),
      bio: $('bio').value.trim(),
      skills: [...container.querySelectorAll('.skill-chip')].map((chip) => chip.firstChild.textContent.trim())
    };

    try {
      const avatarFile = $('avatarInput').files[0];
      if (avatarFile) changes.avatar = await resizeImage(avatarFile, 256);

      // El PDF todavía no se sube a ningún servidor: solo se guarda su nombre.
      const cvFile = $('cvInput').files[0];
      if (cvFile) changes.cvName = cvFile.name;

      await Store.updateProfile(changes);
      showFeedback('¡Perfil guardado!', 'success');
    } catch (error) {
      showFeedback(error.message, 'error');
    }
  }, true);
})();
