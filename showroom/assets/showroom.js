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

  /* Copia por la API del portapapeles cuando existe, y por execCommand
     cuando no. No es una salida por el futuro: navigator.clipboard SOLO se
     expone en contexto seguro, asi que abriendo el showroom por la IP de la
     red --que es como se trabaja entre maquinas-- no existe. Medido en
     http://10.226.28.43/...: isSecureContext false y navigator.clipboard
     undefined, con document.execCommand disponible.

     Antes no habia alternativa: el manejador terminaba sin hacer nada y sin
     avisar, y el boton parecia roto. Lo hacia en las quince vistas, no solo
     en la de card. */
  function copyWithExecCommand(text) {
    /* Un textarea invisible pero NO display:none, porque a un elemento sin
       caja el navegador no le selecciona el contenido y execCommand devuelve
       false sin explicar por que. */
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '0';
    area.style.left = '0';
    area.style.width = '1px';
    area.style.height = '1px';
    area.style.padding = '0';
    area.style.border = 'none';
    area.style.outline = 'none';
    area.style.boxShadow = 'none';
    area.style.background = 'transparent';
    area.style.opacity = '0';

    document.body.appendChild(area);
    area.focus();
    area.select();
    /* En Safari antiguo hay que pedir el rango ademas de select(). */
    if (area.setSelectionRange) area.setSelectionRange(0, text.length);

    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(area);
    return ok;
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(
        function () { return true; },
        function () { return copyWithExecCommand(text); }
      );
    }
    return Promise.resolve(copyWithExecCommand(text));
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

        var flash = function (message) {
          var original = button.textContent;
          button.textContent = message;
          window.setTimeout(function () { button.textContent = original; }, 1500);
        };

        /* Se dice lo que paso, en los dos sentidos. Un boton que no cambia
           de texto no distingue entre "no ha pasado nada" y "no he podido",
           y el que lee no sabe si volver a pulsarlo sirve de algo. */
        copyText(code.textContent).then(function (ok) {
          flash(ok ? 'Copiado' : 'No se pudo copiar');
        });
      });
    }
  }

  /* ----------------------------------------------------------------------
     TOGGLE DE TEMA (sin atributo -> sistema; light / dark -> eleccion)
     ----------------------------------------------------------------------
     Cicla sistema -> oscuro -> claro -> sistema y lo guarda en
     localStorage para que todas las vistas compartan la eleccion. Se
     aplica al evaluar (el script va en el <head> sin defer) para pintar
     el tema guardado antes del primer pintado; el boton se cablea al
     cargar el DOM. */
  var THEME_KEY = 'showroom-theme';
  var THEME_MODES = ['system', 'dark', 'light'];
  var ICON_MAP = { system: 'brightness_auto', dark: 'dark_mode', light: 'light_mode' };
  var LABEL_MAP = { system: 'Tema del sistema activo', dark: 'Tema oscuro activo', light: 'Tema claro activo' };
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
    var btn = document.querySelector('[data-theme-toggle]');
    if (!btn) return;
    btn.setAttribute('aria-label', LABEL_MAP[mode]);
    var iconSpan = btn.querySelector('.md-icon');
    if (iconSpan) iconSpan.textContent = ICON_MAP[mode];
    /* El texto del boton se mantiene en el aria-label; el glifo es la senal visual */
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

  /* ------------------------------------------------------------------
     QUE NO ESTA AQUI, Y POR QUE
     ------------------------------------------------------------------
     Este archivo es el CHROME del showroom: resaltar snippets, el boton
     «Copiar» y el conmutador de tema. Son cosas de leer la documentacion, y
     no se distribuyen con la libreria.

     El comportamiento de los componentes vive en `src/js/`, que si se
     distribuye. El cableado del dialog --`data-open-dialog` y
     `data-close-dialog`-- estuvo aqui mientras se experimentaba y ahora esta
     en `src/js/dialog.js`, que es donde lo consume ManGo! App. Si estuviera
     en los dos sitios, el showroom teacha una cosa y la libreria otra. */
  document.addEventListener('DOMContentLoaded', function () {
    wireCodeBlocks();
    wireCopyButtons();
    wireThemeToggle();
  });
})();
