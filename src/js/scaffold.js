/**
 * src/js/scaffold.js — SCAFFOLD (Gestor interactivo de paneles M3)
 * ==========================================================================
 *
 * QUÉ HACE:
 * 1. Gestiona la interactividad de paneles semi-permanentes y colapsables
 *    mediante delegación global de eventos sobre disparadores [data-scaffold-pane-toggle].
 * 2. Gestiona manijas de arrastre [data-scaffold-drag-handle] (Drag Handle M3)
 *    para redimensionar paneles contiguos mediante Pointer Events y teclado WAI-ARIA.
 * 3. Soporta colapso completo (0dp) para alternar entre two-pane y single-pane,
 *    snap magnético a anchos canónicos M3 (360dp, 412dp, 50%) y toggle por selección
 *    (tap/clic o Enter/Espacio en el separador).
 * 4. Gestiona estados de carga orgánica [data-loading] en paneles (.md-scaffold-pane)
 *    con umbral anti-parpadeo de 200ms e integración directa con Loading Indicator.
 *
 * ACCESIBILIDAD:
 * - aria-expanded en el disparador refleja si el panel subordinado está visible.
 * - aria-controls vincula el disparador o la manija con el id del panel objetivo.
 * - aria-hidden en el panel objetivo oculta o expone el árbol de accesibilidad.
 * - aria-busy="true" mientras el panel está en estado de carga activa.
 * - role="separator", aria-orientation="vertical", aria-valuemin, aria-valuemax
 *   y aria-valuenow en las manijas de arrastre de paneles.
 *
 * EVENTOS:
 * - Despacha 'md-scaffold:pane-toggle' con { paneId, expanded, trigger }.
 * - Despacha 'md-scaffold:pane-resize' con { pane, width, handle }.
 * ==========================================================================
 */

import { hydrateLoadingIndicator } from './loading-indicator.js';

let initialized = false;
const loadingTimers = new WeakMap();

/**
 * Gestiona de forma reactiva los estados de carga sobre un panel de Scaffold.
 * Aplica el umbral anti-parpadeo canónico M3 de 200ms.
 *
 * @param {HTMLElement} pane Panel objetivo (.md-scaffold-pane)
 */
function handlePaneLoadingChange(pane) {
  if (!pane || !pane.matches?.('.md-scaffold-pane')) return;

  const loadingAttr = pane.getAttribute('data-loading');
  const timer = loadingTimers.get(pane);
  if (timer) {
    clearTimeout(timer);
    loadingTimers.delete(pane);
  }

  if (!loadingAttr || loadingAttr === 'false') {
    pane.removeAttribute('data-loading-active');
    pane.removeAttribute('aria-busy');
    const existingLoader = pane.querySelector(':scope > .md-scaffold-pane-loader');
    if (existingLoader) {
      existingLoader.remove();
    }
    return;
  }

  const mode = loadingAttr === 'refresh' ? 'refresh' : 'initial';
  const delay = 200; // Umbral anti-parpadeo M3 (200ms)

  const newTimer = setTimeout(() => {
    loadingTimers.delete(pane);
    const currentLoading = pane.getAttribute('data-loading');
    if (!currentLoading || currentLoading === 'false') return;

    pane.setAttribute('data-loading-active', mode);
    pane.setAttribute('aria-busy', 'true');

    let loader = pane.querySelector(':scope > .md-scaffold-pane-loader');
    if (!loader) {
      loader = document.createElement('div');
      loader.className = 'md-scaffold-pane-loader';
      loader.setAttribute('aria-hidden', 'true');
      pane.appendChild(loader);
    }

    let indicator = loader.querySelector('.md-loading-indicator');
    const label = pane.getAttribute('data-loading-label') || 'Cargando contenido';

    if (!indicator) {
      indicator = document.createElement('div');
      indicator.setAttribute('role', 'progressbar');
      loader.appendChild(indicator);
    }

    indicator.className = mode === 'refresh'
      ? 'md-loading-indicator md-loading-indicator-contained'
      : 'md-loading-indicator';
    indicator.setAttribute('aria-label', label);

    if (typeof hydrateLoadingIndicator === 'function') {
      hydrateLoadingIndicator(indicator);
    } else if (typeof window !== 'undefined' && typeof window.initLoadingIndicator === 'function') {
      window.initLoadingIndicator();
    }
  }, delay);

  loadingTimers.set(pane, newTimer);
}

/**
 * Helper público para activar o desactivar el estado de carga en un panel.
 *
 * @param {HTMLElement|string} pane Referencia a elemento DOM o selector CSS del panel
 * @param {string|boolean} mode 'initial' | 'refresh' | true | false
 * @param {string|null} label Texto accesible descriptivo para el lector de pantalla
 */
export function setPaneLoading(pane, mode = 'initial', label = null) {
  const el = typeof pane === 'string' ? document.querySelector(pane) : pane;
  if (!el) return;

  if (label) {
    el.setAttribute('data-loading-label', label);
  }

  if (mode === false || mode === 'false' || mode === null) {
    el.removeAttribute('data-loading');
  } else {
    el.setAttribute('data-loading', typeof mode === 'string' ? mode : 'initial');
  }

  handlePaneLoadingChange(el);
}

/**
 * Envuelve una tarea asíncrona gestionando automáticamente el ciclo de vida
 * del estado de carga sobre el panel especificado.
 *
 * @param {HTMLElement|string} pane Panel objetivo
 * @param {Function|Promise} asyncTask Tarea asíncrona a ejecutar
 * @param {Object|string} options Opciones de configuración { mode, label } o string con label
 * @returns {Promise<*>} Resultado de la tarea asíncrona
 */
export async function withPaneLoading(pane, asyncTask, options = {}) {
  const el = typeof pane === 'string' ? document.querySelector(pane) : pane;
  const mode = (typeof options === 'object' && options?.mode) ? options.mode : 'initial';
  const label = typeof options === 'string' ? options : (options?.label || null);

  setPaneLoading(el, mode, label);
  try {
    const taskPromise = typeof asyncTask === 'function' ? asyncTask() : asyncTask;
    return await taskPromise;
  } finally {
    setPaneLoading(el, false);
  }
}

/**
 * Alterna el estado colapsado (0dp) / expandido de un panel redimensionable.
 * Recuerda el último ancho previo para restaurarlo al expandir.
 */
function togglePaneCollapse(pane, handle, min = 0) {
  const isCollapsed = pane.getAttribute('data-collapsed') === 'true' || pane.classList.contains('is-collapsed');

  if (isCollapsed) {
    const restoredWidth = parseInt(pane.dataset.lastExpandedWidth, 10) || 360;
    pane.removeAttribute('data-collapsed');
    pane.setAttribute('aria-hidden', 'false');
    pane.style.setProperty('--md-scaffold-pane-width', `${restoredWidth}px`);
    handle.setAttribute('aria-valuenow', String(restoredWidth));
  } else {
    if (min === 0) {
      const currentWidth = parseInt(handle.getAttribute('aria-valuenow'), 10) || 360;
      if (currentWidth >= 280) {
        pane.dataset.lastExpandedWidth = String(currentWidth);
      }
      pane.setAttribute('data-collapsed', 'true');
      pane.setAttribute('aria-hidden', 'true');
      pane.style.setProperty('--md-scaffold-pane-width', 'var(--md-sys-measurement-space-0)');
      handle.setAttribute('aria-valuenow', '0');
    } else {
      const currentWidth = parseInt(handle.getAttribute('aria-valuenow'), 10) || 360;
      const nextWidth = Math.abs(currentWidth - 360) < Math.abs(currentWidth - 412) ? 412 : 360;
      pane.style.setProperty('--md-scaffold-pane-width', `${nextWidth}px`);
      handle.setAttribute('aria-valuenow', String(nextWidth));
    }
  }

  pane.dispatchEvent(
    new CustomEvent('md-scaffold:pane-resize', {
      bubbles: true,
      composed: true,
      detail: {
        pane,
        width: pane.getAttribute('data-collapsed') === 'true' ? 0 : parseInt(handle.getAttribute('aria-valuenow'), 10),
        handle,
      },
    })
  );
}

/**
 * Aplica snap magnético (±20px) a anchos canónicos M3 (360dp, 412dp, 50% split-pane) al soltar.
 */
function applySnapPoints(pane, handle, min, max) {
  const isCollapsed = pane.getAttribute('data-collapsed') === 'true';
  if (isCollapsed) return;

  let currentWidth = parseInt(handle.getAttribute('aria-valuenow'), 10);
  if (Number.isNaN(currentWidth)) return;

  const container = pane.parentElement;
  const candidateSnaps = [360, 412];

  if (container) {
    const containerWidth = container.getBoundingClientRect().width;
    const gutter = 24;
    const halfWidth = Math.round((containerWidth - gutter) / 2);
    const effectiveMin = min === 0 ? 280 : min;
    if (halfWidth >= effectiveMin && halfWidth <= max) {
      candidateSnaps.push(halfWidth);
    }
  }

  for (const snap of candidateSnaps) {
    if (Math.abs(currentWidth - snap) <= 20) {
      currentWidth = snap;
      break;
    }
  }

  pane.style.setProperty('--md-scaffold-pane-width', `${currentWidth}px`);
  handle.setAttribute('aria-valuenow', String(currentWidth));
  pane.dataset.lastExpandedWidth = String(currentWidth);

  pane.dispatchEvent(
    new CustomEvent('md-scaffold:pane-resize', {
      bubbles: true,
      composed: true,
      detail: {
        pane,
        width: currentWidth,
        handle,
      },
    })
  );
}

export function initScaffold() {
  if (initialized) return;
  initialized = true;

  // 1. Delegación de clics para alternancia de paneles semi-permanentes
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-scaffold-pane-toggle]');
    if (!trigger) return;

    const targetId = trigger.getAttribute('aria-controls');
    if (!targetId) return;

    const targetPane = document.getElementById(targetId);
    if (!targetPane) return;

    const isCurrentlyExpanded = trigger.getAttribute('aria-expanded') === 'true';
    const nextExpanded = !isCurrentlyExpanded;

    trigger.setAttribute('aria-expanded', String(nextExpanded));
    targetPane.setAttribute('aria-hidden', String(!nextExpanded));

    targetPane.dispatchEvent(
      new CustomEvent('md-scaffold:pane-toggle', {
        bubbles: true,
        composed: true,
        detail: {
          paneId: targetId,
          expanded: nextExpanded,
          trigger,
        },
      })
    );
  });

  // 2. Drag Handle: Arrastre interactivo con Pointer Events
  let activeDrag = null;

  document.addEventListener('pointerdown', (event) => {
    const handle = event.target.closest('[data-scaffold-drag-handle]');
    if (!handle) return;
    if (event.button !== 0) return; // Solo botón principal

    const targetId = handle.getAttribute('aria-controls');
    const targetPane = targetId ? document.getElementById(targetId) : (handle.previousElementSibling || handle.nextElementSibling);
    if (!targetPane) return;

    const isPaneBefore = Boolean(handle.compareDocumentPosition(targetPane) & Node.DOCUMENT_POSITION_PRECEDING);
    const rect = targetPane.getBoundingClientRect();
    const rawMin = handle.getAttribute('aria-valuemin');
    const min = rawMin !== null ? parseInt(rawMin, 10) : 280;
    const rawMax = handle.getAttribute('aria-valuemax');
    const max = rawMax !== null ? parseInt(rawMax, 10) : 520;

    const isCollapsed = targetPane.getAttribute('data-collapsed') === 'true' || targetPane.classList.contains('is-collapsed');
    const currentWidth = isCollapsed ? 0 : rect.width;

    activeDrag = {
      handle,
      pane: targetPane,
      startX: event.clientX,
      startWidth: currentWidth,
      min,
      max,
      pointerId: event.pointerId,
      hasMoved: false,
      isPaneBefore,
    };

    try {
      handle.setPointerCapture(event.pointerId);
    } catch (_) {}

    handle.setAttribute('data-dragging', 'true');
    event.preventDefault();
  });

  document.addEventListener('pointermove', (event) => {
    if (!activeDrag || event.pointerId !== activeDrag.pointerId) return;

    const rawDeltaX = event.clientX - activeDrag.startX;
    if (Math.abs(rawDeltaX) >= 4) {
      activeDrag.hasMoved = true;
    }

    const deltaX = activeDrag.isPaneBefore ? rawDeltaX : -rawDeltaX;
    let nextWidth = Math.round(activeDrag.startWidth + deltaX);

    // Proteger que el contenedor deje al menos 320px para el panel flexible contiguo
    const container = activeDrag.pane.parentElement;
    let maxAllowed = activeDrag.max;
    if (container) {
      const containerWidth = container.getBoundingClientRect().width;
      const gutter = 24;
      maxAllowed = Math.min(activeDrag.max, Math.round(containerWidth - 320 - gutter));
    }

    // Umbral de colapso (< 140px si min === 0)
    if (activeDrag.min === 0 && nextWidth < 140) {
      activeDrag.pane.setAttribute('data-collapsed', 'true');
      activeDrag.pane.setAttribute('aria-hidden', 'true');
      activeDrag.pane.style.setProperty('--md-scaffold-pane-width', 'var(--md-sys-measurement-space-0)');
      activeDrag.handle.setAttribute('aria-valuenow', '0');
    } else {
      const effectiveMin = activeDrag.min === 0 ? 280 : activeDrag.min;
      if (nextWidth < effectiveMin) nextWidth = effectiveMin;
      if (nextWidth > maxAllowed) nextWidth = maxAllowed;

      activeDrag.pane.removeAttribute('data-collapsed');
      activeDrag.pane.setAttribute('aria-hidden', 'false');
      activeDrag.pane.style.setProperty('--md-scaffold-pane-width', `${nextWidth}px`);
      activeDrag.handle.setAttribute('aria-valuenow', String(nextWidth));
      activeDrag.pane.dataset.lastExpandedWidth = String(nextWidth);
    }

    activeDrag.pane.dispatchEvent(
      new CustomEvent('md-scaffold:pane-resize', {
        bubbles: true,
        composed: true,
        detail: {
          pane: activeDrag.pane,
          width: activeDrag.pane.getAttribute('data-collapsed') === 'true' ? 0 : nextWidth,
          handle: activeDrag.handle,
        },
      })
    );
  });

  const endDrag = (event) => {
    if (!activeDrag || event.pointerId !== activeDrag.pointerId) return;

    const { handle, pane, hasMoved, min, max } = activeDrag;

    try {
      handle.releasePointerCapture(event.pointerId);
    } catch (_) {}

    handle.removeAttribute('data-dragging');

    if (!hasMoved) {
      togglePaneCollapse(pane, handle, min);
    } else {
      applySnapPoints(pane, handle, min, max);
    }

    activeDrag = null;
  };

  document.addEventListener('pointerup', endDrag);
  document.addEventListener('pointercancel', endDrag);

  // 3. Soporte accesible por teclado WAI-ARIA (role="separator")
  document.addEventListener('keydown', (event) => {
    const handle = event.target.closest('[data-scaffold-drag-handle]');
    if (!handle) return;

    const key = event.key;
    if (
      key !== 'ArrowLeft' &&
      key !== 'ArrowRight' &&
      key !== 'Home' &&
      key !== 'End' &&
      key !== 'Enter' &&
      key !== ' '
    ) {
      return;
    }

    const targetId = handle.getAttribute('aria-controls');
    const targetPane = targetId ? document.getElementById(targetId) : (handle.previousElementSibling || handle.nextElementSibling);
    if (!targetPane) return;

    const isPaneBefore = Boolean(handle.compareDocumentPosition(targetPane) & Node.DOCUMENT_POSITION_PRECEDING);
    const shrinkKey = isPaneBefore ? 'ArrowLeft' : 'ArrowRight';
    const expandKey = isPaneBefore ? 'ArrowRight' : 'ArrowLeft';

    const rawMin = handle.getAttribute('aria-valuemin');
    const min = rawMin !== null ? parseInt(rawMin, 10) : 280;
    const rawMax = handle.getAttribute('aria-valuemax');
    const max = rawMax !== null ? parseInt(rawMax, 10) : 520;

    // Toggle por selección con Enter o Espacio
    if (key === 'Enter' || key === ' ') {
      togglePaneCollapse(targetPane, handle, min);
      event.preventDefault();
      return;
    }

    const isCollapsed = targetPane.getAttribute('data-collapsed') === 'true' || targetPane.classList.contains('is-collapsed');
    let currentWidth = isCollapsed ? 0 : (parseInt(handle.getAttribute('aria-valuenow'), 10) || 360);
    const step = 16; // Incremento de 16px en ajuste por teclado

    if (key === shrinkKey) {
      if (min === 0 && currentWidth - step < 140) {
        togglePaneCollapse(targetPane, handle, min);
        event.preventDefault();
        return;
      }
      const effectiveMin = min === 0 ? 280 : min;
      currentWidth = Math.max(effectiveMin, currentWidth - step);
    } else if (key === expandKey) {
      if (isCollapsed) {
        togglePaneCollapse(targetPane, handle, min);
        event.preventDefault();
        return;
      }
      currentWidth = Math.min(max, currentWidth + step);
    } else if (key === 'Home') {
      if (min === 0) {
        if (!isCollapsed) togglePaneCollapse(targetPane, handle, min);
        event.preventDefault();
        return;
      }
      currentWidth = min;
    } else if (key === 'End') {
      if (isCollapsed) {
        targetPane.removeAttribute('data-collapsed');
        targetPane.setAttribute('aria-hidden', 'false');
      }
      currentWidth = max;
    }

    targetPane.removeAttribute('data-collapsed');
    targetPane.setAttribute('aria-hidden', 'false');
    targetPane.style.setProperty('--md-scaffold-pane-width', `${currentWidth}px`);
    handle.setAttribute('aria-valuenow', String(currentWidth));
    targetPane.dataset.lastExpandedWidth = String(currentWidth);

    targetPane.dispatchEvent(
      new CustomEvent('md-scaffold:pane-resize', {
        bubbles: true,
        composed: true,
        detail: {
          pane: targetPane,
          width: currentWidth,
          handle,
        },
      })
    );

    event.preventDefault();
  });

  // 4. Estados de carga orgánica [data-loading] en paneles de Scaffold
  document.querySelectorAll('.md-scaffold-pane[data-loading]').forEach(handlePaneLoadingChange);

  if (typeof MutationObserver !== 'undefined' && document.body) {
    const loadingObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes') {
          const target = mutation.target;
          if (target.matches?.('.md-scaffold-pane')) {
            handlePaneLoadingChange(target);
          }
        } else if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) {
              if (node.matches?.('.md-scaffold-pane[data-loading]')) {
                handlePaneLoadingChange(node);
              }
              if (node.querySelectorAll) {
                node.querySelectorAll('.md-scaffold-pane[data-loading]').forEach(handlePaneLoadingChange);
              }
            }
          }
        }
      }
    });

    loadingObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-loading', 'data-loading-label'],
      childList: true,
      subtree: true,
    });
  }

  // Exposición de API pública en window.M3Scaffold
  if (typeof window !== 'undefined') {
    window.M3Scaffold = window.M3Scaffold || {};
    window.M3Scaffold.setPaneLoading = setPaneLoading;
    window.M3Scaffold.withPaneLoading = withPaneLoading;
  }
}
