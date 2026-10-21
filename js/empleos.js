const form = document.getElementById('searchForm');
const input = document.getElementById('searchInput');
const filterMode = document.getElementById('filterMode');
const filterLevel = document.getElementById('filterLevel');
const clearButton = document.getElementById('clearFilters');
const emptyReset = document.getElementById('emptyReset');
const list = document.getElementById('jobsList');
const count = document.getElementById('resultsCount');
const emptyState = document.getElementById('emptyState');

// Quita acentos y mayúsculas para que "hibrido" encuentre "Híbrido".
const normalize = (text) =>
  text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

// Un solo texto con todo lo que se puede buscar de cada vacante.
let searchable = [];

function setJobs(jobs) {
  searchable = jobs.map((job) => ({
    job,
    text: normalize([job.title, job.company, job.location, job.mode, job.level, ...job.tags].join(' '))
  }));
}

function filterJobs() {
  const terms = normalize(input.value).split(/\s+/).filter(Boolean);

  return searchable
    .filter(({ job, text }) =>
      terms.every((term) => text.includes(term)) &&
      (!filterMode.value || job.mode === filterMode.value) &&
      (!filterLevel.value || job.level === filterLevel.value)
    )
    .map(({ job }) => job);
}

function createCard(job) {
  const item = document.createElement('li');
  item.className = 'job-card';

  const top = document.createElement('div');
  top.className = 'job-card-top';

  const logo = document.createElement('div');
  logo.className = `company-logo company-${job.color}`;
  logo.textContent = job.company.charAt(0);

  const posted = document.createElement('span');
  posted.className = 'job-posted';
  posted.textContent = job.posted;

  top.append(logo, posted);

  const company = document.createElement('p');
  company.className = 'company-name';
  company.textContent = job.company;

  const title = document.createElement('h2');
  title.textContent = job.title;

  const location = document.createElement('p');
  location.className = 'job-location';
  location.textContent = `${job.location} · ${job.mode}`;

  const tags = document.createElement('div');
  tags.className = 'job-tags';
  [job.level, ...job.tags].forEach((tag) => {
    const span = document.createElement('span');
    span.textContent = tag;
    tags.append(span);
  });

  const footer = document.createElement('div');
  footer.className = 'job-card-footer';

  const salary = document.createElement('div');
  const amount = document.createElement('strong');
  amount.textContent = job.salary;
  const unit = document.createElement('span');
  unit.textContent = 'MXN / mes';
  salary.append(amount, unit);

  const button = document.createElement('a');
  button.className = 'button button-secondary';
  button.href = `vacante.html?id=${job.id}`;
  button.textContent = 'Ver vacante';

  footer.append(salary, button);
  item.append(top, company, title, location, tags, footer);

  return item;
}

function render() {
  const results = filterJobs();
  const noJobsYet = searchable.length === 0;

  list.replaceChildren(...results.map(createCard));
  emptyState.hidden = results.length > 0;

  emptyState.querySelector('h2').textContent = noJobsYet
    ? 'Todavía no hay vacantes publicadas'
    : 'No encontramos vacantes con esa búsqueda';
  emptyState.querySelector('p').textContent = noJobsYet
    ? 'Cuando una empresa publique una vacante en Matchwork, aparecerá aquí.'
    : 'Prueba con menos palabras o quita algún filtro.';
  emptyReset.hidden = noJobsYet;

  if (noJobsYet) {
    count.textContent = '';
  } else {
    count.textContent = results.length === 1
      ? '1 vacante encontrada'
      : `${results.length} vacantes encontradas`;
  }
}

function saveSearchInUrl() {
  const params = new URLSearchParams();
  if (input.value.trim()) params.set('q', input.value.trim());
  const query = params.toString();
  history.replaceState(null, '', query ? `?${query}` : location.pathname);
}

function resetAll() {
  input.value = '';
  filterMode.value = '';
  filterLevel.value = '';
  saveSearchInUrl();
  render();
  input.focus();
}

// Busca mientras se escribe, con una pequeña pausa para no repetir trabajo.
let timer;
input.addEventListener('input', () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    saveSearchInUrl();
    render();
  }, 150);
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  saveSearchInUrl();
  render();
});

filterMode.addEventListener('change', render);
filterLevel.addEventListener('change', render);
clearButton.addEventListener('click', resetAll);
emptyReset.addEventListener('click', resetAll);

// Si llegas con ?q=react (por ejemplo desde la página principal), la búsqueda ya viene aplicada.
input.value = new URLSearchParams(location.search).get('q') || '';

async function loadJobs() {
  const jobs = await Store.getJobs();
  setJobs(jobs.map((job) => ({ ...job, posted: Store.timeAgo(job.createdAt) })));
}

// Si ya iniciaste sesión, el menú muestra tu panel en lugar de "Crear cuenta".
if (Store.currentUser()) {
  const loginLink = document.querySelector('.nav-login');
  const registerLink = document.querySelector('.nav-register');
  if (loginLink) loginLink.style.display = 'none';
  if (registerLink) {
    registerLink.href = 'dashboard.html';
    registerLink.textContent = 'Mi panel';
  }
}

loadJobs().then(render).catch((error) => {
  console.error(error);
  count.textContent = `No pudimos cargar las vacantes: ${error.message}`;
});
