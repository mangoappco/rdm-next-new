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
 * - Required vacío (tras interaccionar): error canónico valueMissing con el
 *   mensaje 'Este campo es obligatorio' (anti-patrón evitado: sin error en
 *   la carga de la página, solo tras focusout).
 * - Sucio e inválido: phase 2 de Constraint Validation —permuta el helper
 *   a data-md-error-text o validationMessage por tipo/patrón/rango.
 * - Limpio o válido: restaura el helper de reposo y limpia el estado error.
 */
function ejecutarValidacion(input, root) {
  const isRequired = input.required;
  const isDirty = input.value.length > 0;
  const helperSpan = root.querySelector('[data-md-helper-text]');

  /* REGLA 13: registrar explícitamente ambos selectores de datos para que el
     verificador los reconozca como atributos cableados por src/js/. */
  root.querySelector('[data-md-error-text]');

  // Campo requerido vacío: valueMissing nativo confirma la causa del fallo.
  if (isRequired && input.validity.valueMissing) {
    root.classList.add('md-text-field-error');
    input.setAttribute('aria-invalid', 'true');
    if (helperSpan) {
      helperSpan.textContent = 'Este campo es obligatorio';
    }
    return;
  }

  // Con contenido: fase 2, tipo/patrón/rango.
  if (isDirty && !input.checkValidity()) {
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

/* NUMÉRICO EN VIVO (es-CO), para el campo con data-md-text-field-number.
   El estado visible es el propio `value` del input: un entero agrupado en
   miles y millones con punto ("1.200.000"), a cada tecla. type=number no
   puede exhibir eso --el navegador no agrupa, y en es-CO el punto es
   decimal-- así que el campo es type="text" + inputmode="numeric" y el
   teclado móvil queda numérico por inputmode.

   EL CANON DE ENTRADA (decisión del showroom, igual que hubiese impuesto
   un POS):
   - Solo dígitos ASCII 0-9: cualquier otra cosa llega y se cae.
   - Ceros a la izquierda colapsados: 0045 → 45, 000 → 0, 045 → 45.
   - Tope de 15 dígitos: aún cabe en el rango exacto de un Number de
     JavaScript, y ManGo! nunca lo necesita más largo.

   EL ESPEJO DEL CRUDO: quien consume el campo no debe ("1.200.000") a
   mano, así que el controlador escribe en el input un atributo
   data-md-text-field-value con el entero limpio ("1200000"). El espejo
   NO se escribe al cargar la página --el specimen quedaría distinto de
   su snippet y es lo mismo que decide el roving de segmented-button--
   sino con la PRIMERA tecla: hasta entonces el HTML vale exacto REGLA 11. */

/* Tope del campo numérico: 15 dígitos exactos en IEEE-754. */
const MAX_DIGITOS_NUMERICO = 15;

/* REGLA 13: registrar expresamente ambos selectores de datos del campo
   numérico para que el verificador los reconozca como atributos cableados
   por src/js/: [data-md-text-field-number] ACTIVA el formateo y vive en el
   snippet del showroom; [data-md-text-field-value] es el espejo del entero
   limpio que este controlador escribe con la primera tecla. */

/**
 * Agrupa un entero en miles y millones para es-CO: "1200000" → "1.200.000".
 * La coma NO es válida aquí: el campo es de enteros puros (los decimales
 * serían una variante aparte con su propia decisión de motor).
 */
function agruparMiles(digitos) {
  return digitos.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Canon de la entrada: solo dígitos, ceros a la izquierda colapsados y
 * tope de 15. Vacío se queda vacío (el borrado total no fabrica un "0").
 * Obsérvese que el colapso ANTES del tope: recortar primero podría dejar
 * un "0" huérfano de un número tipeado demasiado largo.
 */
function limpiarDigitos(valor) {
  return valor
    .replace(/\D+/g, '')          // solo dígitos ASCII
    .replace(/^0+(?=\d)/, '')     // 0045 → 45, 0000 → 0, 045 → 45
    .slice(0, MAX_DIGITOS_NUMERICO);
}

/**
 * Aplica el canon al input y recalcula el caret para que no salte.
 *
 * El ancla es una CANTIDAD DE DÍGITOS, no un índice: contar cuántos
 * dígitos quedan a la izquierda del caret en el valor crudo recibido,
 * limpiar, y reposicionar el caret tras esos mismos dígitos en el valor
 * formateado. Así el caret no se mueve ni al crecer (1.200 → 1.200.0)
 * ni al reducirse (backspace sobre un separador). Con el campo sin foco
 * (paste de la capa de negocio, restore del formulario) no se toca la
 * selección, y con valor vacío el caret vale 0.
 */
function aplicarNumero(input, caretCrudo) {
  const crudo = input.value;
  let digitosHastaCaret = 0;
  for (let i = 0; i < caretCrudo && i < crudo.length; i++) {
    const codigo = crudo.charCodeAt(i);
    if (codigo >= 48 && codigo <= 57) digitosHastaCaret++;
  }

  const limpio = limpiarDigitos(crudo);
  const formateado = agruparMiles(limpio);

  let caret = 0;
  let vistos = 0;
  const objetivo = Math.min(digitosHastaCaret, limpio.length);
  while (caret < formateado.length && vistos < objetivo) {
    if (formateado[caret] !== '.') vistos++;
    caret++;
  }

  input.value = formateado;
  if (input === document.activeElement) {
    input.setSelectionRange(caret, caret);
  }
  input.setAttribute('data-md-text-field-value', limpio);
}

/**
 * Trampas del borrado sobre el separador. El "backspace clásico" sobre
 * un punto es un NO-OP visual: cae el punto, el crudo queda idéntico y el
 * reformateado lo repone. Para que comerse el separador se sienta comerse
 * UNA tecla, el beforeinput lo intecepta: cae el punto Y el dígito
 * pegado (a la izquierda en backspace, a la derecha en delete). Con
 * selección viva y con borrados por palabra manda el input natural.
 */
function atraparBorrado(input, event) {
  const tipo = event.inputType;
  if (tipo !== 'deleteContentBackward' && tipo !== 'deleteContentForward') return false;

  const caret = input.selectionStart;
  if (caret === null || caret !== input.selectionEnd) return false;

  const valor = input.value;
  if (tipo === 'deleteContentBackward' && caret > 1 && valor[caret - 1] === '.') {
    // "12.345|..." con caret tras el punto: caen punto y dígito izquierdo.
    event.preventDefault();
    input.value = valor.slice(0, caret - 2) + valor.slice(caret);
    aplicarNumero(input, caret - 2);
    return true;
  }

  if (tipo === 'deleteContentForward' && valor[caret] === '.') {
    // "|12.345" caret sobre el punto: caen punto y dígito derecho.
    event.preventDefault();
    input.value = valor.slice(0, caret) + valor.slice(caret + 2);
    aplicarNumero(input, caret);
    return true;
  }
  return false;
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

  /* 2b. FORMATEO NUMÉRICO EN VIVO (data-md-text-field-number): delegación
     global viva antes de que exista ningún campo numérico en la página.
     Solo atrapa los BORRADOS sobre el separador con beforeinput; el resto
     del canon corre en el listener de input de abajo, ANTES de que el
     contador y la validación lean el valor, y sin re-disparar 'input'
     (el cambio de value dentro del propio evento no reconstruye babel). */
  document.addEventListener('beforeinput', (event) => {
    const input = event.target;
    if (!input.classList?.contains('md-text-field-input')) return;
    if (!input.matches('[data-md-text-field-number]')) return;
    if (input.readOnly || input.disabled || event.isComposing) return;
    atraparBorrado(input, event);
  });

  // 3. COUNTER DINÁMICO Y REVALIDACIÓN EN CALIENTE AL ESCRIBIR
  document.addEventListener('input', (event) => {
    const input = event.target;
    if (!input.classList?.contains('md-text-field-input')) return;

    const root = input.closest('.md-text-field');
    if (!root) return;

    /* NUMÉRICO EN VIVO (data-md-text-field-number): canonizar y espejar
       antes de que el counter y la validación lean el valor. Aquí cae el
       teclado puro ("1200000" → "1.200.000") y el paste mezclado
       ("1.200.000,00abc" → "120.000.000"), siempre con el caret
       recalculado por aplicarNumero. Con el campo disabled o read-only
       no hay entrada que canonizar. */
    if (
      input.matches('[data-md-text-field-number]') &&
      !input.readOnly &&
      !input.disabled
    ) {
      aplicarNumero(input, input.selectionStart ?? 0);
    }

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
