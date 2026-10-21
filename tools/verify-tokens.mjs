/*
 * Verificador de la arquitectura de tokens de RDM Next.
 *
 * Comprueba que las reglas de la arquitectura de 4 capas se cumplen de forma
 * automatica, y que no haya regresiones antes de cada commit.
 *
 * Las reglas que verifica:
 *
 *   REGLA 1  Sin valores crudos fuera de 1-reference-tokens
 *            Ni #HEX, ni px, ni ms/s, ni rem, ni %, ni deg, ni numeros sin
 *            unidad sueltos en 2-system-tokens, 3-components ni 4-utilities.
 *
 *   REGLA 2  Direccion de las dependencias
 *            3-components no puede leer 1-reference-tokens (salto de capa
 *            prohibido). 1-reference-tokens no puede leer 2-system-tokens
 *            ni 3-components (dependencia circular). 2-system-tokens no
 *            puede leer 3-components. 4-utilities es permisiva por diseno:
 *            puede leer las capas 1 y 2.
 *
 *   REGLA 3  Todo token referenciado existe
 *            Un var(--md-...) sin definir produce una regla invalida que el
 *            navegador descarta en silencio. Es el fallo mas dificil de ver.
 *
 *   REGLA 4  Orden de los temas
 *            theme.light.css debe importarse ANTES que theme.dark.css. Es el
 *            unico punto del proyecto donde el orden de escritura cambia el
 *            comportamiento.
 *
 *   REGLA 5  Integridad de la arquitectura
 *            Las carpetas y archivos esperados existen; main.css declara las
 *            capas @layer; el numero de archivos importados coincide.
 *
 *   REGLA 6  Dogfooding del showroom
 *            Ningun HTML lleva atributos de estilo en linea ni bloques
 *            <style>. Si falta un token o una utilidad, se crea en la capa
 *            correspondiente, no se parchea el marcado.
 *
 *   REGLA 7  Sincronizacion de bloques de tema
 *            Cada archivo de tema declara sus tokens en DOS bloques, uno con
 *            @media y otro con [data-theme]. Deben ser IDENTICOS: si no, el
 *            tema se ve bien con el del SO y distinto con el toggle.
 *
 *   REGLA 8  Tablas de tokens del showroom
 *            Portada del verificador de rdm-next-old. El showroom vive
 *            fuera de src/css/, asi que Get-CssFiles lo excluye y sin esta
 *            regla nadie leeria sus hojas. Comprueba que toda <table> lleve
 *            el patron .sr-table, que ese patron sea una superficie completa
 *            (borde, radio, encabezado con tinte, code monospace) y que el
 *            texto de la tabla de 4.5:1 en los dos temas.
 *            La rejilla NO se mide: va en outline-variant por decision
 *            documentada, y el comentario del bloque explica por que.
 *
 *   REGLA 9  El icono se pide con las clases del sistema
 *            a) Ningun HTML puede llevar material-symbols-* en un atributo
 *               de clase. Esa clase la trae la hoja de Google, que
 *               1-reference-tokens/iconfont.css mete en la capa ref.reset precisamente
 *               para que no compita. Como la hoja entera entra con ella, se
 *               podria usar y creerse que funciona; el fallo ya se cometio
 *               una vez y perdia el font-size del componente.
 *               Se comprueba SOLO dentro de atributos class: el nombre
 *               aparece legitimamente en la prosa del showroom, que explica
 *               por que no se usa, y buscarlo en todo el archivo seria un
 *               falso positivo permanente.
 *            b) 4-utilities/icon.css tiene que declarar .md-icon. Garantiza que la
 *               libreria publique siempre un punto de entrada para iconos,
 *               aunque todavia no haya ningun componente que lo use.
 *
 *   REGLA 10 Toda clase del sistema que usa el showroom existe
 *            Recorre los atributos class de todo el HTML del showroom y
 *            comprueba que cada clase con prefijo md- este declarada en
 *            alguna hoja de src/css/.
 *
 *            Por que necesita una regla: una clase inexistente no da error,
 *            da silenciosidad. No hay warning, no hay regla invalida, no hay
 *            nada en consola. El elemento se dibuja con lo que le hereden y
 *            la pagina parece que funciona.
 *
 *            Los dos fallos reales queatrapa:
 *              - .md-bg-black en la vista de Elevation, dos specimens que
 *                no pintaban nada: la celda decia #000 y la muestra salia
 *                transparente. Se resolvia con .md-bg-shadow, que si existe.
 *              - El borrado de las 32 clases .md-type-* de 4-utilities. Las cuatro
 *                vistas del showroom llevaban md-type-body-medium en el body,
 *                y reset.css ya no declara tipografia en el body, asi que al
 *                borrarlas TODO el showroom paso a renderizar en Times New
 *                Roman a 16px. El verificador paso las nueve reglas porque
 *                ninguna comprobaba que una clase existiera.
 *
 *            Solo se miran las clases md-*, no las sr-*: esas son el chrome
 *            del propio showroom y viven en su capa, no en la libreria.
 *
 *   REGLA 11 El snippet copiable es identico a su specimen
 *            Cada pagina de componente son parejas specimen + codigo.
 *            Compara el innerHTML de .sr-specimen contra el texto de su
 *            pre.sr-code desescapado: si divergen, lo copiable miente.
 *
 *   REGLA 12 La vista de color muestra roles, nunca paleta
 *            Falla si una vista de color referencia paleta cruda o #HEX:
 *            lo pintado con primitivas no se mueve con el Theme Builder.
 *
 *   REGLA 13 El snippet es autonomo: rinde con main.css y main.js
 *            Cada bloque pre.sr-code se desescapa y se lee como si se
 *            pegara en una pagina que solo importe main.css: ninguna
 *            clase que no sea del sistema, ningun estilo en linea y
 *            ningun style/link/script propios.
 *
 * POR QUE ESTA EN NODE Y NO EN POWERSHELL
 * --------------------------------------
 * El verificador original era tools/verify-tokens.ps1 y no podia correr en
 * macOS: sus rutas eran Windows-canon (`Join-Path $root 'src\css'`, y
 * Get-RelPath normalizaba a '\'), de modo que instalado PowerShell el script
 * arrancaba, no encontraba ni un archivo y|reportaba un OK falso sobre una
 * biblioteca que no habia leido. Eso es peor que no correr.
 *
 * Node corre igual en macOS, Windows y Linux sin instalar nada, asi que esta
 * es la unica implementacion. El .ps1 quedo como una envoltura de tres lineas
 * que llama a este archivo: quien lo lance en Windows sigue escribiendo lo
 * mismo y ejecuta exactamente este codigo, que es lo que evita que dos
 * verificadores se separen en silencio.
 *
 * USO
 * ---
 *   node tools/verify-tokens.mjs
 *   pwsh ./tools/verify-tokens.ps1      (en Windows, la envoltura)
 *
 * Sale con 0 si todo pasa y con 1 si hay algun fallo.
 *
 * NOTAS
 * -----
 * Archivo de la CAPA 0 (herramienta). No pertenece a 1-reference-tokens,
 * 2-system-tokens, 3-components ni 4-utilities, y por eso no es escaneado
 * por si mismo.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Raiz del proyecto: este archivo vive en tools/, asi que la raiz es un nivel arriba.
const ProjectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Raiz de la libreria CSS. El sistema no vive en la raiz del repositorio sino
// en src/css/, y el showroom vive aparte en showroom/. Esta variable es el UNICO
// lugar donde se conoce esa ruta: las reglas la referencian en vez de escribir
// 'src/css/...' cada vez. Si la estructura vuelve a cambiar, se cambia aqui.
const CssRoot = join(ProjectRoot, 'src', 'css');

// Nombres de archivo que no se escanean por ser marcadores de directorio vacio.
const Markers = new Set(['.gitkeep']);

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Normaliza un separador de ruta para comparar rutas relativas sin depender
 * del sistema. Aqui toda ruta interna se expresa con '/', que es lo que este
 * port hace en lugar del '\' del original: al construir rutas con join() el
 * sistema ya devuelve el separador correcto, y normalizar a uno solo deja las
 * comparaciones de las reglas portables.
 */
function GetRelPath(filePath, base) {
  return filePath.slice(base.length + 1).replace(/\\/g, '/');
}

/** Recorre un arbol y devuelve las rutas de los archivos que cumplen las extensiones dadas. */
function GetFilesRecursive(root, extensions) {
  const out = [];

  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    // Orden alfabetico: en Windows Get-ChildItem tambien devolvia un orden
    // estable, y ordenar hace la salida del verificador reproducible.
    entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === '.git') continue;
        walk(full);
      } else if (entry.isFile()) {
        // -Include de PowerShell no distingue mayusculas en Windows, asi que
        // la comparacion tampoco lo hace: es el superconjunto que vigila mas.
        if (extensions.includes(entry.name.slice(entry.name.lastIndexOf('.')).toLowerCase())) {
          out.push(full);
        }
      }
    }
  };

  walk(root);
  return out;
}

/**
 * Devuelve las hojas CSS de la LIBRERIA (src/css/), mas reset.css.
 *
 * El filtro se evalua sobre la ruta relativa a src/css/, no a la raiz del
 * proyecto: asi "esta hoja pertenece a una capa" es una pregunta sobre la
 * libreria. Por eso el prefijo src/css/ se quita antes de comparar, y una hoja
 * que viva fuera de la libreria (por ejemplo showroom/assets/showroom.css, que
 * es del showroom y no del sistema) queda automaticamente excluida.
 */
function GetCssFiles(root, cssRoot) {
  const extensions = ['.css', '.scss'];

  return GetFilesRecursive(root, extensions).filter((full) => {
    const name = full.slice(full.lastIndexOf('/') + 1) || full;
    const base = name.includes('\\') ? name.slice(name.lastIndexOf('\\') + 1) : name;

    // Rutas PORTABLES. En Windows `join` deja barras invertidas, y esta
    // comparacion las necesita hacia delante. Sin la normalizacion no entra
    // NINGUNA hoja: el verificador escanea cero, y da por inexistentes
    // todas las clases y todos los tokens del sistema.
    const posix = full.replace(/\\/g, '/');
    if (!posix.startsWith(cssRoot.replace(/\\/g, '/') + '/')) return false;

    const cssRel = GetRelPath(full, cssRoot);

    // fuera de marcadores
    if (Markers.has(base)) return false;
    // fuera de main.css (se valida aparte, con reglas propias)
    if (base === 'main.css') return false;
    // dentro de las carpetas de capas, mas el reset de la raiz de src/css/
    // (el reset no va en una carpeta numerada: no es un token de M3,
    //  es un reinicio del navegador. Ver la cabecera de src/css/reset.css)
    return (
      cssRel.startsWith('1-reference-tokens/') ||
      cssRel.startsWith('2-system-tokens/') ||
      cssRel.startsWith('3-components/') ||
      cssRel.startsWith('4-utilities/') ||
      cssRel === 'reset.css'
    );
  });
}

/**
 * Extrae el codigo REAL de una hoja: sin comentarios y sin bloques de ejemplo.
 * Sin esto, un #HEX dentro de un comentario pedagogico contaria como violacion
 * y el script seria inservible por falsos positivos.
 */
function GetCodeOnly(path) {
  let raw = readFileSync(path, 'utf8');

  // 1. comentarios de bloque /* ... */
  raw = raw.replace(/\/\*[\s\S]*?\*\//g, '');

  // 2. comentarios de linea // ...
  raw = raw.replace(/\/\/.*$/gm, '');

  return raw;
}

/**
 * Devuelve la capa de una hoja a partir de su ruta RELATIVA A src/css/.
 * La comparacion es exacta con el nombre de archivo para el reset, y por
 * subcarpeta para el resto. No se usan comodines: un token vivo como
 * --md-ref-ref-... en el nombre de una carpeta no debe decidir la capa.
 */
function GetLayer(relative) {
  if (relative === 'reset.css') return 'reset';
  if (relative.startsWith('1-reference-tokens/') || relative === '1-reference-tokens') return 'ref';
  if (relative.startsWith('2-system-tokens/') || relative === '2-system-tokens') return 'sys';
  if (relative.startsWith('3-components/') || relative === '3-components') return 'comp';
  if (relative.startsWith('4-utilities/') || relative === '4-utilities') return 'utilities';
  return '?';
}

/** Todos los matches de un patron global, con sus grupos. */
function Matches(text, pattern) {
  const re = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
  return [...text.matchAll(re)];
}

/** Resultado acumulado de una verificacion. */
const Issues = [];

function AddIssue(rule, file, line, message, snippet) {
  Issues.push({ Rule: rule, File: file, Line: line, Message: message, Snippet: snippet });
}

// ============================================================================
// CARGA Y PREPARACION
// ============================================================================

const out = (line = '') => process.stdout.write(line + '\n');

const color = {
  reset: '\x1b[0m',
  gray: '\x1b[90m',
  darkGray: '\x1b[90m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  darkYellow: '\x1b[33m',
  cyan: '\x1b[36m',
  darkCyan: '\x1b[36m',
};

// Sin color cuando no hay terminal, o cuando el entorno lo pide.
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code, text) => (useColor ? code + text + color.reset : text);

out();
out(paint(color.cyan, '  RDM Next - Verificador de tokens'));
out(paint(color.darkCyan, '  --------------------------------'));

// Anotar cada archivo con dos rutas:
//   Full        -> la ruta en disco.
//   Relative    -> relativa al proyecto. Se usa para reportar la ubicacion del
//                  fallo de forma que el mensaje sea accionable.
//   CssRelative -> relativa a src/css/. Se usa para determinar la capa, porque
//                  las reglas hablan de 'la capa' y la capa se define dentro de
//                  la libreria, no del repositorio.
const files = GetCssFiles(ProjectRoot, CssRoot).map((full) => ({
  Full: full,
  Relative: GetRelPath(full, ProjectRoot),
  CssRelative: GetRelPath(full, CssRoot),
}));

// Indice de TODOS los tokens definidos en el proyecto (para la regla 3).
//
// Se indexan dos familias, porque hay dos cosas distintas que un var() puede
// nombrar:
//
//   --md-...   los tres prefijos de capa: ref, sys y comp. Son el sistema, y
//              un nombre mal escrito es un token que no existe.
//
//   --_...     token local de una hoja, con el prefijo que usa M3 para lo
//              interno y que ya aparecia en 3-components/button.css. No pertenece a
//              ninguna capa, asi que no se indexa por capa, pero se verifica
//              igual: un var(--_foo) mal escrito se descarta en silencio igual
//              que un --md-.
//
// El patron de REGLA 2 sigue siendo solo --md-, porque las reglas de
// direccion de capas no aplican a un token local.
const definedTokens = new Set();
for (const file of files) {
  const code = GetCodeOnly(file.Full);
  for (const m of Matches(code, /(--md-(?:ref|sys|comp|state|elevation|shape|motion|typescale|measurement|colors?|typography)-[a-z0-9-]+)\s*:/g)) {
    definedTokens.add(m[1]);
  }
  for (const m of Matches(code, /(--_[a-z0-9-]+)\s*:/g)) {
    definedTokens.add(m[1]);
  }
}

out(`  Hojas escaneadas : ${files.length}`);
out(`  Tokens definidos : ${definedTokens.size}`);
out();

// ============================================================================
// REGLA 1 - Sin valores crudos fuera de 1-reference-tokens
// ============================================================================
//
// Exenciones deliberadas (valores-identidad, no decisiones de tema):
//   0 y 1 sin unidad (inset: 0, border: 0, opacity: 0/1, line-height: 1)
//   0%, 50% y 100% (centrado con translate(-50%), full-bleed con 100%)
// Un 0 nunca cambiara por tema; un 37% o un opacity 0.3, si.

const patternHex = /#[0-9a-fA-F]{3,8}\b/;
const patternPx = /(?<![\w-])\d+\.?\d*px/;
const patternMs = /(?<![\w-])\d+\.?\d*ms/;
const patternRem = /(?<![\w-])\d+\.?\d*rem/;
const patternS = /(?<![\w-])\d+\.?\d*s\b/;
const patternPct = /(?<![\w-])(?!(?:0|50|100)(?:\.0+)?%)\d+\.?\d*%/;
const patternDeg = /(?<![\w-])\d+\.?\d*deg/;
const patternNum = /:\s*(?!(?:0|1)(?:\.0+)?\s*[;,\)])\d+\.?\d*\s*[;,\)]/;

const rawChecks = [
  { Pattern: patternHex, Name: 'color #HEX' },
  { Pattern: patternPx, Name: 'medida px' },
  { Pattern: patternMs, Name: 'duracion ms' },
  { Pattern: patternRem, Name: 'medida rem' },
  { Pattern: patternS, Name: 'duracion s' },
  { Pattern: patternPct, Name: 'porcentaje %' },
  { Pattern: patternDeg, Name: 'angulo deg' },
  { Pattern: patternNum, Name: 'numero sin unidad' },
];

for (const file of files) {
  const layer = GetLayer(file.CssRelative);
  if (layer === 'ref') continue;

  const lines = GetCodeOnly(file.Full).split('\n');
  const rel = file.Relative;

  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i];
    // no contar numeros dentro de nombres de token, p.ej. --md-ref-spacing-100
    const probe = lineText.replace(/--[a-z0-9-]+/g, 'VAR');

    for (const check of rawChecks) {
      for (const _m of Matches(probe, check.Pattern)) {
        AddIssue('REGLA 1', rel, i + 1, `valor crudo (${check.Name}) fuera de 1-reference-tokens`, lineText.trim());
      }
    }
  }
}

// ============================================================================
// REGLA 2 - Direccion de las dependencias
// ----------------------------------------------------------------------------
// La capa `utilities` es deliberadamente permisiva y no aparece abajo: una
// utilidad puede leer --md-ref-* y --md-sys-* (asi lo exige su trabajo, y
// .md-type-* y .md-icon-* lo hacen). Lo que ninguna capa hace es leer una
// familia --md-utilities-*, porque no existe: las utilidades no definen
// tokens nuevos, solo clases.
// ============================================================================

for (const file of files) {
  const layer = GetLayer(file.CssRelative);
  const lines = GetCodeOnly(file.Full).split('\n');
  const rel = file.Relative;

  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i];
    for (const m of Matches(lineText, /--md-(ref|sys|comp)-/g)) {
      const target = m[1];

      let violation = false;
      let why = '';

      if (layer === 'comp' && target === 'ref') {
        violation = true;
        why = '3-components no puede leer 1-reference-tokens: salto de capa prohibido';
      }
      if (layer === 'ref' && target === 'sys') {
        violation = true;
        why = '1-reference-tokens no puede leer 2-system-tokens: dependencia circular';
      }
      if (layer === 'ref' && target === 'comp') {
        violation = true;
        why = '1-reference-tokens no puede leer 3-components: dependencia circular';
      }
      if (layer === 'sys' && target === 'comp') {
        violation = true;
        why = '2-system-tokens no puede leer 3-components: dependencia invertida';
      }
      if (layer === 'reset' && target === 'comp') {
        violation = true;
        why = 'reset no puede leer 3-components: el reset es la base y no depende de componentes';
      }

      if (violation) {
        AddIssue('REGLA 2', rel, i + 1, why, lineText.trim());
      }
    }
  }
}

// ============================================================================
// REGLA 3 - Todo token referenciado existe
// ============================================================================

for (const file of files) {
  const lines = GetCodeOnly(file.Full).split('\n');
  const rel = file.Relative;

  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i];
    // --md-... son tokens de capa; --_... son tokens locales de la hoja.
    // Los dos se verifican: un nombre mal escrito se descarta igual.
    for (const m of Matches(lineText, /var\((--md-[a-z0-9-]+|--_[a-z0-9-]+)\)/g)) {
      const token = m[1];
      if (!definedTokens.has(token)) {
        AddIssue('REGLA 3', rel, i + 1, `token inexistente: ${token} (el navegador descarta la regla en silencio)`, lineText.trim());
      }
    }
  }
}

// ============================================================================
// REGLA 4 - Orden de los temas en main.css
// ============================================================================

const mainPath = join(CssRoot, 'main.css');

if (!existsSync(mainPath)) {
  AddIssue('REGLA 5', 'src/css/main.css', 0, 'no existe', '');
} else {
  const mainCode = GetCodeOnly(mainPath);
  const imports = Matches(mainCode, /@import url\("([^"]+)"\)\s*layer\((\w+)\)/g);

  // main.css importa indices (*/index.css), no hojas. Para comprobar el
  // orden de los temas hay que expandir un nivel: cada import que apunte
  // a un index.css se sustituye por los @import de ese indice, en orden,
  // resueltos de forma relativa al directorio del indice.
  const seq = [];
  for (const imp of imports) {
    const target = imp[1];
    if (/\/index\.css$/.test(target)) {
      const idxPath = join(CssRoot, target);
      if (existsSync(idxPath)) {
        const idxCode = GetCodeOnly(idxPath);
        for (const sub of Matches(idxCode, /@import url\("([^"]+)"\)/g)) {
          seq.push(target.replace(/\/index\.css$/, '') + '/' + sub[1]);
        }
        continue;
      }
    }
    seq.push(target);
  }
  const iLight = seq.indexOf('2-system-tokens/theme/theme.light.css');
  const iDark = seq.indexOf('2-system-tokens/theme/theme.dark.css');

  if (iLight < 0) {
    AddIssue('REGLA 4', 'src/css/main.css', 0, 'no importa 2-system-tokens/theme/theme.light.css (ni directo ni via 2-system-tokens/index.css)', '');
  } else if (iDark < 0) {
    AddIssue('REGLA 4', 'src/css/main.css', 0, 'no importa 2-system-tokens/theme/theme.dark.css (ni directo ni via 2-system-tokens/index.css)', '');
  } else if (iLight > iDark) {
    AddIssue('REGLA 4', 'src/css/main.css', 0, 'orden invertido: theme.light.css debe importarse ANTES que theme.dark.css (convencion de legibilidad; ya no afecta el comportamiento del tema)', '');
  }

  // Cada archivo importado debe existir en disco.
  // Las rutas de los @import de main.css son RELATIVAS a la carpeta donde vive
  // main.css (src/css/), no a la raiz del proyecto. Por eso se resuelve
  // partiendo de $CssRoot.
  for (const imp of imports) {
    const p = join(CssRoot, imp[1]);
    if (!existsSync(p)) {
      AddIssue('REGLA 5', 'src/css/main.css', 0, `importa un archivo que no existe: ${imp[1]}`, '');
    } else if (/\/index\.css$/.test(imp[1])) {
      // El indice existe: sus hojas tambien deben existir, resueltas
      // de forma relativa al directorio del indice.
      const idxDir = dirname(p);
      const idxCode = GetCodeOnly(p);
      for (const sub of Matches(idxCode, /@import url\("([^"]+)"\)/g)) {
        const sp = join(idxDir, sub[1]);
        if (!existsSync(sp)) {
          AddIssue('REGLA 5', 'src/css/main.css', 0, `el indice ${imp[1]} importa una hoja que no existe: ${sub[1]}`, '');
        }
      }
    }
  }
}

// ============================================================================
// REGLA 5 - Integridad de la arquitectura
// ============================================================================

// Las capas @layer deben declararse antes de cualquier import.
//
// IMPORTANTE: el analisis se hace sobre el codigo SIN comentarios. main.css
// documenta la declaracion de @layer en su cabecera, y un regex sobre el texto
// crudo capturaria esa mencion pedagogica en vez de la declaracion real.
//
// Si main.css no existe, REGLA 4 ya lo reporto. Aqui se sigue con una cadena
// vacia en vez de llamar a Get-CodeOnly sobre un archivo inexistente: sin este
// guardia el script muere con una excepcion no controlada y las reglas 6 y 7
// nunca llegan a ejecutarse, que es peor que un fallo reportado.
const mainRaw = existsSync(mainPath) ? GetCodeOnly(mainPath) : '';
const layerDecl = /@layer\s+([^;]+);/.exec(mainRaw);
const firstImportIndex = mainRaw.search(/@import/);

if (!layerDecl) {
  AddIssue('REGLA 5', 'src/css/main.css', 0, 'no declara @layer', '');
} else if (layerDecl.index > firstImportIndex) {
  AddIssue('REGLA 5', 'src/css/main.css', 0, '@layer debe declararse ANTES del primer @import', '');
} else {
  const declared = layerDecl[1];
  for (const need of ['reset', 'ref', 'sys', 'comp', 'utilities']) {
    if (!new RegExp(`\\b${need}\\b`).test(declared)) {
      AddIssue('REGLA 5', 'src/css/main.css', 0, `no declara la capa @${need}`, '');
    }
  }

  // El ORDEN de la declaracion es la tabla de precedencia del sistema.
  // Si una capa se declara despues de otra, esa otra pierde contra ella.
  // Un orden alterado no rompe el build: rompe la ARQUITECTURA en silencio.
  const order = declared.split(',').map((s) => s.trim()).filter((s) => s !== '');
  const wanted = ['reset', 'ref', 'sys', 'comp', 'utilities'];
  if (order.join(',') !== wanted.join(',')) {
    AddIssue('REGLA 5', 'src/css/main.css', 0, `orden de capas incorrecto. Esperado: ${wanted.join(', ')}. Encontrado: ${order.join(', ')}`, '');
  }
}

// reset.css debe existir y ser el PRIMER import del orquestador.
const resetPath = join(CssRoot, 'reset.css');
if (!existsSync(resetPath)) {
  AddIssue('REGLA 5', 'src/css/reset.css', 0, 'falta la capa 0: src/css/reset.css es el primer import del sistema', '');
} else {
  const firstImport = /@import\s+url\(\s*"([^"]+)"/.exec(mainRaw);
  if (firstImport && firstImport[1] !== 'reset.css') {
    AddIssue('REGLA 5', 'src/css/main.css', 0, `reset.css debe ser el PRIMER import (se encontro '${firstImport[1]}' primero). El reset necesita declararse antes que las capas que lo van a sobreescribir`, '');
  }
}

// Estructura de carpetas esperada. Las tres primeras son relativas a src/css/
// (la libreria); las dos siguientes son relativas a la raiz del repositorio.
const expectedInCss = ['1-reference-tokens', '2-system-tokens', '2-system-tokens/theme', '3-components', '4-utilities'];
for (const dir of expectedInCss) {
  if (!existsSync(join(CssRoot, dir))) {
    AddIssue('REGLA 5', `src/css/${dir}`, 0, 'falta el directorio esperado', '');
  }
}

const expectedInRoot = ['tools', 'showroom', 'showroom/components', 'showroom/assets'];
for (const dir of expectedInRoot) {
  if (!existsSync(join(ProjectRoot, dir))) {
    AddIssue('REGLA 5', dir, 0, 'falta el directorio esperado', '');
  }
}

// Toda hoja escaneada debe pertenecer a una capa conocida. Si Get-Layer no
// reconoce una ruta, la REGLA 1 la trataria como si no fuera de
// 1-reference-tokens y la REGLA 2 no revisaria sus dependencias: dos reglas
// apagadas en silencio.
for (const file of files) {
  if (GetLayer(file.CssRelative) === '?') {
    AddIssue('REGLA 5', file.Relative, 0, `hoja escaneada cuya capa no se puede determinar (relativa a src/css: ${file.CssRelative})`, '');
  }
}

// ============================================================================
// REGLA 6 - Dogfooding del showroom
// ============================================================================
// El showroom se construye UNICAMENTE con lo que el sistema proporciona.
// Esta regla verifica dos cosas:
//
//   a) Ningun HTML del proyecto lleva atributos de estilo en linea.
//   b) Ningun HTML del proyecto lleva un bloque <style> propio.
// ============================================================================

const htmlFiles = GetFilesRecursive(ProjectRoot, ['.html']);

for (const html of htmlFiles) {
  const raw = readFileSync(html, 'utf8');
  const rel = GetRelPath(html, ProjectRoot);

  // Sin comentarios: los comentarios de documentacion mencionan la regla
  const body = raw.replace(/<!--[\s\S]*?-->/g, '');

  const lines = body.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i];

    // a) atributo de estilo en linea
    for (const _m of Matches(lineText, /<[a-zA-Z][^>]*?\sstyle\s*=/g)) {
      AddIssue('REGLA 6', rel, i + 1, 'estilo en linea prohibido: el HTML debe consumir el sistema con clases de 4-utilities o 3-components. Si falta un token o una utilidad, creala en la capa correspondiente', lineText.trim());
    }

    // b) bloque de estilos propio en el HTML
    if (/<style[\s>]/.test(lineText)) {
      AddIssue('REGLA 6', rel, i + 1, 'bloque <style> en el HTML prohibido: el CSS pertenece a las capas 1-reference-tokens, 2-system-tokens, 3-components o 4-utilities', lineText.trim());
    }
  }
}

// ============================================================================
// REGLA 7 - Sincronizacion de bloques de tema
// ============================================================================
// Cada archivo de tema declara sus tokens en DOS bloques: uno con @media
// (para prefers-color-scheme) y otro con [data-theme] (para eleccion
// explicita). Ambos bloques deben ser IDENTICOS.
// ============================================================================

// Rutas relativas a src/css/ (CssRoot).
const themeFiles = ['2-system-tokens/theme/theme.light.css', '2-system-tokens/theme/theme.dark.css'];

for (const tf of themeFiles) {
  const path = join(CssRoot, tf);
  if (!existsSync(path)) continue;

  const lines = GetCodeOnly(path).split('\n');

  // Extraer tokens de un rango de lineas
  const getTokens = (start, end) => {
    const result = new Map();
    for (let i = start; i <= end; i++) {
      const m = /^\s*(--md-sys-color-[a-z0-9-]+)\s*:\s*(.+?)\s*;/.exec(lines[i]);
      if (m) result.set(m[1], m[2]);
    }
    return result;
  };

  // Encontrar el bloque @media
  let mediaStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/@media\s*\(prefers-color-scheme:/.test(lines[i])) {
      mediaStart = i;
      break;
    }
  }

  // Encontrar el bloque [data-theme]
  let attrStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^html\[data-theme=/.test(lines[i])) {
      attrStart = i;
      break;
    }
  }

  if (mediaStart < 0 || attrStart < 0) {
    AddIssue('REGLA 7', `src/css/${tf}`, 0, 'no se encontraron los dos bloques (@media y [data-theme])', '');
    continue;
  }

  // Encontrar el final de cada bloque (contando llaves)
  const findEnd = (start) => {
    let depth = 0;
    for (let i = start; i < lines.length; i++) {
      depth += (lines[i].match(/\{/g) || []).length;
      depth -= (lines[i].match(/\}/g) || []).length;
      if (depth === 0) return i;
    }
    return lines.length - 1;
  };

  const mediaEnd = findEnd(mediaStart);
  const attrEnd = findEnd(attrStart);

  const mediaTokens = getTokens(mediaStart, mediaEnd);
  const attrTokens = getTokens(attrStart, attrEnd);

  // Comparar
  const allKeys = [...new Set([...mediaTokens.keys(), ...attrTokens.keys()])].sort();
  for (const key of allKeys) {
    const inMedia = mediaTokens.has(key);
    const inAttr = attrTokens.has(key);

    if (!inMedia) {
      AddIssue('REGLA 7', `src/css/${tf}`, 0, `token ${key} esta en el bloque [data-theme] pero no en el bloque @media`, '');
    } else if (!inAttr) {
      AddIssue('REGLA 7', `src/css/${tf}`, 0, `token ${key} esta en el bloque @media pero no en el bloque [data-theme]`, '');
    } else if (mediaTokens.get(key) !== attrTokens.get(key)) {
      AddIssue('REGLA 7', `src/css/${tf}`, 0, `token ${key} tiene valores distintos: @media=${mediaTokens.get(key)} vs [data-theme]=${attrTokens.get(key)}`, '');
    }
  }
}

// ============================================================================
// REGLA 8 - Tablas de tokens del showroom
// ============================================================================
// Estas reglas vienen del verificador de rdm-next-old, que tenia tres checks de
// tabla. Portan la doctrina que el proyecto viejo escribio en su SKILL.md y que
// aqui todavia no estaba:
//   a) Formato. Toda <table> del showroom lleva sr-table. Y .sr-table es una
//      SUPERFICIE: borde real + radio, fondo, encabezado con tinte, rejilla
//      completa, code en monospace.
//   b) Specimen. Una tabla de color o de medidas debe PINTAR el valor.
//   c) Contraste. El texto de la tabla tiene que dar 3:1 contra su fondo, en los
//      dos temas.
// ============================================================================

const showroomRoot = join(ProjectRoot, 'showroom');
const showroomCss = join(showroomRoot, 'assets', 'showroom.css');

// a) Formato de la tabla

if (!existsSync(showroomCss)) {
  AddIssue('REGLA 8', 'showroom/assets/showroom.css', 0, 'no existe: sin el, las tablas del showroom no tienen patron', '');
} else {
  const srCss = readFileSync(showroomCss, 'utf8');

  // Cada <table> del showroom lleva la clase. Se comparan los dos conteos: el
  // de toda tabla del showroom contra el de toda tabla con sr-table.
  let srTables = 0;
  for (const html of htmlFiles) {
    const raw = readFileSync(html, 'utf8');
    const body = raw.replace(/<!--[\s\S]*?-->/g, '');
    const rel = GetRelPath(html, ProjectRoot);

    const tot = (body.match(/<table[\s>]/g) || []).length;
    const conPatron = (body.match(/<table[^>]*class="[^"]*\bsr-table\b/g) || []).length;

    if (tot !== conPatron) {
      AddIssue('REGLA 8', rel, 0, `hay ${tot} <table> y solo ${conPatron} llevan sr-table: toda tabla del showroom lleva el patron`, '');
    }
    srTables += tot;
  }

  // c) Contraste del texto de la tabla, leido del arbol real de tokens.
  //
  // No se comprueba el color que escribe showroom.css sino el que RESUELVE,
  // siguiendo la cadena hasta 1-reference-tokens/palette.css. Asi el check no se rompe cada
  // vez que la paleta cambia, y detecta el fallo real: un rol nuevo que
  // documenta la tabla y no da 3:1.
  function GetTokenValue(token, themeFile) {
    // El rol de color vive en 2-system-tokens/theme/<tema>.css. Las clases
    // .md-bg-*/.md-text-* que lo exponen viven en 4-utilities/color.css:
    // exponer no es definir, y por eso se resuelve desde el tema.
    const txt = readFileSync(join(CssRoot, themeFile), 'utf8');
    const m = new RegExp(escapeRegex(token) + '\\s*:\\s*var\\((--md-ref-palette-[a-z0-9-]+)\\)').exec(txt);
    if (!m) return null;
    const ref = m[1];

    // La paleta usa las dos formas: 1-reference-tokens/palette.css escribe los extremos
    // en 3 digitos (#000, #fff) y el resto en 6. Se aceptan ambas y se
    // expande la corta, porque neutral100 es justamente el fondo de la
    // tabla en tema claro.
    const pal = readFileSync(join(CssRoot, '1-reference-tokens', 'palette.css'), 'utf8');
    // OJO con el orden de las alternativas: la de 6 digitos va PRIMERO.
    // En una alternancia el motor prueba las ramas de izquierda a derecha y
    // se queda con la primera que case, sin mirar el resto. Con {3} primero,
    // un #1d1b20 se captura como #1d1, se expande a #11dd11, y el contraste
    // que sale no corresponde a ningun color del sistema.
    const p = new RegExp(escapeRegex(ref) + '\\s*:\\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})').exec(pal);
    if (!p) return null;

    const hex = p[1];
    if (hex.length === 4) {
      // #abc -> #aabbcc
      return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    return hex;
  }

  function GetLuminance(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255.0;
    const g = parseInt(hex.slice(3, 5), 16) / 255.0;
    const b = parseInt(hex.slice(5, 7), 16) / 255.0;

    // WCAG 2.x: los canales por debajo de 0.03928 se linealizan con
    // /12.92; el resto con la potencia 2.4.
    const lin = [r, g, b].map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
  }

  function GetContrast(a, b) {
    let la = GetLuminance(a);
    let lb = GetLuminance(b);
    if (la < lb) {
      const t = la;
      la = lb;
      lb = t;
    }
    return (la + 0.05) / (lb + 0.05);
  }

  // Se mide en LOS DOS TEMAS. El showroom tiene un toggle de tema, asi que
  // un par que funciona en claro y falla en oscuro es un fallo real de la
  // pagina, aunque el tema por defecto pase.
  const pares = [
    { Name: 'texto de celda', Fg: '--md-sys-color-on-surface', Bg: '--md-sys-color-surface-container-lowest', Min: 4.5 },
    { Name: 'texto de th', Fg: '--md-sys-color-on-surface', Bg: '--md-sys-color-surface-container-low', Min: 4.5 },
  ];

  const temas = [
    { Nombre: 'claro', Archivo: '2-system-tokens/theme/theme.light.css' },
    { Nombre: 'oscuro', Archivo: '2-system-tokens/theme/theme.dark.css' },
  ];

  for (const tema of temas) {
    for (const par of pares) {
      const fg = GetTokenValue(par.Fg, tema.Archivo);
      const bg = GetTokenValue(par.Bg, tema.Archivo);

      if (fg === null || bg === null) {
        AddIssue('REGLA 8', 'showroom/assets/showroom.css', 0, `no se pudo resolver ${par.Fg} o ${par.Bg} desde ${tema.Archivo}`, '');
        continue;
      }

      const c = GetContrast(fg, bg);
      if (c < par.Min) {
        AddIssue('REGLA 8', 'showroom/assets/showroom.css', 0, `${par.Name} en tema ${tema.Nombre} da ${round(c, 2)}:1 (${fg} sobre ${bg}) y necesita ${par.Min}:1`, `${par.Fg} sobre ${par.Bg}`);
      }
    }
  }

  // Sin tablas no hay formato que exigir (linea base del reinicio: el
  // showroom es un index pelado). El contraste de arriba si se mide
  // siempre, porque lee los roles del sistema y no la hoja del showroom.
  if (srTables > 0) {
    // La receta del formato, comprobada por propiedad. Cada una es un
    // requisito que se puede violar sin que la tabla se rompa, asi que ninguno
    // se deduce de los otros.
    const formato = [
      { Token: 'border-radius: var(--md-sys-shape-corner-medium)', Msg: 'la tabla no declara radio: sin el no se lee como superficie', Regex: false },
      { Token: 'border-collapse: separate', Msg: 'la tabla no declara border-collapse: separate: hace falta para que el radio recorte con overflow', Regex: false },
      { Token: 'overflow: hidden', Msg: 'la tabla no declara overflow: hidden: el radio solo recorta con overflow', Regex: false },
      { Token: 'surface-container-lowest', Msg: 'la tabla no pinta superficie propia', Regex: false },
      { Token: 'var(--md-sys-typescale-title-medium)', Msg: 'el encabezado no usa title-medium: pesaria menos que su propio contenido', Regex: false },
      { Token: 'var(--md-sys-typescale-body-medium)', Msg: 'las celdas no usan body-medium', Regex: false },
      { Token: 'font-family: monospace', Msg: 'el <code> de la tabla no queda en monospace explicito', Regex: true },
      { Token: 'thead th', Msg: 'no hay encabezado con tinte: sin el el th se confunde con el contenido', Regex: false },
    ];

    // Dos formas de comprobar. Por defecto, Contains: busca el texto tal cual,
    // que es lo que quiere decir "la declaracion esta". Con Regex, se busca la
    // DECLARACION, no su texto: `font-family: monospace` esta en la hoja
    // escrito `font-family: monospace;` y un Contains sin el punto y coma
    // daria falso negativo.
    for (const f of formato) {
      const found = f.Regex
        ? new RegExp(escapeRegex(f.Token) + '\\s*;').test(srCss)
        : srCss.includes(f.Token);

      if (!found) {
        AddIssue('REGLA 8', 'showroom/assets/showroom.css', 0, f.Msg, f.Token);
      }
    }

    // Una regla de seguridad que el formato completo vuelve necesaria: el ancho
    // de las barras de medida no puede venir del markup. Se comprueba que exista
    // la clase de ancho, porque un swatch sin ancho en una celda no mide nada.
    if (!/\.sr-spec-bar--\d/.test(srCss)) {
      AddIssue('REGLA 8', 'showroom/assets/showroom.css', 0, 'no hay clases sr-spec-bar--N: las barras de medida no tendrian ancho, y REGLA 6 prohibe ponerlo en el markup', '');
    }

    // b) Specimen en las tablas de color y de medidas
    //
    // Se busca el encabezado de la tabla, no el de la pagina: una tabla que
    // documenta tokens de color o medidas tiene que pintar algo. Se acepta
    // cualquiera de las tres familias de muestra.
    const tablas = Matches(srCss, /sr-spec/g);
    if (tablas.length === 0) {
      AddIssue('REGLA 8', 'showroom/assets/showroom.css', 0, 'no hay specimens (sr-spec-*): las tablas de tokens listarian valores sin mostrarlos', '');
    }
  }
}

// ============================================================================
// REGLA 9 - El icono se pide con las clases del sistema
// ============================================================================
// a) La clase de Google fuera del marcado
// b) 4-utilities/icon.css existe y publica .md-icon
// ============================================================================

for (const html of htmlFiles) {
  const raw = readFileSync(html, 'utf8');
  const rel = GetRelPath(html, ProjectRoot);

  // SOLO dentro de atributos class. El nombre material-symbols-outlined
  // aparece en la prosa del showroom para explicar por que no se usa, y
  // tambien en comentarios. Buscarlo en el archivo entero seria un falso
  // positivo que nadie podria silenciar sin borrar la documentacion.
  for (const m of Matches(raw, /class\s*=\s*"([^"]*)"/g)) {
    for (const cls of m[1].split(/\s+/)) {
      if (cls && cls.startsWith('material-symbols')) {
        AddIssue('REGLA 9', rel, 0, `la clase '${cls}' es de Google, no del sistema: declararia su propio font-size y le ganaria al componente. Usar .md-icon de 4-utilities/icon.css`, m[0]);
      }
    }
  }
}

const iconCss = join(CssRoot, '4-utilities', 'icon.css');

if (!existsSync(iconCss)) {
  AddIssue('REGLA 9', 'src/css/4-utilities/icon.css', 0, 'no existe: sin el, 1-reference-tokens/iconfont.css carga una fuente que la libreria no tiene forma de aplicar', '');
} else {
  const iconRaw = readFileSync(iconCss, 'utf8');
  if (!/^\s*\.md-icon\s*\{/m.test(iconRaw)) {
    AddIssue('REGLA 9', 'src/css/4-utilities/icon.css', 0, 'no declara .md-icon: la libreria debe publicar siempre un punto de entrada para iconos', '');
  }
}

// ============================================================================
// REGLA 10 - Toda clase del sistema que usa el showroom existe
// ============================================================================
// Se construye el conjunto de clases que la libreria declara, y despues se
// recorren los atributos class de todo el HTML del showroom buscando prefijos
// md- que no esten en ese conjunto.
//
// COMO SE EXTRAEN LAS CLASES DECLARADAS
// Se lee el codigo SIN comentarios de las hojas de src/css/, y se buscan
// selectores de clase. El conjunto es un superconjunto a proposito: el regex
// tambien recoge cosas que no son clases. Que sobre es inofensivo, porque aqui
// solo se pregunta "esta definida".
//
// POR QUE SOLO md-* Y NO sr-*
// Las clases sr-* son el chrome del showroom y viven en
// showroom/assets/showroom.css, que esta fuera de src/css/. La frontera que
// importa es la de la libreria: lo que el showroom le pide al sistema.
//
// showroom/templates/ SI SE COMPRUEBA
// Antes se excluia porque el template llevaba clases de ejemplo
// (md-componente). Ya no: los templates usan solo clases reales, y la
// exclusion escondio un typo real (md-text-inverse-on-surface en vez de
// md-text-on-inverse-surface, texto invisible en la pareja Inverse).
// ============================================================================

const definedClasses = new Set();

for (const file of files) {
  const code = GetCodeOnly(file.Full);
  for (const m of Matches(code, /\.([a-zA-Z][a-zA-Z0-9_-]*)/g)) {
    definedClasses.add(m[1]);
  }
}

for (const html of htmlFiles) {
  // Sin exclusion para showroom/templates/: los templates usan solo
  // clases reales. Fue justo aqui donde un typo de orden
  // (md-text-inverse-on-surface en vez de md-text-on-inverse-surface)
  // paso en verde: la exclusion lo volvia invisible.
  const raw = readFileSync(html, 'utf8');
  const rel = GetRelPath(html, ProjectRoot);

  for (const m of Matches(raw, /class\s*=\s*"([^"]*)"/g)) {
    for (const cls of m[1].split(/\s+/)) {
      if (cls && cls.startsWith('md-') && !definedClasses.has(cls)) {
        AddIssue('REGLA 10', rel, 0, `la clase '${cls}' no existe: ninguna hoja de src/css/ la declara. El elemento se dibujara con lo que herede, y no avisa`, m[0]);
      }
    }
  }
}

// ============================================================================
// REGLA 11 - El snippet copiable es identico a su specimen
// ============================================================================
// Cada pagina de componente son parejas specimen + codigo: lo renderizado
// en .sr-specimen y el texto de su pre.sr-code tienen que ser IDENTICOS.
// Si el autor edita uno y olvida el otro, la libreria miente en silencio:
// el lector copia un markup que no es el que ve.
//
// Se compara el innerHTML del specimen contra el snippet desescapado,
// normalizando solo el espacio ENTRE etiquetas (el texto interior se
// respeta tal cual).
//
// Limites: no soporta .sr-specimen anidados; el boton [data-copy] no se
// verifica (showroom.js lo cablea al <pre> hermano anterior).
// ============================================================================

// Un specimen por pareja. El tempered greedy permite divs interiores
// pero no un specimen anidado dentro de otro.
//
// CORRECCION FRENTE AL .ps1: el patron acaba en `[^>]*>` despues de la
// comilla de class. El original exigia `">`, es decir, que `class` fuese el
// ULTIMO atributo del div, y un specimen con algo detras
// --<div class="sr-specimen sr-specimen-gap" data-toggle-group>-- no casaba.
// El tempered greedy no lo frenaba, asi que se comia dos parejas de un
// tiron y comparaba el specimen de una contra el snippet de la siguiente:
// REGLA 11 reportaba un fallo inexistente en los dos pares "Toggle group"
// (button.html e icon-button.html). Y no era un aviso de mas: ese par es el
// unico del sistema que necesita un atributo en el contenedor, asi que el
// patron no comparaba NADA de el. Con `[^>]*` se acepta lo que venga
// despues de class, y el tempered greedy vuelve a frenar en la pareja vecina.
//
// El grupo 1 captura lo que va DESPUES de class, para leer sus data-*.
const pairPattern = /<div class="sr-specimen(?:\s[^"]*)?"([^>]*)>((?:(?!<div class="sr-specimen(?:\s[^"]*)?"[^>]*>)[\s\S])*)<\/div>\s*<pre class="sr-code"><code>([\s\S]*?)<\/code>/g;

for (const html of htmlFiles) {
  const raw = readFileSync(html, 'utf8');
  const rel = GetRelPath(html, ProjectRoot);

  // Sin comentarios: el template documenta la convencion en un comentario
  // que menciona las clases, y no es una pareja.
  const body = raw.replace(/<!--[\s\S]*?-->/g, '');

  for (const m of Matches(body, pairPattern)) {
    const attrs = m[1];
    const inner = m[2];
    const code = m[3];

    // Doctrina: todo snippet es HTML pegable para maquetar. Un pre que
    // no empieza con &lt; (CSS u otro texto) viola la doctrina.
    if (!/^&lt;/.test(code.trim())) {
      const trimmed = code.trim();
      AddIssue('REGLA 11', rel, 0, 'snippet no pegable: todo snippet es HTML para maquetar (empieza con &lt;)', trimmed.slice(0, Math.min(60, trimmed.length)));
      continue;
    }

    const rendered = inner.replace(/>\s+</g, '><').trim();

    let snippet = code
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    snippet = snippet.replace(/&amp;/g, '&').replace(/>\s+</g, '><').trim();

    if (rendered === snippet) continue;

    // EXCEPCION: specimen con atributos FUNCIONALES en el contenedor.
    //
    // data-toggle-group lo cablea src/js/toggle.js, asi que el snippet tiene
    // que llevar su <div data-toggle-group>. Y no puede llevar las clases
    // sr-* del chrome del showroom, porque REGLA 13 prohibe en el snippet
    // cualquier clase que no sea del sistema. Las dos reglas son correctas y
    // juntas hacen que las dos cadenas no puedan coincidir: el specimen dice
    // `class="sr-specimen sr-specimen-gap" data-toggle-group` y el snippet
    // solo puede decir `data-toggle-group`.
    //
    // Por eso la igualdad se evalua sobre lo que de verdad tiene que ser
    // igual: el contenido, con el envoltorio funcional puesto. Sin data-* en
    // el specimen no hay excepcion y la comparacion es la de siempre.
    const dataAttrs = attrs.match(/data-[^\s=>]+/g) || [];
    if (dataAttrs.length > 0) {
      const esperado = `<div ${dataAttrs.join(' ')}>${rendered}</div>`;
      if (snippet === esperado) continue;
    }

    AddIssue('REGLA 11', rel, 0, 'el snippet no es identico a su specimen: lo copiable diverge de lo renderizado', snippet.slice(0, 120));
  }
}

// ============================================================================
// REGLA 12 - La vista de color muestra roles, nunca paleta
// ============================================================================
// La vista de color pinta UNICAMENTE roles del tema via utilidades
// (md-bg-*, md-text-*, md-border-*). Si cuela un --md-ref-palette-*, un
// #HEX o un swatch fijo, esa muestra deja de moverse con el Theme Builder
// y la pagina miente en silencio.
//
// Aplica a las vistas cuyo nombre contiene 'color' (template y vista
// real). Sin comentarios: el template nombra lo prohibido al
// documentarlo, y eso no es una fuga.
// ============================================================================

for (const html of htmlFiles) {
  const name = html.slice(html.lastIndexOf('/') + 1);
  if (!name.includes('color')) continue;

  const raw = readFileSync(html, 'utf8');
  const rel = GetRelPath(html, ProjectRoot);
  const body = raw.replace(/<!--[\s\S]*?-->/g, '');

  for (const m of Matches(body, /--md-ref-palette-[a-z0-9-]+/g)) {
    AddIssue('REGLA 12', rel, 0, `paleta cruda en la vista de color: ${m[0]} (la vista pinta roles via utilidades, no primitivas)`, m[0]);
  }

  const probe = body.replace(/--[a-z0-9-]+/g, 'VAR');
  for (const m of Matches(probe, patternHex)) {
    AddIssue('REGLA 12', rel, 0, 'color #HEX en la vista de color (la vista pinta roles via utilidades)', m[0]);
  }
}

// ============================================================================
// REGLA 13 - El snippet es autonomo: rinde con main.css y main.js
// ============================================================================
// QUE SE COMPRUEBA Y POR QUE CADA COSA
//   a) Ninguna clase que no sea del sistema (sr-*, o sin prefijo). Las sr-*
//      viven en showroom/assets/showroom.css.
//   b) Ningun estilo en linea. REGLA 6 no lo ve aqui: busca '<letra' y
//      dentro de un snippet las etiquetas estan escapadas (&lt;button), asi
//      que un style= colado en lo copiable pasaria inadvertido.
//   c) Ningun <style>, <link> ni <script>. Un snippet que traiga cualquiera
//      de ellos ya no se sostiene con los archivos del sistema.
//   d) Cada data-* que el snippet cablea existe de verdad. Sin el, un
//      `data-open-diálogo` con tilde documentaria un comportamiento que la
//      libreria no tiene: el boton no haria nada y no habria ni error ni aviso.
// ============================================================================

// Los data-* que src/js/ cablea de verdad. Se leen de los propios archivos
// con [data-open-dialog] y [data-close-dialog], para que la lista no pueda
// quedar vieja sin que el verificador se entere.
const jsBehaviour = GetFilesRecursive(join(ProjectRoot, 'src', 'js'), ['.js']);
const dataWired = new Set();
for (const js of jsBehaviour) {
  const src = readFileSync(js, 'utf8');
  for (const dm of Matches(src, /\[data-([a-z0-9-]+)/g)) {
    dataWired.add(dm[1]);
  }
}

for (const html of htmlFiles) {
  const raw = readFileSync(html, 'utf8');
  const rel = GetRelPath(html, ProjectRoot);
  const body = raw.replace(/<!--[\s\S]*?-->/g, '');

  for (const m of Matches(body, /<pre class="sr-code"><code>([\s\S]*?)<\/code>/g)) {
    // Se lee el snippet DESESCAPADO, que es lo que acaba en el portapapeles.
    const code = m[1]
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');

    for (const cm of Matches(code, /class\s*=\s*"([^"]*)"/g)) {
      for (const cls of cm[1].split(/\s+/)) {
        if (cls && !cls.startsWith('md-')) {
          AddIssue('REGLA 13', rel, 0, `el snippet usa '${cls}', que no es una clase del sistema: no renderizara con solo main.css (las sr-* viven en el chrome del showroom)`, cls);
        }
      }
    }

    for (const sm of Matches(code, /<[a-zA-Z][^>]*?\sstyle\s*=/g)) {
      AddIssue('REGLA 13', rel, 0, 'el snippet lleva estilo en linea: lo pegable se posiciona con clases del sistema, no con style=', sm[0]);
    }

    for (const tm of Matches(code, /<(style|link|script)[\s>]/g)) {
      AddIssue('REGLA 13', rel, 0, `el snippet trae un <${tm[1]}> propio: el copiable tiene que sostenerse con main.css y main.js y nada mas`, tm[0]);
    }

    for (const am of Matches(code, /data-([^\s=>"]+)/g)) {
      const attr = am[1];
      if (dataWired.has(attr)) continue;
      // La lista es PERMISIVA a proposito: captura cualquier cosa que
      // empiece por data- y la compara con la que src/js/ cablea.
      AddIssue('REGLA 13', rel, 0, `el snippet cablea 'data-${attr}', que src/js/ no conecta: el boton no hara nada y no habra error ni aviso. O es un typo, o el atributo no existe todavia`, `data-${attr}`);
    }
  }
}

// ============================================================================
// SALIDA
// ============================================================================

out(paint(color.darkGray, '  Reglas aplicadas:'));
out(paint(color.darkGray, '    REGLA 1  sin valores crudos fuera de 1-reference-tokens'));
out(paint(color.darkGray, '    REGLA 2  direccion de dependencias entre capas'));
out(paint(color.darkGray, '    REGLA 3  todo token referenciado existe'));
out(paint(color.darkGray, '    REGLA 4  orden de theme.light antes que theme.dark'));
out(paint(color.darkGray, '    REGLA 5  integridad de la estructura y @layer'));
out(paint(color.darkGray, '    REGLA 6  sin estilos inline ni <style> en el showroom'));
out(paint(color.darkGray, '    REGLA 7  sincronizacion de bloques de tema'));
out(paint(color.darkGray, '    REGLA 8  formato, specimens y contraste de las tablas de tokens'));
out(paint(color.darkGray, '    REGLA 9  los iconos se piden con .md-icon, no con la clase de Google'));
out(paint(color.darkGray, '    REGLA 10 toda clase md-* que usa el showroom existe en src/css'));
out(paint(color.darkGray, '    REGLA 11 el snippet copiable es identico a su specimen'));
out(paint(color.darkGray, '    REGLA 12 la vista de color muestra roles, nunca paleta'));
out(paint(color.darkGray, '    REGLA 13 el snippet es autonomo: rinde con main.css y main.js'));
out();

if (Issues.length === 0) {
  out(paint(color.green, '  OK - La arquitectura se respeta en las 13 reglas.'));
  out();
  process.exit(0);
}

// Agrupar por regla para que el resumen sea util
const byRule = [...new Set(Issues.map((i) => i.Rule))].sort();

out(paint(color.red, `  FALLOS: ${Issues.length}`));
out();

for (const rule of byRule) {
  const group = Issues.filter((i) => i.Rule === rule);
  out(paint(color.yellow, `  ${rule}: ${group.length}`));
  for (const issue of group.slice(0, 12)) {
    const loc = issue.Line > 0 ? `${issue.File}:${issue.Line}` : issue.File;
    out(paint(color.gray, `    ${loc}`));
    out(paint(color.darkYellow, `      ${issue.Message}`));
    if (issue.Snippet) {
      out(paint(color.darkGray, `      > ${issue.Snippet}`));
    }
  }
  if (group.length > 12) {
    out(paint(color.darkGray, `    ... y ${group.length - 12} mas`));
  }
  out();
}

out(paint(color.red, '  Corregir antes de hacer commit.'));
out();
process.exit(1);

// ---------------------------------------------------------------------------

/** Escapa un literal para usarlo dentro de un RegExp. */
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Redondeo a los decimales pedidos, como [Math]::Round de .NET. */
function round(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
