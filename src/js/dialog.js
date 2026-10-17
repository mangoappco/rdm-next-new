/* ==========================================================================
   src/js/dialog.js — DIALOG (capa de comportamiento)
   ==========================================================================

   QUE HACE ESTE ARCHIVO, Y QUE NO
   -------------------------------
   El dialog sigue siendo CSS. `.md-dialog`, `.md-dialog-headline`,
   `.md-dialog-content`, `.md-dialog-actions`, `.md-dialog-icon` y
   `.md-dialog-scrim` estan en `3-components/dialog.css` y no se tocan aqui.

   Este archivo solo pone en marcha lo que el CSS no puede: abrir y cerrar.
   Con el atributo `open` a secas el `<dialog>` NO es modal --fluye en su
   sitio, que es como se muestran los specimens del showroom-- y por eso no
   hay velo ni bloqueo de fondo. Eso lo decide el navegador con
   `showModal()`, y `showModal()` es una llamada.

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

   Y no escribe el scrim. Ver abajo.

   EL SCRIM LO PONE ESTE ARCHIVO, NO EL AUTOR
   -------------------------------------------
   Es `position: fixed` con `inset: 0`, o sea que ocupa el viewport entero.
   Si el autor lo escribiera en el marcado, cada dialog de la app llevaria
   una linea de mas que hay que recordar, y el que se la olvide abriria un
   dialog sin velo creyendo que es un fallo. Aqui se inserta al abrir y se
   borra al cerrar, y no se puede desincronizar porque no hay estado guardado.

   Que se vea o no lo decide el CSS, no este archivo:

       .md-dialog-scrim                { display: none }
       :has(dialog:modal) .md-dialog-scrim { display: flex }

   O sea que el atributo que manda es `:modal`, no `[open]`: con `<dialog
   open>` a secas el elemento no es modal y el scrim se queda apagado. Eso es
   lo que permite que los specimens del showroom enseñen el dialog sin apagar
   la pagina.

   LO QUE ESTE ARCHIVO NO HACE
   ---------------------------
   - No cierra el dialog al pulsar fuera. El scrim lleva `pointer-events:
     none` y no puede recibir el clic; ademas el que marca el objetivo de ese
     clic es el `<dialog>`, no el scrim. Cerrar por clic fuera es decision de
     la app, y se hace escuchando el clic en el dialog.
   - No bloquea el scroll del fondo: eso lo hace el navegador al entrar en el
     top layer, que deja el resto `inert`. No hay que hacer nada.
   - No anima nada. La elevacion no se transiciona en este sistema.

   LO QUE NO HAY QUE COPIAR DE AQUI
   ---------------------------------
   No hay framework, ni clases, ni instanciar nada. Se registra una vez al
   cargar la pagina y lee el marcado. Quien use la libreria importa
   `src/js/main.js` y ya.
   ========================================================================== */

/* El scrim que se inserta al abrir. Se guarda por dialog para poder quitar
   solo el suyo: con dos dialogs en la misma pagina, el de uno no puede
   llevarse el velo del otro. */
const velos = new WeakMap();

function ponerVelo(dialog) {
  if (velos.has(dialog)) return;

  const velo = document.createElement('div');
  velo.className = 'md-dialog-scrim';

  /* hermano del dialog, y no hijo: el scrim tapa la pantalla y el dialog
     vive en el top layer del navegador. */
  dialog.parentNode.insertBefore(velo, dialog);
  velos.set(dialog, velo);
}

function quitarVelo(dialog) {
  const velo = velos.get(dialog);
  if (!velo) return;
  velo.remove();
  velos.delete(dialog);
}

function abrir(dialog) {
  /* Sin esto, dos clics rapidos en el boton abren dos veces y `showModal()`
     lanza `InvalidStateError` en la segunda. */
  if (dialog.open) return;

  ponerVelo(dialog);
  dialog.showModal();
}

function cerrar(dialog) {
  if (dialog.open) dialog.close();
}

export function registrar() {
  /* Un boton con `data-open-dialog` abre el dialog que nombre su valor, que
     es el id de ese dialog. */
  document.querySelectorAll('[data-open-dialog]').forEach((boton) => {
    boton.addEventListener('click', () => {
      const dialog = document.getElementById(boton.getAttribute('data-open-dialog'));
      if (!dialog) return;
      /* `showModal` no existe en navegadores sin dialog nativo. No se
         avisa por consola porque el showroom no trae polyfills y el fallo
         visible --que el boton no haga nada-- ya se ve. */
      if (typeof dialog.showModal !== 'function') return;
      abrir(dialog);
    });
  });

  /* Un boton con `data-close-dialog` cierra el dialog en el que esta, y solo
     ese: por eso se busca el ancestro y no un id. */
  document.querySelectorAll('[data-close-dialog]').forEach((boton) => {
    boton.addEventListener('click', () => {
      const dialog = boton.closest('dialog');
      if (dialog) cerrar(dialog);
    });
  });

  /* El evento `close` lo lanza el navegador tanto si cerramos con `close()`
     como si el usuario pulsa Escape, que es la via que no controla este
     archivo. Es el unico sitio donde se puede quitar el velo en los dos
     casos sin repetir la llamada. */
  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.addEventListener('close', () => quitarVelo(dialog));
  });
}
