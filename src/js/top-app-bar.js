/* ==========================================================================
   src/js/top-app-bar.js — CONTROLADOR DECLARATIVO PARA TOP APP BAR
   ManGo! App / RDM Next

   Tres comportamientos dinámicos de M3 Expressive que el CSS no puede
   expresar por sí solo:

   1. Scrolled state: conmutación de elevación (surface -> surface-container
      + elevation-level2) al hacer scroll en viewport o contenedor.
   2. Collapsing: COMPRESS EFFECT scroll-linked con inercia — la
      compresión de Medium/Large, el desvanecimiento del subtítulo y el
      morph del titular siguen al scroll con fricción
      (canon Compose exitUntilCollapsed).
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
    /* Delta del recorrido canon por variante Y configuracion (canon AndroidX
       TwoRowsTopAppBar, tokens 14_0_0 — hug content por subtitulo):
         Medium sin subtitulo: 112 - 64 = 48dp
         Medium con subtitulo: 136 - 64 = 72dp
         Large sin subtitulo:  120 - 64 = 56dp
         Large con subtitulo:  152 - 64 = 88dp
       Concuerda con los tokens
       --md-sys-measurement-top-bar-{medium,large}-collapse-delta* de
       2-system-tokens/measurement.css; se replica aqui porque el valor que
       alimenta la division es runtime y el token se compone de var()+calc(),
       no de un numero parseable desde JS. */
    const compressionDelta = (bar) => {
      const conSubtitulo = !!bar.querySelector('.md-top-app-bar-subtitle');
      if (bar.classList.contains('md-top-app-bar-large')) {
        return conSubtitulo ? 88 : 56;
      }
      return conSubtitulo ? 72 : 48;
    };

    let ultimoTarget = null; /* origen del ultimo evento de scroll */
    let rafId = 0; /* id del frame programado (0 = nada pendiente) */
    let tPrev = 0; /* timestamp del frame anterior, para dt real */
    /* Progreso efectivo por barra: el objetivo lo fija el scroll, el
       valor pintado lo persigue con inercia (WeakMap barra -> 0..1). */
    const progresoActual = new WeakMap();

    /* Constante de friccion (ms): constante de tiempo de la decaida
       exponencial. 60ms equivale a asentarse al 99.9% en ~415ms — el
       recorrido canon de medium4 (400ms). El scroll ES el destino; el
       gesto rapido deja de ser un teletransporte brutal y la barra
       responde con la curva de desaceleracion Expressive. */
    const FRICCION_MS = 60;

    const update = () => {
      rafId = 0;
      const ahora = performance.now();
      const dt = tPrev ? Math.min(48, ahora - tPrev) : 16.7; /* cap: pestaña dormida no salta */
      tPrev = ahora;

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

      /* COMPRESS EFFECT con inercia (canon Compose exitUntilCollapsed):
         la altura, el desvanecimiento del subtitulo y el morph del titular
         avanzan 1:1 con el scroll — pero via progreso con friccion, no con
         transicion temporal. Gesto lento = sigue al dedo; detener a mitad
         = se asienta y se congela; soltar rapido al top = expansion
         pedalada. La variable vive en la barra (0 -> 1); sin JS la barra
         queda expandida (fallback 0 en el CSS). is-collapsed es solo el
         estado estructural final (swap de grid al completar el recorrido),
         nunca intermedio -> no hay toggles en mitad de camino. */
      let enMovimiento = false;

      collapseBars.forEach((bar) => {
        const delta = compressionDelta(bar);
        const objetivo = Math.min(1, y / delta);
        let actual = progresoActual.get(bar) || 0;

        /* Persecucion friccional: el deficit respecto al objetivo decae
           exponencialmente con el tiempo real (independiente del frame rate). */
        actual += (objetivo - actual) * (1 - Math.exp(-dt / FRICCION_MS));

        /* Snap al objetivo por debajo del umbral perceptible; mientras
           difieran, la barra sigue viva un frame mas (rAF continuo). */
        if (Math.abs(objetivo - actual) < 0.001) {
          actual = objetivo;
        } else {
          enMovimiento = true;
        }

        progresoActual.set(bar, actual);
        bar.style.setProperty('--md-top-app-bar-collapse-progress', actual.toFixed(3));
        bar.classList.toggle('is-collapsed', actual >= 1);
      });

      if (enMovimiento) {
        rafId = requestAnimationFrame(update);
      }
    };

    const scheduleUpdate = (event) => {
      if (event && event.target) ultimoTarget = event.target;
      if (!rafId) {
        tPrev = 0; /* reactivando tras reposo: dt limpio de un frame, no el Hueco acumulado */
        rafId = requestAnimationFrame(update);
      }
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
