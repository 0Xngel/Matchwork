const $ = (id) => document.getElementById(id);

const applyButton = $('btnApply');
const message = $('applyMessage');

function setMessage(text, linkText, linkHref) {
  message.replaceChildren(document.createTextNode(text));

  if (linkText) {
    const anchor = document.createElement('a');
    anchor.href = linkHref;
    anchor.textContent = linkText;
    message.append(' ', anchor);
  }
}

// Si ya iniciaste sesión, el menú muestra tu panel en lugar de "Crear cuenta".
function adaptNav(user) {
  if (!user) return;

  const loginLink = document.querySelector('.nav-login');
  const registerLink = document.querySelector('.nav-register');

  if (loginLink) loginLink.style.display = 'none';
  if (registerLink) {
    registerLink.href = 'dashboard.html';
    registerLink.textContent = 'Mi panel';
  }
}

function fillJob(job, user) {
  document.title = `${job.title} — Matchwork`;

  const logo = $('vacLogo');
  logo.className = `company-logo company-${job.color}`;
  logo.textContent = job.company.charAt(0).toUpperCase();

  $('vacCompany').textContent = job.company;
  $('vacTitle').textContent = job.title;
  $('vacMeta').textContent = `${job.location} · ${job.mode}`;
  $('vacSalary').textContent = job.salary;
  $('vacOwner').textContent = job.ownerName;
  $('vacPosted').textContent = Store.timeAgo(job.createdAt);
  $('vacDescription').textContent = job.description;

  $('vacTags').replaceChildren(...[job.level, ...job.tags].map((tag) => {
    const span = document.createElement('span');
    span.textContent = tag;
    return span;
  }));

  const match = user ? Store.matchPercent(user.profile.skills, job.tags) : null;
  $('vacMatchBox').hidden = match === null;
  if (match !== null) $('vacMatch').textContent = `${match}%`;
}

async function setupApplyButton(job, user) {
  if (!user) {
    applyButton.hidden = true;
    const next = encodeURIComponent(location.pathname.split('/').pop() + location.search);
    setMessage('Para postularte necesitas una cuenta.', 'Inicia sesión', `login.html?next=${next}`);
    return;
  }

  if (job.ownerId === user.id) {
    const received = await Store.getApplicationsToMyJobs();
    const total = received.filter((item) => item.jobId === job.id).length;
    applyButton.hidden = true;
    setMessage(`Esta es tu vacante. Postulantes hasta ahora: ${total}.`, 'Ir a mi panel', 'dashboard.html');
    return;
  }

  const mine = await Store.getMyApplications();

  if (mine.some((item) => item.jobId === job.id)) {
    applyButton.disabled = true;
    applyButton.textContent = 'Ya te postulaste';
    return;
  }

  applyButton.addEventListener('click', async () => {
    applyButton.disabled = true;
    applyButton.textContent = 'Enviando...';

    try {
      await Store.applyToJob(job.id);
      applyButton.textContent = 'Postulación enviada';

      if (user.profile.skills.length === 0) {
        setMessage('La empresa verá tu perfil. Agrega tus habilidades para destacar.', 'Completar perfil', 'profile.html');
      } else {
        setMessage('Tu postulación quedó registrada. La empresa verá tu perfil.');
      }
    } catch (error) {
      applyButton.disabled = false;
      applyButton.textContent = 'Postularme';
      setMessage(error.message);
    }
  });
}

(async () => {
  const user = Store.currentUser();
  adaptNav(user);

  const id = new URLSearchParams(location.search).get('id');
  const job = id ? await Store.getJob(id) : null;

  if (!job) {
    $('vacMissing').hidden = false;
    return;
  }

  fillJob(job, user);
  $('vacancy').hidden = false;
  await setupApplyButton(job, user);
})().catch((error) => {
  console.error(error);
  $('vacMissing').querySelector('p').textContent = error.message;
  $('vacMissing').hidden = false;
});
