const STORAGE_KEY = 'matchwork-mode';
const WEEK = 7 * 24 * 60 * 60 * 1000;

const buttons = document.querySelectorAll('.mode-option');
const subtitle = document.getElementById('dashSubtitle');

const panels = {
  seeker: document.getElementById('panelSeeker'),
  employer: document.getElementById('panelEmployer')
};

const subtitles = {
  seeker: 'Esto es lo que pasa con tu búsqueda.',
  employer: 'Esto es lo que pasa con tus vacantes.'
};

/* ---------- Modo: busco / ofrezco trabajo ---------- */

function readSavedMode() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'employer' ? 'employer' : 'seeker';
  } catch {
    return 'seeker';
  }
}

function saveMode(mode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Si el navegador bloquea el almacenamiento, el panel sigue funcionando.
  }
}

function setMode(mode) {
  buttons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
  });

  panels.seeker.hidden = mode !== 'seeker';
  panels.employer.hidden = mode !== 'employer';
  subtitle.textContent = subtitles[mode];
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    setMode(button.dataset.mode);
    saveMode(button.dataset.mode);
  });
});

setMode(readSavedMode());

/* ---------- Piezas reutilizables ---------- */

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function statCard(label, value, note, extra) {
  const card = element('article', 'stat-card');
  card.append(
    element('span', 'stat-label', label),
    element('strong', 'stat-number', String(value))
  );

  if (extra) card.append(extra);
  if (note) card.append(element('span', 'stat-note', note));
  return card;
}

function progressBar(percent) {
  const bar = element('div', 'progress');
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-label', 'Perfil completado');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');
  bar.setAttribute('aria-valuenow', String(percent));

  const fill = document.createElement('span');
  fill.style.width = `${percent}%`;
  bar.append(fill);
  return bar;
}

function link(text, href, className) {
  const anchor = element('a', className, text);
  anchor.href = href;
  return anchor;
}

function itemRow({ letter, color, title, href, subtitle: detail, chip, chipClass }) {
  const row = element('li', 'item');
  row.append(element('div', `company-logo company-${color}`, letter.toUpperCase()));

  const text = element('div', 'item-text');
  const strong = element('strong');
  strong.append(href ? link(title, href) : document.createTextNode(title));
  text.append(strong, element('span', '', detail));

  row.append(text, element('span', `chip ${chipClass}`, chip));
  return row;
}

function emptyRow(message, linkText, linkHref) {
  const row = element('li', 'item-empty');
  row.append(element('p', '', message));
  if (linkText) row.append(link(linkText, linkHref));
  return row;
}

function fill(listId, rows, empty) {
  document.getElementById(listId).replaceChildren(...(rows.length ? rows : [empty]));
}

const matchChip = (match) =>
  match === null
    ? { chip: 'Nueva', chipClass: 'chip-review' }
    : { chip: `${match}% match`, chipClass: match >= 70 ? 'chip-success' : 'chip-review' };

/* ---------- Datos reales del usuario ---------- */

async function init() {
  const user = Store.requireUser();
  if (!user) return;

  document.getElementById('userName').textContent = user.name.split(' ')[0];

  const [jobs, myApplications, myJobs, received] = await Promise.all([
    Store.getJobs(),
    Store.getMyApplications(),
    Store.getMyJobs(),
    Store.getApplicationsToMyJobs()
  ]);

  renderSeeker(user, jobs, myApplications);
  renderEmployer(myJobs, received);
}

function renderSeeker(user, jobs, myApplications) {
  const weekAgo = Date.now() - WEEK;
  const thisWeek = myApplications.filter((item) => new Date(item.createdAt).getTime() > weekAgo).length;
  const available = jobs.filter((job) => job.ownerId !== user.id);
  const completion = Store.profileCompletion(user);
  const skills = user.profile.skills;

  const completionExtra = element('div');
  completionExtra.append(progressBar(completion), link('Completar perfil', 'profile.html', 'stat-link'));

  document.getElementById('seekerStats').replaceChildren(
    statCard('Postulaciones enviadas', myApplications.length,
      myApplications.length ? `${thisWeek} esta semana` : 'Aún no te has postulado'),
    statCard('Vacantes disponibles', available.length, 'Publicadas en Matchwork'),
    statCard('Habilidades en tu perfil', skills.length,
      skills.length ? 'Se usan para calcular tu match' : 'Agrégalas en tu perfil'),
    statCard('Perfil completado', `${completion}%`, '', completionExtra)
  );

  fill('applicationsList',
    myApplications.map((item) => itemRow({
      letter: (item.job ? item.job.company : '?').charAt(0),
      color: item.job ? item.job.color : 'violet',
      title: item.job ? item.job.title : 'Vacante eliminada',
      href: item.job ? `vacante.html?id=${item.job.id}` : '',
      subtitle: `${item.job ? item.job.company : ''} · ${Store.timeAgo(item.createdAt)}`,
      chip: item.status,
      chipClass: 'chip-review'
    })),
    emptyRow('Todavía no te has postulado a ninguna vacante.', 'Buscar empleos', 'empleos.html')
  );

  const applied = new Set(myApplications.map((item) => item.jobId));

  const recommended = available
    .filter((job) => !applied.has(job.id))
    .map((job) => ({ job, match: Store.matchPercent(skills, job.tags) }))
    .sort((a, b) => (b.match ?? -1) - (a.match ?? -1))
    .slice(0, 3);

  fill('recommendedList',
    recommended.map(({ job, match }) => itemRow({
      letter: job.company.charAt(0),
      color: job.color,
      title: job.title,
      href: `vacante.html?id=${job.id}`,
      subtitle: `${job.company} · ${job.location}`,
      ...matchChip(match)
    })),
    emptyRow(available.length
      ? 'Ya te postulaste a todas las vacantes disponibles.'
      : 'Todavía nadie ha publicado vacantes en Matchwork.')
  );
}

function renderEmployer(myJobs, received) {
  const weekAgo = Date.now() - WEEK;
  const countFor = (jobId) => received.filter((item) => item.jobId === jobId).length;
  const newThisWeek = received.filter((item) => new Date(item.createdAt).getTime() > weekAgo).length;
  const withoutApplicants = myJobs.filter((job) => countFor(job.id) === 0).length;

  document.getElementById('employerStats').replaceChildren(
    statCard('Vacantes publicadas', myJobs.length, myJobs.length ? 'Visibles en la búsqueda' : 'Aún no publicas ninguna'),
    statCard('Postulantes recibidos', received.length, 'En todas tus vacantes'),
    statCard('Nuevos esta semana', newThisWeek, 'Últimos 7 días'),
    statCard('Vacantes sin postulantes', withoutApplicants, myJobs.length ? 'Compártelas para recibir más' : '')
  );

  fill('myJobsList',
    myJobs.map((job) => {
      const total = countFor(job.id);
      return itemRow({
        letter: job.company.charAt(0),
        color: job.color,
        title: job.title,
        href: `vacante.html?id=${job.id}`,
        subtitle: `${total} ${total === 1 ? 'postulante' : 'postulantes'} · ${Store.timeAgo(job.createdAt)}`,
        chip: 'Activa',
        chipClass: 'chip-success'
      });
    }),
    emptyRow('Aún no has publicado vacantes.', 'Publicar mi primera vacante', 'publicar.html')
  );

  fill('candidatesList',
    received.slice(0, 5).map((item) => {
      const match = Store.matchPercent(item.applicantSkills, item.job ? item.job.tags : []);
      return itemRow({
        letter: item.applicantName.charAt(0),
        color: 'violet',
        title: item.applicantName,
        href: '',
        subtitle: `${item.applicantHeadline || 'Sin título profesional'} · ${item.job ? item.job.title : ''}`,
        ...(match === null ? { chip: 'Nuevo', chipClass: 'chip-review' } : matchChip(match))
      });
    }),
    emptyRow('Cuando alguien se postule a tus vacantes, aparecerá aquí.')
  );
}

init().catch((error) => {
  console.error(error);
  subtitle.textContent = `No pudimos cargar tus datos: ${error.message}`;
});
