const MAX_SKILLS = 8;

// Solo usuarios con sesión pueden publicar.
Store.requireUser();

const form = document.getElementById('jobForm');
const feedback = document.getElementById('formFeedback');
const publishButton = document.getElementById('btnPublish');

const fields = {
  title: document.getElementById('title'),
  company: document.getElementById('company'),
  location: document.getElementById('location'),
  mode: document.getElementById('mode'),
  level: document.getElementById('level'),
  salaryMin: document.getElementById('salaryMin'),
  salaryMax: document.getElementById('salaryMax'),
  description: document.getElementById('description')
};

const skillInput = document.getElementById('skillInput');
const addSkillButton = document.getElementById('btnAddSkill');
const skillsList = document.getElementById('skillsList');
const descriptionCounter = document.getElementById('descriptionCounter');

const preview = {
  logo: document.getElementById('previewLogo'),
  company: document.getElementById('previewCompany'),
  title: document.getElementById('previewTitle'),
  location: document.getElementById('previewLocation'),
  tags: document.getElementById('previewTags'),
  salary: document.getElementById('previewSalary')
};

let skills = [];

/* ---------- Sueldo ---------- */

function formatMoney(amount) {
  return amount >= 1000 ? `$${+(amount / 1000).toFixed(1)}k` : `$${amount}`;
}

function buildSalaryText(min, max) {
  if (min && max) return `${formatMoney(min)}–${formatMoney(max)}`;
  if (min) return `Desde ${formatMoney(min)}`;
  if (max) return `Hasta ${formatMoney(max)}`;
  return 'A tratar';
}

function readNumber(input) {
  const value = Number(input.value);
  return input.value !== '' && Number.isFinite(value) && value > 0 ? value : 0;
}

/* ---------- Vista previa ---------- */

function updatePreview() {
  const company = fields.company.value.trim();
  const title = fields.title.value.trim();
  const location = fields.location.value.trim();
  const mode = fields.mode.value;
  const level = fields.level.value;

  preview.logo.textContent = company ? company.charAt(0).toUpperCase() : 'M';
  preview.company.textContent = company || 'Tu empresa';
  preview.title.textContent = title || 'Nombre del puesto';
  preview.location.textContent = [location || 'Ubicación', mode || 'Modalidad'].join(' · ');
  preview.salary.textContent = buildSalaryText(readNumber(fields.salaryMin), readNumber(fields.salaryMax));

  const tags = [level, ...skills].filter(Boolean);
  preview.tags.replaceChildren(...tags.map((tag) => {
    const span = document.createElement('span');
    span.textContent = tag;
    return span;
  }));

  descriptionCounter.textContent = `${fields.description.value.length} / 1500`;
}

/* ---------- Habilidades ---------- */

function renderSkills() {
  skillsList.replaceChildren(...skills.map((skill) => {
    const chip = document.createElement('span');
    chip.className = 'pub-chip';
    chip.append(document.createTextNode(skill));

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = '×';
    remove.setAttribute('aria-label', `Eliminar ${skill}`);
    remove.addEventListener('click', () => {
      skills = skills.filter((item) => item !== skill);
      renderSkills();
      updatePreview();
    });

    chip.append(remove);
    return chip;
  }));
}

function addSkill() {
  const value = skillInput.value.trim();
  if (!value) return;

  const exists = skills.some((skill) => skill.toLocaleLowerCase() === value.toLocaleLowerCase());

  if (exists) {
    showError('skills', 'Esa habilidad ya está en la lista.');
    return;
  }

  if (skills.length >= MAX_SKILLS) {
    showError('skills', `Puedes agregar hasta ${MAX_SKILLS} habilidades.`);
    return;
  }

  clearError('skills');
  skills.push(value);
  skillInput.value = '';
  skillInput.focus();
  renderSkills();
  updatePreview();
}

addSkillButton.addEventListener('click', addSkill);

skillInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    addSkill();
  }
});

/* ---------- Errores ---------- */

function showError(name, message) {
  const box = document.getElementById(`err-${name}`);
  box.textContent = message;

  const field = fields[name];
  if (field) {
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', box.id);
  }
}

function clearError(name) {
  const box = document.getElementById(`err-${name}`);
  if (box) box.textContent = '';

  const field = fields[name];
  if (field) {
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
  }
}

function clearAllErrors() {
  ['title', 'company', 'location', 'mode', 'level', 'salaryMax', 'description', 'skills']
    .forEach(clearError);
}

function showFeedback(message, type) {
  feedback.textContent = message;
  feedback.className = `pub-feedback ${type}`;
  feedback.hidden = false;
}

/* ---------- Validación ---------- */

function validate() {
  const errors = {};

  if (!fields.title.value.trim()) errors.title = 'Escribe el nombre del puesto.';
  if (!fields.company.value.trim()) errors.company = 'Escribe el nombre de la empresa.';
  if (!fields.location.value.trim()) errors.location = 'Indica la ubicación del puesto.';
  if (!fields.mode.value) errors.mode = 'Elige la modalidad.';
  if (!fields.level.value) errors.level = 'Elige el nivel.';

  const min = readNumber(fields.salaryMin);
  const max = readNumber(fields.salaryMax);
  if (min && max && max < min) errors.salaryMax = 'El máximo debe ser mayor o igual al mínimo.';

  if (fields.description.value.trim().length < 30) {
    errors.description = 'Describe el puesto con al menos 30 caracteres.';
  }

  if (skills.length === 0) errors.skills = 'Agrega al menos una habilidad.';

  return errors;
}

/* ---------- Guardado ---------- */

// Guarda la vacante con el Store. Con Firebase, solo cambia el interior de Store.createJob.
async function saveJob(job) {
  return Store.createJob(job);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearAllErrors();
  feedback.hidden = true;

  const errors = validate();
  const names = Object.keys(errors);

  if (names.length > 0) {
    names.forEach((name) => showError(name, errors[name]));
    showFeedback('Revisa los campos marcados antes de publicar.', 'error');

    const firstWithField = names.find((name) => fields[name]);
    if (firstWithField) fields[firstWithField].focus();
    return;
  }

  const salaryMin = readNumber(fields.salaryMin);
  const salaryMax = readNumber(fields.salaryMax);

  // Mismos nombres de campo que usa empleos.js para mostrar las vacantes.
  const job = {
    title: fields.title.value.trim(),
    company: fields.company.value.trim(),
    location: fields.location.value.trim(),
    mode: fields.mode.value,
    level: fields.level.value,
    salary: buildSalaryText(salaryMin, salaryMax),
    salaryMin,
    salaryMax,
    description: fields.description.value.trim(),
    tags: [...skills]
  };

  publishButton.disabled = true;
  publishButton.textContent = 'Publicando...';

  try {
    await saveJob(job);
    showFeedback('¡Vacante publicada! Ya aparece en la búsqueda de empleos y en tu panel.', 'success');
    form.reset();
    skills = [];
    renderSkills();
    updatePreview();
    feedback.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (error) {
    console.error(error);
    showFeedback(error.message || 'No se pudo publicar la vacante. Inténtalo de nuevo.', 'error');
  } finally {
    publishButton.disabled = false;
    publishButton.innerHTML = 'Publicar vacante <span aria-hidden="true">→</span>';
  }
});

/* ---------- Eventos ---------- */

Object.entries(fields).forEach(([name, field]) => {
  field.addEventListener('input', () => {
    clearError(name);
    updatePreview();
  });
  field.addEventListener('change', updatePreview);
});

updatePreview();
