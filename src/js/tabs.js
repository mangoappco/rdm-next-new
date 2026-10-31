/* ==========================================================================
   src/js/tabs.js — SERVICIO DE TABS M3 (Navegación WAI-ARIA, Selección y Eventos)
   ==========================================================================

   ALCANCE DEL SCRIPT:
   - Comportamiento interactivo y accesible WAI-ARIA / M3:
     1. Conmutación dinámica de selección (aria-selected="true" / "false") y
        roving tabindex ("0" / "-1").
     2. Despacho del evento canónico desacoplado 'md-tabs:change' hacia el
        contenedor padre .md-tabs ({ tab, index }).
     3. Auto-scroll fluido (scrollIntoView) para mantener visible la pestaña activa.
     4. Alternancia accesible de paneles asociados vía 'aria-controls' / role="tabpanel".
     5. Navegación por teclado (ArrowLeft, ArrowRight, Home, End).
   - REGLA 13: El desplazamiento horizontal es 100% nativo mediante CSS
     (overflow-inline: auto) e inercia táctil (-webkit-overflow-scrolling: touch).
     En ratón tradicional opera mediante Shift + Rueda del ratón.
   ========================================================================== */

export function initTabs() {
  // 1. Delegación de clics para conmutar tabs dentro de cualquier .md-tabs
  document.addEventListener('click', (event) => {
    const tab = event.target.closest('.md-tab');
    if (!tab) return;
    const tabs = tab.closest('.md-tabs');
    if (!tabs || tab.disabled || tab.getAttribute('aria-disabled') === 'true') return;

    // Si ya está activo, no duplicar trabajo
    if (tab.getAttribute('aria-selected') === 'true') return;

    const allTabs = Array.from(tabs.querySelectorAll('.md-tab:not([disabled]):not([aria-disabled="true"])'));

    // Actualizar estados aria-selected y roving tabindex
    allTabs.forEach(t => {
      const isCurrent = (t === tab);
      t.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
      t.setAttribute('tabindex', isCurrent ? '0' : '-1');
    });

    // Desplazar suavemente al tab seleccionado si queda fuera de vista
    tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });

    // Alternar tabpanels asociados si existen (aria-controls)
    const panelId = tab.getAttribute('aria-controls');
    if (panelId) {
      const targetPanel = document.getElementById(panelId);
      if (targetPanel) {
        document.querySelectorAll(`[role="tabpanel"][aria-labelledby="${tab.id || ''}"]`).forEach(p => {
          p.hidden = true;
        });
        targetPanel.hidden = false;
      }
    }

    // Disparar evento canónico desacoplado
    tabs.dispatchEvent(new CustomEvent('md-tabs:change', {
      bubbles: true,
      detail: {
        tab: tab,
        index: allTabs.indexOf(tab)
      }
    }));
  });

  // 2. Delegación de teclado accesible WAI-ARIA (ArrowLeft, ArrowRight, Home, End)
  document.addEventListener('keydown', (event) => {
    const tab = event.target.closest('.md-tab');
    if (!tab) return;
    const tabs = tab.closest('.md-tabs');
    if (!tabs) return;

    const navKeys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!navKeys.includes(event.key)) return;

    const enabledTabs = Array.from(tabs.querySelectorAll('.md-tab:not(:disabled):not([aria-disabled="true"])'));
    if (enabledTabs.length < 2) return;

    event.preventDefault();
    const currentIndex = enabledTabs.indexOf(tab);
    let nextIndex = currentIndex;

    if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = enabledTabs.length - 1;
    else if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % enabledTabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;

    const targetTab = enabledTabs[nextIndex];
    if (targetTab) {
      targetTab.focus();
      targetTab.click();
    }
  });
}
