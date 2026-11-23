/* ==========================================================================
   src/js/navigation-rail.js — SERVICIO DE NAVIGATION RAIL M3 (Navegación WAI-ARIA)
   ==========================================================================

   ALCANCE DEL SCRIPT (Zero JS en Motion):
   1. Conmutación dinámica de destino activo (aria-current="page") entre los destinos del rail.
   2. Despacho del evento canónico desacoplado 'md-navigation-rail:change'
      hacia el contenedor padre .md-navigation-rail ({ destination, index }).
   3. Navegación por teclado vertical WAI-ARIA (ArrowUp, ArrowDown, Home,
      End, con ArrowLeft/ArrowRight como alias en modo expandido).
   4. Alternancia accesible de paneles asociados vía 'aria-controls'.
   5. Toggle de expansión (Standard): SOLO conmuta la clase lógica
      .md-navigation-rail-expanded y su aria-expanded. Toda la cinemática
      es soberanía de CSS (tokens Capa 2).
   6. Soporte para Modal Navigation Rail (.md-navigation-rail-modal):
      - Apertura desde disparadores [data-rail-target="<id>"] o [data-rail-open].
      - Activación de velo [data-rail-scrim] o .md-navigation-rail-scrim.
      - Atributos WAI-ARIA APG Modal (role="dialog", aria-modal="true").
      - Cierre accesible con tecla Escape, clic en scrim o [data-rail-close]/[data-rail-toggle].
      - Focus trap cíclico con Tab/Shift+Tab y devolución automática de foco al disparador.
   ========================================================================== */

export function initNavigationRail() {
  let activeModalTrigger = null;

  function getFocusableElements(container) {
    if (!container) return [];
    return Array.from(container.querySelectorAll(
      'button:not([disabled]):not([aria-disabled="true"]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter((el) => {
      return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
    });
  }

  function ensureScrim(rail) {
    const parent = (rail && rail.parentNode) ? rail.parentNode : document.body;
    let scrim = parent.querySelector('.md-navigation-rail-scrim');
    if (!scrim) {
      scrim = document.createElement('div');
      scrim.className = 'md-navigation-rail-scrim';
      scrim.setAttribute('aria-hidden', 'true');
      if (rail && rail.parentNode) {
        rail.parentNode.insertBefore(scrim, rail);
      } else {
        parent.appendChild(scrim);
      }
    }
    return scrim;
  }

  function openModal(rail, trigger) {
    if (!rail) return;
    const toggleBtn = trigger || rail.querySelector('[data-rail-toggle]');
    activeModalTrigger = trigger || toggleBtn || null;

    rail.classList.add('md-navigation-rail-expanded', 'md-navigation-rail-open');
    rail.setAttribute('role', 'dialog');
    rail.setAttribute('aria-modal', 'true');

    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.setAttribute('aria-label', 'Contraer menú de navegación');
      const icon = toggleBtn.querySelector('.md-icon');
      if (icon) {
        icon.textContent = 'menu_open';
      }
    }

    if (trigger && trigger !== toggleBtn) {
      trigger.setAttribute('aria-expanded', 'true');
    }

    // Activar o auto-inyectar scrim en el stage o DOM
    const scrim = ensureScrim(rail);
    if (scrim) {
      scrim.classList.add('md-navigation-rail-scrim-open');
    }

    // Foco en el primer elemento interactivo
    const focusables = getFocusableElements(rail);
    if (focusables.length > 0) {
      (trigger && trigger === toggleBtn) ? toggleBtn.focus() : focusables[0].focus();
    }

    rail.dispatchEvent(new CustomEvent('md-navigation-rail:toggle', {
      bubbles: true,
      detail: { expanded: true, modal: true }
    }));
  }

  function closeModal(rail) {
    if (!rail) return;
    rail.classList.remove('md-navigation-rail-expanded', 'md-navigation-rail-open');
    rail.removeAttribute('aria-modal');

    // Sincronizar botón interno maestro de cierre/toggle dentro del rail modal
    const toggleBtn = rail.querySelector('[data-rail-toggle]');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.setAttribute('aria-label', 'Expandir menú de navegación');
      const icon = toggleBtn.querySelector('.md-icon');
      if (icon) {
        icon.textContent = 'menu';
      }
    }

    // Desactivar scrim
    const parent = (rail && rail.parentNode) ? rail.parentNode : document.body;
    const scrim = parent.querySelector('.md-navigation-rail-scrim') || document.querySelector('.md-navigation-rail-scrim');
    if (scrim) {
      scrim.classList.remove('md-navigation-rail-scrim-open');
    }

    // Devolver foco al disparador
    const targetToFocus = activeModalTrigger || toggleBtn;
    if (targetToFocus) {
      targetToFocus.setAttribute('aria-expanded', 'false');
      targetToFocus.focus();
      activeModalTrigger = null;
    }

    rail.dispatchEvent(new CustomEvent('md-navigation-rail:toggle', {
      bubbles: true,
      detail: { expanded: false, modal: true }
    }));
  }

  // 1. Delegación de clics para apertura y cierre de modal, y toggle de expansión
  document.addEventListener('click', (event) => {
    // A) Disparador externo opcional de apertura de modal: [data-rail-target="id"] o [data-rail-open]
    const openTrigger = event.target.closest('[data-rail-target], [data-rail-open]');
    if (openTrigger) {
      const targetId = openTrigger.getAttribute('data-rail-target') || openTrigger.getAttribute('data-rail-open');
      const rail = targetId ? document.getElementById(targetId) : event.target.closest('.md-navigation-rail');
      if (rail && rail.classList.contains('md-navigation-rail-modal')) {
        openModal(rail, openTrigger);
        return;
      }
    }

    // B) Clic en el Scrim: cierra el modal activo
    const scrim = event.target.closest('.md-navigation-rail-scrim');
    if (scrim) {
      const parent = scrim.parentNode || document.body;
      const modalRail = parent.querySelector('.md-navigation-rail-modal:is(.md-navigation-rail-expanded, .md-navigation-rail-open)') || document.querySelector('.md-navigation-rail-modal:is(.md-navigation-rail-expanded, .md-navigation-rail-open)');
      if (modalRail) {
        closeModal(modalRail);
        return;
      }
    }

    // C) Botón de cierre explícito [data-rail-close]
    const closeBtn = event.target.closest('[data-rail-close]');
    if (closeBtn) {
      const rail = closeBtn.closest('.md-navigation-rail');
      if (rail && rail.classList.contains('md-navigation-rail-modal')) {
        closeModal(rail);
        return;
      }
    }

    // D) Botón [data-rail-toggle]: conmutación modal o conmutación estándar
    const toggleBtn = event.target.closest('[data-rail-toggle]');
    if (!toggleBtn) return;
    const rail = toggleBtn.closest('.md-navigation-rail');
    if (!rail) return;

    // Si es modal, conmuta entre colapsado (96dp) y modal expandido (280dp)
    if (rail.classList.contains('md-navigation-rail-modal')) {
      const isExpanded = rail.classList.contains('md-navigation-rail-expanded') || rail.classList.contains('md-navigation-rail-open');
      if (isExpanded) {
        closeModal(rail);
      } else {
        openModal(rail, toggleBtn);
      }
      return;
    }

    // Conmutación estándar (colapsado <-> expandido)
    const isExpanded = rail.classList.contains('md-navigation-rail-expanded');
    const willExpand = !isExpanded;

    toggleBtn.setAttribute('aria-expanded', willExpand ? 'true' : 'false');

    const icon = toggleBtn.querySelector('.md-icon');
    if (icon) {
      icon.textContent = willExpand ? 'menu_open' : 'menu';
    }

    toggleBtn.setAttribute('aria-label', willExpand ? 'Contraer menú de navegación' : 'Abrir menú de navegación');

    rail.dispatchEvent(new CustomEvent('md-navigation-rail:toggle', {
      bubbles: true,
      detail: { expanded: willExpand, modal: false }
    }));

    rail.classList.toggle('md-navigation-rail-expanded', willExpand);
  });

  // 2. Delegación de clics para conmutar destinos dentro de cualquier .md-navigation-rail
  document.addEventListener('click', (event) => {
    const item = event.target.closest('.md-navigation-rail-item');
    if (!item) return;
    const rail = item.closest('.md-navigation-rail');
    if (!rail || item.disabled || item.getAttribute('aria-disabled') === 'true') return;

    if (item.getAttribute('aria-current') === 'page') return;

    const items = Array.from(rail.querySelectorAll('.md-navigation-rail-item:not([disabled]):not([aria-disabled="true"])'));

    items.forEach((t) => {
      const isCurrent = (t === item);
      if (isCurrent) {
        t.setAttribute('aria-current', 'page');
      } else {
        t.removeAttribute('aria-current');
      }
      t.removeAttribute('aria-selected');
      t.removeAttribute('role');
      t.removeAttribute('tabindex');
    });

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

    rail.dispatchEvent(new CustomEvent('md-navigation-rail:change', {
      bubbles: true,
      detail: {
        destination: item,
        index: items.indexOf(item)
      }
    }));
  });

  // 3. Accesibilidad por teclado WAI-ARIA (Navegación vertical + Modal Trap + Escape)
  document.addEventListener('keydown', (event) => {
    // A) Modal abierto: gestión de Escape y Focus Trap
    const openModalEl = document.querySelector('.md-navigation-rail-modal:is(.md-navigation-rail-expanded, .md-navigation-rail-open)');
    if (openModalEl) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal(openModalEl);
        return;
      }

      if (event.key === 'Tab') {
        const focusables = getFocusableElements(openModalEl);
        if (focusables.length > 0) {
          const first = focusables[0];
          const last = focusables[focusables.length - 1];

          if (event.shiftKey) {
            if (document.activeElement === first || !openModalEl.contains(document.activeElement)) {
              event.preventDefault();
              last.focus();
              return;
            }
          } else {
            if (document.activeElement === last || !openModalEl.contains(document.activeElement)) {
              event.preventDefault();
              first.focus();
              return;
            }
          }
        }
      }
    }

    // B) Navegación por flechas entre destinos del rail
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
