# Matchwork — Design System

## 1. Propósito

Este documento define las reglas visuales y de interacción de Matchwork. Su objetivo es mantener una identidad coherente entre todas las páginas y evitar que cada nueva funcionalidad introduzca estilos incompatibles.

Antes de diseñar una página nueva o modificar una existente, consulta esta guía y reutiliza los componentes y las variables CSS disponibles.

## 2. Identidad visual

Matchwork es una plataforma de descubrimiento laboral con una experiencia visual moderna, profesional, accesible y cercana.

La interfaz debe transmitir claridad, confianza y dinamismo, evitando la apariencia rígida de un portal de empleo tradicional.

### Principios

- Priorizar la claridad y la facilidad de navegación.
- Mantener una identidad visual consistente en todas las páginas.
- Utilizar el color para destacar acciones y elementos importantes.
- Diseñar primero pensando en distintos tamaños de pantalla.
- Respetar las preferencias de movimiento reducido del usuario.
- Evitar adornos que dificulten la lectura o distraigan de las tareas principales.

## 3. Paleta de colores

Los siguientes valores proceden de las variables CSS actuales de `css/styles.css`.

| Token | Valor claro | Uso |
|---|---|---|
| `--color-primary` | `#7657FF` | Acciones principales, enlaces destacados y elementos de marca. |
| `--color-primary-hover` | `#6241EF` | Estado hover de las acciones principales. |
| `--color-accent` | `#B8F34A` | Acentos visuales y elementos de énfasis. |
| `--color-coral` | `#FF6B6B` | Acentos secundarios y estados que requieran atención. |
| `--color-mint` | `#21C7A8` | Elementos de apoyo y acentos positivos. |
| `--color-background` | `#F7F7FC` | Fondo general de la aplicación. |
| `--color-surface` | `#FFFFFF` | Tarjetas, paneles y superficies principales. |
| `--color-surface-secondary` | `#F0EFF8` | Superficies secundarias. |
| `--color-text` | `#17172B` | Texto principal. |
| `--color-text-secondary` | `#68687D` | Texto secundario y descripciones. |
| `--color-border` | `#E5E4EF` | Bordes y separadores. |

### Reglas de uso

- Utilizar `var(--color-primary)` en lugar de repetir el código hexadecimal.
- Priorizar los colores de texto y superficie definidos por el tema.
- Reservar los colores de acento para destacar elementos concretos.
- No introducir nuevos colores globales sin una necesidad justificada.
- Comprobar el contraste entre texto, fondo y controles interactivos.

## 4. Tema claro y oscuro

Matchwork dispone de un tema claro y otro oscuro, gestionados mediante el atributo `data-theme` del elemento raíz y `js/theme.js`.

### Tema claro

- Fondo: `#F7F7FC`
- Superficie principal: `#FFFFFF`
- Texto principal: `#17172B`
- Texto secundario: `#68687D`
- Borde: `#E5E4EF`

### Tema oscuro

- Fondo: `#11111F`
- Superficie principal: `#1C1B2D`
- Superficie secundaria: `#26243B`
- Texto principal: `#F7F5FF`
- Texto secundario: `#B7B4CB`
- Borde: `#37344C`

### Reglas

- Usar las variables semánticas para que los componentes respondan al tema.
- Evitar fondos y textos con colores fijos cuando deban cambiar de tema.
- Mantener visibles los estados de foco, hover, deshabilitado y error.
- No crear un sistema de temas independiente para cada página.

## 5. Tipografía

La tipografía global actual utiliza esta pila:

`Inter, "Segoe UI", Tahoma, sans-serif`

### Jerarquía recomendada

- **Título principal:** grande, claro y con una jerarquía visual evidente.
- **Títulos de sección:** tamaño intermedio y peso suficiente para facilitar el escaneo.
- **Texto principal:** cómodo de leer y con una altura de línea adecuada.
- **Etiquetas y metadatos:** más compactos, sin sacrificar legibilidad.

La jerarquía debe ser consistente entre páginas. Evitar utilizar muchos tamaños, pesos o estilos tipográficos sin una razón funcional.

## 6. Bordes, radios y sombras

Reutilizar los tokens existentes:

| Token | Valor | Aplicación |
|---|---|---|
| `--radius-sm` | `10px` | Campos y componentes pequeños. |
| `--radius-md` | `18px` | Componentes y contenedores medianos. |
| `--radius-lg` | `28px` | Tarjetas y contenedores principales. |
| `--radius-pill` | `999px` | Botones redondeados y etiquetas tipo chip. |
| `--shadow-card` | `0 20px 60px rgb(37 26 85 / 10%)` | Tarjetas destacadas en tema claro. |
| `--shadow-soft` | `0 8px 30px rgb(37 26 85 / 7%)` | Elevación ligera. |

Las sombras deben aportar profundidad sin dominar la interfaz. En el tema oscuro deben utilizarse las variantes definidas por el sistema de estilos.

## 7. Espaciado y composición

- Mantener una separación visual clara entre secciones.
- Agrupar los campos relacionados dentro de la misma sección.
- Evitar interfaces excesivamente densas.
- Utilizar los contenedores y patrones de distribución existentes cuando sean adecuados.
- Comprobar que las tarjetas y formularios no desborden su contenedor.

No introducir un sistema adicional de espaciado hasta que exista una necesidad real y se pueda aplicar de forma coherente.

## 8. Componentes

### Navegación

- Reutilizar la cabecera, la marca y los estilos de navegación existentes.
- Mantener enlaces claros y distinguir la acción principal.
- Garantizar que los controles sigan siendo utilizables en pantallas pequeñas.

### Botones

- Utilizar las clases de botones existentes, como `button-primary`, `button-secondary` y `button-ghost`.
- Reservar el botón principal para la acción más importante de cada sección.
- Proporcionar estados hover, foco y deshabilitado.
- Utilizar etiquetas que describan claramente la acción.

### Tarjetas

- Utilizar superficies coherentes con el tema activo.
- Mantener radios, bordes y sombras consistentes.
- Priorizar el contenido importante y evitar adornos innecesarios.

### Formularios

- Asociar cada campo con su etiqueta.
- Mostrar mensajes de validación comprensibles.
- Mantener estados de foco visibles.
- Evitar depender únicamente del color para comunicar errores.
- No presentar acciones simuladas como operaciones reales.

### Etiquetas y habilidades

- Utilizar chips compactos y legibles.
- Facilitar la identificación y eliminación de elementos cuando corresponda.
- Evitar duplicados si el componente requiere valores únicos.

## 9. Diseño adaptable

Todas las páginas nuevas deben funcionar en escritorio, tableta y móvil.

- Evitar anchos fijos que provoquen desbordamientos.
- Permitir que las columnas se apilen cuando no exista espacio suficiente.
- Mantener botones y campos cómodos para la interacción táctil.
- Adaptar la navegación a pantallas pequeñas.
- Comprobar el comportamiento de las tarjetas, formularios y textos largos.

Reutilizar las media queries y patrones responsivos existentes cuando sean adecuados.

## 10. Animaciones e interacción

Anime.js se utiliza actualmente para animaciones de entrada.

- Preferir animaciones breves y discretas.
- Utilizar movimiento para reforzar la jerarquía, no para distraer.
- Respetar `prefers-reduced-motion`.
- No añadir animaciones que retrasen innecesariamente una tarea.
- Garantizar que la página siga funcionando si la biblioteca de animación no está disponible.

Las animaciones son complementarias: no deben ser necesarias para comprender o utilizar la interfaz.

## 11. Accesibilidad

- Utilizar HTML semántico.
- Mantener un contraste suficiente entre texto y fondo.
- Asegurar que los controles puedan utilizarse con teclado.
- Proporcionar etiquetas accesibles a los botones que no tengan texto visible.
- Asociar mensajes dinámicos con las regiones correspondientes.
- Mantener indicadores de foco visibles.
- Respetar las preferencias de movimiento reducido.

## 12. Reglas para herramientas de IA

Cuando una herramienta de IA genere o modifique código para Matchwork:

1. Leer este documento antes de diseñar una página o un componente.
2. Revisar `css/styles.css` y los estilos específicos relacionados.
3. Reutilizar las variables y clases existentes siempre que sea posible.
4. No reemplazar funcionalidades existentes al modificar el diseño.
5. No introducir dependencias nuevas sin justificar su necesidad.
6. Mantener el comportamiento de los temas claro y oscuro.
7. Probar la interfaz en tamaños de pantalla diferentes.
8. Identificar claramente cualquier funcionalidad que sea solo demostrativa.
9. Explicar los archivos modificados y las pruebas realizadas.

## 13. Evolución del sistema

Este documento describe el sistema visual actual y las reglas recomendadas para ampliarlo.

Cuando se incorpore un componente o patrón visual reutilizable, se deberá evaluar si corresponde actualizar esta guía y los estilos compartidos.

Los cambios de diseño deben mantener la coherencia del producto sin impedir mejoras justificadas en usabilidad, accesibilidad o funcionalidad.