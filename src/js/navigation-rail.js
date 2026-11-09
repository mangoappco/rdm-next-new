/* ==========================================================================
   src/js/navigation-rail.js — SERVICIO DE NAVIGATION RAIL M3 (Navegación WAI-ARIA)
   ==========================================================================

   ALCANCE DEL SCRIPT:
   1. Conmutación dinámica de selección (aria-selected="true" / "false") y
      roving tabindex ("0" / "-1") entre los destinos del rail.
   2. Despacho del evento canónico desacoplado 'md-navigation-rail:change'
      hacia el contenedor padre .md-navigation-rail ({ destination, index }).
   3. Navegación por teclado vertical WAI-ARIA (ArrowUp, ArrowDown, Home,
      End, con ArrowLeft/ArrowRight como alias en modo expandido).
   4. Alternancia accesible de paneles asociados vía 'aria-controls' / role="tabpanel".
   ========================================================================== */

export function initNavigationRail() {
  // 1. Delegación de clics para conmutar expansión del rail (Collapsed <-> Expanded)
  //    IMPORTANTE: solo [data-rail-toggle] activa la expansión. El header es el
  //    slot canónico para FABs y logos: un clic en cualquiera de ellos NUNCA
  //    debe colapsar el carril (era el defecto del selector '.header button').
  //
  //    COREOGRAFÍA (réplica de startTransitionAnimation() de
  //    NavigationRailView.java): la semántica (estado, glifo, aria-label,
  //    evento) se fija INMEDIATAMENTE al clic; la animación corre en dos
  //    fases secuenciales — Fase A: fade-out de etiquetas y texto del FAB
  //    (150ms, entre el teletransporte semántico y el flip) — Fase B:
  //    conmutación del estado del riel (la caja morfa con las curvas
  //    emphasized del CSS) y retirada de la clase morphing en el frame
  //    siguiente para que el estado destino anime el fade-in.
  const handoff = () => {
    // El valor canónico se LEE del token (Capa 2): duration-short3 = 150ms.
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--md-sys-motion-duration-short3');
    const ms = parseFloat(raw);
    return Number.isFinite(ms) && ms > 0 ? ms : 150; /* fallback: valor del token en el momento de escribir esto */
  };
  const morphTimers = new WeakMap(); // timer pendiente por rail (anti doble clic)

  document.addEventListener('click', (event) => {
    const toggleBtn = event.target.closest('[data-rail-toggle]');
    if (!toggleBtn) return;
    const rail = toggleBtn.closest('.md-navigation-rail');
    if (!rail) return;

    const isCollapsing = rail.classList.contains('md-navigation-rail-collapsing');
    const isExpanded = rail.classList.contains('md-navigation-rail-expanded') && !isCollapsing;
    const willExpand = !isExpanded;

    // SEMANTICA INMEDIATA (no espera a la animación)
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

    // ANIMACION: bypass instantáneo si el usuario pide menos movimiento.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      rail.classList.remove('md-navigation-rail-collapsing', 'md-navigation-rail-morphing');
      rail.classList.toggle('md-navigation-rail-expanded', willExpand);
      return;
    }

    // Cancelar una coreografía a medio volar antes de empezar otra.
    const previous = morphTimers.get(rail);
    if (previous !== undefined) {
      clearTimeout(previous);
      morphTimers.delete(rail);
    }

    if (willExpand) {
      // EXPANSION: conmutar inmediatamente a layout expandido
      rail.classList.remove('md-navigation-rail-collapsing');
      rail.classList.add('md-navigation-rail-expanded');
    } else {
      // COLAPSO COORDINADO M3:
      // Mantener la disposición de fila (.md-navigation-rail-collapsing)
      // mientras el riel se encoge de 280dp a 96dp en 300ms (medium2)
      // y las etiquetas se desvanecen en 150ms (short3).
      rail.classList.add('md-navigation-rail-collapsing');
      const raw = getComputedStyle(document.documentElement).getPropertyValue('--md-sys-motion-duration-medium2');
      const ms = parseFloat(raw) || 300;
      morphTimers.set(rail, setTimeout(() => {
        rail.classList.remove('md-navigation-rail-expanded', 'md-navigation-rail-collapsing');
        morphTimers.delete(rail);
      }, ms));
    }
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
