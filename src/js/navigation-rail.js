/* ==========================================================================
   src/js/navigation-rail.js — SERVICIO DE NAVIGATION RAIL M3 (Navegación WAI-ARIA)
   ==========================================================================

   ALCANCE DEL SCRIPT (Zero JS en Motion):
   1. Conmutación dinámica de selección (aria-selected="true" / "false") y
      roving tabindex ("0" / "-1") entre los destinos del rail.
   2. Despacho del evento canónico desacoplado 'md-navigation-rail:change'
      hacia el contenedor padre .md-navigation-rail ({ destination, index }).
   3. Navegación por teclado vertical WAI-ARIA (ArrowUp, ArrowDown, Home,
      End, con ArrowLeft/ArrowRight como alias en modo expandido).
   4. Alternancia accesible de paneles asociados vía 'aria-controls' / role="tabpanel".
   5. Toggle de expansión: SOLO conmuta la clase lógica .md-navigation-rail-expanded
      y su aria-expanded. Toda la cinemática es soberanía de CSS (tokens Capa 2).
   ========================================================================== */

export function initNavigationRail() {
  // 1. Delegación de clics para conmutar expansión del rail (Collapsed <-> Expanded)
  //    IMPORTANTE: solo [data-rail-toggle] activa la expansión. El header es el
  //    slot canónico para FABs y logos: un clic en cualquiera de ellos NUNCA
  //    debe colapsar el carril (era el defecto del selector '.header button').
  //
  //    ZERO JS MOTION: la clase raíz se conmuta en frame 0; el CSS declara
  //    toda la coreografía asimétrica (long2/decelerate expandir,
  //    long1/emphasized-accelerate colapsar) consumiendo tokens Capa 2.
  document.addEventListener('click', (event) => {
    const toggleBtn = event.target.closest('[data-rail-toggle]');
    if (!toggleBtn) return;
    const rail = toggleBtn.closest('.md-navigation-rail');
    if (!rail) return;

    const isExpanded = rail.classList.contains('md-navigation-rail-expanded');
    const willExpand = !isExpanded;

    // SEMANTICA INMEDIATA
    toggleBtn.setAttribute('aria-expanded', willExpand ? 'true' : 'false');

    // Conmutar icono semántico si existe
    const icon = toggleBtn.querySelector('.md-icon');
    if (icon) {
      icon.textContent = willExpand ? 'menu_open' : 'menu';
    }

    // Actualizar accesibilidad de etiqueta
    toggleBtn.setAttribute('aria-label', willExpand ? 'Contraer menú de navegación' : 'Abrir menú de navegación');

    // Despachar evento canónico de conmutación
    rail.dispatchEvent(new CustomEvent('md-navigation-rail:toggle', {
      bubbles: true,
      detail: { expanded: willExpand }
    }));

    // CONMUTACIÓN PURA EN FRAME 0 — CSS gobierna la física
    rail.classList.toggle('md-navigation-rail-expanded', willExpand);
  });

  // 2. Delegación de clics para conmutar destinos dentro de cualquier .md-navigation-rail
  document.addEventListener('click', (event) => {
    const item = event.target.closest('.md-navigation-rail-item');
    if (!item) return;
    const rail = item.closest('.md-navigation-rail');
    if (!rail || item.disabled || item.getAttribute('aria-disabled') === 'true') return;

    // Si ya está activo, no duplicar trabajo
    if (item.getAttribute('aria-selected') === 'true') return;

    const items = Array.from(rail.querySelectorAll('.md-navigation-rail-item:not([disabled]):not([aria-disabled="true"])'));

    // Actualizar estados aria-selected y roving tabindex
    items.forEach(t => {
      const isCurrent = (t === item);
      t.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
      t.setAttribute('tabindex', isCurrent ? '0' : '-1');
    });

    // Alternar paneles asociados si existen (aria-controls).
    // Se oculta primero TODO panel controlado por items del rail y se
    // exhibe el del destino elegido. El id se captura ANTES de usarlo:
    // el selector anterior interpolaba item.id sin comprobarlo y con el
    // atributo vacio generaba '[aria-labelledby=""]', un query invalido.
    const panelIds = items
      .map((t) => t.getAttribute('aria-controls'))
      .filter((id) => id !== null && id !== '');
    panelIds.forEach((id) => {
      const panel = document.getElementById(id);
      if (panel) panel.hidden = true;
    });
    const activePanelId = item.getAttribute('aria-controls');
    if (activePanelId) {
      const activePanel = document.getElementById(activePanelId);
      if (activePanel) activePanel.hidden = false;
    }

    // Disparar evento canónico desacoplado
    rail.dispatchEvent(new CustomEvent('md-navigation-rail:change', {
      bubbles: true,
      detail: {
        destination: item,
        index: items.indexOf(item)
      }
    }));
  });

  // 3. Navegación por teclado WAI-ARIA.
  //    El eje principal es VERTICAL en ambos modos: los destinos siguen
  //    apilados en una columna aunque cada item sea una fila horizontal
  //    (modo expandido), y el flujo de lectura es de arriba hacia abajo.
  //    ArrowLeft/ArrowRight son un alias del mismo orden en el modo
  //    expandido (fila horizontal), NUNCA su sustito.
  document.addEventListener('keydown', (event) => {
    const item = event.target.closest('.md-navigation-rail-item');
    if (!item) return;
    const rail = item.closest('.md-navigation-rail');
    if (!rail) return;

    const navKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!navKeys.includes(event.key)) return;

    const enabledItems = Array.from(rail.querySelectorAll('.md-navigation-rail-item:not(:disabled):not([aria-disabled="true"])'));
    if (enabledItems.length < 2) return;

    event.preventDefault();
    const currentIndex = enabledItems.indexOf(item);
    let nextIndex = currentIndex;

    if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = enabledItems.length - 1;
    else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % enabledItems.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + enabledItems.length) % enabledItems.length;

    const targetItem = enabledItems[nextIndex];
    if (targetItem) {
      targetItem.focus();
      targetItem.click();
    }
  });
}
