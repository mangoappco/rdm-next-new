/* ==========================================================================
   src/js/menu.js — CONTROLADOR DE MENU (M3 Superficie flotante)
   ==========================================================================

   QUE HACE
   --------
   Comportamiento interactivo accesible para menús y submenús en cascada
   de Material Design 3. Conmuta atributos aria-expanded, gestiona el cierre
   en clic exterior (click outside), la tecla Escape y la navegación cíclica
   por teclado (WAI-ARIA Menu & Menu Button).
   Incorpora Viewport Edge Detection con auto-flipping horizontal y vertical
   para prevenir colisiones contra los bordes de la pantalla.

   PATRON
   ------
   Delegación global en document para click y keydown. Zero dependencias.
   Zero JS en Motion: la cinemática de escala y opacidad la gobierna CSS.
   ========================================================================== */

export function initMenu() {
  /**
   * Calcula y ajusta en tiempo real la orientación del menú para evitar
   * que se desborde fuera de los límites visibles de la ventana (Viewport Edge Detection).
   * Gestiona el auto-flip horizontal (data-align="end") y vertical (data-valign="top").
   * @param {HTMLElement} menu
   */
  function positionMenu(menu) {
    if (!menu) return;

    // Resetear atributos previos para medir en reposo canónico
    menu.removeAttribute('data-align');
    menu.removeAttribute('data-valign');

    const isSubmenu = Boolean(menu.closest('.md-menu-submenu'));
    const parentMenu = menu.parentElement ? menu.parentElement.closest('.md-menu') : null;
    const parentAlignEnd = parentMenu && parentMenu.getAttribute('data-align') === 'end';

    // Si el menú padre ya está invertido hacia la izquierda, el submenú hereda esa dirección por defecto
    if (isSubmenu && parentAlignEnd) {
      menu.setAttribute('data-align', 'end');
    }

    const rect = menu.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
    const viewportHeight = window.innerHeight;
    const MARGIN = 8; // Margen de guarda de seguridad contra el borde de la pantalla

    // 1. Detección de colisión horizontal
    if (!parentAlignEnd) {
      // Abre naturalmente a la derecha; verificar si choca con el borde derecho del viewport
      if (rect.right > viewportWidth - MARGIN) {
        menu.setAttribute('data-align', 'end');
        // Si al invertir a la izquierda choca contra el borde izquierdo y cabía mejor a la derecha, revertir
        const newRect = menu.getBoundingClientRect();
        if (newRect.left < MARGIN && (viewportWidth - rect.right) > newRect.left) {
          menu.removeAttribute('data-align');
        }
      }
    } else {
      // Heredó apertura a la izquierda; verificar si choca con el borde izquierdo
      if (rect.left < MARGIN) {
        menu.removeAttribute('data-align');
      }
    }

    // 2. Detección de colisión vertical
    const currentRect = menu.getBoundingClientRect();
    if (currentRect.bottom > viewportHeight - MARGIN) {
      menu.setAttribute('data-valign', 'top');
      const topRect = menu.getBoundingClientRect();
      // Si al invertir hacia arriba se sale por el techo y cabía mejor abajo, revertir
      if (topRect.top < MARGIN && (viewportHeight - currentRect.bottom) > topRect.top) {
        menu.removeAttribute('data-valign');
      }
    }
  }

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
      const menu = anchor ? anchor.querySelector(':scope > .md-menu') : null;
      if (menu) {
        menu.removeAttribute('data-align');
        menu.removeAttribute('data-valign');
      }
    });
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

      // Si se abre, posicionar y enfocar el primer ítem habilitado
      if (nextState && anchor) {
        const menu = anchor.querySelector(':scope > .md-menu');
        if (menu) {
          positionMenu(menu);
          const firstItem = menu.querySelector('.md-menu-item:not([disabled]):not([aria-disabled="true"])');
          if (firstItem) {
            firstItem.focus();
          }
        }
      } else if (!nextState && anchor) {
        const menu = anchor.querySelector(':scope > .md-menu');
        if (menu) {
          menu.removeAttribute('data-align');
          menu.removeAttribute('data-valign');
        }
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

      const currentSubmenu = activeEl.closest('.md-menu-submenu:has(> [aria-expanded="true"])');
      const currentAnchor = activeEl.closest('.md-menu-anchor');

      if (currentSubmenu) {
        const subTrigger = currentSubmenu.querySelector(':scope > [aria-haspopup="menu"]');
        if (subTrigger) {
          subTrigger.setAttribute('aria-expanded', 'false');
          const subMenu = currentSubmenu.querySelector(':scope > .md-menu');
          if (subMenu) {
            subMenu.removeAttribute('data-align');
            subMenu.removeAttribute('data-valign');
          }
          subTrigger.focus();
          e.preventDefault();
          return;
        }
      }

      if (currentAnchor) {
        const rootTrigger = currentAnchor.querySelector(':scope > [aria-haspopup="menu"]');
        if (rootTrigger) {
          rootTrigger.setAttribute('aria-expanded', 'false');
          const rootMenu = currentAnchor.querySelector(':scope > .md-menu');
          if (rootMenu) {
            rootMenu.removeAttribute('data-align');
            rootMenu.removeAttribute('data-valign');
          }
          rootTrigger.focus();
          e.preventDefault();
          return;
        }
      }
      return;
    }

    // B) Tecla Tab: cerrar menús abiertos sin interferir en la navegación nativa (WAI-ARIA APG)
    if (e.key === 'Tab') {
      const activeMenu = e.target.closest('.md-menu, .md-menu-anchor');
      if (activeMenu) {
        closeAllMenus();
      }
      return;
    }

    // C) Teclas sobre el disparador principal en reposo (abrir con flechas o Enter/Space)
    const trigger = e.target.closest('[aria-haspopup="menu"]');
    if (trigger && !trigger.closest('.md-menu')) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger.setAttribute('aria-expanded', 'true');
        const anchor = trigger.closest('.md-menu-anchor');
        const menu = anchor ? anchor.querySelector(':scope > .md-menu') : null;
        if (menu) {
          positionMenu(menu);
          const firstItem = menu.querySelector('.md-menu-item:not([disabled]):not([aria-disabled="true"])');
          firstItem?.focus();
        }
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        trigger.setAttribute('aria-expanded', 'true');
        const anchor = trigger.closest('.md-menu-anchor');
        const menu = anchor ? anchor.querySelector(':scope > .md-menu') : null;
        if (menu) {
          positionMenu(menu);
          const items = Array.from(menu.querySelectorAll('.md-menu-item:not([disabled]):not([aria-disabled="true"])'));
          items[items.length - 1]?.focus();
        }
        return;
      }
    }

    // D) Navegación entre ítems dentro de un menú abierto
    const currentItem = e.target.closest('.md-menu-item');
    const currentMenu = currentItem ? currentItem.closest('.md-menu') : null;

    if (currentMenu) {
      const items = Array.from(currentMenu.querySelectorAll(
        ':scope > .md-menu-item:not([disabled]):not([aria-disabled="true"]), ' +
        ':scope > .md-menu-submenu > .md-menu-item:not([disabled]):not([aria-disabled="true"])'
      ));
      const currentIndex = items.indexOf(currentItem);

      // Determinar si la orientación en este menú es hacia la izquierda (auto-flipped)
      const isFlippedX = currentMenu.getAttribute('data-align') === 'end' ||
                         Boolean(currentMenu.closest('.md-menu[data-align="end"]'));

      const openSubmenuKey = isFlippedX ? 'ArrowLeft' : 'ArrowRight';
      const closeSubmenuKey = isFlippedX ? 'ArrowRight' : 'ArrowLeft';

      // Activar enlace <a> con barra espaciadora (WAI-ARIA APG para role="menuitem")
      if (e.key === ' ' && currentItem.tagName === 'A') {
        e.preventDefault();
        currentItem.click();
        return;
      }

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
      } else if (e.key === openSubmenuKey) {
        // Abrir submenú si el ítem actual lo gobierna
        const submenuAnchor = currentItem.closest('.md-menu-submenu');
        if (submenuAnchor && currentItem.hasAttribute('aria-haspopup')) {
          e.preventDefault();
          currentItem.setAttribute('aria-expanded', 'true');
          const subMenu = submenuAnchor.querySelector(':scope > .md-menu');
          if (subMenu) {
            positionMenu(subMenu);
            const firstSubItem = subMenu.querySelector('.md-menu-item:not([disabled]):not([aria-disabled="true"])');
            firstSubItem?.focus();
          }
        }
      } else if (e.key === closeSubmenuKey) {
        // Cerrar submenú si estamos dentro de uno y regresar foco al padre
        const parentSubmenu = currentMenu.closest('.md-menu-submenu');
        if (parentSubmenu) {
          e.preventDefault();
          const parentTrigger = parentSubmenu.querySelector(':scope > [aria-haspopup="menu"]');
          if (parentTrigger) {
            parentTrigger.setAttribute('aria-expanded', 'false');
            parentTrigger.focus();
            currentMenu.removeAttribute('data-align');
            currentMenu.removeAttribute('data-valign');
          }
        }
      }
    }
  });

  // Cerrar menús al redimensionar la ventana para evitar desalineación flotante
  window.addEventListener('resize', () => {
    closeAllMenus();
  });
}
