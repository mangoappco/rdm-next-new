/* showroom/assets/showroom.js — resaltado de snippets + boton copiar.
   Sin dependencias y solo para HTML: etiquetas, atributos, strings con
   comillas dobles y comentarios. Limites honestos: no entiende strings
   con comillas simples ni comentarios dentro de atributos; el markup de
   componentes del showroom no usa ninguno de los dos. */

(function () {
  'use strict';

  /* Escapa el texto crudo del <code> para poder resaltar sobre el. */
  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* Resalta un snippet ya escapado. Los comentarios se apartan primero con
     un placeholder, y despues cada etiqueta se resalta POR DENTRO: primero
     atributos (texto crudo, sin spans) y despues el nombre (anclado al ^).
     El orden importa: al reves, la regex de atributos muerde el class de
     los <span> insertados, rompe el HTML y el navegador muestra "tok-tag"
     como texto. Medido en el template al estrenar el resaltado. */
  function highlight(escaped) {
    var comments = [];
    var code = escaped.replace(/&lt;!--[\s\S]*?--&gt;/g, function (match) {
      comments.push(match);
      return '\u0000' + (comments.length - 1) + '\u0000';
    });

    code = code.replace(/&lt;\/?[a-zA-Z][a-zA-Z0-9-]*(?:[^&]|&(?!gt;))*?&gt;/g, function (tag) {
      return tag
        .replace(/([a-zA-Z-:]+)(=)("[^"]*")/g, '<span class="tok-attr">$1</span>$2<span class="tok-str">$3</span>')
        .replace(/^(&lt;\/?)([a-zA-Z][a-zA-Z0-9-]*)/, '$1<span class="tok-tag">$2</span>');
    });

    code = code.replace(/\u0000(\d+)\u0000/g, function (match, index) {
      return '<span class="tok-com">' + comments[Number(index)] + '</span>';
    });

    return code;
  }

  function wireCodeBlocks() {
    var blocks = document.querySelectorAll('pre.sr-code > code');
    for (var i = 0; i < blocks.length; i++) {
      blocks[i].innerHTML = highlight(escapeHtml(blocks[i].textContent));
    }
  }

  /* Cada boton [data-copy] copia el <code> del <pre> hermano inmediato
     anterior. Se copia textContent (el texto crudo), no innerHTML: el
     resaltado no contamina el portapapeles. */
  function wireCopyButtons() {
    var buttons = document.querySelectorAll('[data-copy]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function () {
        var button = this;
        var pre = button.previousElementSibling;
        var code = pre && pre.querySelector ? pre.querySelector('code') : null;
        if (!code) return;

        var done = function () {
          var original = button.textContent;
          button.textContent = 'Copiado';
          window.setTimeout(function () { button.textContent = original; }, 1500);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code.textContent).then(done, done);
        }
      });
    }
  }

  /* ----------------------------------------------------------------------
     TOGGLE DE TEMA (sin atributo -> sistema; light / dark -> eleccion)
     ----------------------------------------------------------------------
     Cicla sistema -> claro -> oscuro -> sistema y lo guarda en
     localStorage para que todas las vistas compartan la eleccion. Se
     aplica al evaluar (el script va en el <head> sin defer) para pintar
     el tema guardado antes del primer pintado; el boton se cablea al
     cargar el DOM. */
  var THEME_KEY = 'showroom-theme';
  var THEME_MODES = ['system', 'light', 'dark'];
  var THEME_LABELS = { system: 'Tema: sistema', light: 'Tema: claro', dark: 'Tema: oscuro' };
  var currentTheme = readTheme();
  applyTheme(currentTheme);

  function readTheme() {
    try {
      var saved = window.localStorage.getItem(THEME_KEY);
      return THEME_MODES.indexOf(saved) === -1 ? 'system' : saved;
    } catch (e) {
      return 'system';
    }
  }

  function applyTheme(mode) {
    if (mode === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', mode);
    var button = document.querySelector('[data-theme-toggle]');
    if (button) button.textContent = THEME_LABELS[mode];
  }

  function wireThemeToggle() {
    var button = document.querySelector('[data-theme-toggle]');
    if (!button) return;
    applyTheme(currentTheme);
    button.addEventListener('click', function () {
      currentTheme = THEME_MODES[(THEME_MODES.indexOf(currentTheme) + 1) % THEME_MODES.length];
      applyTheme(currentTheme);
      try { window.localStorage.setItem(THEME_KEY, currentTheme); } catch (e) { /* sin almacenamiento */ }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    wireCodeBlocks();
    wireCopyButtons();
    wireThemeToggle();
  });
})();
