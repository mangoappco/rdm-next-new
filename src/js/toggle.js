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

   LA PUERTA ES UN ATRIBUTO NATIVO
   -------------------------------
   El unico contrato de un boton conmutable es `aria-pressed` (WAI-ARIA):
   `false` desactivado, `true` activado. El lector de pantalla lo anuncia,
   el CSS lo lee para pintar y este archivo es el UNICO que lo escribe.
   No existe `data-*` en M3 ni en ARIA: no hay gancho inventado. Sirve
   para button e icon-button por igual: un solo contrato, no uno por
   componente.

   ASI QUE EL AUTOR ESCRIBE ESTO
   ------------------------------

   TOGGLE INDIVIDUAL -- un filtro de una sola pieza. La autoria y el
   estado viven en el mismo atributo: el boton conmuta a base de
   escribir su `aria-pressed`:

       <button type="button" class="md-icon-button"
               aria-pressed="false" aria-label="Guardar">
         <span class="md-icon-button-icon md-icon" aria-hidden="true">bookmark</span>
         <span class="md-icon-button-touch"></span>
       </button>

   GRUPO EXCLUSIVO -- seleccion mutuamente excluyente, una sola opcion
   activa a la vez. El contenedor lleva `role="group"` y `aria-label`,
   y cada boton lleva su `aria-pressed` inicial puesto a mano:

       <div class="md-button-group" role="group" aria-label="Filtro de comandas">
         <button type="button" class="md-button" aria-pressed="true">Activas</button>
         <button type="button" class="md-button" aria-pressed="false">Cerradas</button>
       </div>

   GRUPO MULTIPLE -- cada boton se conmuta solo, sin pisar a sus hermanos,
   marcado con el atributo estandar WAI-ARIA `aria-multiselectable="true"`:

       <div class="md-button-group" role="group" aria-label="Formato de texto"
            aria-multiselectable="true">
         <button type="button" class="md-icon-button" aria-pressed="true"
                 aria-label="Negrita">...</button>
         <button type="button" class="md-icon-button" aria-pressed="false"
                 aria-label="Cursiva">...</button>
       </div>

   EL ESTADO INICIAL LO PONE EL AUTOR, NO ESTE ARCHIVO
   ---------------------------------------------------
   El primer `aria-pressed` lo escribe el marcado, a mano: `true` en el
   activado de un grupo y `false` en el resto. Este archivo NO recorre el
   documento al cargar para inicializar nada, por la misma razon que el
   dialog no se abre solo: un controlador que reparte estado inicial en
   silencio es un segundo autor no visto, y el marcado es la unica fuente
   de la verdad del sistema.

   Un boton SIN `aria-pressed` no entra en el selector y este archivo no
   lo toca: la puerta ES el atributo, no una clase a buen hacer.

   LA REGLA DE SELECCION EXCLUSIVA: NUNCA VACIO
   --------------------------------------------
   En un grupo exclusivo, clicar el que ya esta activo NO lo desmarca. Y
   no re-escribe `true`: es un RETORNO TEMPRANO. M3 pide que un grupo
   exclusivo tenga una opcion unica, y si el clic desmarcara, el grupo
   quedaria vacio y la pantalla sin filtro. El retorno no es un detalle
   de rendimiento: tambien evita re-anunciar al lector de pantalla el
   mismo estado que ya tiene.

   UN SOLO LISTENER DELEGADO EN `document`
   ---------------------------------------
   La misma apuesta que dialog.js: un `addEventListener('click')` al
   cargar la pagina y `closest()` desde el objetivo del clic. Un boton que
   se añada DESPUES de cargar funciona igual. Y un clic en el glifo de
   Material Symbols --que es un `<span>` hijo del button-- sube por
   closest y alcanza el `button[aria-pressed]`.

   SOLO BUTTON, PORQUE EL SELECTOR LO GARANTIZA
   ---------------------------------------------
   La puerta es `button[aria-pressed]`: el selector SOLO casa con
   elementos `<button>`. Un `<a aria-pressed>` o un `<div aria-pressed>`
   no existen en ARIA y no casan aqui. No hace falta una comprobacion
   `instanceof` despues: el propio selector la ejecuta de entrada.

   DESACTIVADO: DOS PUERTAS, NO UNA
   ---------------------------------
   `disabled` nativo Y `aria-disabled="true"` se descartan de entrada.
   El disabled nativo no dispara click a traves del boton, PERO un click
   delegado en `document` si llega al objetivo: sin esta guarda, un
   toggle disabled conmutaria igual. El `aria-disabled` no corta el
   evento de click de forma nativa: es advertencia semantica para el
   lector de pantalla, y el motor la respeta.

   type="button" ES REGLA DE AUTORIA, Y AUN ASI HAY SALVAGUARDA
   ------------------------------------------------------------
   La regla de marcado: un toggle ES `type="button"`. El defecto del
   navegador es el contrario: un `<button>` SIN type, dentro de un FORM,
   siendo type="submit" implicito, ENVIA el formulario al clic y recarga
   la pantalla, perdiendo la seleccion y el estado.

   Por eso el archivo mira `btn.type` y en ese caso llama a
   `preventDefault()` antes de conmutar. Es el UNICO sitio de todo el
   archivo que toca el comportamiento del navegador, y su razon es la de
   arriba.

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

/* Un unico listener delegado en `document`, y no uno por boton. Ver la
   nota de la cabecera: la razon es la misma que en dialog.js, un boton
   que se anada despues de cargar funciona sin volver a registrar. */
export function registrar() {
  document.addEventListener('click', (event) => {
    /* AUTORIA. La puerta es el atributo: `button[aria-pressed]`. Sin el
       atributo en ningun ancestro, el clic no es de este archivo. */
    const btn = event.target.closest('button[aria-pressed]');
    if (!btn || btn.disabled || btn.getAttribute('aria-disabled') === 'true') return;

    /* SALVAGUARDA DE FORMULARIO. Un `<button>` conexion submit implicito
       enviaria el formulario antes de conmutar: se frena ANTES. */
    if (btn.type === 'submit') event.preventDefault();

    const group = btn.closest('.md-button-group');

    if (group) {
      /* MULTIPLE. El atributo `aria-multiselectable="true"` marca grupos
         que admiten mas de una seleccion: cada boton conmuta su propio
         estado sin tocar a los hermanos. */
      const isMulti = group.getAttribute('aria-multiselectable') === 'true';
      if (isMulti) {
        const isPressed = btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-pressed', String(!isPressed));
      } else {
        /* EXCLUSIVA. GUARDA TEMPRANA: si esta activo, el estado no
           cambia. El grupo exclusivo NUNCA queda sin opcion activa, y el
           lector de pantalla no recibe un re-anuncio del mismo valor. */
        if (btn.getAttribute('aria-pressed') === 'true') return;

        /* Los hermanos se apagan y el pulsado enciende. */
        const siblings = group.querySelectorAll('button[aria-pressed]');
        siblings.forEach((sibling) => {
          sibling.setAttribute('aria-pressed', String(sibling === btn));
        });
      }
    } else {
      /* SIN GRUPO: toggle individual, libre de conmutar lo suyo. */
      const isPressed = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', String(!isPressed));
    }
  });
}
