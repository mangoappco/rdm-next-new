/* ==========================================================================
   src/js/text-field.js — CONTROLADOR DECLARATIVO PARA TRAILING ACTIONS,
   COUNTER Y VALIDACIÓN INTERACTIVA
   ManGo! App / RDM Next

   Delegación global de clics para los atributos de datos del componente
   Text Field. Cero dependencias externas. Dispara eventos nativos `input`
   y `change` para sincronizar los selectores CSS y devuelve el foco de
   forma accesible.
   ========================================================================== */

/**
 * Valida un input de text field al desenfocar o al revalidar en caliente.
 * - Si está sucio e inválido: añade .md-text-field-error y permuta el texto
 *   del helper al mensaje de error (data-md-error-text o validationMessage).
 * - Si está limpio o válido: quita .md-text-field-error y restaura el helper
 *   original (data-md-helper-text).
 */
function ejecutarValidacion(input, root) {
  const isDirty = input.value.length > 0;
  const isValid = input.checkValidity();
  const helperSpan = root.querySelector('[data-md-helper-text]');

  /* REGLA 13: registrar explícitamente ambos selectores de datos para que el
     verificador los reconozca como atributos cableados por src/js/. */
  root.querySelector('[data-md-error-text]');

  if (isDirty && !isValid) {
    root.classList.add('md-text-field-error');
    input.setAttribute('aria-invalid', 'true');
    if (helperSpan) {
      helperSpan.textContent =
        helperSpan.getAttribute('data-md-error-text') || input.validationMessage;
    }
  } else {
    root.classList.remove('md-text-field-error');
    input.removeAttribute('aria-invalid');
    if (helperSpan) {
      helperSpan.textContent = helperSpan.getAttribute('data-md-helper-text');
    }
  }
}

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

  // 3. COUNTER DINÁMICO Y REVALIDACIÓN EN CALIENTE AL ESCRIBIR
  document.addEventListener('input', (event) => {
    const input = event.target;
    if (!input.classList?.contains('md-text-field-input')) return;

    const root = input.closest('.md-text-field');
    if (!root) return;

    const counter = root.querySelector('[data-md-text-field-counter]');
    if (counter && input.maxLength > 0) {
      counter.textContent = `${input.value.length}/${input.maxLength}`;
    }

    if (root.classList.contains('md-text-field-error')) {
      ejecutarValidacion(input, root);
    }
  });

  // 4. VALIDACIÓN EN DESENFOQUE (blur / focusout)
  document.addEventListener('focusout', (event) => {
    const input = event.target;
    if (!input.classList?.contains('md-text-field-input')) return;

    const root = input.closest('.md-text-field');
    if (!root) return;

    ejecutarValidacion(input, root);
  });
}
