/* ==========================================================================
   src/js/chip-input.js — INPUT CHIPS (capa de comportamiento)
   ==========================================================================

   QUE HACE ESTE ARCHIVO, Y QUE NO
   -------------------------------
   El input chip de M3 permite remover una entrada seleccionada por la
   persona (etiqueta, modificador de comanda, etc.) mediante el botón de
   cierre. La apariencia y las medidas estan en `3-components/chip.css`;
   este archivo solo pone en marcha la remoción del DOM y la reubicación
   del foco.

   EL GANCHO ES EL ATRIBUTO DE DATOS DEL GRUPO
   -------------------------------------------
   El contenedor lleva `data-chip-input-group`. El motor filtra que el
   chip que contiene el botón de cierre pertenezca a ese grupo, de modo
   que los specimens estáticos del Par 6 (sin el atributo) no se ven
   afectados.

   EL BOTÓN DE CIERRE ES UN `<button>` NATIVO
   -------------------------------------------
   El cierre es `<button type="button" class="md-chip-close">`. El
   navegador ya dispara `click` al presionar Enter o Espacio; este archivo
   solo escucha `click`, sin listeners de `keydown` adicionales que
   dupliquen la activación.

   LO QUE ESTE ARCHIVO NO HACE
   ---------------------------
   - No escucha Space ni Enter: el `<button>` nativo las convierte en
     `click` y este archivo ya escucha click; un keydown sería doble.
   - No anima nada: la salida del chip es una transición del CSS si la
     hubiera; aquí solo se elimina el nodo del DOM.
   - No emite eventos propios ni guarda estado en otro sitio.
   ========================================================================== */

export function registrar() {
  document.addEventListener('click', (evento) => {
    const botonCierre = evento.target instanceof Element
      ? evento.target.closest('.md-chip-close')
      : null;

    if (!botonCierre || !(botonCierre instanceof HTMLButtonElement)) return;

    const chip = botonCierre.closest('.md-chip');
    if (!chip) return;

    /* ACOTAR AL GRUPO INTERACTIVO: sin data-chip-input-group, el clic
       no es de este archivo (protege los specimens estaticos del Par 6). */
    const grupo = chip.closest('.md-chip-set[data-chip-input-group]');
    if (!grupo) return;

    /* Evitar que el cierre propague al contenedor del chip. */
    evento.stopPropagation();

    /* Reubicar el foco antes de eliminar el chip. */
    const todos = [...grupo.querySelectorAll('.md-chip')];
    const indice = todos.indexOf(chip);
    const siguiente = todos[indice + 1] ?? todos[indice - 1];

    chip.remove();

    if (siguiente) {
      siguiente.focus();
    } else if (grupo) {
      /* El grupo quedo vacío: asignar tabindex temporal para poder enfocar
         y no perder el foco en el <body>. */
      grupo.setAttribute('tabindex', '-1');
      grupo.focus();
    }
  });
}
