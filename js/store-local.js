// Capa de datos TEMPORAL de Matchwork: guarda todo en el navegador (localStorage).
// Cuando conectes Firebase, se reemplaza el interior de estas funciones
// y el resto de la app sigue funcionando igual, porque usa estos mismos nombres.

const Store = (() => {
  const KEYS = {
    users: 'mw-users',
    session: 'mw-session',
    jobs: 'mw-jobs',
    applications: 'mw-applications'
  };
  const COLORS = ['violet', 'green', 'coral'];

  /* ---------- Utilidades internas ---------- */

  const read = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const write = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      throw new Error('No se pudo guardar. Revisa que tu navegador permita el almacenamiento local.');
    }
  };

  const newId = () =>
    crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const normalizeEmail = (email) => (email || '').trim().toLowerCase();

  async function hashPassword(password, salt) {
    if (!crypto.subtle) return `${salt}:${password}`;
    const bytes = new TextEncoder().encode(`${salt}:${password}`);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  const publicUser = (user) =>
    user && { id: user.id, name: user.name, email: user.email, profile: user.profile, createdAt: user.createdAt };

  const users = () => read(KEYS.users, []);
  const jobs = () => read(KEYS.jobs, []);
  const applications = () => read(KEYS.applications, []);
  const newestFirst = (a, b) => b.createdAt.localeCompare(a.createdAt);

  /* ---------- Sesión ---------- */

  function currentUser() {
    const id = read(KEYS.session, null);
    return (id && publicUser(users().find((user) => user.id === id))) || null;
  }

  // Úsalo en páginas privadas: si no hay sesión, manda al inicio de sesión.
  function requireUser() {
    const user = currentUser();
    if (!user) location.replace('login.html');
    return user;
  }

  async function register({ name, email, password }) {
    name = (name || '').trim();
    email = normalizeEmail(email);

    if (name.length < 2) throw new Error('Escribe tu nombre completo.');
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Escribe un correo válido.');
    if ((password || '').length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres.');

    const all = users();
    if (all.some((user) => user.email === email)) throw new Error('Ya existe una cuenta con ese correo.');

    const salt = newId();
    const user = {
      id: newId(),
      name,
      email,
      salt,
      passwordHash: await hashPassword(password, salt),
      createdAt: new Date().toISOString(),
      profile: { headline: '', bio: '', skills: [], avatar: '', cvName: '' }
    };

    write(KEYS.users, [...all, user]);
    write(KEYS.session, user.id);
    return publicUser(user);
  }

  async function login(email, password) {
    const user = users().find((item) => item.email === normalizeEmail(email));
    const valid = user && (await hashPassword(password || '', user.salt)) === user.passwordHash;

    if (!valid) throw new Error('Correo o contraseña incorrectos.');

    write(KEYS.session, user.id);
    return publicUser(user);
  }

  function logout() {
    try {
      localStorage.removeItem(KEYS.session);
    } catch {
      // Si no se puede borrar, igual se manda al inicio.
    }
    location.href = 'index.html';
  }

  async function updateProfile({ name, ...profile }) {
    const all = users();
    const user = all.find((item) => item.id === read(KEYS.session, null));

    if (!user) throw new Error('Inicia sesión para guardar tu perfil.');

    if (name !== undefined) user.name = name.trim();
    user.profile = { ...user.profile, ...profile };

    write(KEYS.users, all);
    return publicUser(user);
  }

  /* ---------- Vacantes ---------- */

  async function getJobs() {
    return jobs().sort(newestFirst);
  }

  async function getJob(id) {
    return jobs().find((job) => job.id === id) || null;
  }

  async function getMyJobs() {
    const user = currentUser();
    return (await getJobs()).filter((job) => user && job.ownerId === user.id);
  }

  async function createJob(data) {
    const user = currentUser();
    if (!user) throw new Error('Inicia sesión para publicar una vacante.');

    const job = {
      ...data,
      id: newId(),
      ownerId: user.id,
      ownerName: user.name,
      createdAt: new Date().toISOString(),
      color: COLORS[(data.company.charCodeAt(0) || 0) % COLORS.length]
    };

    write(KEYS.jobs, [...jobs(), job]);
    return job;
  }

  /* ---------- Postulaciones ---------- */

  async function applyToJob(jobId) {
    const user = currentUser();
    if (!user) throw new Error('Inicia sesión para postularte.');

    const job = jobs().find((item) => item.id === jobId);
    if (!job) throw new Error('Esa vacante ya no existe.');
    if (job.ownerId === user.id) throw new Error('No puedes postularte a tu propia vacante.');

    const all = applications();
    if (all.some((item) => item.jobId === jobId && item.applicantId === user.id)) {
      throw new Error('Ya te postulaste a esta vacante.');
    }

    const application = {
      id: newId(),
      jobId,
      applicantId: user.id,
      applicantName: user.name,
      applicantHeadline: user.profile.headline,
      applicantSkills: user.profile.skills,
      status: 'En revisión',
      createdAt: new Date().toISOString()
    };

    write(KEYS.applications, [...all, application]);
    return application;
  }

  const withJob = (application) => ({
    ...application,
    job: jobs().find((job) => job.id === application.jobId) || null
  });

  async function getMyApplications() {
    const user = currentUser();
    return applications()
      .filter((item) => user && item.applicantId === user.id)
      .sort(newestFirst)
      .map(withJob);
  }

  async function getApplicationsToMyJobs() {
    const mine = new Set((await getMyJobs()).map((job) => job.id));
    return applications()
      .filter((item) => mine.has(item.jobId))
      .sort(newestFirst)
      .map(withJob);
  }

  /* ---------- Cálculos para mostrar ---------- */

  // Porcentaje de habilidades de la vacante que coinciden con las del usuario.
  function matchPercent(skills = [], tags = []) {
    if (!skills.length || !tags.length) return null;
    const mine = new Set(skills.map((skill) => skill.toLocaleLowerCase()));
    const hits = tags.filter((tag) => mine.has(tag.toLocaleLowerCase())).length;
    return Math.round((hits / tags.length) * 100);
  }

  function profileCompletion(user) {
    const { headline, bio, skills, avatar, cvName } = user.profile;
    const checks = [user.name, headline, bio, skills.length > 0, avatar, cvName];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }

  function timeAgo(iso) {
    const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} h`;

    const days = Math.floor(hours / 24);
    if (days < 7) return days === 1 ? 'Hace 1 día' : `Hace ${days} días`;

    const weeks = Math.floor(days / 7);
    return weeks === 1 ? 'Hace 1 semana' : `Hace ${weeks} semanas`;
  }

  // Cualquier enlace que diga "Cerrar sesión" cierra la sesión.
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (link && link.textContent.trim() === 'Cerrar sesión') {
      event.preventDefault();
      logout();
    }
  });

  return {
    currentUser, requireUser, register, login, logout, updateProfile,
    getJobs, getJob, getMyJobs, createJob,
    applyToJob, getMyApplications, getApplicationsToMyJobs,
    matchPercent, profileCompletion, timeAgo
  };
})();
