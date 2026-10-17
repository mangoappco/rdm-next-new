/* ==========================================================================
   src/js/main.js — PUNTO DE ENTRADA DEL JS DEL SISTEMA
   ==========================================================================

   QUIEN USA RDM NEXT IMPORTA ESTOS DOS ARCHIVOS
   ---------------------------------------------
       <link rel="stylesheet" href="src/css/main.css">
       <script src="src/js/main.js"></script>

   Es el mismo par de antes, con un archivo mas. `main.css` sigue siendo el
   unico punto de entrada del CSS y carga las cuatro capas; este carga el
   comportamiento.

   QUE HAY Y QUE NO HAY EN ESTE ARCHIVO
   ------------------------------------
   SOLO comportamiento de componentes. El chrome del showroom --resaltar
   snippets, el boton «Copiar» y el conmutador de tema-- vive en
   `showroom/assets/showroom.js`, porque eso es documentacion y no se
   distribuye. La frontera es esa: si algo describe un componente, vive
   aqui; si sirve para leer la documentacion, vive alla.

   POR QUE UN ARCHIVO POR COMPONENTE Y NO UNO SOLO
   -----------------------------------------------
   Cada componente es dueño de sus atributos `data-*` y no puede pisar los
   de otro. Con todo en un archivo, un cambio en el dialog tocaria el boton,
   y un atributo inventado por dos componentes se pisaria sin que nada
   avise.

   Y el coste: sin build, cada `import` es una peticion mas. Por HTTP/2 son
   unos cuantos archivos pequenos, y el peaje real es otro --ver abajo.

   LO QUE NO TIENE QUE LLEVAR UN ARCHIVO AQUI
   ------------------------------------------
   Solo los componentes que necesiten algo que el CSS no puede expresar:
   abrir y cerrar, o guardar estado. Hoy es UNO, el dialog.

   Los otros siete --divider, icon-button, button, button-group, fab, fab-
   extended y card-- no crean archivo. No se crean vacios por simetria: un
   archivo sin contenido obliga a mantenerlo y a acordarse de que existe,
   que es mas trabajo que el que ahorra.

   LO QUE ESTO CAMBIA Y NO SE DICE SUFICIENTE
   ------------------------------------------
   Este sistema ya no es «HTML + CSS sin JavaScript». El candado viejo era
   «sin JavaScript en el sistema» y lo que se decide ahora es mas estrecho
   y mas util: cero `<script>` con codigo dentro de un HTML, y cero
   comportamiento escrito a mano en cada pagina.

   QUE PASA AL ABRIR UN DIALOG
   ---------------------------
   `showModal()` mete el `<dialog>` en el top layer del navegador. Eso trae
   tres cosas que antes no tenia el sistema y que no hay que implementar:
   la caja sale centrada en el viewport, el fondo queda `inert` --y con el
   scroll bloqueado-- y el velo lo pone el `:has(dialog:modal)` de
   `dialog.css`. Medido en Chrome, el dialog computa `z-index: auto` y aun
   asi queda por encima del scrim.
   ========================================================================== */

import { registrar } from './dialog.js';

/* Se registra al cargar el script, no al hacer clic. Los specimens del
   showroom llevan `<dialog open>` a secas, que NO es modal, asi que ahi no
   hay nada que abrir: lo que se enseña es el dialog en su sitio. */
registrar();

/* Y aqui iran los que lo necesiten:
     import { registrar as registrarFabMenu } from './fab-menu.js';
     registrarFabMenu();
   Que no exista todavia no significa que no pueda: M3 publica el FAB menu y
   el split button, y los dos estaban refutados por falta de JavaScript. */
