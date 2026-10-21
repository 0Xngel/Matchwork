// Capa de datos de Matchwork conectada a Firebase (Authentication + Firestore).
// Tiene las mismas funciones que la versión local (store-local.js),
// así que las páginas no necesitan cambios.

const Store = (() => {
  const FB = 'https://www.gstatic.com/firebasejs/10.14.1';
  const CACHE_KEY = 'mw-user-cache';
  const COLORS = ['violet', 'green', 'coral'];

  /* ---------- Carga de Firebase ---------- */

  const firebase = (async () => {
    let config;
    let A;
    let F;

    try {
      config = await import('./firebase-config.js');
    } catch {
      throw new Error('No se pudo cargar js/firebase-config.js. Abre la página desde tu servidor local (Live Server), no con doble clic.');
    }

    if (!config.firebaseReady) {
      throw new Error('Firebase todavía no está configurado. Pega los datos de tu proyecto en js/firebase-config.js.');
    }

    try {
      [A, F] = await Promise.all([
        import(`${FB}/firebase-auth.js`),
        import(`${FB}/firebase-firestore.js`)
      ]);
    } catch {
      throw new Error('No se pudo cargar Firebase. Revisa tu conexión a internet.');
    }

    return { A, F, db: config.db, auth: A.getAuth(config.app) };
  })();

  // El error se muestra cuando una función necesita Firebase; aquí solo se evita el aviso suelto.
  firebase.catch(() => {});

  /* ---------- Errores en español ---------- */

  const MESSAGES = {
    'auth/email-already-in-use': 'Ya existe una cuenta con ese correo.',
    'auth/invalid-email': 'Escribe un correo válido.',
    'auth/missing-password': 'Escribe tu contraseña.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/invalid-credential': 'Correo o contraseña incorrectos.',
    'auth/wrong-password': 'Correo o contraseña incorrectos.',
    'auth/user-not-found': 'Correo o contraseña incorrectos.',
    'auth/too-many-requests': 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
    'auth/network-request-failed': 'No hay conexión con Firebase. Revisa tu internet.',
    'auth/operation-not-allowed': 'Activa el acceso con correo y contraseña en Firebase → Authentication.',
    'permission-denied': 'Firebase rechazó la operación. Revisa las reglas de Firestore.',
    unavailable: 'No hay conexión con Firebase. Revisa tu internet.'
  };

  function friendly(error) {
    if (!error.code) return error;
    console.error(error);
    return new Error(MESSAGES[error.code] || `Firebase respondió con un error (${error.code}).`);
  }

  const wrap = (fn) => async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      throw friendly(error);
    }
  };

  /* ---------- Usuario en caché (para páginas que lo leen al instante) ---------- */

  const readCache = () => {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY));
    } catch {
      return null;
    }
  };

  const writeCache = (user) => {
    try {
      if (user) localStorage.setItem(CACHE_KEY, JSON.stringify(user));
      else localStorage.removeItem(CACHE_KEY);
    } catch {
      // Sin almacenamiento local no hay caché, pero Firebase sigue manejando la sesión.
    }
  };

  const defaultProfile = () => ({ headline: '', bio: '', skills: [], avatar: '', cvName: '' });
  const newestFirst = (a, b) => b.createdAt.localeCompare(a.createdAt);
  const fromDoc = (snap) => ({ id: snap.id, ...snap.data() });

  // Trae el perfil del usuario desde Firestore (y lo crea si no existe).
  async function loadUser(fb, fbUser, fallbackName) {
    const ref = fb.F.doc(fb.db, 'users', fbUser.uid);
    const snap = await fb.F.getDoc(ref);
    let data;

    if (snap.exists()) {
      data = snap.data();
    } else {
      data = {
        name: fallbackName || fbUser.email.split('@')[0],
        email: fbUser.email,
        createdAt: new Date().toISOString(),
        profile: defaultProfile()
      };
      await fb.F.setDoc(ref, data);
    }

    const user = {
      id: fbUser.uid,
      name: data.name,
      email: data.email,
      createdAt: data.createdAt,
      profile: { ...defaultProfile(), ...data.profile }
    };

    writeCache(user);
    return user;
  }

  // Si Firebase cierra la sesión (por ejemplo, expiró), se limpia la caché y se recarga la página.
  firebase.then((fb) => {
    fb.A.onAuthStateChanged(fb.auth, async (fbUser) => {
      const cached = readCache();

      if (!fbUser) {
        if (cached) {
          writeCache(null);
          location.reload();
        }
        return;
      }

      if (!cached || cached.id !== fbUser.uid) {
        try {
          await loadUser(fb, fbUser);
        } catch {
          // Se intentará de nuevo en la siguiente carga.
        }
      }
    });
  }).catch(() => {});

  /* ---------- Sesión ---------- */

  const currentUser = () => readCache();

  // Úsalo en páginas privadas: si no hay sesión, manda al inicio de sesión.
  function requireUser() {
    const user = readCache();
    if (!user) location.replace('login.html');
    return user;
  }

  async function register({ name, email, password }) {
    name = (name || '').trim();
    email = (email || '').trim().toLowerCase();

    if (name.length < 2) throw new Error('Escribe tu nombre completo.');
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Escribe un correo válido.');
    if ((password || '').length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres.');

    const fb = await firebase;
    const credential = await fb.A.createUserWithEmailAndPassword(fb.auth, email, password);
    return loadUser(fb, credential.user, name);
  }

  async function login(email, password) {
    const fb = await firebase;
    const credential = await fb.A.signInWithEmailAndPassword(
      fb.auth, (email || '').trim().toLowerCase(), password || ''
    );
    return loadUser(fb, credential.user);
  }

  async function logout() {
    writeCache(null);

    try {
      const fb = await firebase;
      await fb.A.signOut(fb.auth);
    } catch {
      // Aunque falle, igual se manda al inicio.
    }

    location.href = 'index.html';
  }

  async function updateProfile({ name, ...profile }) {
    const cached = readCache();
    if (!cached) throw new Error('Inicia sesión para guardar tu perfil.');

    const fb = await firebase;
    const updated = {
      ...cached,
      name: name !== undefined ? name.trim() : cached.name,
      profile: { ...cached.profile, ...profile }
    };

    await fb.F.setDoc(fb.F.doc(fb.db, 'users', cached.id), {
      name: updated.name,
      email: updated.email,
      createdAt: updated.createdAt,
      profile: updated.profile
    });

    writeCache(updated);
    return updated;
  }

  /* ---------- Vacantes ---------- */

  async function getJobs() {
    const fb = await firebase;
    const snapshot = await fb.F.getDocs(fb.F.collection(fb.db, 'jobs'));
    return snapshot.docs.map(fromDoc).sort(newestFirst);
  }

  async function getJob(id) {
    if (!id || !/^[\w-]+$/.test(id)) return null;

    const fb = await firebase;
    const snap = await fb.F.getDoc(fb.F.doc(fb.db, 'jobs', id));
    return snap.exists() ? fromDoc(snap) : null;
  }

  async function getMyJobs() {
    const user = readCache();
    if (!user) return [];

    const fb = await firebase;
    const snapshot = await fb.F.getDocs(
      fb.F.query(fb.F.collection(fb.db, 'jobs'), fb.F.where('ownerId', '==', user.id))
    );
    return snapshot.docs.map(fromDoc).sort(newestFirst);
  }

  async function createJob(data) {
    const user = readCache();
    if (!user) throw new Error('Inicia sesión para publicar una vacante.');

    const fb = await firebase;
    const job = {
      ...data,
      ownerId: user.id,
      ownerName: user.name,
      createdAt: new Date().toISOString(),
      color: COLORS[(data.company.charCodeAt(0) || 0) % COLORS.length]
    };

    const ref = await fb.F.addDoc(fb.F.collection(fb.db, 'jobs'), job);
    return { id: ref.id, ...job };
  }

  /* ---------- Postulaciones ---------- */

  // Trae las postulaciones donde `field` (applicantId o jobOwnerId) es el usuario, con los datos de su vacante.
  async function fetchApplications(field, uid) {
    const fb = await firebase;
    const [snapshot, jobs] = await Promise.all([
      fb.F.getDocs(fb.F.query(fb.F.collection(fb.db, 'applications'), fb.F.where(field, '==', uid))),
      getJobs()
    ]);

    const byId = new Map(jobs.map((job) => [job.id, job]));

    return snapshot.docs
      .map(fromDoc)
      .sort(newestFirst)
      .map((application) => ({ ...application, job: byId.get(application.jobId) || null }));
  }

  async function getMyApplications() {
    const user = readCache();
    return user ? fetchApplications('applicantId', user.id) : [];
  }

  async function getApplicationsToMyJobs() {
    const user = readCache();
    return user ? fetchApplications('jobOwnerId', user.id) : [];
  }

  async function applyToJob(jobId) {
    const user = readCache();
    if (!user) throw new Error('Inicia sesión para postularte.');

    const job = await getJob(jobId);
    if (!job) throw new Error('Esa vacante ya no existe.');
    if (job.ownerId === user.id) throw new Error('No puedes postularte a tu propia vacante.');

    const mine = await getMyApplications();
    if (mine.some((item) => item.jobId === jobId)) throw new Error('Ya te postulaste a esta vacante.');

    const fb = await firebase;
    const id = `${jobId}_${user.id}`;
    const application = {
      jobId,
      jobOwnerId: job.ownerId,
      applicantId: user.id,
      applicantName: user.name,
      applicantHeadline: user.profile.headline,
      applicantSkills: user.profile.skills,
      status: 'En revisión',
      createdAt: new Date().toISOString()
    };

    await fb.F.setDoc(fb.F.doc(fb.db, 'applications', id), application);
    return { id, ...application };
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
    currentUser,
    requireUser,
    logout,
    matchPercent,
    profileCompletion,
    timeAgo,
    register: wrap(register),
    login: wrap(login),
    updateProfile: wrap(updateProfile),
    getJobs: wrap(getJobs),
    getJob: wrap(getJob),
    getMyJobs: wrap(getMyJobs),
    createJob: wrap(createJob),
    applyToJob: wrap(applyToJob),
    getMyApplications: wrap(getMyApplications),
    getApplicationsToMyJobs: wrap(getApplicationsToMyJobs)
  };
})();
