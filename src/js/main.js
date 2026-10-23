/* ==========================================================================
   src/js/main.js — PUNTO DE ENTRADA DEL JS DEL SISTEMA
   ==========================================================================

   QUIEN USA RDM NEXT IMPORTA ESTOS DOS ARCHIVOS
   ---------------------------------------------
       <link rel="stylesheet" href="src/css/main.css">
       <script type="module" src="src/js/main.js"></script>

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
   abrir y cerrar, o conmutar estado. Hoy son TRES, el dialog, el toggle y
   el segmented button, y NO por simetria de componentes: son los unicos con
   una pieza de estado que el CSS no puede cambiar por si sola.

   Los otros seis --divider, button-group, fab, fab-extended y card-- no
   crean archivo. No se crean vacios por simetria: un archivo sin
   contenido obliga a mantenerlo y a acordarse de que existe, que es mas
   trabajo que el que ahorra.

   UN ARCHIVO POR ATRIBUTO, NO POR COMPONENTE VISUAL
   -------------------------------------------------
   El caso del toggle lo dice claro: el estado es UNO (`aria-pressed`) y
   lo pintan DOS componentes --icon-button y button--, cada uno con su
   CSS. Aun asi hay UN archivo de comportamiento, no dos, porque no hay
   dos atributos que pelearse: `data-toggle` es el gancho de los dos.
   La regla no es "un archivo por componente" sino "un archivo por
   atributos": cada familia de `data-*` tiene un solo dueno, y el fallo
   que hay que impedir es que DOS archivos toquen el mismo atributo.

   Por eso el dialog y el toggle no comparten archivo aunque los dos
   sean "comportamiento": no se piden atributos y no necesitan nada el
   uno del otro, y unirlos haria que un cambio en el toggle tocara el
   dialog. La frontera son los atributos; los componentes son vistas de
   esos atributos en CSS distinto.

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

   QUE PASA AL CONMUTAR UN TOGGLE
   ------------------------------
   Nada que implementar: el estado ya esta en la plataforma. `aria-pressed`
   es lo que el lector de pantalla anuncia y lo que el CSS lee, sin una
   API mas. Lo que hay que tener claro:

   - EL VISUAL: el CSS del componente cambia por `[aria-pressed="true"]`,
     en icon-button.css (seccion SELECCIONADO) y en button.css cuando
     entre. No hay ninguna clase de estado que conmutar.
   - EL ANUNCIO: ni aria-live ni roles extras. Un `<button>` con
     `aria-pressed` es un toggle button para ARIA, y el lector de
     pantalla anuncia "pulsado" / "no pulsado" con el cambio.
   - LA APP: ManGo! App decide su estado de negocio fuera de este
     archivo. Si necesita reaccionar a la conmutacion, lee
     `aria-pressed` del propio DOM en su flujo --o un MutationObserver
     sobre el atributo--, que es la misma fuente de la verdad que este
     controlador. AQUI no se emiten eventos custom: el ancla del sistema
     es el atributo, no una API de suscripcion.

   EL PEAJE REAL DE ESTE ARCHIVO NUEVO
   ------------------------------------
   Una peticion mas, lo mismo que trajo `dialog.js`: dos archivos
   pequenos por HTTP/2. La logica del toggle no ejecuta nada si la
   pagina no lleva `[data-toggle]`, pero cargarla siempre es el precio
   de que anadirla a una pagina sea escribir atributos en el marcado y
   nada mas. Es el mismo peaje que ya se acepto con el dialog, y la
   alternativa es peor: sin archivo, cada pagina conmutaria a mano, y
   el bug silencioso seria el dia a dia.
   ========================================================================== */

import { registrar } from './dialog.js';
import { registrar as registrarToggle } from './toggle.js';
import { registrar as registrarSegmented } from './segmented-button.js';
import { registrar as registrarChipFilter } from './chip-filter.js';

/* Se registra al cargar el script, no al hacer clic. Los specimens del
   showroom llevan `<dialog open>` a secas, que NO es modal, asi que ahi no
   hay nada que abrir: lo que se enseña es el dialog en su sitio. */
registrar();

/* El toggle, tambien al cargar y por la misma razon: la delegacion esta
   viva antes de que exista ningun [data-toggle] en la pagina. No se
   recorre el documento al cargar; quien llegue despues funciona igual. */
registrarToggle();

/* El segmented button, por la misma razon todavia: dos delegaciones (click
   y keydown) y el gancho es el rol que el marcado ya publica --su cabecera
   lo cuenta--. No se recorre el documento al cargar; los tabindex del
   roving llegan con la primera flecha, no aqui. */
registrarSegmented();

/* Los filter chips, por la misma razon: una delegacion de click y el
   gancho es el atributo que el marcado ya publica --su cabecera lo
   cuenta--. No se recorre el documento al cargar; quien llegue despues
   funciona igual. */
registrarChipFilter();

/* Y aqui iran los que lo necesiten:
     import { registrar as registrarFabMenu } from './fab-menu.js';
     registrarFabMenu();
   Que no exista todavia no significa que no pueda: M3 publica el FAB menu y
   el split button, y los dos estaban refutados por falta de JavaScript. */
