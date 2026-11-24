/**
 * src/js/scaffold.js — SCAFFOLD (Gestor interactivo de paneles M3)
 * ==========================================================================
 *
 * QUÉ HACE:
 * Gestiona la interactividad de paneles semi-permanentes y colapsables
 * mediante delegación global de eventos sobre disparadores [data-scaffold-pane-toggle].
 * Sincroniza aria-expanded en el disparador y aria-hidden en el panel objetivo.
 *
 * ACCESIBILIDAD:
 * - aria-expanded en el disparador refleja si el panel subordinado está visible.
 * - aria-controls vincula el disparador con el id del panel.
 * - aria-hidden en el panel objetivo oculta o expone el árbol de accesibilidad.
 *
 * EVENTOS:
 * Despacha 'md-scaffold:pane-toggle' con { paneId, expanded, trigger } para
 * integración desacoplada en aplicaciones de producción (ManGo! App).
 * ==========================================================================
 */

let initialized = false;

export function initScaffold() {
  if (initialized) return;
  initialized = true;

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
}
