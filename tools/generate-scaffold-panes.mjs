import fs from 'node:fs';
import path from 'node:path';

const pairs = [
  {
    num: 1,
    title: 'Clase base (slots obligatorios)',
    desc: 'Mínimo viable del App Shell M3: contenedor raíz más panel de contenido autónomo con desplazamiento independiente.',
    specimenClass: 'sr-specimen sr-specimen-scaffold',
    markup: `        <div class="md-scaffold">
          <!-- Slot: Body / Panel de contenido principal (obligatorio) -->
          <div class="md-scaffold-body">
            <main class="md-scaffold-pane md-scaffold-pane-flexible">
              <article class="md-card md-card-outlined">
                <div class="md-card-header">
                  <h4 class="md-type-title-medium">Panel de contenido principal</h4>
                  <p class="md-type-body-small">Ranura central con desplazamiento vertical independiente.</p>
                </div>
                <div class="md-card-content">
                  <p class="md-type-body-medium">Mínimo viable del chasis de pantalla, preparado para recibir el contenido de la aplicación sin barras perimetrales.</p>
                </div>
              </article>
              <article class="md-card md-card-outlined">
                <div class="md-card-header">
                  <h4 class="md-type-title-medium">Flujo secundario de prueba</h4>
                  <p class="md-type-body-small">Comprueba la contención overscroll y el scroll autónomo.</p>
                </div>
                <div class="md-card-content">
                  <p class="md-type-body-medium">El desplazamiento vertical reside íntegramente dentro del panel, aislando el resto de la ventana.</p>
                </div>
              </article>
              <article class="md-card md-card-outlined">
                <div class="md-card-header">
                  <h4 class="md-type-title-medium">Bloque adicional</h4>
                  <p class="md-type-body-small">Extensión de contenido para verificar el desplazamiento.</p>
                </div>
                <div class="md-card-content">
                  <p class="md-type-body-medium">Demostración de flujo continuo sin deformar el contenedor raíz.</p>
                </div>
              </article>
            </main>
          </div>
        </div>`
  },
  {
    num: 2,
    title: 'Bar superior (Top App Bar)',
    desc: 'Ranura superior sticky (.md-scaffold-header) para anclar la barra de aplicación sobre el panel de contenido.',
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
                <span class="md-top-app-bar-title">App Shell · Cabecera sticky</span>
              </div>
              <div class="md-top-app-bar-trailing">
                <button type="button" class="md-icon-button" aria-label="Buscar">
                  <span class="md-icon" aria-hidden="true">search</span>
                </button>
              </div>
            </header>
          </div>

          <!-- Slot: Body / Panel de contenido principal -->
          <div class="md-scaffold-body">
            <main class="md-scaffold-pane md-scaffold-pane-flexible">
              <article class="md-card md-card-outlined">
                <div class="md-card-header">
                  <h4 class="md-type-title-medium">Área bajo cabecera</h4>
                  <p class="md-type-body-small">El contenido se desplaza por debajo de la barra sticky.</p>
                </div>
                <div class="md-card-content">
                  <p class="md-type-body-medium">La cabecera superior proyecta elevación y persiste fija mientras el panel se desplaza libremente.</p>
                </div>
              </article>
              <article class="md-card md-card-outlined">
                <div class="md-card-header">
                  <h4 class="md-type-title-medium">Contenido continuo</h4>
                  <p class="md-type-body-small">Segundo bloque del panel principal.</p>
                </div>
                <div class="md-card-content">
                  <p class="md-type-body-medium">Demuestra la separación nítida entre la cabecera fija y el flujo scrolleable del pane.</p>
                </div>
              </article>
              <article class="md-card md-card-outlined">
                <div class="md-card-header">
                  <h4 class="md-type-title-medium">Tercer bloque</h4>
                  <p class="md-type-body-small">Extensión vertical.</p>
                </div>
                <div class="md-card-content">
                  <p class="md-type-body-medium">Verificación del scroll continuo bajo la barra superior.</p>
                </div>
              </article>
            </main>
          </div>
        </div>`
  },
  {
    num: 3,
    title: 'Bar inferior y FAB (Navigation Bar 80dp)',
    desc: 'Barra de navegación móvil (.md-scaffold-nav) con elevación contextual automática del FAB a 96dp.',
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
                <span class="md-top-app-bar-title">Móvil · Barra inferior</span>
              </div>
            </header>
          </div>

          <!-- Slot: Body / Panel de contenido principal -->
          <div class="md-scaffold-body">
            <main class="md-scaffold-pane md-scaffold-pane-flexible">
              <article class="md-card md-card-outlined">
                <div class="md-card-header">
                  <h4 class="md-type-title-medium">Vista móvil compacta</h4>
                  <p class="md-type-body-small">Compensación automática de padding inferior.</p>
                </div>
                <div class="md-card-content">
                  <p class="md-type-body-medium">El panel compensa los 80dp de la barra inferior para evitar que el contenido quede oculto.</p>
                </div>
              </article>
              <article class="md-card md-card-outlined">
                <div class="md-card-header">
                  <h4 class="md-type-title-medium">Contenido secundario</h4>
                  <p class="md-type-body-small">Flujo scrolleable con margen de seguridad.</p>
                </div>
                <div class="md-card-content">
                  <p class="md-type-body-medium">El FAB flota a 96dp sin pisar los destinos táctiles de la barra de navegación.</p>
                </div>
              </article>
            </main>
          </div>

          <!-- Slot: FAB / Botón de acción flotante elevado sobre la barra inferior -->
          <div class="md-scaffold-fab">
            <button type="button" class="md-fab" aria-label="Acción rápida">
              <span class="md-icon" aria-hidden="true">add</span>
            </button>
          </div>

          <!-- Slot: Nav inferior / Barra de navegación móvil (80dp) -->
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
    num: 4,
    title: 'Rail lateral (Navigation Rail 96dp)',
    desc: 'Carril de navegación lateral coaxial a 96dp con contenedor vertical (.md-scaffold-content) para cabecera y paneles.',
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
                  <span class="md-top-app-bar-title">Escritorio · Rail lateral</span>
                </div>
              </header>
            </div>

            <!-- Slot: Body / Panel de contenido principal -->
            <div class="md-scaffold-body">
              <main class="md-scaffold-pane md-scaffold-pane-flexible">
                <article class="md-card md-card-outlined">
                  <div class="md-card-header">
                    <h4 class="md-type-title-medium">Panel junto al rail</h4>
                    <p class="md-type-body-small">Coexistencia coaxial con el carril de navegación.</p>
                  </div>
                  <div class="md-card-content">
                    <p class="md-type-body-medium">El chasis conmuta automáticamente a disposición horizontal manteniendo la cabecera confinada al área de contenido.</p>
                  </div>
                </article>
                <article class="md-card md-card-outlined">
                  <div class="md-card-header">
                    <h4 class="md-type-title-medium">Segundo bloque de contenido</h4>
                    <p class="md-type-body-small">Desplazamiento vertical autónomo.</p>
                  </div>
                  <div class="md-card-content">
                    <p class="md-type-body-medium">El riel lateral permanece estático de borde a borde mientras el panel interior se desplaza.</p>
                  </div>
                </article>
              </main>
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
    num: 5,
    title: 'Panes: Fixed y Flexible (Two-pane)',
    desc: 'Convivencia de dos paneles lado a lado con scroll independiente: panel fijo de 360dp y panel flexible de 1fr.',
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

          <!-- Slot: Body / Dos paneles lado a lado -->
          <div class="md-scaffold-body">
            <main class="md-scaffold-pane md-scaffold-pane-flexible">
              <article class="md-card md-card-outlined">
                <div class="md-card-header">
                  <h4 class="md-type-title-medium">Panel flexible (1fr)</h4>
                  <p class="md-type-body-small">Absorbe el espacio disponible con desplazamiento independiente.</p>
                </div>
                <div class="md-card-content">
                  <p class="md-type-body-medium">Aloja el área de trabajo activa, tablas de datos o listas de flujo continuo.</p>
                </div>
              </article>
              <article class="md-card md-card-outlined">
                <div class="md-card-header">
                  <h4 class="md-type-title-medium">Segundo registro de trabajo</h4>
                  <p class="md-type-body-small">Demostración de flujo vertical continuo.</p>
                </div>
                <div class="md-card-content">
                  <p class="md-type-body-medium">El desplazamiento interno opera con contención overscroll en cada panel.</p>
                </div>
              </article>
            </main>
            <aside class="md-scaffold-pane md-scaffold-pane-fixed" aria-label="Panel de apoyo fijo">
              <article class="md-card md-card-outlined">
                <div class="md-card-header">
                  <h4 class="md-type-title-medium">Panel fijo (360dp)</h4>
                  <p class="md-type-body-small">Ancho inmutable para apoyo contextual.</p>
                </div>
                <div class="md-card-content">
                  <p class="md-type-body-medium">Detalles del registro seleccionado, filtros avanzados o resumen de cuenta.</p>
                </div>
              </article>
              <article class="md-card md-card-outlined">
                <div class="md-card-header">
                  <h4 class="md-type-title-medium">Información complementaria</h4>
                  <p class="md-type-body-small">Desplazamiento independiente en el panel lateral.</p>
                </div>
                <div class="md-card-content">
                  <p class="md-type-body-medium">Permite consultar datos adicionales sin perder la posición en la vista principal.</p>
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
    num: 6,
    title: 'Panes: Floating y Semi-permanent',
    desc: 'Panel contextual elevado sobre superficie alta y panel lateral acoplado colapsable mediante control aria-expanded.',
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
                <span class="md-top-app-bar-title">Panes · Flotante y colapsable</span>
              </div>
              <div class="md-top-app-bar-trailing">
                <button type="button" class="md-icon-button" aria-expanded="true" aria-controls="pane-lateral-acoplado" aria-label="Alternar panel lateral">
                  <span class="md-icon" aria-hidden="true">view_sidebar</span>
                </button>
              </div>
            </header>
          </div>

          <!-- Slot: Body / Panel base, panel flotante y panel colapsable -->
          <div class="md-scaffold-body">
            <main class="md-scaffold-pane md-scaffold-pane-flexible">
              <article class="md-card md-card-outlined">
                <div class="md-card-header">
                  <h4 class="md-type-title-medium">Panel de trabajo base</h4>
                  <p class="md-type-body-small">Área fluida de contenido continuo.</p>
                </div>
                <div class="md-card-content">
                  <p class="md-type-body-medium">Mantiene el foco de operación principal mientras los paneles secundarios ofrecen soporte.</p>
                </div>
              </article>
            </main>
            <aside class="md-scaffold-pane md-scaffold-pane-fixed md-scaffold-pane-floating" aria-label="Panel flotante de inspección">
              <article class="md-card">
                <div class="md-card-header">
                  <h4 class="md-type-title-medium">Panel flotante (360dp)</h4>
                  <p class="md-type-body-small">Superficie alta con sombra M3 nivel 2.</p>
                </div>
                <div class="md-card-content">
                  <p class="md-type-body-medium">Inspección contextual superpuesta sin deformar la retícula base.</p>
                </div>
              </article>
            </aside>
            <aside id="pane-lateral-acoplado" class="md-scaffold-pane md-scaffold-pane-fixed md-scaffold-pane-semi-permanent" aria-label="Panel lateral colapsable">
              <article class="md-card md-card-outlined">
                <div class="md-card-header">
                  <h4 class="md-type-title-medium">Panel colapsable (360dp)</h4>
                  <p class="md-type-body-small">Visibilidad alternable por botón o estado.</p>
                </div>
                <div class="md-card-content">
                  <p class="md-type-body-medium">Se oculta suavemente al pulsar el botón de alternancia en la cabecera.</p>
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
    num: 7,
    title: 'Ensamblaje Expanded (Two-pane)',
    desc: 'Integración canónica para escritorio (≥ 840dp): Navigation Rail a 96dp, cabecera sticky y dos paneles simultáneos.',
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

            <!-- Slot: Body / Dos paneles simultáneos -->
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
                <article class="md-card md-card-outlined">
                  <div class="md-card-header">
                    <h4 class="md-type-title-medium">Registro activo</h4>
                    <p class="md-type-body-small">Detalle de comanda o pedido en curso.</p>
                  </div>
                  <div class="md-card-content">
                    <p class="md-type-body-medium">Espacio amplio para edición y revisión de partidas.</p>
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
                <article class="md-card md-card-outlined">
                  <div class="md-card-header">
                    <h4 class="md-type-title-medium">Acciones rápidas</h4>
                    <p class="md-type-body-small">Atajos de liquidación y cierre.</p>
                  </div>
                  <div class="md-card-content">
                    <p class="md-type-body-medium">Botones y opciones secundarias de acceso directo.</p>
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
    num: 8,
    title: 'Ensamblaje Large / Extra-Large (Three-pane)',
    desc: 'Integración amplia para estaciones POS (≥ 1200dp): Navigation Rail a 96dp y tres paneles simultáneos de trabajo.',
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
              <div class="md-scaffold-pane md-scaffold-pane-fixed" aria-label="Lista de mesas">
                <article class="md-card md-card-outlined">
                  <div class="md-card-header">
                    <h4 class="md-type-title-medium">Panel 1 · Lista fija (360dp)</h4>
                    <p class="md-type-body-small">Mesas activas o comandas pendientes.</p>
                  </div>
                  <div class="md-card-content">
                    <p class="md-type-body-medium">Lista de selección inmutable con desplazamiento vertical propio.</p>
                  </div>
                </article>
              </div>
              <main class="md-scaffold-pane md-scaffold-pane-flexible">
                <article class="md-card md-card-outlined">
                  <div class="md-card-header">
                    <h4 class="md-type-title-medium">Panel 2 · Comanda activa (1fr)</h4>
                    <p class="md-type-body-small">Detalle fluido con adición de platos y notas.</p>
                  </div>
                  <div class="md-card-content">
                    <p class="md-type-body-medium">Área principal flexible que absorbe el centro de la estación de trabajo.</p>
                  </div>
                </article>
              </main>
              <aside class="md-scaffold-pane md-scaffold-pane-fixed md-scaffold-pane-floating" aria-label="Panel de liquidación rápida">
                <article class="md-card">
                  <div class="md-card-header">
                    <h4 class="md-type-title-medium">Panel 3 · Cobro flotante (360dp)</h4>
                    <p class="md-type-body-small">Teclado numérico y medios de pago.</p>
                  </div>
                  <div class="md-card-content">
                    <p class="md-type-body-medium">Panel contextual elevado para liquidación ágil sin invadir la comanda.</p>
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
      <p class="md-type-body-medium md-text-on-surface-variant">M3 Expressive · App Shell & Panes · Bloque 1 (Pares 1 a 8 · Completo)</p>
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
console.log('Total de pares generados: ' + pairs.length);
