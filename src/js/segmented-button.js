/* ==========================================================================
   src/js/segmented-button.js — SEGMENTED BUTTON (capa de comportamiento)
   ==========================================================================

   QUE HACE ESTE ARCHIVO, Y QUE NO
   -------------------------------
   La seleccion del segmented button sigue siendo CSS. Las reglas que pintan
   el marcado estan en `3-components/segmented-button.css` --la clase
   `md-segmented-button-item-selected`--. Color, tinte, bordes y costura no
   se tocan aqui.

   Este archivo solo pone en marcha lo que el CSS no puede: mover la clase
   seleccionada de un segmento a otro y conmutar la de un grupo multi. El
   CSS pinta el estado; aqui se decide cuando cambia.

   EL ESTADO TIENE DOS CARAS, Y EL MOTOR ESCRIBE LAS DOS
   ------------------------------------------------------
   La clase `md-segmented-button-item-selected` es el dato que el CSS lee,
   y el aria es el anuncio: `aria-checked` en el radiogroup (single-select)
   y `aria-pressed` en el group (multi-select). Cada escritura del motor
   actualiza la clase Y el aria juntos; un desacuerdo entre las dos seria
   el bug silencioso del sistema: pantalla marcada que el lector de pantalla
   anuncia sin marcar. La contraparte del toggle.js: alli el aria era el
   UNICO estado; aqui el dato es doble y el motor lo escribe sincrono.

   EL GANCHO NO ES UN DATA-*: ES EL ROL QUE M3 YA PUBLICA
   -------------------------------------------------------
   Decidido en el par de anatomia: `role="radiogroup"` con `role="radio"`.
   Decidido en el par de multi: `role="group"` con `aria-pressed`. El motor
   no inventa un atributo de autoria nuevo: el rol que el marcado ya lleva
   ES la autoria. Dos condiciones lo acotan para no pisar nada ajeno:

       1. El grupo es un `.md-segmented-button` -- la clase del componente
          existe y la buscan closest() y querySelectorAll().
       2. El segmento es un `<button>` con clase
          `md-segmented-button-item`, y la comprobacion es
          `instanceof HTMLButtonElement` como en toggle.js.

   Un `role="group"` de otro radio o un radiogroup de otro widget no se ven
   tocados: sin la clase del componente, ningun clic es de este archivo.

   LA REGLA DE SELECCION EXCLUSIVA: NUNCA VACIO
   ---------------------------------------------
   Idem que toggle.js: clicar la opcion ya marcada del radiogroup NO la
   desmarca. Un grupo de seleccion excluyente sin seleccion no es un estado
   de ManGo! App ni de M3. La escritura es un no-op y el motor solo
   reparte el roving para no dejar el tabindex a medias.

   FLECHAS Y ROVING TABINDEX, SOLO EN EL RADIOGROUP
   --------------------------------------------------
   El radiogroup es el widget de teclado: ArrowLeft/ArrowRight (y arriba y
   abajo, igual que el patron ARIA), Home y End mueven el foco y SELECCIONAN
   de una vez, con wrap en los extremos, y saltan los segmentos
   deshabilitados. El group multi no lleva flechas: son toggle buttons
   corrientes, con tab order nativo.

   EL ROVING NO SE ESCRIBE AL CARGAR: LLEGA CON LA PRIMERA FLECHA. El
   patron estricto ARIA pide un solo tabstop por grupo --el motor escribe
   el tabindex de todos-- pero escribirlo en la carga dejaria el specimen
   distinto de su snippet: los `tabindex` que el motor anade no estan en el
   HTML copiable. Por eso el roving se reparte desde la PRIMERA flecha (o
   el primer clic): hasta entonces el grupo esta tal cual el snippet, la
   REGLA 11 mide byte a byte, y la divergencia con el patron queda
   escrita aqui y en el template.

   LA SALIDA DEL NAVEGADOR
   -------------------------
   Las flechas y Home/End hacen scroll en una pagina larga: sobre un
   radiogroup del componente, este archivo las reclama y llama a
   `preventDefault()`. Fuera de estos grupos, la tecla viaja libre; nada
   aqui la captura.

   LO QUE ESTE ARCHIVO NO HACE
   ---------------------------
   - No escucha Space ni Enter: en un `<button>` nativo disparan `click`
     y este archivo ya escucha click; un keydown adicional seria doble.
   - No anima nada: el fundido del icono → check y el tinte de seleccion
     son transiciones del CSS (par Expressive del motion.css), y una
     clase nueva que aparece ya dispara el fundido que el CSS declara.
   - No emite eventos propios ni guarda estado en otro sitio: los datos
     son la clase y el aria, quien los lea los lee del DOM.
   - No avisa por consola: un radiogroup sin la clase del componente es
     marcado, no comportamiento.
   ========================================================================== */

/* La lista limpia de un grupo, solo los `<button>` activos: las flechas
   saltan los deshabilitados, como en el patron ARIA del radiogroup. */
function listaActiva(grupo) {
  return Array.from(grupo.querySelectorAll('button.md-segmented-button-item'))
    .filter((segmento) => !segmento.disabled);
}

/* El roving tabindex: la base del grupo con tabindex="0" y el resto con
   "-1". Solo se llama desde una interaccion: ver las notas de FLECHAS y
   ROVING mas arriba. */
function repartirTabindex(grupo, base) {
  listaActiva(grupo).forEach((segmento) => {
    segmento.tabIndex = segmento === base ? 0 : -1;
  });
}

/* La escritura atomica del estado doble: clase en el marcado y aria en el
   anuncio. En el radio la seleccion entera se re-escribe; en el multi solo
   el segmento conmutado. Despues, el roving sigue al nuevo dueno del
   tabstop, que el foco ya le esta llegando. */
function marcarRadio(grupo, marcado) {
  grupo.querySelectorAll('.md-segmented-button-item').forEach((segmento) => {
    const activo = segmento === marcado;
    segmento.classList.toggle('md-segmented-button-item-selected', activo);
    segmento.setAttribute('aria-checked', String(activo));
  });
  repartirTabindex(grupo, marcado);
}

function conmutar(segmento) {
  const activado = segmento.getAttribute('aria-pressed') === 'true';
  segmento.setAttribute('aria-pressed', String(!activado));
  segmento.classList.toggle('md-segmented-button-item-selected', !activado);
}

/* Dos delegaciones en `document`, una de click y una de keydown: un solo
   par de listeners para toda la pagina, como en toggle.js. Un segmento
   que llegue despues de cargar funciona igual. */
export function registrar() {
  document.addEventListener('click', (evento) => {
    const segmento = evento.target instanceof Element
      ? evento.target.closest('.md-segmented-button-item')
      : null;

    /* AUTORIA. El segmento valido es un `<button>` del componente. */
    if (!segmento || !(segmento instanceof HTMLButtonElement)) return;
    if (segmento.disabled) return;

    /* GRUPO. El grupo valido es el ancestro con la clase del componente.
       No pisamos otro grupo: sin la clase, el clic no es de este archivo. */
    const grupo = segmento.closest('.md-segmented-button');
    if (!grupo) return;

    const rol = grupo.getAttribute('role');

    /* SALVAGUARDA DE FORMULARIO, igual que toggle.js. */
    if (segmento.type === 'submit' && evento.cancelable) {
      evento.preventDefault();
    }

    /* SINGLE-SELECT. Nunca vacio: clicar la marcada reparte el tabindex y
       no toca el estado. El clic en otra marca a ella y desmarca las
       demas (ver marcarRadio). Un grupo sin rol no es nuestro. */
    if (rol === 'radiogroup') {
      if (segmento.getAttribute('aria-checked') === 'true') {
        repartirTabindex(grupo, segmento);
        return;
      }
      marcarRadio(grupo, segmento);
      return;
    }

    /* MULTI-SELECT. Cada segmento conmuta lo suyo, sin pisar hermanos. */
    if (rol === 'group') {
      conmutar(segmento);
    }
  });

  document.addEventListener('keydown', (evento) => {
    const teclas = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (!teclas.includes(evento.key)) return;

    const segmento = evento.target instanceof Element
      ? evento.target.closest('.md-segmented-button-item')
      : null;
    if (!segmento || !(segmento instanceof HTMLButtonElement)) return;
    if (segmento.disabled) return;

    const grupo = segmento.closest('.md-segmented-button');
    if (!grupo || grupo.getAttribute('role') !== 'radiogroup') return;

    const lista = listaActiva(grupo);
    if (lista.length === 0) return;

    /* El destino, con wrap y saltando los deshabilitados: la lista ya
       viene limpia de filtro, y el modulo aritmetico del indice te envia
       del ultimo al primero y del primero al ultimo. */
    const indice = lista.indexOf(segmento);
    let destino;
    if (evento.key === 'Home') {
      destino = lista[0];
    } else if (evento.key === 'End') {
      destino = lista[lista.length - 1];
    } else {
      const paso = evento.key === 'ArrowLeft' || evento.key === 'ArrowUp' ? -1 : 1;
      destino = lista[(indice + paso + lista.length) % lista.length];
    }

    if (!destino) return;
    evento.preventDefault();

    /* Estado primero, foco despues: cuando el foco llega, la seleccion ya
       esta escrita y el lector de pantalla anuncia la marca nueva con el
       segmento. El focus() no cambia nada mas: el CSS pinta la clase que
       marcarRadio acaba de escribir. */
    marcarRadio(grupo, destino);
    destino.focus();
  });
}
