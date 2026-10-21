# ✦ Matchwork

### Encuentra oportunidades. Conecta con tu futuro.

**Matchwork** es un prototipo de plataforma web que busca combinar el descubrimiento de oportunidades laborales con la construcción de una identidad profesional. Inspirada en la dinámica de exploración de aplicaciones modernas, propone una experiencia más visual, intuitiva y atractiva para conectar a candidatos con empresas y reclutadores.

> Menos búsquedas interminables. Más oportunidades que conectan contigo.

---

## ✨ Concepto

Las plataformas profesionales tradicionales pueden resultar abrumadoras al explorar numerosas vacantes. Matchwork busca ofrecer una experiencia diferente: descubrir oportunidades laborales mediante una interfaz visual, consultar información relevante de cada puesto y construir un perfil profesional desde un mismo lugar.

El proyecto se encuentra en una etapa inicial de desarrollo frontend. Actualmente cuenta con varias páginas interactivas que representan la experiencia visual propuesta, mientras que las funciones que requieren autenticación, almacenamiento y comunicación con un servidor siguen pendientes.

## 🎯 Objetivos del proyecto

- **Descubrir:** explorar oportunidades laborales mediante tarjetas visuales e interactivas.
- **Conectar:** acercar a candidatos y empresas a través de oportunidades profesionales.
- **Organizar:** reunir perfiles profesionales e información laboral en un mismo espacio.
- **Simplificar:** ofrecer una experiencia intuitiva, adaptable y fácil de utilizar.
- **Diseñar:** desarrollar una interfaz coherente, accesible y agradable en distintos dispositivos.

## 🚀 Estado de las funcionalidades

### Implementadas en el prototipo

- [x] Estructura inicial de páginas HTML.
- [x] Portada con presentación del proyecto y navegación.
- [x] Diseño adaptable a diferentes tamaños de pantalla.
- [x] Tema claro y oscuro con preferencia guardada en el navegador.
- [x] Interfaz de registro con validaciones básicas.
- [x] Interfaz de inicio de sesión con validaciones y credenciales demostrativas.
- [x] Perfil profesional con campos para información personal y descripción.
- [x] Vista previa de la fotografía de perfil.
- [x] Agregado y eliminación de habilidades.
- [x] Selección de archivos PDF para representar el currículum.
- [x] Animaciones de entrada mediante Anime.js.
- [x] Estilos compartidos y estilos específicos para las páginas de autenticación y perfil.

### Pendientes de desarrollo

- [ ] Dashboard funcional para explorar oportunidades laborales.
- [ ] Búsqueda y filtrado de vacantes.
- [ ] Visualización detallada de cada oferta.
- [ ] Guardado de oportunidades y envío de postulaciones.
- [ ] Registro y autenticación reales de usuarios.
- [ ] Almacenamiento persistente de perfiles y archivos.
- [ ] Herramientas para que empresas y reclutadores publiquen y administren vacantes.
- [ ] Integración con una base de datos y un backend.
- [ ] Pruebas funcionales y de seguridad más completas.

**Importante:** las páginas de registro, inicio de sesión y perfil funcionan actualmente como demostraciones del lado del cliente. No existe todavía un sistema real de cuentas, ni se guardan permanentemente los datos del perfil o los archivos seleccionados.

## 🛠️ Tecnologías utilizadas

| Tecnología | Propósito |
|---|---|
| HTML5 | Estructura y contenido de las páginas web. |
| CSS3 | Diseño visual, componentes reutilizables y adaptación a distintos dispositivos. |
| JavaScript | Interactividad, validaciones, gestión del tema y manipulación de elementos de la interfaz. |
| Anime.js 4 | Animaciones de entrada e interacciones visuales. |
| Git | Control de versiones del código. |
| GitHub | Alojamiento del repositorio y gestión de ramas y Pull Requests. |
| Visual Studio Code | Entorno de edición y desarrollo. |
| Live Server | Servidor local para visualizar y probar las páginas durante el desarrollo. |

Anime.js se incorpora mediante un CDN de JavaScript. Actualmente, el proyecto no utiliza un framework frontend ni dispone de un backend conectado.

Node.js, npm, PostgreSQL y otras tecnologías para futuras etapas podrán evaluarse cuando se defina la arquitectura de la aplicación.

## 📂 Estructura del proyecto

```text
Matchwork/
├── css/
│   ├── auth.css
│   ├── profile.css
│   └── styles.css
├── js/
│   └── theme.js
├── index.html
├── login.html
├── register.html
├── profile.html
└── README.md
```

### Descripción de los archivos principales

- **`index.html`:** portada y presentación de Matchwork.
- **`login.html`:** interfaz de inicio de sesión con validaciones demostrativas.
- **`register.html`:** formulario de registro con validaciones y animaciones.
- **`profile.html`:** interfaz para editar visualmente la información de un perfil profesional.
- **`css/styles.css`:** estilos globales, componentes compartidos y temas visuales.
- **`css/auth.css`:** estilos específicos de las páginas de registro e inicio de sesión.
- **`css/profile.css`:** estilos específicos del perfil profesional.
- **`js/theme.js`:** lógica del tema claro y oscuro, incluida la persistencia de la preferencia.
- **`README.md`:** documentación general del proyecto.

El dashboard de empleos todavía no forma parte de esta estructura.

## ⚙️ Instalación y ejecución

### Requisitos

- Git.
- Visual Studio Code o un editor equivalente.
- Un navegador web moderno.
- La extensión Live Server de VS Code, recomendada para el desarrollo local.

### 1. Clonar el repositorio

```bash
git clone https://github.com/0Xngel/Matchwork.git
cd Matchwork
```

### 2. Abrir el proyecto

Abre la carpeta `Matchwork` en Visual Studio Code.

### 3. Ejecutar la aplicación

Utiliza Live Server para abrir `index.html` en el navegador. Desde la portada podrás navegar a las páginas disponibles.

También puedes abrir directamente `login.html`, `register.html` o `profile.html` para probar sus interfaces.

No es necesario ejecutar `npm install` en la versión actual del proyecto, ya que no se utiliza un sistema de dependencias local.

**Nota:** las animaciones que dependen de Anime.js requieren acceso al CDN. La ejecución local de las páginas no implica que exista autenticación real ni almacenamiento de información en un servidor.

## 🌿 Flujo de trabajo y contribuciones

El desarrollo se organiza mediante ramas de Git y Pull Requests en GitHub.

1. Actualizar la rama principal antes de comenzar una tarea.
2. Crear una rama específica para la funcionalidad o mejora.
3. Implementar los cambios y probarlos localmente.
4. Registrar los cambios mediante commits descriptivos.
5. Publicar la rama y crear un Pull Request.
6. Revisar los cambios antes de integrarlos en `main`.

Se recomienda mantener los nombres de las ramas claros y descriptivos, y redactar los commits y las descripciones de los Pull Requests en español.

## 🔭 Visión a futuro

Matchwork busca convertir la exploración laboral en una experiencia más cercana a la manera en que las personas descubren contenido e interactúan en la web moderna.

Las siguientes etapas se centrarán en desarrollar el dashboard de empleos, conectar las distintas pantallas y definir una arquitectura que permita incorporar cuentas reales, perfiles persistentes y herramientas para candidatos y reclutadores.

Matchwork es el punto de partida de esa idea.

---

<p align="center">
  <strong>Matchwork · Tu próximo paso profesional empieza aquí.</strong>
</p>

<p align="center">
  Proyecto académico · Desarrollo Web Profesional
</p>