/* ==========================================================================
   src/js/theme.js — CONMUTADOR DE TEMA (sistema / claro / oscuro)
   ==========================================================================

   POR QUE VIVE EN EL SISTEMA
   --------------------------
   La eleccion de tema es una pieza de estado que el CSS no puede conmutar
   por si sola: hay que escribir `data-theme` en <html> al hacer clic. Es
   el mismo criterio que creo el toggle (`conmutar estado`), y aqui el
   estado ES el atributo que el sistema de temas de `main.css` ya define:
   `html[data-theme="light|dark"]`, y SIN el atributo: sigue el sistema.

   HAY DOS CONMUTADORES, Y NO SE PISAN
   -----------------------------------
   El chrome del showroom trae el suyo (`data-theme-toggle` + clases sr-*,
   showroom.js). Este es el del sistema: `data-md-theme-toggle` rinde con
   lo que la pagina ya carga -- main.js -- y sin clases de documentacion.
   Ganchos distintos y llaves de guardado distintas (`rdm-theme` vs
   `showroom-theme`): ninguno puede pisar el eleccion del otro.

   COMO FUNCIONA
   --------------
   1. Al evaluar el modulo se aplica la eleccion guardada en localStorage.
      Si no hay eleccion (o el almacenamiento no responde), no se escribe
      el atributo y el tema lo manda el sistema operativo.
   2. Cada clic cicla sistema -> claro -> oscuro -> sistema y guarda el
      resultado; el propio boton publica el modo en su `.md-button-label`.

   EL BOTON QUE EL AUTOR ESCRIBE
   ------------------------------
       <button type="button" class="md-button md-button-tonal"
               data-md-theme-toggle>
         <span class="md-button-label">Tema: sistema</span>
       </button>

   REGLA 13: `data-md-theme-toggle` solo se conecta aqui.

   LIMITE HONESTO
   ---------------
   main.js es type="module": se evalua tras el parseo, asi que si el CSS
   pinta primero puede verse UN flash del tema del sistema cuando la
   eleccion guardada difiere. Es el peaje de cargar sin script inline; si
   una pagina real necesitara cero flash, aplicaria el atributo antes del
   CSS -- fuera de este archivo.
   ========================================================================== */

const THEME_KEY = 'rdm-theme';
const THEME_MODES = ['system', 'dark', 'light'];
const THEME_LABELS = {
  system: 'Tema: sistema',
  light: 'Tema: claro',
  dark: 'Tema: oscuro',
};

/* La eleccion se lee por clic y no se cachea: si algo la cambia a mano
   (DevTools, otro modulo), este archivo sigue la verdad nueva. */
function readTheme() {
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    return THEME_MODES.indexOf(saved) === -1 ? 'system' : saved;
  } catch (e) {
    return 'system';
  }
}

function applyTheme(mode) {
  if (mode === 'system') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', mode);
  }

  const button = document.querySelector('[data-md-theme-toggle]');
  if (!button) return;
  const label = button.querySelector('.md-button-label');
  if (label) label.textContent = THEME_LABELS[mode];
}

export function initTheme() {
  applyTheme(readTheme());

  const button = document.querySelector('[data-md-theme-toggle]');
  if (!button) return;

  button.addEventListener('click', () => {
    const mode = THEME_MODES[(THEME_MODES.indexOf(readTheme()) + 1) % THEME_MODES.length];
    applyTheme(mode);
    try {
      window.localStorage.setItem(THEME_KEY, mode);
    } catch (e) {
      /* sin almacenamiento: la eleccion vive hasta recargar */
    }
  });
}
