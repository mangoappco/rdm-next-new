/* ==========================================================================
   src/js/chip-filter.js — FILTER CHIPS (capa de comportamiento)
   ==========================================================================

   QUE HACE ESTE ARCHIVO, Y QUE NO
   -------------------------------
   La seleccion del filter chip sigue siendo CSS. Las reglas que pintan el
   estado estan en `3-components/chip.css` --la clase
   `md-chip-selected` y el atributo `aria-selected="true"`--. Color, tinte,
   bordes y glifo check no se tocan aqui.

   Este archivo solo pone en marcha lo que el CSS no puede: conmutar el
   estado de seleccion de cada chip de forma independiente (multi-filter).
   El CSS pinta el estado; aqui se decide cuando cambia.

   EL ESTADO TIENE DOS CARAS, Y EL MOTOR ESCRIBE LAS DOS
   ------------------------------------------------------
   La clase `md-chip-selected` es el dato que el CSS lee, y el aria es el
   anuncio: `aria-selected="true|false"`. Cada escritura del motor
   actualiza la clase Y el aria juntos; un desacuerdo entre las dos seria
   el bug silencioso del sistema: pantalla marcada que el lector de pantalla
   anuncia sin marcar.

   EL GANCHO NO ES UN DATA-* INVENTADO: ES EL ATRIBUTO QUE M3 YA PUBLICA
   --------------------------------------------------------------------
   Decidido en el par de anatomia: `aria-selected="true|false"` en el
   `<button>` del chip. El motor no inventa un atributo de autoria nuevo:
   el atributo que el marcado ya lleva ES la autoria. Dos condiciones lo
   acotan para no pisar nada ajeno:

        1. El grupo es un `[data-chip-filter-group]` -- el contenedor del
           conjunto de filtros.
        2. El segmento es un `<button>` con clase `md-chip`.

   Un `<button>` de otro widget o un grupo sin el atributo de datos no se
   ven tocados: sin `[data-chip-filter-group]`, ningun clic es de este
   archivo.

   SELECCION MULTIPLE INDEPENDIENTE
   --------------------------------
   Cada chip conmuta su propio estado sin afectar al resto del grupo.
   Clicar el ya marcado lo desmarca: un filtro individual puede estar
   activado o desactivado, y el grupo permite n marcas a la vez. Esto es
   exactamente lo que diferencia al filter chip del segmented button:
   aqui no hay exclusividad, ni nunca queda el grupo sin seleccion.

   MULTIPLE SELECTION: UNO O MAS A LA VEZ
   --------------------------------------
   El grupo de filtros puede tener cero, uno o varios marcados. No hay
   restriccion de exclusividad: cada segmento es un toggle button propio.

   FLECHAS Y TECLADO: NADA AQUI
   ----------------------------
   Cada segmento es un `<button type="button">` nativo. El navegador ya
   dispara `click` al presionar Enter o Espacio, y este archivo ya escucha
   click; un listener de `keydown` adicional seria doble activacion.
   Nada aqui captura flechas: el tab order nativo del navegador basta.

   LO QUE ESTE ARCHIVO NO HACE
   ---------------------------
   - No escucha Space ni Enter: en un `<button>` nativo disparan `click`
     y este archivo ya escucha click; un keydown adicional seria doble.
   - No anima nada: el aparicion del glifo check y el tinte de seleccion
     son transiciones del CSS, y una clase nueva que aparece ya dispara
     el fundido que el CSS declara.
   - No emite eventos propios ni guarda estado en otro sitio: los datos
     son la clase y el aria, quien los lea los lee del DOM.
   - No avisa por consola: un grupo sin el atributo de datos es marcado,
     no comportamiento.
   ========================================================================== */

/* La escritura atomica del estado doble: clase en el marcado y aria en el
   anuncio. Se escribe siempre en los dos sitios juntos. */
function conmutarChip(segmento) {
  const activado = segmento.getAttribute('aria-selected') === 'true';
  const nuevoEstado = !activado;
  segmento.setAttribute('aria-selected', String(nuevoEstado));
  segmento.classList.toggle('md-chip-selected', nuevoEstado);

  /* El glifo check vive como primer hijo del chip cuando esta marcado. */
  const checkExistente = segmento.querySelector('.md-chip > .md-icon');
  if (nuevoEstado && !checkExistente) {
    const check = document.createElement('span');
    check.className = 'md-icon md-icon-wght-light';
    check.setAttribute('aria-hidden', 'true');
    check.textContent = 'check';
    segmento.insertBefore(check, segmento.firstChild);
  } else if (!nuevoEstado && checkExistente) {
    checkExistente.remove();
  }
}

/* Una delegacion en `document` de click: un solo listener para toda la
   pagina. Un chip que llegue despues de cargar funciona igual. */
export function registrar() {
  document.addEventListener('click', (evento) => {
    const chip = evento.target instanceof Element
      ? evento.target.closest('.md-chip')
      : null;

    /* AUTORIA. El chip valido es un <button> del componente. */
    if (!chip || !(chip instanceof HTMLButtonElement)) return;
    if (chip.disabled) return;

    /* GRUPO. El grupo valido es el ancestro con el atributo de datos.
       No pisamos otro grupo: sin el atributo, el clic no es de este
       archivo. */
    const grupo = chip.closest('[data-chip-filter-group]');
    if (!grupo) return;

    conmutarChip(chip);
  });
}
