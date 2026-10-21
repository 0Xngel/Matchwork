// =========================================
// MATCHWORK — DATOS DEL DASHBOARD
// =========================================

// Vacantes ficticias para probar la interfaz.
// No representan ofertas laborales reales.

const jobs = [
  {
    id: 1,
    title: "Desarrollador Frontend Junior",
    company: "NovaTech",
    location: "Monterrey, México",
    modality: "hybrid",
    type: "full-time",
    salary: "$18,000–$24,000 MXN / mes",
    tags: ["JavaScript", "HTML", "CSS"],
    postedDaysAgo: 1
  },
  {
    id: 2,
    title: "Diseñador UX/UI",
    company: "Studio Norte",
    location: "Remoto",
    modality: "remote",
    type: "full-time",
    salary: "$16,000–$22,000 MXN / mes",
    tags: ["Figma", "UX", "UI"],
    postedDaysAgo: 2
  },
  {
    id: 3,
    title: "Practicante de Desarrollo Web",
    company: "Pixel Labs",
    location: "Guadalupe, Nuevo León",
    modality: "onsite",
    type: "internship",
    salary: "Apoyo económico por definir",
    tags: ["HTML", "CSS", "JavaScript"],
    postedDaysAgo: 3
  },
  {
    id: 4,
    title: "Desarrollador Backend",
    company: "CloudWorks",
    location: "Remoto",
    modality: "remote",
    type: "full-time",
    salary: "$22,000–$30,000 MXN / mes",
    tags: ["Node.js", "SQL", "APIs"],
    postedDaysAgo: 4
  },
  {
    id: 5,
    title: "Asistente de Diseño Digital",
    company: "Creativa MX",
    location: "Monterrey, México",
    modality: "hybrid",
    type: "part-time",
    salary: "$9,000–$12,000 MXN / mes",
    tags: ["Diseño", "Canva", "Redes sociales"],
    postedDaysAgo: 5
  },
  {
    id: 6,
    title: "Desarrollador Web",
    company: "Nube Digital",
    location: "Ciudad de México",
    modality: "onsite",
    type: "full-time",
    salary: "$20,000–$27,000 MXN / mes",
    tags: ["JavaScript", "CSS", "APIs"],
    postedDaysAgo: 6
  }
];

console.log("Vacantes cargadas:", jobs.length);

// =========================================
// RENDERIZADO DE VACANTES
// =========================================

const jobsResults = document.getElementById("jobsResults");
const jobsCount = document.getElementById("jobsCount");

const jobSearchForm = document.getElementById("jobSearchForm");
const jobSearch = document.getElementById("jobSearch");
const jobLocation = document.getElementById("jobLocation");
const jobType = document.getElementById("jobType");
const jobModality = document.getElementById("jobModality");
const jobSort = document.getElementById("jobSort");


const modalityLabels = {
  remote: "Remoto",
  hybrid: "Híbrido",
  onsite: "Presencial"
};

const typeLabels = {
  "full-time": "Tiempo completo",
  "part-time": "Medio tiempo",
  internship: "Prácticas"
};

function renderJobs(jobsToRender) {
  jobsCount.textContent =
    `${jobsToRender.length} ${jobsToRender.length === 1 ? "oportunidad encontrada" : "oportunidades encontradas"}`;

  if (jobsToRender.length === 0) {
    jobsResults.innerHTML = `
      <p class="jobs-placeholder">
        No encontramos oportunidades con esos criterios.
        Prueba con otra búsqueda o modifica los filtros.
      </p>
    `;
    return;
  }

  jobsResults.innerHTML = jobsToRender.map(job => `
    <article class="job-card dashboard-job-card">
      <div class="dashboard-job-top">
        <div class="company-logo company-violet" aria-hidden="true">
          ${job.company.charAt(0)}
        </div>
        <span class="dashboard-job-type">
          ${typeLabels[job.type]}
        </span>
      </div>

      <p class="company-name">${job.company}</p>
      <h3>${job.title}</h3>

      <p class="job-location">
        ${job.location} · ${modalityLabels[job.modality]}
      </p>

      <div class="job-tags">
        ${job.tags.map(tag => `<span>${tag}</span>`).join("")}
      </div>

      <div class="dashboard-job-footer">
        <strong>${job.salary}</strong>
        <span>Hace ${job.postedDaysAgo} ${job.postedDaysAgo === 1 ? "día" : "días"}</span>
      </div>
    </article>
  `).join("");
}

renderJobs(jobs);

function filterAndSortJobs() {
  const searchTerm = jobSearch.value.trim().toLowerCase();
  const locationTerm = jobLocation.value.trim().toLowerCase();
  const selectedType = jobType.value;
  const selectedModality = jobModality.value;
  const selectedSort = jobSort.value;

  let filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm) ||
      job.company.toLowerCase().includes(searchTerm) ||
      job.tags.some(tag => tag.toLowerCase().includes(searchTerm));

    const matchesLocation =
      job.location.toLowerCase().includes(locationTerm);

    const matchesType =
      selectedType === "all" || job.type === selectedType;

    const matchesModality =
      selectedModality === "all" ||
      job.modality === selectedModality;

    return (
      matchesSearch &&
      matchesLocation &&
      matchesType &&
      matchesModality
    );
  });

  if (selectedSort === "title") {
    filteredJobs.sort((a, b) => a.title.localeCompare(b.title, "es"));
  } else {
    filteredJobs.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
  }

  renderJobs(filteredJobs);
}

jobSearchForm.addEventListener("submit", event => {
  event.preventDefault();
  filterAndSortJobs();
});

jobSearch.addEventListener("input", filterAndSortJobs);
jobLocation.addEventListener("input", filterAndSortJobs);
jobType.addEventListener("change", filterAndSortJobs);
jobModality.addEventListener("change", filterAndSortJobs);
jobSort.addEventListener("change", filterAndSortJobs);