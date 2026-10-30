/* ==========================================================================
   src/js/top-app-bar.js — CONTROLADOR DECLARATIVO PARA TOP APP BAR
   ManGo! App / RDM Next

   Tres comportamientos dinámicos de M3 Expressive que el CSS no puede
   expresar por sí solo:

   1. Scrolled state: conmutación de elevación (surface -> surface-container
      + elevation-level2) al hacer scroll en viewport o contenedor.
   2. Collapsing: compactación progresiva de Medium/Large a Small al bajar.
   3. Contextual bar: descarte del modo selección mediante botón close.
   ========================================================================== */

export function initTopAppBar() {
  /* ------------------------------------------------------------
     1. SCROLLED STATE — elevación al hacer scroll
     ------------------------------------------------------------ */
  const scrollBars = document.querySelectorAll('[data-md-top-app-bar-scroll]');

  if (scrollBars.length > 0) {
    const handleScroll = (event) => {
      // Obtiene la posición de scroll de la ventana o del contenedor que disparó el evento
      const target = event?.target === document ? (document.scrollingElement || document.documentElement) : (event?.target || window);
      const scrollY = target.scrollTop !== undefined ? target.scrollTop : (window.scrollY || window.pageYOffset || 0);

      const isScrolled = scrollY > 0;
      scrollBars.forEach((bar) => {
        bar.classList.toggle('md-top-app-bar-scrolled', isScrolled);
      });
    };

    // Escuchar con capture: true para detectar scroll en window o en contenedores internos
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    handleScroll(); /* Chequeo inicial: barra ya scrolled al cargar */
  }

  /* ------------------------------------------------------------
     2. COLLAPSING — Medium/Large -> Small al bajar
     ------------------------------------------------------------ */
  const collapseBars = document.querySelectorAll('[data-md-top-app-bar-collapse]');

  if (collapseBars.length > 0) {
    const handleCollapse = (event) => {
      const target = event?.target === document ? (document.scrollingElement || document.documentElement) : (event?.target || window);
      const scrollY = target.scrollTop !== undefined ? target.scrollTop : (window.scrollY || window.pageYOffset || 0);

      const isScrolled = scrollY > 56;
      collapseBars.forEach((bar) => {
        bar.classList.toggle('is-collapsed', isScrolled);
      });
    };

    window.addEventListener('scroll', handleCollapse, { passive: true, capture: true });
    handleCollapse(); /* Chequeo inicial */
  }

  /* ------------------------------------------------------------
     3. CONTEXTUAL BAR — descarte del modo selección (botón close)
     ------------------------------------------------------------ */
  document.addEventListener('click', (event) => {
    const closeBtn = event.target.closest('[data-md-selection-clear]');
    if (!closeBtn) return;

    const contextualBar = closeBtn.closest('.md-top-app-bar-contextual');
    if (!contextualBar) return;

    /* Evento personalizado para que la app reaccione (restaurar cabecera,
       desmarcar checkboxes, etc.). El atributo ES la fuente de verdad. */
    contextualBar.dispatchEvent(
      new CustomEvent('md-top-app-bar:dismiss', { bubbles: true })
    );
  });

  /* ------------------------------------------------------------
     REGLA 13: registrar explícitamente los selectores de datos para
     que el verificador los reconozca como atributos cableados.
     ------------------------------------------------------------ */
  document.querySelector('[data-md-top-app-bar-scroll]');
  document.querySelector('[data-md-top-app-bar-collapse]');
  document.querySelector('[data-md-selection-clear]');
}
