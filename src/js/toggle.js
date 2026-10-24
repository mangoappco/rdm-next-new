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
   No existe `data-*` en M3 ni en ARIA: la autoría y el estado pesan en el
   mismo atributo, y este archivo lo respeta. Sirve para button e
   icon-button por igual: un solo gancho, no uno por componente.

   ASI QUE EL AUTOR ESCRIBE ESTO
   ------------------------------

   TOGGLE INDIVIDUAL -- un filtro de una sola pieza, el caso del
   icon-button con estado. El boton conmuta a base de escribir su
   `aria-pressed`, sin clase ni data-* que lo distinga: el atributo ES la
   autoria y el estado:

       <button type="button" class="md-icon-button"
               aria-pressed="false" aria-label="Guardar">
         <span class="md-icon-button-icon md-icon" aria-hidden="true">bookmark</span>
         <span class="md-icon-button-touch"></span>
       </button>

   GRUPO EXCLUSIVO -- "Comandas activas / cerradas" en ManGo! App. El
   contenedor lleva `role="group"` y `aria-label` (lo que ARIA llama un
   grupo) y cada boton lleva su `aria-pressed` inicial puesto a mano:

       <div class="md-button-group" role="group" aria-label="Filtro de comandas">
         <button type="button" class="md-button" aria-pressed="true">Activas</button>
         <button type="button" class="md-button" aria-pressed="false">Cerradas</button>
       </div>

   GRUPO MULTIPLE -- cada boton se conmuta solo, sin pisar a sus hermanos.
   La forma es el atributo estandar WAI-ARIA `aria-multiselectable`:

       <div class="md-button-group" role="group"
            aria-label="Formato de texto" aria-multiselectable="true">
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

   Un toggle individual SIN `aria-pressed` es un boton de accion a secas y
   este archivo no lo toca: la puerta ES el atributo, no una clase a
   buen hacer.

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

   SOLO BUTTON, PORQUE ASI SE DECIDIO
   -----------------------------------
   El toggle es un `<button>`. Un `<a aria-pressed>` o un
   `<div aria-pressed>` se IGNORAN: no existe `aria-pressed` sobre
   enlaces, y `closest('button[aria-pressed]')` los descarta de entrada.
   Un `<div role="button" aria-pressed>` seria equivalente, pero el
   `aria-pressed` de un div es un control con estado sin mecanismo de
   conmutacion nativo: queda fuera por la misma razon que en dialog.js.

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
    /* AUTORIA. La puerta es el atributo: `button[aria-pressed]`. Sin el
       atributo en ningun ancestro, el clic no es de este archivo. */
    const objetivo = evento.target instanceof Element
      ? evento.target.closest('button[aria-pressed]')
      : null;
    if (!objetivo) return;

    /* DESACTIVADO. Un boton disabled no recibe click a traves de si
       mismo, pero un click delegado ARRIBA de el el clic llega igual:
       el objetivo del evento es debajo del disabled. */
    if (objetivo.disabled) return;

    /* SALVAGUARDA DE FORMULARIO. Si el autor olvido el `type="button"`,
       el boton es de tipo submit y el clic dispararia el envio del
       formulario. Se frena ANTES de conmutar: con la conmutacion ya en
       marcha, el submit iria detras y recargaria la pantalla. */
    if (objetivo.type === 'submit' && evento.cancelable) {
      evento.preventDefault();
    }

    /* GRUPOS. El grupo valido es el ancestro `.md-button-group`: la clase
       del sistema que los tres casos (exclusivo, multiple, grupo de
       pares) comparten. La clase no pinta nada por si sola: es el
       contenedor que el sistema declara, y `closest()` sobre ella
       funciona con varios grupos en la pagina sin añadir ni un id. */
    const grupo = objetivo.closest('.md-button-group');

    if (grupo) {
      /* MULTIPLE. El atributo `aria-multiselectable="true"` marca grupos
         que admiten mas de una seleccion: cada boton conmuta su propio
         estado sin tocar a los hermanos. */
      const multiple =
        grupo.getAttribute('aria-multiselectable') === 'true';

      if (multiple) {
        conmutar(objetivo);
        return;
      }

      /* EXCLUSIVA. GUARDA TEMPRANA: si esta activo, el estado no cambia.
         El grupo exclusivo NUNCA se queda sin opcion activa, y el lector
         de pantalla no recibe un re-anuncio del mismo valor. */
      if (objetivo.getAttribute('aria-pressed') === 'true') return;

      /* Los hermanos se apagan y el pulsado enciende. */
      grupo.querySelectorAll('button[aria-pressed]').forEach((otro) => {
        otro.setAttribute('aria-pressed', String(otro === objetivo));
      });

      return;
    }

    /* SIN GRUPO: toggle individual, libre de conmutar lo suyo. */
    conmutar(objetivo);
  });
}
