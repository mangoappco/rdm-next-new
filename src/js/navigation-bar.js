/* ==========================================================================
   src/js/navigation-bar.js — SERVICIO DE NAVIGATION BAR M3 (Navegación WAI-ARIA)
   ==========================================================================

   ALCANCE DEL SCRIPT (analogo a tabs.js, sobre la faja inferior):
   1. Conmutación dinámica de selección (aria-selected="true" / "false") y
      roving tabindex ("0" / "-1") entre los destinos de la barra.
   2. Despacho del evento canónico desacoplado 'md-navigation-bar:change'
      hacia el contenedor padre .md-navigation-bar ({ destination, index }).
   3. Navegación por teclado (ArrowLeft, ArrowRight, Home, End): la faja no
      se desplaza, así que no hay scrollIntoView y el foco simplemente
      viaja al destino siguiente.
   4. Alternancia accesible de paneles asociados vía 'aria-controls' /
      role="tabpanel", la misma opt-in de tabs.js: si el destino no declara
      panel, la selección no cambia nada a la derecha de la barra.
   - La onda está resuelta por ripple.js: '.md-navigation-bar-item' es
     ciudadano del SELECTOR del motor, así que el marcado del componente
     no necesita atributos adicionales.
   ========================================================================== */

export function initNavigationBar() {
  // 1. Delegación de clics para conmutar destinos dentro de cualquier
  //    .md-navigation-bar
  document.addEventListener('click', (event) => {
    const item = event.target.closest('.md-navigation-bar-item');
    if (!item) return;
    const bar = item.closest('.md-navigation-bar');
    if (!bar || item.disabled || item.getAttribute('aria-disabled') === 'true') return;

    // Si ya está activo, no duplicar trabajo
    if (item.getAttribute('aria-selected') === 'true' || item.getAttribute('aria-current') === 'page') return;

    const items = Array.from(bar.querySelectorAll('.md-navigation-bar-item:not([disabled]):not([aria-disabled="true"])'));

    // Actualizar estados: aria-current="page" para landmarks de navegación y aria-selected para tablist
    const usesCurrent = items.some(t => t.hasAttribute('aria-current')) || bar.getAttribute('role') !== 'tablist';
    items.forEach(t => {
      const isCurrent = (t === item);
      if (usesCurrent) {
        if (isCurrent) {
          t.setAttribute('aria-current', 'page');
        } else {
          t.removeAttribute('aria-current');
        }
      }
      if (t.hasAttribute('aria-selected') || bar.getAttribute('role') === 'tablist') {
        t.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
        t.setAttribute('tabindex', isCurrent ? '0' : '-1');
      }
    });

    // Alternar paneles asociados si existen (aria-controls),
    // el mismo gancho opt-in de tabs.js
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
    bar.dispatchEvent(new CustomEvent('md-navigation-bar:change', {
      bubbles: true,
      detail: {
        destination: item,
        index: items.indexOf(item)
      }
    }));
  });

  // 2. Delegación de teclado accesible WAI-ARIA (ArrowLeft, ArrowRight, Home, End)
  document.addEventListener('keydown', (event) => {
    const item = event.target.closest('.md-navigation-bar-item');
    if (!item) return;
    const bar = item.closest('.md-navigation-bar');
    if (!bar) return;

    const navKeys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!navKeys.includes(event.key)) return;

    const enabledItems = Array.from(bar.querySelectorAll('.md-navigation-bar-item:not(:disabled):not([aria-disabled="true"])'));
    if (enabledItems.length < 2) return;

    event.preventDefault();
    const currentIndex = enabledItems.indexOf(item);
    let nextIndex = currentIndex;

    if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = enabledItems.length - 1;
    else if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % enabledItems.length;
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + enabledItems.length) % enabledItems.length;

    const targetItem = enabledItems[nextIndex];
    if (targetItem) {
      targetItem.focus();
      targetItem.click();
    }
  });

  // 3. Autodetección de Scaffold: inyectar clase de holgura al <main> si hay Navigation Bar fija
  const fixedNav = document.querySelector('.md-navigation-bar-fixed, body > .md-navigation-bar, body > .md-navigation-bar-docked');
  if (fixedNav) {
    const main = document.querySelector('main, .md-main-content');
    if (main) {
      if (fixedNav.classList.contains('md-navigation-bar-horizontal')) {
        if (!main.classList.contains('md-has-navigation-bar-horizontal')) {
          main.classList.add('md-has-navigation-bar-horizontal');
        }
      } else {
        if (!main.classList.contains('md-has-navigation-bar')) {
          main.classList.add('md-has-navigation-bar');
        }
      }
    }
  }
}
