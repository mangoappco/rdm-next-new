/* ==========================================================================
   src/js/toggle.js — TOGGLE (capa de comportamiento)
   ==========================================================================

   QUE HACE ESTE ARCHIVO, Y QUE NO
   -------------------------------
   El toggle sigue siendo CSS. Las reglas que pintan el seleccionado están
   en `3-components/icon-button.css` --seccion SELECCIONADO-- y las del
   button entrarán en `button.css`. Color, forma y relleno no se tocan aqui.

   Este archivo solo pone en marcha lo que el CSS no puede: conmutar
   `aria-pressed`, y decidir cuando la conmutacion es exclusiva. El CSS
   pinta el estado; aqui se decide cuando cambia.

   LA PUERTA SON DOS ATRIBUTOS
   ---------------------------
   Como en dialog.js, el orden de lectura es AUTORIA -> ESTADO:

       `data-toggle`          el atributo de AUTORIA. Dice "este boton
                              conmuta". Sin el, no hay nada que leer y el
                              boton es de accion a secas.
       `aria-pressed`         el atributo de ESTADO. Lo anuncia el lector de
                              pantalla, lo lee el CSS y es lo UNICO que este
                              archivo escribe. Sirve para button e
                              icon-button por igual: un solo gancho, no uno
                              por componente.

   ASI QUE EL AUTOR ESCRIBE ESTO
   ------------------------------

   TOGGLE INDIVIDUAL -- un filtro de una sola pieza, el caso del
   icon-button con estado:

       <button type="button" class="md-icon-button" data-toggle
               aria-pressed="false" aria-label="Guardar">
         <span class="md-icon-button-icon md-icon" aria-hidden="true">bookmark</span>
         <span class="md-icon-button-touch"></span>
       </button>

   GRUPO EXCLUSIVO -- "Comandas activas / cerradas" en ManGo! App. El
   contenedor lleva `data-toggle-group` a secas y los botones llevan el
   `data-toggle` de siempre, con su aria-pressed inicial puesto a mano:

       <div class="md-button-group" data-toggle-group>
         <button type="button" class="md-button" data-toggle aria-pressed="true">Activas</button>
         <button type="button" class="md-button" data-toggle aria-pressed="false">Cerradas</button>
       </div>

   GRUPO MULTIPLE -- los filtros "Para llevar / En mesa": cada boton se
   conmuta solo, sin pisar a sus hermanos. Dos formas de marcarlo, las DOS
   validas y equivalentes para este archivo:

       <div class="md-button-group" data-toggle-group="multi"> ...
       <div class="md-button-group" data-toggle-group aria-multiselectable="true"> ...

   `aria-multiselectable` es la forma ARIA y conviene al autor que ya lleva
   atributos ARIA en el bloque; `data-toggle-group="multi"` es la forma de
   los data-* del sistema. Las dos existen porque una cuarta convencion no
   cabe en este archivo.

   EL ESTADO INICIAL LO PONE EL AUTOR, NO ESTE ARCHIVO
   ---------------------------------------------------
   El primer `aria-pressed` lo escribe el marcado, a mano: `true` en el
   activado de un grupo y `false` en el resto. Este archivo NO recorre el
   documento al cargar para inicializar nada, por la misma razon que el
   dialog no se abre solo: un controlador que reparte estado inicial en
   silencio es un segundo autor no visto, y el marcado es la unica fuente
   de la verdad del sistema.

   Un toggle individual SIN `aria-pressed` se lee como desactivado, que
   coincide con lo que ya pinta el CSS: su estado unselected sale de
   `:not([aria-pressed="true"])`. En el primer clic el atributo aparece.

   LA REGLA DE SELECCION EXCLUSIVA: NUNCA VACIO
   --------------------------------------------
   En un grupo exclusivo, clicar el que ya esta activo NO lo desmarca. Es
   una decision, no un detalle: M3 pide que un grupo exclusivo tenga una
   opcion unica, y si el clic desmarcara, el grupo quedaria vacio y la
   pantalla sin filtro. Por eso el clic en el activo re-escribe `true`:
   escribir el mismo valor es un suceso nulo en el DOM y no re-anuncia nada
   al lector de pantalla.

   UN SOLO LISTENER DELEGADO EN `document`
   ---------------------------------------
   La misma apuesta que dialog.js: un `addEventListener('click')` al
   cargar la pagina y `closest()` desde el objetivo del clic. Un boton que
   se añada DESPUES de cargar funciona igual. Y un clic en el glifo de
   Material Symbols --que es un `<span>` hijo del button-- sube por
   closest y alcanza el `button[data-toggle]`.

   SOLO BUTTON, PORQUE ASI SE DECIDIO
   -----------------------------------
   El toggle es un `<button>` con estado. Un `<a data-toggle>` o un
   `<div role="button" data-toggle>` se IGNORAN: equivalente tecnicamente,
   pero la ratificacion de la API es estricta y el `aria-pressed` de un
   enlace no vale lo que el de un control con estado. La comprobacion es
   `instanceof HTMLButtonElement` y no un selector fino en closest(), por
   el mismo motivo que en dialog.js separan autoria y uso: el atributo
   marca, el uso decide.

   type="button" ES REGLA DE AUTORIA, Y AUN ASI HAY SALVAGUARDA
   ------------------------------------------------------------
   La regla de marcado: un toggle ES `type="button"`. El defecto del
   navegador es el contrario: un `<button>` SIN type, dentro de un FORM,
   siendo type="submit" implicito, ENVIA el formulario al clic y recarga
   la pantalla, perdiendo la seleccion y el estado.

   Por eso el archivo mira `boton.type` --la propiedad, no el atributo:
   devuelve "submit" tanto si el autor lo escribio como si no puso
   nada-- y en ese caso llama a `preventDefault()` antes de conmutar. Es
   el UNICO sitio de todo el archivo que toca el comportamiento del
   navegador, y su razon es la de arriba. La propiedad `cancelable` del
   evento comprueba que el navegador lo permita, y un formulario fuera de
   un `<form>` no pasa nada: `preventDefault` sobre un boton sin
   formulario no tiene efecto ni efecto adverso.

   LO QUE ESTE ARCHIVO NO HACE
   ---------------------------
   - No escucha teclado: Space y Enter ya disparan `click` en un button
     nativo, y añadir listeners de keydown seria DOBLE conmutacion.
   - No anima nada: el CSS no lleva transicion en el seleccionado, por
     decision del sistema.
   - No emite eventos propios ni guarda estado en otro sitio: el estado
     ES `aria-pressed`, quien lo lea lo lee del DOM.
   - No avisa por consola: es un fallo de autoria que se ve leyendo el
     marcado, igual que en dialog.js.

   LO QUE NO HAY QUE COPIAR DE AQUI
   ---------------------------------
   Igual que dialog.js: sin framework, sin clases, sin instanciar nada.
   Se registra una vez al cargar la pagina y lee el marcado. Quien use la
   libreria importa `src/js/main.js` y ya.
   ========================================================================== */

/* Conmutacion individual. Lee el estado y apunta el contrario.
   `null` (atributo ausente) se lee como desactivado y coincide con lo
   que el CSS pinta hasta el primer clic. */
function conmutar(boton) {
  const activado = boton.getAttribute('aria-pressed') === 'true';
  boton.setAttribute('aria-pressed', String(!activado));
}

/* Un unico listener delegado en `document`, y no uno por boton. Ver la
   nota de la cabecera: la razon es la misma que en dialog.js, un boton
   que se anada despues de cargar funciona sin volver a registrar. */
export function registrar() {
  document.addEventListener('click', (evento) => {
    /* AUTORIA. closest() sube desde el objetivo del clic: un clic en el
       glifo del icon-button alcanza el button igualmente. Sin
       [data-toggle] en ningun ancestro, el clic no es de este archivo. */
    const objetivo = evento.target instanceof Element
      ? evento.target.closest('[data-toggle]')
      : null;
    if (!objetivo) return;

    /* CIFRAS. Solo `<button>` conmuta (ver la nota SOLO BUTTON). */
    if (!(objetivo instanceof HTMLButtonElement)) return;

    /* SALVAGUARDA DE FORMULARIO. Si el autor olvido el `type="button"`,
       el boton es de tipo submit y el clic dispararia el envio del
       formulario. Se frena ANTES de conmutar: con la conmutacion ya en
       marcha, el submit iria detras y recargaria la pantalla. */
    if (objetivo.type === 'submit' && evento.cancelable) {
      evento.preventDefault();
    }

    /* GRUPO. El grupo valido es el ancestro mas cercano con
       `data-toggle-group`, igual que dialog.js cerraba el dialog en el que
       ESA boton esta con `closest('dialog')`: el mismo marcado sirve con
       varios grupos en la pagina sin añadir ni un id. */
    const grupo = objetivo.closest('[data-toggle-group]');

    if (grupo) {
      /* MULTIPLE. Dos formas equivalentes de marcarlo (ver la cabecera):
         `aria-multiselectable="true"` o `data-toggle-group="multi"`. La
         segunda es un ATRIBUTO con valor, no un booleano a secas: `a
         secas` por defecto es exclusivo, y por eso la comprobacion es
         exactamente la cadena "multi" y no la presencia. */
      const multiple =
        grupo.getAttribute('aria-multiselectable') === 'true' ||
        grupo.getAttribute('data-toggle-group') === 'multi';

      if (multiple) {
        conmutar(objetivo);
        return;
      }

      /* EXCLUSIVA. El clic se activa y los hermanos `button[data-toggle]`
         del GRUPO se desactivan de golpe. Tres casos en una sola linea:
         clic en inactivo --se activa--, clic en el ya activo --re-escribe
         `true`, y nunca vacio--, y ausencia inicial --pasa a `true` y a
         partir de ahi hay estado.

         El selector es `button[data-toggle]` y no `[data-toggle]`: los
         hijos que no son boton no son electrones de este sistema (ver la
         nota SOLO BUTTON) y no reciben atributos que ellos no declaran. */
      grupo.querySelectorAll('button[data-toggle]').forEach((otro) => {
        otro.setAttribute('aria-pressed', String(otro === objetivo));
      });

      return;
    }

    /* SIN GRUPO: toggle individual, libre de conmutar lo suyo. */
    conmutar(objetivo);
  });
}
