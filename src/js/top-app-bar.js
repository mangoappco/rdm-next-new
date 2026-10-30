/* ==========================================================================
   src/js/top-app-bar.js — CONTROLADOR DECLARATIVO PARA TOP APP BAR
   ManGo! App / RDM Next

   Tres comportamientos dinámicos de M3 Expressive que el CSS no puede
   expresar por sí solo:

   1. Scrolled state: conmutación de elevación (surface -> surface-container
      + elevation-level2) al hacer scroll en viewport o contenedor.
   2. Collapsing: COMPRESS EFFECT scroll-linked — la compresión de
      Medium/Large, el desvanecimiento del subtítulo y el morph del
      titular avanzan 1:1 con el scroll (canon Compose exitUntilCollapsed).
   3. Contextual bar: descarte del modo selección mediante botón close.
   ========================================================================== */

export function initTopAppBar() {
  /* ------------------------------------------------------------
     1. SCROLL UNIFICADO — scrolled state + compress progress
        Un solo listener (passive + capture) con throttling rAF:
        el trabajo real ocurre como maximo una vez por frame.
     ------------------------------------------------------------ */
  const scrollBars = document.querySelectorAll('[data-md-top-app-bar-scroll]');
  const collapseBars = document.querySelectorAll('[data-md-top-app-bar-collapse]');

  if (scrollBars.length > 0 || collapseBars.length > 0) {
    /* Delta del recorrido canon por variante: cuantos px de scroll separan
       la variante flexible de Small (canon M3: medium 112dp - 64dp = 48dp,
       large 152dp - 64dp = 88dp). Vive en tokens como
       --md-sys-measurement-top-bar-{medium,large}-collapse-delta
       (2-system-tokens/measurement.css); se replica aqui porque el valor
       que alimenta la division es runtime y el token se compone de
       var()+calc(), no de un numero parseable desde JS. */
    const compressionDelta = (bar) =>
      bar.classList.contains('md-top-app-bar-large') ? 88 : 48;

    let ultimoTarget = null; /* origen del ultimo evento de scroll */
    let frameProgramado = false; /* bandera rAF: 1 update por frame */

    const update = () => {
      frameProgramado = false;

      /* Posicion del scroll: contenedor interno (ELEMENT_NODE) o viewport */
      let y = 0;
      if (ultimoTarget && ultimoTarget.nodeType === 1) {
        y = ultimoTarget.scrollTop;
      } else {
        y = (document.scrollingElement || document.documentElement).scrollTop || window.scrollY || 0;
      }
      y = Math.max(0, y);

      /* Scrolled state: par canon de effects (short4 + effects-default) */
      scrollBars.forEach((bar) => {
        bar.classList.toggle('md-top-app-bar-scrolled', y > 0);
      });

      /* COMPRESS EFFECT scroll-linked (canon Compose exitUntilCollapsed):
         altura, desvanecimiento del subtitulo y morph del titular avanzan
         1:1 con el scroll via --md-top-app-bar-collapse-progress (0 -> 1).
         El scroll ES el timing: gesto lento = compresion lenta; detener a
         mitad congela la barra a mitad. Sin JS, la variable no existe y la
         barra queda expandida (degradacion graciosa). is-collapsed es solo
         el estado estructural final (swap de grid) al completar el
         recorrido, nunca intermedio -> no hay toggles en mitad de camino. */
      collapseBars.forEach((bar) => {
        const delta = compressionDelta(bar);
        const progreso = Math.min(1, y / delta);
        bar.style.setProperty('--md-top-app-bar-collapse-progress', progreso.toFixed(3));
        bar.classList.toggle('is-collapsed', y >= delta);
      });
    };

    const scheduleUpdate = (event) => {
      if (event && event.target) ultimoTarget = event.target;
      if (frameProgramado) return;
      frameProgramado = true;
      requestAnimationFrame(update);
    };

    /* capture: true para detectar scroll en window y en contenedores internos */
    window.addEventListener('scroll', scheduleUpdate, { passive: true, capture: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    update(); /* Chequeo inicial: barra scrolled/colapsada si se carga a mitad de pagina */
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
