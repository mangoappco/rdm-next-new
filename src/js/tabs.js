/* ==========================================================================
   src/js/tabs.js — SERVICIO DE TABS M3 (Navegación WAI-ARIA y Teclado)
   ==========================================================================

   ALCANCE DEL SCRIPT:
   - Solo comportamiento accesible WAI-ARIA que el CSS no puede expresar:
     roving tabindex, conmutación de aria-selected y auto-scroll al tab activo.
   - REGLA 13: El desplazamiento horizontal es 100% nativo mediante CSS
     (overflow-inline: auto) e inercia táctil (-webkit-overflow-scrolling: touch).
     En escritorio, el desplazamiento nativo opera mediante Shift + Rueda del ratón.
   ========================================================================== */

export function initTabs() {
  // Delegación de clics para conmutar tabs dentro de cualquier .md-tabs
  document.addEventListener('click', (event) => {
    const tab = event.target.closest('.md-tab');
    if (!tab) return;
    const tabs = tab.closest('.md-tabs');
    if (!tabs || tab.disabled || tab.getAttribute('aria-disabled') === 'true') return;

    // Actualizar estados aria-selected y roving tabindex
    const allTabs = Array.from(tabs.querySelectorAll('.md-tab'));
    allTabs.forEach(t => {
      const isCurrent = (t === tab);
      t.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
      t.setAttribute('tabindex', isCurrent ? '0' : '-1');
    });

    // Desplazar suavemente al tab seleccionado si queda fuera de vista
    tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  });

  // Delegación de teclado accesible WAI-ARIA (ArrowLeft, ArrowRight, Home, End)
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
