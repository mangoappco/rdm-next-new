/* ==========================================================================
   src/js/dialog.js — DIALOG (capa de comportamiento)
   ==========================================================================

   QUE HACE ESTE ARCHIVO, Y QUE NO
   -------------------------------
   El dialog sigue siendo CSS. `.md-dialog`, `.md-dialog-headline`,
   `.md-dialog-content`, `.md-dialog-actions` y `.md-dialog-icon` estan en
   `3-components/dialog.css` y no se tocan aqui.

   Este archivo solo pone en marcha lo que el CSS no puede: abrir, cerrar y
   cerrar al clicar fuera. Con el atributo `open` a secas el `<dialog>` NO es
   modal --fluye en su sitio, que es como se muestran los specimens del
   showroom-- y por eso no hay velo ni bloqueo de fondo. Eso lo decide el
   navegador con `showModal()`, y `showModal()` es una llamada.

   ASI QUE EL AUTOR ESCRIBE ESTO:

       <button data-open-dialog="mi-dialogo">Abrir</button>

       <dialog class="md-dialog" id="mi-dialogo" aria-labelledby="t">
         <div class="md-dialog-headline">
           <h3 class="md-type-headline-small" id="t">Headline</h3>
         </div>
         <div class="md-dialog-content">
           <p class="md-type-body-medium">Supporting text</p>
         </div>
         <div class="md-dialog-actions">
           <button data-close-dialog>Cancelar</button>
         </div>
       </dialog>

   Y no escribe el velo. Ver abajo.

   EL VELO NO LO PONE ESTE ARCHIVO, Y TAMPOCO EL AUTOR
   ---------------------------------------------------
   Hubo aqui un `<div class="md-dialog-scrim">` que este archivo insertaba al
   abrir y borraba al cerrar. Ya no: el velo es el `::backdrop` que pinta
   `dialog.css` y que el navegador crea y destruye solo con `showModal()`.

   Asi este archivo se queda en dos llamadas --`showModal()` y `close()`-- y
   no hay ningun nodo en el DOM que se pueda quedar huerfano por la via que
   sea. M3 si lleva scrim propio, porque el suyo es parte de su DOM y de su
   animacion; aqui el elemento es un `<dialog>` nativo y no hay animacion.
   Ver la nota larga de `dialog.css`.

   VARIOS DIALOGS EN LA MISMA PAGINA, Y SI SE AISLAN
   --------------------------------------------------
   Es el caso de una lista: un boton de eliminar por fila, cada uno con su
   dialog. Medido con tres filas, y se aislan sin que este archivo tenga nada
   especial:

       abrir el 2               solo se abre el 2
       su boton de cancelar     cierra el 2  -- se busca con `closest('dialog')`,
                                                  o sea el ancestro del propio
                                                  boton, no un id suelto
       cerrar por fuera         cierra el que recibio el clic
       dos clics rapidos        uno solo, por la guarda de `abrir()`
       dos ids iguales          los dos botones abren el primero

   Lo que las apila es la plataforma: abrir dos sin cerrar el primero deja los
   dos modales, y cerrar va por orden inverso. Es el nested modal de
   `<dialog>`, no un comportamiento de aqui.

   LO QUE ESTE ARCHIVO NO HACE
   ---------------------------
   - No bloquea el scroll del fondo: eso lo hace el navegador al entrar en el
     top layer, que deja el resto `inert`. No hay que hacer nada.
   - No anima nada. La elevacion no se transiciona en este sistema.

   LO QUE NO HAY QUE COPIAR DE AQUI
   ---------------------------------
   No hay framework, ni clases, ni instanciar nada. Se registra una vez al
   cargar la pagina y lee el marcado. Quien use la libreria importa
   `src/js/main.js` y ya.
   ========================================================================== */

/* Un unico listener delegado en `document`, y no uno por boton.

   Delegar y no recorrer los botones al cargar tiene una ventaja concreta: un
   boton que se anada DESPUES de cargar la pagina funciona igual. Con listeners
   por elemento habria que volver a llamar a `registrar()`, y el olvido pasaria
   en silencio: el boton a la vista, sin hacer nada y sin error.

   Por eso se mira el objetivo del clic hacia arriba con `closest()`, en vez de
   escuchar a cada boton. */

function abrir(dialog) {
  /* Sin esta guarda, dos clics rapidos en el boton abren dos veces y el
     segundo `showModal()` lanza `InvalidStateError`. */
  if (dialog.open) return;
  dialog.showModal();
}

export function registrar() {
  document.addEventListener('click', (evento) => {
    /* ABRIR. El valor del atributo es el id del dialog que ese boton abre.

       Y POR ESO EL ID TIENE QUE SER UNICO EN LA PAGINA
       --------------------------------------------------
       En una lista --una tabla de productos con un boton de eliminar por
       fila-- esto es lo UNICO que dice que boton abre que dialog. Y es un
       `id`, no una referencia al boton, asi que un id repetido no da error:
       `getElementById` devuelve el PRIMERO con ese id y los dos botones
       abren el mismo dialog. Medido en el par Lista de la vista.

       No se avisa por consola a proposito: es un fallo de autoria, se ve
       leyendo el marcado, y este sistema no lleva avisos de desarrollo. Lo
       unico que hace falta es que cada fila ponga su id. */
    const botonAbrir = evento.target.closest('[data-open-dialog]');
    if (botonAbrir) {
      const dialog = document.getElementById(botonAbrir.getAttribute('data-open-dialog'));
      if (!dialog) return;
      /* `showModal` no existe en navegadores sin dialog nativo. No se avisa
         por consola porque no hay polyfills en el sistema, y el fallo
         visible --que el boton no haga nada-- ya se ve. */
      if (typeof dialog.showModal !== 'function') return;
      abrir(dialog);
      return;
    }

    /* CERRAR con el boton. Se busca el ancestro y no un id porque lo que
       importa es cerrar el dialog en el que ESTA ese boton, no uno en
       concreto: asi el mismo marcado sirve con varios dialogs en la pagina. */
    const botonCerrar = evento.target.closest('[data-close-dialog]');
    if (botonCerrar) {
      const dialog = botonCerrar.closest('dialog');
      if (dialog && dialog.open) dialog.close();
      return;
    }

    /* CERRAR AL CLICAR FUERA, que es lo que hace M3
       -----------------------------------------------
       Con `::backdrop` el area de fuera la cubre el propio `<dialog>`: el
       clic cae en el elemento, no en un velo aparte. Por eso la comprobacion
       es `event.target === dialog` y no hace falta medir rectangulos.

       Lo que hay dentro no cierra: los hijos del dialog tienen otro objetivo,
       asi que solo sale cuando el clic cae en el dialog mismo. */
    if (evento.target instanceof HTMLDialogElement && evento.target.open) {
      evento.target.close();
    }
  });
}
