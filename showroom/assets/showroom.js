/* showroom/assets/showroom.js - toggle de tema.
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
    if (!button) return;
    apply(current);
    button.addEventListener('click', function () {
      current = MODES[(MODES.indexOf(current) + 1) % MODES.length];
      apply(current);
      try { localStorage.setItem(KEY, current); } catch (e) { /* sin almacenamiento */ }
    });
  });
})();
