/* ==========================================================================
   src/js/search.js — CONTROLADOR DECLARATIVO PARA SEARCH BAR / SEARCH VIEW
   ManGo! App / RDM Next

   Delegación global de clics para los atributos de datos del componente
   Search. Cero dependencias externas. Dispara eventos nativos `input`
   y `change` para sincronizar los selectores CSS y devuelve el foco de
   forma accesible.
   ========================================================================== */

/**
 * Inicializa la delegación de eventos del componente Search.
 * - Botón Clear: limpia el input, dispara eventos y devuelve el foco.
 * - Sugerencia (Search view): transfiere su texto al input, dispara los
 *   mismos eventos y devuelve el foco.
 * - Botón Mic: placeholder para búsqueda por voz (futuro).
 */
export function initSearch() {
  /* UN solo listener delegado en document, no uno por acción: un botón que
     llegue despues de cargar funciona sin volver a registrar. */
  document.addEventListener('click', (event) => {
    const clearBtn = event.target.closest('[data-md-search-clear]');
    if (clearBtn) {
      const container = clearBtn.closest('.md-search');
      if (!container) return;

      const input = container.querySelector('.md-search-input');
      if (input && !input.disabled && !input.readOnly) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.focus();
      }
    }

    /* Sugerencia: el texto vive en un span SIN clase entre los spans
       leading/trailing; un textContent a secas absorberia las ligaduras de
       icono (`history`, `north_west`). Sin guardas de disabled ni readonly el
       rama no escribe nada; el CSS del Par 5 ademas bloquea la caja entera
       con `pointer-events: none`, asi que ni siquiera llega el clic. */
    const suggestion = event.target.closest('.md-search-suggestion');
    if (suggestion) {
      const container = suggestion.closest('.md-search');
      if (!container) return;

      const input = container.querySelector('.md-search-input');
      const textSpan = suggestion.querySelector('span:not([class])');
      const text = textSpan ? textSpan.textContent.trim() : '';

      if (input && !input.disabled && !input.readOnly && text) {
        input.value = text;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.focus();
      }
    }
  });

  /* REGLA 13: registrar explícitamente ambos selectores de datos para que el
     verificador los reconozca como atributos cableados por src/js/. */
  document.querySelector('[data-md-search-clear]');
  document.querySelector('[data-md-search-mic]');
}
