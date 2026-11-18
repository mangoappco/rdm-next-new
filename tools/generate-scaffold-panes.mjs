import fs from 'node:fs';
import path from 'node:path';

const pairs = [
  {
    num: 1,
    title: 'Base y anatomía (Single-pane Scaffold)',
    desc: 'Estructura base con sus tres regiones maestras: cabecera sticky, panel de contenido con desplazamiento independiente y FAB seguro.',
    specimenClass: 'sr-specimen sr-specimen-scaffold',
    markup: `        <div class="md-scaffold">
          <!-- Slot: Header / Cabecera superior sticky -->
          <div class="md-scaffold-header">
            <header class="md-top-app-bar md-top-app-bar-small" data-md-top-app-bar-scroll>
              <div class="md-top-app-bar-leading">
                <button type="button" class="md-icon-button" aria-label="Menú principal">
                  <span class="md-icon" aria-hidden="true">menu</span>
                </button>
              </div>
              <div class="md-top-app-bar-content">
                <span class="md-top-app-bar-title">App Shell · Base</span>
              </div>
              <div class="md-top-app-bar-trailing">
                <button type="button" class="md-icon-button" aria-label="Buscar">
                  <span class="md-icon" aria-hidden="true">search</span>
                </button>
              </div>
            </header>
          </div>

          <!-- Slot: Body / Panel principal autónomo con scroll independiente -->
          <div class="md-scaffold-body">
            <main class="md-scaffold-pane md-scaffold-pane-flexible">
              <article class="md-card md-card-outlined">
                <div class="md-card-header">
                  <h4 class="md-type-title-medium">Panel principal autónomo</h4>
                  <p class="md-type-body-small">Contenedor con desplazamiento independiente y contención overscroll.</p>
                </div>
                <div class="md-card-content">
                  <p class="md-type-body-medium">Espacio delimitado por el Scaffold, preparado para recibir la retícula interna o tarjetas de flujo.</p>
                </div>
              </article>
              <article class="md-card md-card-outlined">
                <div class="md-card-header">
                  <h4 class="md-type-title-medium">Contenido secundario</h4>
                  <p class="md-type-body-small">Demostración de flujo continuo dentro del panel.</p>
                </div>
              </article>
            </main>
          </div>

          <!-- Slot: FAB / Botón de acción flotante seguro -->
          <div class="md-scaffold-fab">
            <button type="button" class="md-fab" aria-label="Acción primaria">
              <span class="md-icon" aria-hidden="true">add</span>
            </button>
          </div>
        </div>`
  },
  {
    num: 2,
    title: 'Fixed y Flexible Panes (Two-pane)',
    desc: 'Convivencia de un panel fijo de 360dp y un panel flexible con desplazamiento independiente por cada contenedor.',
    specimenClass: 'sr-specimen sr-specimen-scaffold',
    markup: `        <div class="md-scaffold">
          <!-- Slot: Header / Cabecera superior sticky -->
          <div class="md-scaffold-header">
            <header class="md-top-app-bar md-top-app-bar-small" data-md-top-app-bar-scroll>
              <div class="md-top-app-bar-leading">
                <button type="button" class="md-icon-button" aria-label="Menú principal">
                  <span class="md-icon" aria-hidden="true">menu</span>
                </button>
              </div>
              <div class="md-top-app-bar-content">
                <span class="md-top-app-bar-title">Two-pane · Fixed y Flexible</span>
              </div>
            </header>
          </div>

          <!-- Slot: Body / Convivencia de paneles fijo y flexible -->
          <div class="md-scaffold-body">
            <main class="md-scaffold-pane md-scaffold-pane-flexible">
              <article class="md-card md-card-outlined">
                <div class="md-card-header">
                  <h4 class="md-type-title-medium">Panel primario flexible (1fr)</h4>
                  <p class="md-type-body-small">Absorbe el espacio restante de la pantalla con scroll propio.</p>
                </div>
                <div class="md-card-content">
                  <p class="md-type-body-medium">Aloja el área de trabajo activa, tablas de datos o listas de flujo continuo.</p>
                </div>
              </article>
            </main>
            <aside class="md-scaffold-pane md-scaffold-pane-fixed" aria-label="Panel de apoyo fijo">
              <article class="md-card md-card-outlined">
                <div class="md-card-header">
                  <h4 class="md-type-title-medium">Panel fijo (360dp)</h4>
                  <p class="md-type-body-small">Ancho constante inmutable con scroll independiente.</p>
                </div>
                <div class="md-card-content">
                  <p class="md-type-body-medium">Detalles contextuales, filtros avanzados o resumen del registro seleccionado.</p>
                </div>
              </article>
            </aside>
          </div>

          <!-- Slot: FAB / Botón de acción flotante seguro -->
          <div class="md-scaffold-fab">
            <button type="button" class="md-fab" aria-label="Acción primaria">
              <span class="md-icon" aria-hidden="true">add</span>
            </button>
          </div>
        </div>`
  },
  {
    num: 3,
    title: 'Floating Pane (Panel elevado)',
    desc: 'Panel contextual elevado sobre el plano base con elevación tonal y sombra M3 para inspección o apoyo sin deformar el panel primario.',
    specimenClass: 'sr-specimen sr-specimen-scaffold',
    markup: `        <div class="md-scaffold">
          <!-- Slot: Header / Cabecera superior sticky -->
          <div class="md-scaffold-header">
            <header class="md-top-app-bar md-top-app-bar-small" data-md-top-app-bar-scroll>
              <div class="md-top-app-bar-leading">
                <button type="button" class="md-icon-button" aria-label="Menú principal">
                  <span class="md-icon" aria-hidden="true">menu</span>
                </button>
              </div>
              <div class="md-top-app-bar-content">
                <span class="md-top-app-bar-title">Floating Pane · Inspección</span>
              </div>
            </header>
          </div>

          <!-- Slot: Body / Panel flexible base con panel flotante elevado -->
          <div class="md-scaffold-body">
            <main class="md-scaffold-pane md-scaffold-pane-flexible">
              <article class="md-card md-card-outlined">
                <div class="md-card-header">
                  <h4 class="md-type-title-medium">Panel base de trabajo</h4>
                  <p class="md-type-body-small">Superficie estándar de contenido con desplazamiento continuo.</p>
                </div>
                <div class="md-card-content">
                  <p class="md-type-body-medium">El panel flotante adyacente ofrece contexto de inspección sin deformar este contenedor.</p>
                </div>
              </article>
            </main>
            <aside class="md-scaffold-pane md-scaffold-pane-fixed md-scaffold-pane-floating" aria-label="Panel flotante de inspección">
              <article class="md-card">
                <div class="md-card-header">
                  <h4 class="md-type-title-medium">Panel flotante (360dp)</h4>
                  <p class="md-type-body-small">Elevación M3 nivel 2 sobre superficie alta.</p>
                </div>
                <div class="md-card-content">
                  <p class="md-type-body-medium">Aloja herramientas de auditoría, panel de pagos o inspección rápida superpuesta.</p>
                </div>
              </article>
            </aside>
          </div>

          <!-- Slot: FAB / Botón de acción flotante seguro -->
          <div class="md-scaffold-fab">
            <button type="button" class="md-fab" aria-label="Acción primaria">
              <span class="md-icon" aria-hidden="true">add</span>
            </button>
          </div>
        </div>`
  },
  {
    num: 4,
    title: 'Semi-permanent Pane (Colapsable)',
    desc: 'Panel lateral acoplado que puede alternar su visibilidad según la interacción del usuario o la disponibilidad de espacio.',
    specimenClass: 'sr-specimen sr-specimen-scaffold',
    markup: `        <div class="md-scaffold">
          <!-- Slot: Header / Cabecera con botón de alternancia -->
          <div class="md-scaffold-header">
            <header class="md-top-app-bar md-top-app-bar-small" data-md-top-app-bar-scroll>
              <div class="md-top-app-bar-leading">
                <button type="button" class="md-icon-button" aria-label="Menú principal">
                  <span class="md-icon" aria-hidden="true">menu</span>
                </button>
              </div>
              <div class="md-top-app-bar-content">
                <span class="md-top-app-bar-title">Semi-permanent Pane</span>
              </div>
              <div class="md-top-app-bar-trailing">
                <button type="button" class="md-icon-button" aria-expanded="true" aria-controls="pane-lateral-acoplado" aria-label="Alternar panel lateral">
                  <span class="md-icon" aria-hidden="true">view_sidebar</span>
                </button>
              </div>
            </header>
          </div>

          <!-- Slot: Body / Área de trabajo con panel lateral acoplado -->
          <div class="md-scaffold-body">
            <main class="md-scaffold-pane md-scaffold-pane-flexible">
              <article class="md-card md-card-outlined">
                <div class="md-card-header">
                  <h4 class="md-type-title-medium">Área principal persistente</h4>
                  <p class="md-type-body-small">Contenedor adaptativo que absorbe el ancho cuando el panel colapsa.</p>
                </div>
                <div class="md-card-content">
                  <p class="md-type-body-medium">El panel lateral responde a la tecla o botón de alternancia colapsándose suavemente.</p>
                </div>
              </article>
            </main>
            <aside id="pane-lateral-acoplado" class="md-scaffold-pane md-scaffold-pane-fixed md-scaffold-pane-semi-permanent" aria-label="Panel lateral acoplado">
              <article class="md-card md-card-outlined">
                <div class="md-card-header">
                  <h4 class="md-type-title-medium">Panel lateral acoplado</h4>
                  <p class="md-type-body-small">Visibilidad condicionada por estado o tamaño de pantalla.</p>
                </div>
                <div class="md-card-content">
                  <p class="md-type-body-medium">Permite optimizar el espacio horizontal ocultándose cuando no es requerido.</p>
                </div>
              </article>
            </aside>
          </div>

          <!-- Slot: FAB / Botón de acción flotante seguro -->
          <div class="md-scaffold-fab">
            <button type="button" class="md-fab" aria-label="Acción primaria">
              <span class="md-icon" aria-hidden="true">add</span>
            </button>
          </div>
        </div>`
  },
  {
    num: 5,
    title: 'Compact (< 600dp · Single-pane)',
    desc: 'Ensamblaje móvil con barra superior, panel único con desplazamiento independiente, navegación inferior de 80dp y FAB elevado a 96dp.',
    specimenClass: 'sr-specimen sr-specimen-scaffold sr-specimen-compact',
    markup: `        <div class="md-scaffold">
          <!-- Slot: Header / Cabecera superior sticky -->
          <div class="md-scaffold-header">
            <header class="md-top-app-bar md-top-app-bar-small" data-md-top-app-bar-scroll>
              <div class="md-top-app-bar-leading">
                <button type="button" class="md-icon-button" aria-label="Menú principal">
                  <span class="md-icon" aria-hidden="true">menu</span>
                </button>
              </div>
              <div class="md-top-app-bar-content">
                <span class="md-top-app-bar-title">Móvil · Compact</span>
              </div>
            </header>
          </div>

          <!-- Slot: Body / Panel único móvil -->
          <div class="md-scaffold-body">
            <main class="md-scaffold-pane md-scaffold-pane-flexible">
              <article class="md-card md-card-outlined">
                <div class="md-card-header">
                  <h4 class="md-type-title-medium">Vista compacta de un panel</h4>
                  <p class="md-type-body-small">Desplazamiento vertical adaptado a terminal móvil.</p>
                </div>
                <div class="md-card-content">
                  <p class="md-type-body-medium">El padding inferior compensa automáticamente la barra de navegación para evitar solapamientos.</p>
                </div>
              </article>
            </main>
          </div>

          <!-- Slot: FAB / Elevación ergonómica sobre la barra inferior -->
          <div class="md-scaffold-fab">
            <button type="button" class="md-fab" aria-label="Acción rápida">
              <span class="md-icon" aria-hidden="true">add</span>
            </button>
          </div>

          <!-- Slot: Nav / Barra de navegación inferior móvil (80dp) -->
          <div class="md-scaffold-nav">
            <nav class="md-navigation-bar" aria-label="Navegación principal">
              <button type="button" class="md-navigation-bar-item" aria-current="page">
                <span class="md-navigation-bar-indicator">
                  <span class="md-navigation-bar-icon md-icon" aria-hidden="true">home</span>
                </span>
                <span class="md-navigation-bar-label">Inicio</span>
              </button>
              <button type="button" class="md-navigation-bar-item">
                <span class="md-navigation-bar-indicator">
                  <span class="md-navigation-bar-icon md-icon" aria-hidden="true">receipt_long</span>
                </span>
                <span class="md-navigation-bar-label">Pedidos</span>
              </button>
              <button type="button" class="md-navigation-bar-item">
                <span class="md-navigation-bar-indicator">
                  <span class="md-navigation-bar-icon md-icon" aria-hidden="true">settings</span>
                </span>
                <span class="md-navigation-bar-label">Ajustes</span>
              </button>
            </nav>
          </div>
        </div>`
  },
  {
    num: 6,
    title: 'Medium y Expanded (≥ 840dp · Two-pane)',
    desc: 'Chasis completo con Navigation Rail lateral coaxial a 96dp y dos paneles simultáneos con desplazamiento independiente.',
    specimenClass: 'sr-specimen sr-specimen-scaffold',
    markup: `        <div class="md-scaffold">
          <!-- Slot: Nav / Riel de navegación lateral coaxial (96dp) -->
          <div class="md-scaffold-nav">
            <nav class="md-navigation-rail" aria-label="Navegación principal">
              <div class="md-navigation-rail-header">
                <button type="button" class="md-icon-button" aria-label="Abrir menú de navegación" aria-expanded="false" data-rail-toggle>
                  <span class="md-icon" aria-hidden="true">menu</span>
                </button>
              </div>
              <div class="md-navigation-rail-content">
                <button type="button" class="md-navigation-rail-item" aria-current="page">
                  <span class="md-navigation-rail-indicator">
                    <span class="md-navigation-rail-icon md-icon" aria-hidden="true">home</span>
                  </span>
                  <span class="md-navigation-rail-label">Inicio</span><span class="md-navigation-rail-label-horizontal" aria-hidden="true">Inicio</span>
                </button>
                <button type="button" class="md-navigation-rail-item">
                  <span class="md-navigation-rail-indicator">
                    <span class="md-navigation-rail-icon md-icon" aria-hidden="true">point_of_sale</span>
                  </span>
                  <span class="md-navigation-rail-label">Caja</span><span class="md-navigation-rail-label-horizontal" aria-hidden="true">Caja</span>
                </button>
                <button type="button" class="md-navigation-rail-item">
                  <span class="md-navigation-rail-indicator">
                    <span class="md-navigation-rail-icon md-icon" aria-hidden="true">analytics</span>
                  </span>
                  <span class="md-navigation-rail-label">Métricas</span><span class="md-navigation-rail-label-horizontal" aria-hidden="true">Métricas</span>
                </button>
              </div>
            </nav>
          </div>

          <!-- Contenedor vertical de cabecera y cuerpo de paneles -->
          <div class="md-scaffold-content">
            <!-- Slot: Header / Cabecera superior sticky -->
            <div class="md-scaffold-header">
              <header class="md-top-app-bar md-top-app-bar-small" data-md-top-app-bar-scroll>
                <div class="md-top-app-bar-leading">
                  <button type="button" class="md-icon-button" aria-label="Menú principal">
                    <span class="md-icon" aria-hidden="true">menu</span>
                  </button>
                </div>
                <div class="md-top-app-bar-content">
                  <span class="md-top-app-bar-title">Escritorio · Two-pane</span>
                </div>
              </header>
            </div>

            <!-- Slot: Body / Convivencia Two-pane -->
            <div class="md-scaffold-body">
              <main class="md-scaffold-pane md-scaffold-pane-flexible">
                <article class="md-card md-card-outlined">
                  <div class="md-card-header">
                    <h4 class="md-type-title-medium">Panel maestro de trabajo</h4>
                    <p class="md-type-body-small">Flujo principal con scroll independiente y retícula fluida.</p>
                  </div>
                  <div class="md-card-content">
                    <p class="md-type-body-medium">Coexiste con el Navigation Rail a la izquierda y el panel de apoyo a la derecha.</p>
                  </div>
                </article>
              </main>
              <aside class="md-scaffold-pane md-scaffold-pane-fixed" aria-label="Panel de apoyo lateral">
                <article class="md-card md-card-outlined">
                  <div class="md-card-header">
                    <h4 class="md-type-title-medium">Panel lateral (360dp)</h4>
                    <p class="md-type-body-small">Ancho constante reservado para apoyo contextual.</p>
                  </div>
                  <div class="md-card-content">
                    <p class="md-type-body-medium">Detalles de comanda o resumen de cuenta en un terminal de escritorio.</p>
                  </div>
                </article>
              </aside>
            </div>
          </div>

          <!-- Slot: FAB / Botón de acción flotante seguro -->
          <div class="md-scaffold-fab">
            <button type="button" class="md-fab" aria-label="Crear nuevo">
              <span class="md-icon" aria-hidden="true">add</span>
            </button>
          </div>
        </div>`
  },
  {
    num: 7,
    title: 'Large y Extra-Large (≥ 1200dp · Three-pane)',
    desc: 'Ensamblaje para pantallas amplias con Navigation Rail y tres paneles simultáneos para flujos de alta densidad como punto de venta.',
    specimenClass: 'sr-specimen sr-specimen-scaffold',
    markup: `        <div class="md-scaffold">
          <!-- Slot: Nav / Riel de navegación lateral coaxial (96dp) -->
          <div class="md-scaffold-nav">
            <nav class="md-navigation-rail" aria-label="Navegación principal">
              <div class="md-navigation-rail-header">
                <button type="button" class="md-icon-button" aria-label="Abrir menú de navegación" aria-expanded="false" data-rail-toggle>
                  <span class="md-icon" aria-hidden="true">menu</span>
                </button>
              </div>
              <div class="md-navigation-rail-content">
                <button type="button" class="md-navigation-rail-item" aria-current="page">
                  <span class="md-navigation-rail-indicator">
                    <span class="md-navigation-rail-icon md-icon" aria-hidden="true">point_of_sale</span>
                  </span>
                  <span class="md-navigation-rail-label">Ventas</span><span class="md-navigation-rail-label-horizontal" aria-hidden="true">Ventas</span>
                </button>
                <button type="button" class="md-navigation-rail-item">
                  <span class="md-navigation-rail-indicator">
                    <span class="md-navigation-rail-icon md-icon" aria-hidden="true">kitchen</span>
                  </span>
                  <span class="md-navigation-rail-label">Cocina</span><span class="md-navigation-rail-label-horizontal" aria-hidden="true">Cocina</span>
                </button>
                <button type="button" class="md-navigation-rail-item">
                  <span class="md-navigation-rail-indicator">
                    <span class="md-navigation-rail-icon md-icon" aria-hidden="true">inventory_2</span>
                  </span>
                  <span class="md-navigation-rail-label">Stock</span><span class="md-navigation-rail-label-horizontal" aria-hidden="true">Stock</span>
                </button>
              </div>
            </nav>
          </div>

          <!-- Contenedor vertical de cabecera y cuerpo con 3 paneles -->
          <div class="md-scaffold-content">
            <!-- Slot: Header / Cabecera superior sticky -->
            <div class="md-scaffold-header">
              <header class="md-top-app-bar md-top-app-bar-small" data-md-top-app-bar-scroll>
                <div class="md-top-app-bar-leading">
                  <button type="button" class="md-icon-button" aria-label="Menú principal">
                    <span class="md-icon" aria-hidden="true">menu</span>
                  </button>
                </div>
                <div class="md-top-app-bar-content">
                  <span class="md-top-app-bar-title">Estación POS · Three-pane</span>
                </div>
              </header>
            </div>

            <!-- Slot: Body / Tres paneles simultáneos M3 -->
            <div class="md-scaffold-body">
              <div class="md-scaffold-pane md-scaffold-pane-fixed" aria-label="Lista de selección">
                <article class="md-card md-card-outlined">
                  <div class="md-card-header">
                    <h4 class="md-type-title-medium">Panel 1 · Lista fija (360dp)</h4>
                    <p class="md-type-body-small">Mesas activas o comandas pendientes.</p>
                  </div>
                </article>
              </div>
              <main class="md-scaffold-pane md-scaffold-pane-flexible">
                <article class="md-card md-card-outlined">
                  <div class="md-card-header">
                    <h4 class="md-type-title-medium">Panel 2 · Comanda activa (1fr)</h4>
                    <p class="md-type-body-small">Detalle fluido con adición de platos y notas.</p>
                  </div>
                </article>
              </main>
              <aside class="md-scaffold-pane md-scaffold-pane-fixed md-scaffold-pane-floating" aria-label="Panel de liquidación rápida">
                <article class="md-card">
                  <div class="md-card-header">
                    <h4 class="md-type-title-medium">Panel 3 · Cobro flotante (360dp)</h4>
                    <p class="md-type-body-small">Teclado numérico y medios de pago.</p>
                  </div>
                </article>
              </aside>
            </div>
          </div>

          <!-- Slot: FAB / Botón de acción flotante seguro -->
          <div class="md-scaffold-fab">
            <button type="button" class="md-fab" aria-label="Nueva orden">
              <span class="md-icon" aria-hidden="true">add</span>
            </button>
          </div>
        </div>`
  }
];

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildSection(p) {
  const codeEscaped = escapeHtml(p.markup);
  return `    <!-- PAREJA: ${p.title} -->
    <section class="sr-section">
      <h3 class="md-type-title-large">${p.title}</h3>
      <p class="md-type-body-medium">${p.desc}</p>

      <div class="${p.specimenClass}">
${p.markup}
      </div>

      <pre class="sr-code"><code>${codeEscaped}</code></pre>
    </section>`;
}

const headerHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Scaffold de RDM Next: estructura base de pantalla que organiza y ensambla las regiones de navegación, cabeceras y contenido.">
  <title>Scaffold — RDM ManGo! App</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex&display=swap">
  <link rel="stylesheet" href="../../src/css/main.css?v=93">
  <link rel="stylesheet" href="../assets/showroom.css">
  <script type="module" src="../../src/js/main.js"></script>
  <script src="../assets/showroom.js"></script>
</head>

<!--
  VISTA DE SCAFFOLD (App Shell Canónico M3)
  Estructura de Bloque 1 Técnico y Puro.
  Gobierna la ecuación canónica completa: Scaffold = Bars + Rails + Panes.
-->

<body class="md-bg-background md-text-on-background md-type-body-medium">
  <!-- CABECERA INSTITUCIONAL DEL SHOWROOM (DOGFOODING) -->
  <header class="md-top-app-bar md-top-app-bar-small" data-md-top-app-bar-scroll role="banner" aria-label="Cabecera institucional del showroom">
    <div class="md-top-app-bar-leading">
      <a href="../index.html" class="md-icon-button" aria-label="Volver al catálogo">
        <span class="md-icon" aria-hidden="true">arrow_back</span>
      </a>
    </div>
    <div class="md-top-app-bar-content">
      <span class="md-top-app-bar-title">Scaffold</span>
      <span class="md-top-app-bar-subtitle">RDM Next · ManGo! App</span>
    </div>
    <div class="md-top-app-bar-trailing">
      <button type="button" class="md-icon-button" data-theme-toggle aria-label="Tema del sistema activo">
        <span class="md-icon" aria-hidden="true">brightness_auto</span>
      </button>
    </div>
  </header>

  <main class="sr-page">

    <!-- PORTADA DEL COMPONENTE -->
    <header class="sr-header">
      <h1 class="md-type-display-large">Scaffold</h1>
      <p class="md-type-body-large">Estructura base de pantalla que organiza y ensambla las regiones de navegación, cabeceras y contenido.</p>
      <p class="md-type-body-medium md-text-on-surface-variant">M3 Expressive · App Shell & Panes · Bloque 1 (Pares 1 a 7 · Completo)</p>
    </header>

    <hr class="md-divider">

    <!-- BLOQUE 1: ESPECIFICACIÓN TÉCNICA Y ANATOMÍA -->
    <h2 class="md-type-headline-medium">Bloque 1 · Especificación técnica y anatomía</h2>
`;

const footerHtml = `
  </main>
</body>
</html>
`;

const sectionsHtml = pairs.map(buildSection).join('\n\n');
const fullHtml = headerHtml + '\n' + sectionsHtml + footerHtml;

const templatePath = path.resolve('showroom/templates/scaffold.template.html');
const componentPath = path.resolve('showroom/components/scaffold.html');

fs.writeFileSync(templatePath, fullHtml, 'utf8');
fs.writeFileSync(componentPath, fullHtml, 'utf8');

console.log('Generados con éxito:');
console.log(' - ' + templatePath);
console.log(' - ' + componentPath);
