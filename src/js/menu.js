/* ==========================================================================
   src/js/menu.js — CONTROLADOR DE MENU (M3 Superficie flotante)
   ==========================================================================

   QUE HACE
   --------
   Comportamiento interactivo accesible para menús y submenús en cascada
   de Material Design 3. Conmuta atributos aria-expanded, gestiona el cierre
   en clic exterior (click outside), la tecla Escape y la navegación cíclica
   por teclado (WAI-ARIA Menu & Menu Button).

   PATRON
   ------
   Delegación global en document para click y keydown. Zero dependencias.
   Zero JS en Motion: la cinemática de escala y opacidad la gobierna CSS.
   ========================================================================== */

export function initMenu() {
  /**
   * Cierra todos los menús abiertos en la página, con opción de preservar
   * el ancla o jerarquía activa.
   * @param {Element|null} exceptAnchor
   */
  function closeAllMenus(exceptAnchor = null) {
    const openTriggers = document.querySelectorAll(
      '.md-menu-anchor > [aria-haspopup="menu"][aria-expanded="true"], ' +
      '.md-menu-submenu > [aria-haspopup="menu"][aria-expanded="true"]'
    );

    openTriggers.forEach((trigger) => {
      const anchor = trigger.closest('.md-menu-anchor, .md-menu-submenu');
      if (exceptAnchor && (anchor === exceptAnchor || anchor.contains(exceptAnchor))) {
        return;
      }
      trigger.setAttribute('aria-expanded', 'false');
    });
  }

  /**
   * Enfoca el primer ítem habilitado de un menú de forma robusta.
   * El estado cerrado usa visibility:hidden, que hace al ítem infocalizable
   * hasta el primer fotograma de la transición de apertura (frame 0): si el
   * foco no llegó porque el menú aún estaba oculto, se reintenta en el
   * siguiente rAF, cuando la interpolación ya lo volvió visible.
   * @param {Element|null} menu
   */
  function focusFirstItem(menu) {
    if (!menu) return;
    const firstItem = menu.querySelector('.md-menu-item:not([disabled]):not([aria-disabled="true"])');
    if (!firstItem) return;
    firstItem.focus();
    if (document.activeElement !== firstItem) {
      // El estado cerrado (visibility:hidden) mantiene al ítem infocalizable
      // durante los primeros ~2 fotogramas de la transición de apertura:
      // reintenta por rAF hasta que la interpolación lo vuelve visible.
      const retry = (left) => {
        firstItem.focus();
        if (document.activeElement !== firstItem && left > 0) {
          requestAnimationFrame(() => retry(left - 1));
        }
      };
      requestAnimationFrame(() => retry(8));
    }
  }

  // Delegación de clic
  document.addEventListener('click', (e) => {
    // 1. Clic en un disparador de menú (raíz o submenú)
    const trigger = e.target.closest('[aria-haspopup="menu"]');
    if (trigger) {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      const anchor = trigger.closest('.md-menu-anchor, .md-menu-submenu');

      // Si es un disparador de primer nivel, cerrar otros menús no relacionados
      if (trigger.closest('.md-menu-anchor') && !trigger.closest('.md-menu-submenu')) {
        closeAllMenus(anchor);
      }

      // Conmutar estado
      const nextState = !isExpanded;
      trigger.setAttribute('aria-expanded', String(nextState));

      // Si se abre, enfocar el primer ítem habilitado
      if (nextState && anchor) {
        focusFirstItem(anchor.querySelector(':scope > .md-menu'));
      }
      return;
    }

    // 2. Clic en una opción de menú (que no abra submenú)
    const item = e.target.closest('.md-menu-item:not([disabled]):not([aria-disabled="true"])');
    if (item && !item.hasAttribute('aria-haspopup')) {
      const rootAnchor = item.closest('.md-menu-anchor');
      const rootTrigger = rootAnchor ? rootAnchor.querySelector(':scope > [aria-haspopup="menu"]') : null;

      // Despachar evento desacoplado de selección
      item.dispatchEvent(new CustomEvent('md-menu:select', {
        bubbles: true,
        detail: {
          item,
          value: item.dataset.value || item.textContent.trim(),
        },
      }));

      // Cerrar toda la jerarquía de menús y devolver foco al disparador principal
      closeAllMenus();
      if (rootTrigger) {
        rootTrigger.focus();
      }
      return;
    }

    // 3. Clic fuera: si se hace clic fuera de cualquier .md-menu-anchor, cerrar todo
    if (!e.target.closest('.md-menu-anchor')) {
      closeAllMenus();
    }
  });

  // Delegación de teclado (WAI-ARIA Menu & Menu Button)
  document.addEventListener('keydown', (e) => {
    // A) Tecla Escape: cerrar el nivel activo
    if (e.key === 'Escape') {
      const activeEl = document.activeElement;
      if (!activeEl) return;

      const currentSubmenu = activeEl.closest('.md-menu-submenu');
      const currentAnchor = activeEl.closest('.md-menu-anchor');

      if (currentSubmenu && currentSubmenu.querySelector(':scope > [aria-expanded="true"]')) {
        const subTrigger = currentSubmenu.querySelector(':scope > [aria-haspopup="menu"]');
        if (subTrigger) {
          subTrigger.setAttribute('aria-expanded', 'false');
          subTrigger.focus();
          e.preventDefault();
          return;
        }
      }

      if (currentAnchor) {
        const rootTrigger = currentAnchor.querySelector(':scope > [aria-haspopup="menu"]');
        if (rootTrigger) {
          rootTrigger.setAttribute('aria-expanded', 'false');
          rootTrigger.focus();
          e.preventDefault();
          return;
        }
      }
      return;
    }

    // A2) Tab / Shift+Tab: APG — el menú se cierra y el foco sale del menú
    // con el flujo natural del navegador (sin preventDefault). El estado
    // cerrado con visibility:hidden lo saca del tab-order automáticamente.
    if (e.key === 'Tab') {
      const activeEl = document.activeElement;
      if (activeEl && activeEl.closest('.md-menu-anchor, .md-menu-submenu')) {
        closeAllMenus();
      }
      return;
    }

    // B) Teclas sobre el disparador principal en reposo (abrir con flechas o Enter/Space)
    const trigger = e.target.closest('[aria-haspopup="menu"]');
    if (trigger && !trigger.closest('.md-menu')) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger.setAttribute('aria-expanded', 'true');
        const anchor = trigger.closest('.md-menu-anchor');
        focusFirstItem(anchor ? anchor.querySelector(':scope > .md-menu') : null);
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        trigger.setAttribute('aria-expanded', 'true');
        const anchor = trigger.closest('.md-menu-anchor');
        const menu = anchor ? anchor.querySelector(':scope > .md-menu') : null;
        const items = menu ? Array.from(menu.querySelectorAll('.md-menu-item:not([disabled]):not([aria-disabled="true"])')) : [];
        items[items.length - 1]?.focus();
        return;
      }
    }

    // C) Navegación entre ítems dentro de un menú abierto
    const currentItem = e.target.closest('.md-menu-item');
    const currentMenu = currentItem ? currentItem.closest('.md-menu') : null;

    if (currentMenu) {
      const items = Array.from(currentMenu.querySelectorAll(
        ':scope > .md-menu-item:not([disabled]):not([aria-disabled="true"]), ' +
        ':scope > .md-menu-submenu > .md-menu-item:not([disabled]):not([aria-disabled="true"])'
      ));
      const currentIndex = items.indexOf(currentItem);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        items[nextIndex]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        items[prevIndex]?.focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        items[0]?.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        items[items.length - 1]?.focus();
        } else if (e.key === 'ArrowRight') {
        // Abrir submenú si el ítem actual lo gobierna
        const submenuAnchor = currentItem.closest('.md-menu-submenu');
        if (submenuAnchor && currentItem.hasAttribute('aria-haspopup')) {
          e.preventDefault();
          currentItem.setAttribute('aria-expanded', 'true');
          focusFirstItem(submenuAnchor.querySelector(':scope > .md-menu'));
        }
      } else if (e.key === 'ArrowLeft') {
        // Cerrar submenú si estamos dentro de uno y regresar foco al padre
        const parentSubmenu = currentMenu.closest('.md-menu-submenu');
        if (parentSubmenu) {
          e.preventDefault();
          const parentTrigger = parentSubmenu.querySelector(':scope > [aria-haspopup="menu"]');
          if (parentTrigger) {
            parentTrigger.setAttribute('aria-expanded', 'false');
            parentTrigger.focus();
          }
        }
      }
    }
  });
}
