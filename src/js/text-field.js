/* ==========================================================================
   src/js/text-field.js — CONTROLADOR DECLARATIVO PARA TRAILING ACTIONS
   ManGo! App / RDM Next

   Delegación global de clics para los atributos de datos del componente
   Text Field. Cero dependencias externas. Dispara eventos nativos `input`
   y `change` para sincronizar los selectores CSS y devuelve el foco de
   forma accesible.
   ========================================================================== */

export function initTextField() {
  document.addEventListener('click', (event) => {
    // 1. CLEAR ACTION
    const clearBtn = event.target.closest('[data-md-text-field-clear]');
    if (clearBtn) {
      const container = clearBtn.closest('.md-text-field-container');
      if (!container) return;

      const input = container.querySelector('.md-text-field-input');
      if (input && !input.disabled && !input.readOnly) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.focus();
      }
      return;
    }

    // 2. PASSWORD VISIBILITY TOGGLE
    const toggleBtn = event.target.closest('[data-md-text-field-toggle-password]');
    if (toggleBtn) {
      const container = toggleBtn.closest('.md-text-field-container');
      if (!container) return;

      const input = container.querySelector('.md-text-field-input');
      const icon = toggleBtn.querySelector('.md-icon');
      if (!input || input.disabled) return;

      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      if (icon) {
        icon.textContent = isPassword ? 'visibility_off' : 'visibility';
      }

      toggleBtn.setAttribute(
        'aria-label',
        isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
      );

      input.focus();
    }
  });
}
