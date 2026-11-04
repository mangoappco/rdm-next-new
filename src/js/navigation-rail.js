/* ==========================================================================
   src/js/navigation-rail.js — SERVICIO DE NAVIGATION RAIL M3 (Navegación WAI-ARIA)
   ==========================================================================

   ALCANCE DEL SCRIPT:
   1. Conmutación dinámica de selección (aria-selected="true" / "false") y
      roving tabindex ("0" / "-1") entre los destinos del rail.
   2. Despacho del evento canónico desacoplado 'md-navigation-rail:change'
      hacia el contenedor padre .md-navigation-rail ({ destination, index }).
   3. Navegación por teclado vertical WAI-ARIA (ArrowUp, ArrowDown, Home, End).
   4. Alternancia accesible de paneles asociados vía 'aria-controls' / role="tabpanel".
   ========================================================================== */

export function initNavigationRail() {
  // 1. Delegación de clics para conmutar destinos dentro de cualquier .md-navigation-rail
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

    // Alternar paneles asociados si existen (aria-controls)
    const panelId = item.getAttribute('aria-controls');
    if (panelId) {
      const targetPanel = document.getElementById(panelId);
      if (targetPanel) {
        document.querySelectorAll(`[role="tabpanel"][aria-labelledby="${item.id || ''}"]`).forEach(p => {
          p.hidden = true;
        });
        targetPanel.hidden = false;
      }
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

  // 2. Delegación de teclado accesible WAI-ARIA vertical (ArrowUp, ArrowDown, Home, End)
  document.addEventListener('keydown', (event) => {
    const item = event.target.closest('.md-navigation-rail-item');
    if (!item) return;
    const rail = item.closest('.md-navigation-rail');
    if (!rail) return;

    const navKeys = ['ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (!navKeys.includes(event.key)) return;

    const enabledItems = Array.from(rail.querySelectorAll('.md-navigation-rail-item:not(:disabled):not([aria-disabled="true"])'));
    if (enabledItems.length < 2) return;

    event.preventDefault();
    const currentIndex = enabledItems.indexOf(item);
    let nextIndex = currentIndex;

    if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = enabledItems.length - 1;
    else if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % enabledItems.length;
    else if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + enabledItems.length) % enabledItems.length;

    const targetItem = enabledItems[nextIndex];
    if (targetItem) {
      targetItem.focus();
      targetItem.click();
    }
  });
}
