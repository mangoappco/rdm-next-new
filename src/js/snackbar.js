/* ==========================================================================
   src/js/snackbar.js — SNACKBAR (capa de comportamiento)
   ==========================================================================

   QUE HACE ESTE ARCHIVO
   ---------------------
   Controla el ciclo de vida y cinemática de los snackbars:
   1. Disparo/apertura mediante delegado de clic en `[data-trigger-snackbar="id"]`
      o `[data-open-snackbar="id"]`.
   2. Cierre explícito mediante delegado de clic en `[data-close-snackbar]`.
   3. Auto-dismiss temporizado (4s a 10s según M3) con soporte para pausar
      el temporizador mientras el usuario mantiene el foco o el puntero sobre
      el componente (`mouseover`/`focusin`), reanudando al salir (`mouseout`/`focusout`).
   4. Coordinación con la física de movimiento: aplica la clase `.md-snackbar-visible`
      para activar la curva `emphasized-decelerate` (300ms) al entrar, y la retira
      para ejecutar la salida rápida con `emphasized-accelerate` (150ms).
   ========================================================================== */

/** @type {WeakMap<HTMLElement, { timerId: any, remaining: number, start: number, paused: boolean }>} */
const timers = new WeakMap();

/**
 * Comprueba si un elemento es visible en pantalla.
 * @param {Element} el
 * @returns {boolean}
 */
function isElementVisible(el) {
  if (!el || !el.isConnected) return false;
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false;
  }
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

/**
 * Calcula la cota inferior universal según los componentes visibles en la base del viewport.
 * @returns {string}
 */
export function getUniversalBottomOffset() {
  const GAP = 16; // 16px de holgura canónica M3
  let bottomOffset = GAP; // Reposo base: 16px

  // 1. Detectar si hay Navigation Bar fija visible
  const navBar = document.querySelector('.md-navigation-bar-docked, .md-navigation-bar-fixed, .md-navigation-bar');
  if (navBar && isElementVisible(navBar)) {
    const navRect = navBar.getBoundingClientRect();
    // Si la barra está pegada al piso de la pantalla
    if (navRect.bottom >= window.innerHeight - 5) {
      bottomOffset = navRect.height + GAP; // 80 + 16 = 96px
    }
  }

  // 2. Detectar si hay un FAB visible (regular o extendido)
  const fab = document.querySelector('.md-fab-over-nav, .md-fab-over-nav-fixed, .md-fab-anchored, .md-fab-fixed, .md-fab');
  if (fab && isElementVisible(fab)) {
    const fabRect = fab.getBoundingClientRect();
    // Si el FAB flota en la zona inferior de la pantalla (últimos 250px)
    if (fabRect.bottom >= window.innerHeight - 250) {
      const fabTopFromBottom = window.innerHeight - fabRect.top;
      // El snackbar debe quedar a 16px sobre el techo del FAB
      bottomOffset = Math.max(bottomOffset, fabTopFromBottom + GAP); // 80 + 16 + 56 + 16 = 168px
    }
  }

  return `${bottomOffset}px`;
}

/**
 * Aplica la cota inferior automática al host o al snackbar.
 * @param {HTMLElement} snackbar
 */
export function updateSnackbarOffset(snackbar) {
  if (!snackbar) return;
  const dynamicOffset = getUniversalBottomOffset();
  const host = snackbar.closest('.md-snackbar-container') || snackbar;
  host.style.setProperty('--_snackbar-bottom-offset', dynamicOffset);
}

/**
 * Muestra u oculta con animación.
 * @param {HTMLElement} snackbar
 * @param {number} [duration]
 */
export function mostrarSnackbar(snackbar, duration = 4000) {
  if (!snackbar) return;

  // Autodetección de cota inferior universal antes de entrar
  updateSnackbarOffset(snackbar);

  // Si había un timer en curso, cancelarlo
  const prev = timers.get(snackbar);
  if (prev && prev.timerId) {
    clearTimeout(prev.timerId);
  }

  snackbar.removeAttribute('hidden');
  // Forzar reflow para asegurar que la transición corra desde el estado inicial
  void snackbar.offsetHeight;
  snackbar.classList.add('md-snackbar-visible');

  const dur = duration || parseInt(snackbar.dataset.snackbarDuration || '4000', 10);
  const timerData = {
    timerId: null,
    remaining: dur,
    start: Date.now(),
    paused: false
  };

  if (dur > 0) {
    timerData.timerId = setTimeout(() => {
      ocultarSnackbar(snackbar);
    }, dur);
  }

  timers.set(snackbar, timerData);
  snackbar.dispatchEvent(new CustomEvent('md-snackbar-opened', { bubbles: true }));
}

/**
 * Oculta el snackbar con la animación de salida.
 * @param {HTMLElement} snackbar
 */
export function ocultarSnackbar(snackbar) {
  if (!snackbar) return;
  const timerData = timers.get(snackbar);
  if (timerData && timerData.timerId) {
    clearTimeout(timerData.timerId);
    timers.delete(snackbar);
  }

  snackbar.classList.remove('md-snackbar-visible');
  snackbar.dispatchEvent(new CustomEvent('md-snackbar-closed', { bubbles: true }));
}

/**
 * Pausa el temporizador si el usuario interactúa (hover o focus).
 * @param {HTMLElement} snackbar
 */
function pausarTemporizador(snackbar) {
  const timerData = timers.get(snackbar);
  if (!timerData || !timerData.timerId || timerData.paused) return;
  clearTimeout(timerData.timerId);
  timerData.timerId = null;
  timerData.paused = true;
  const elapsed = Date.now() - timerData.start;
  timerData.remaining = Math.max(0, timerData.remaining - elapsed);
}

/**
 * Reanuda el temporizador cuando cesa la interacción.
 * @param {HTMLElement} snackbar
 */
function reanudarTemporizador(snackbar) {
  const timerData = timers.get(snackbar);
  if (!timerData || !timerData.paused || timerData.remaining <= 0) return;
  timerData.paused = false;
  timerData.start = Date.now();
  timerData.timerId = setTimeout(() => ocultarSnackbar(snackbar), timerData.remaining);
}

/**
 * Compatibilidad con la API previa.
 */
export const openSnackbar = mostrarSnackbar;
export const closeSnackbar = ocultarSnackbar;

/**
 * Registra la delegación global en el documento.
 */
export function initSnackbar() {
  // 1. Delegación de clic
  document.addEventListener('click', (evento) => {
    const target = /** @type {Element} */ (evento.target);

    // Botón de disparar/abrir snackbar
    const trigger = target.closest('[data-trigger-snackbar], [data-open-snackbar]');
    if (trigger) {
      const id = trigger.getAttribute('data-trigger-snackbar') || trigger.getAttribute('data-open-snackbar');
      if (id) {
        const snackbar = document.getElementById(id);
        if (snackbar instanceof HTMLElement) {
          mostrarSnackbar(snackbar);
        }
      }
      return;
    }

    // Botón de cerrar snackbar
    const closeBtn = target.closest('[data-close-snackbar]');
    if (closeBtn) {
      const snackbar = closeBtn.closest('.md-snackbar');
      if (snackbar instanceof HTMLElement) {
        ocultarSnackbar(snackbar);
      }
    }
  });

  // 2. Pausa y reanudación ergonómica por hover (mouseenter / mouseleave)
  document.addEventListener('mouseover', (evento) => {
    const target = /** @type {Element} */ (evento.target);
    const snackbar = target.closest('.md-snackbar');
    if (snackbar instanceof HTMLElement) {
      pausarTemporizador(snackbar);
    }
  });

  document.addEventListener('mouseout', (evento) => {
    const target = /** @type {Element} */ (evento.target);
    const snackbar = target.closest('.md-snackbar');
    if (snackbar instanceof HTMLElement) {
      const related = /** @type {Element | null} */ (evento.relatedTarget);
      if (!related || !snackbar.contains(related)) {
        reanudarTemporizador(snackbar);
      }
    }
  });

  // 3. Pausa y reanudación por focus/blur
  document.addEventListener('focusin', (evento) => {
    const target = /** @type {Element} */ (evento.target);
    const snackbar = target.closest('.md-snackbar');
    if (snackbar instanceof HTMLElement) {
      pausarTemporizador(snackbar);
    }
  });

  document.addEventListener('focusout', (evento) => {
    const target = /** @type {Element} */ (evento.target);
    const snackbar = target.closest('.md-snackbar');
    if (snackbar instanceof HTMLElement) {
      const related = /** @type {Element | null} */ (evento.relatedTarget);
      if (!related || !snackbar.contains(related)) {
        reanudarTemporizador(snackbar);
      }
    }
  });
}
