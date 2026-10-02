/* showroom/assets/showroom.js - toggle de tema y tablas scrolleables.
   Mismo mecanismo que src/2-sys/theme/:
     sin atributo        -> sigue al sistema (prefers-color-scheme)
     data-theme="light"  -> claro, ignora el SO
     data-theme="dark"   -> oscuro, ignora el SO
   Cicla: sistema -> claro -> oscuro -> sistema. Se guarda en localStorage
   para que todas las vistas compartan la eleccion.

   Se carga en el <head> SIN defer: aplica el tema guardado antes de pintar y
   evita el parpadeo del tema equivocado. El boton se enlaza al cargar el DOM. */

(function () {
  var KEY = 'showroom-theme';
  var MODES = ['system', 'light', 'dark'];
  var LABELS = { system: 'Tema: sistema', light: 'Tema: claro', dark: 'Tema: oscuro' };
  var root = document.documentElement;

  /* El mismo corte que la regla .sr-table de showroom.css. Los dos tienen que
     coincidir: si el CSS dextra la tabla y el JS no, la region scrolleable
     queda inalcanzable con teclado; y al reves, un tab stop que no lleva a
     ninguna parte.

     767 por el motivo que explica el bloque de la tabla en la hoja: a partir
     de 768 el contenido de .sr-page esta topado a 720px y la tabla cabe
     entera, o sea que no hay nada que scrollear. */
  var ANCHO_ANGOSTO = '(max-width: 767px)';

  /* WCAG 2.1.1: una region con scroll tiene que ser alcanzable con teclado,
     porque sin foco no hay forma de desplazarla con las flechas.

     El tabindex se pone sobre el <table>, no sobre un envoltorio, para no
     anadir markup: el contenedor de scroll ya es la propia tabla, porque
     showroom.css le cambia el display a block por debajo del corte.

     Y se mide si la tabla SE DESPLAZA, en vez de mirar solo el ancho de la
     ventana. Medido a 375px: 18 de las 19 tablas de typography scrollean y 1
     cabe. Con el corte como unico criterio, esa que cabe recibia tabindex sin
     necesidad: un tab stop que no lleva a ninguna parte solo alarga la
     navegacion con el teclado. Preguntando a cada tabla, el criterio es el
     que importa y el de mas desaparece solo.

     El atributo se quita en cuanto deja de haber barra, para que al pasar a
     escritorio no queden 52 paradas de tab que antes no existian. */
  function enlazarTablas() {
    var tablas = document.querySelectorAll('.sr-table');

    for (var i = 0; i < tablas.length; i++) {
      var seDesplaza = tablas[i].scrollWidth - tablas[i].clientWidth > 1;

      if (seDesplaza) {
        tablas[i].setAttribute('tabindex', '0');
        /* La region scrolleable necesita nombre accesible. Sin el, un lector
           de pantalla anuncia "table" a secas y no dice que se puede
           desplazar: role=region le da el contexto y aria-label lo nombra.
           El nombre sale del h3 de la seccion, que es donde esta la tabla,
           asi que no se inventa texto nuevo. */
        tablas[i].setAttribute('role', 'region');
        if (!tablas[i].getAttribute('aria-label')) {
          var seccion = tablas[i].previousElementSibling;
          while (seccion && seccion.tagName !== 'H3' && seccion.tagName !== 'H2') {
            seccion = seccion.previousElementSibling;
          }
          if (seccion) tablas[i].setAttribute('aria-label', seccion.textContent.trim());
        }
      } else {
        tablas[i].removeAttribute('tabindex');
        tablas[i].removeAttribute('role');
        tablas[i].removeAttribute('aria-label');
      }
    }
  }

  function read() {
    try {
      var saved = localStorage.getItem(KEY);
      return MODES.indexOf(saved) === -1 ? 'system' : saved;
    } catch (e) {
      return 'system';
    }
  }

  function apply(mode) {
    if (mode === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', mode);
    var button = document.querySelector('[data-theme-toggle]');
    if (button) button.textContent = LABELS[mode];
  }

  var current = read();
  apply(current);

  document.addEventListener('DOMContentLoaded', function () {
    var button = document.querySelector('[data-theme-toggle]');
    if (button) {
      apply(current);
      button.addEventListener('click', function () {
        current = MODES[(MODES.indexOf(current) + 1) % MODES.length];
        apply(current);
        try { localStorage.setItem(KEY, current); } catch (e) { /* sin almacenamiento */ }
      });
    }

    /* El corte tambien vigila al cambiar el ancho de la ventana, no solo al
       cargar: una tabla que no scrollea en escritorio pasa a scrollear al
       estrechar la ventana, y al reves al ensancharla. Sin este listener el
       tabindex se quedaria en el estado del ultimo carregamento.

       addEventListener sobre el MediaQueryList y no addListener, que es la
       API vieja. */
    enlazarTablas();
    var consulta = window.matchMedia(ANCHO_ANGOSTO);
    if (consulta.addEventListener) consulta.addEventListener('change', enlazarTablas);
    else if (consulta.addListener) consulta.addListener(enlazarTablas);
  });
})();
