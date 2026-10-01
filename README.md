# RDM Next — Design System

Showroom de componentes UI para **ManGo! App** (`mango-next`).
Estándar: **Google Material Design 3 (M3)**.

---

## 1. Propósito

Este repositorio es la **fuente única de verdad** del sistema de diseño de ManGo!.

No es una maqueta ni un prototipo: es la implementación real de tokens y recetas que
consumirá el sistema final. El showroom y la app de producción cargan **el mismo
orquestador `css/main.css`**. Lo que se ve aquí es exactamente lo que se ejecuta allí.

---

## 2. Arquitectura: la jerarquía de 3 capas

El sistema se organiza en tres capas con dependencias **unidireccionales**.
Cada capa solo puede consumir la capa inmediatamente anterior.

```
css/
├── 1-ref/    Primitivas       --md-ref-*
├── 2-sys/    Tokens semánticos --md-sys-*
└── 3-comp/   Componentes      --md-comp-*
```

### Regla de dependencia

```
1-ref  ──►  2-sys  ──►  3-comp
 (valores)   (roles)     (componentes)
```

- `3-comp/` **nunca** referencia `1-ref/` directamente.
- `2-sys/` **nunca** referencia `3-comp/`.
- `1-ref/` **nunca** referencia `2-sys/` ni `3-comp/` (sería dependencia circular).

Si un componente necesita un valor crudo, **no lo usa**: pide un token semántico a
`2-sys/`, y si ese rol no existe, se crea primero en `2-sys/`. Esa es la disciplina que
hace que el tema sea cambiable sin tocar componentes.

### Prefijos de tokens

| Capa     | Prefijo          | Contiene                                |
| -------- | ---------------- | --------------------------------------- |
| `1-ref/` | `--md-ref-*`     | Valores crudos, sin contexto semántico  |
| `2-sys/` | `--md-sys-*`     | Roles con significado de diseño         |
| `3-comp/`| `--md-comp-*`    | Decisiones específicas de un componente |

### Prefijos de clases: el criterio tokens-largos / clases-cortas

Los tokens usan el **nombre oficial de M3** íntegro. Las clases usan el **prefijo corto**,
porque en el markup cada carácter cuenta y el nombre completo ya está a un click de
distancia en la hoja de estilos.

| Concepto                 | Token (oficial de Google)  | Clase (forma corta) |
| ------------------------ | -------------------------- | ------------------- |
| Escala tipográfica       | `--md-sys-typescale-*`     | `.md-type-*`        |
| Tipografía de referencia | `--md-ref-typescale-*`     | *(no lleva clase)*  |
| Familia de fuente        | `--md-ref-typeface-*`      | *(no lleva clase)*  |
| Color de fondo           | `--md-sys-color-*`         | `.md-bg-*`          |
| Color de texto           | `--md-sys-color-*`         | `.md-text-*`        |
| Color de borde           | `--md-sys-color-*`         | `.md-border-*`      |
| Esquinas                 | `--md-sys-corner-*`        | `.md-shape-*`       |
| Medidas                  | `--md-sys-measurement-*`   | `.md-measure-*`     |

**La única excepción de esta regla** es tipografía, donde el nombre oficial es
`typescale` y la forma corta es `type`. El motivo es que en HTML
`class="md-type-body-medium"` se lee mejor que `class="md-typescale-body-medium"`, y a
diferencia de `bg`/`text`/`border`, `type` no es ambiguo: no hay otra propiedad que
empiece igual.

**Consecuencia práctica:** si traes un ejemplo de la documentación de Google, las clases
se llaman distinto. El mapeo es mecánico: quita `md-typescale-`, pon `md-type-`.

```html
<!-- Google Material Web -->
<h1 class="md-typescale-display-large">…</h1>

<!-- RDM Next -->
<h1 class="md-type-display-large">…</h1>
```

**Lo que NO se puede copiar tal cual:** las clases de Google emiten el atajo
`font: weight size/line-height family`. Las nuestras emiten las cuatro propiedades
separadas, más `font-optical-sizing` y `font-variation-settings`, que son lo que
configura Google Sans Flex como variable. Copiar el `class` sin el CSS no aplica nada,
y pegar nuestro CSS sobre su `class` tampoco funciona.

**Modificador `-prominent`:** con un solo guion, igual que Google
(`.md-typescale-label-medium-prominent`). Antes se usaban dos (`--prominent`) por
influencia de BEM, que no aplica en este proyecto; normalizado junto con esto.

### Cuántas clases de utilidad publica Google (y cuántas publicamos nosotros)

La tabla de arriba puede leerse como si nuestras clases replicaran las de Google.
No lo hacen, y conviene tener el dato medido.

Auditado sobre el repositorio completo de `@material/web` 2.5.0
(`material-components/material-web`):

```
Clases distintas en TODO el repositorio:  10
  .md-typescale-*        8   generadas por typescale.styles() en typography/_typescale.scss
  .md-icon               1   experimento en labs/gb/, no parte del sistema de estilos
  .md-stories-bg-override 1  del sitio de documentación (catalog/)

Clases de este proyecto:  167
  colors 93 · typography 32 · shape 14 · elevation 12 · motion 8 · state 6 · measurement 2
```

Las 6 de `state` son `.md-state-layer` más sus cuatro modificadores
(`--hover`, `--focus`, `--pressed`, `--dragged`) y `.md-disabled`, que aplica `opacity` al
contenido inactivo —no es un *state layer*: no hay capa encima, el propio contenido se
atenúa—.

Esas cuatro usan **doble guion**, a diferencia del `-prominent` de tipografía, que se
normalizó a uno. Queda como inconsistencia pendiente, no resuelta: el criterio todavía no
está escrito.

**Material Web publica 8 clases de utilidad. Publicamos 167.** Compartimos una sola
familia: la tipográfica.

La prueba más directa está en el `package.json` de la librería:

```json
{
  "name": "@material/web",
  "version": "2.5.0",
  "customElements": [ … ],
  "files": [ "**/*.js", "**/*.scss", "**/*.css", … ]
}
```

**No hay campo `style` ni campo `sass`.** Una librería que publicara utilidades CSS los
tendría. Los únicos `.css` del repositorio son de `catalog/site/` —la página de
documentación— y están excluidos del paquete con `!catalog/`.

Además, en `.md-bg-*`, `.md-text-*` y `.md-border-*` hay **cero coincidencias** en todo el
repositorio. Nuestras 93 clases de color no existen en Google.

### Cómo aplica Google el color, la elevación y el estado sin clases

No hay atajo de utilidad porque el mecanismo es otro: **web components con tokens propios
y estilos internos.** Tres formas distintas, ninguna con clase global.

**1. Cada componente expone sus propios tokens, y el tema los alimenta.**

```scss
// button/internal/_filled-button.scss
@mixin theme($tokens) {
  @each $token, $value in $tokens {
    --md-filled-button-#{$token}: #{$value};
  }
}
```

Ahí no hay `.md-btn-primary`: hay un elemento `<md-filled-button>` que se tema por variables.

**2. `:host` y pseudo-elementos, en lugar de clases de estado.**

```scss
// elevation/internal/_elevation.scss
:host { display: flex; pointer-events: none; }
.shadow::before { box-shadow: …; opacity: 0.3; }   /* sombra key    */
.shadow::after  { box-shadow: …; opacity: 0.15; }  /* sombra ambient */
```

Nosotros exponemos `.md-elevation-3`. Google usa `<md-elevation>` con un `--_level`
interno y dos sombras superpuestas. **La elevación no se pide con una clase: se pide con
un elemento.**

**3. `currentColor` para los colores.** Igual que nosotros en `2-sys/state.css`: la capa de
estado toma el color del contenido, no un color propio.

### Qué significa para este proyecto

Nuestra forma de consumir tokens es una **decisión de arquitectura distinta**, no una
convención heredada. Conviene decir las dos cosas:

**Lo que se gana:** el HTML puede tomar decisiones de diseño sin escribir CSS. Esto resuelve
un hueco concreto:

```html
<p class="md-text-primary">Texto primario fuera de un componente</p>
```

Con Material Web, ese mismo párrafo necesita que escribas la regla del color. No existe
clase oficial que lo haga. La REGLA 6 del proyecto prohíbe escribirla en el HTML, así que
sin nuestras clases no habría forma de cumplirla para texto suelto.

**Lo que se pierde:** la interoperabilidad directa con Material Web. No se puede tomar un
`<md-button>` de su documentación y aplicarle nuestras clases, porque sus estilos viven en
`:host`, dentro del shadow DOM de un web component, y no en clases que se puedan añadir
desde fuera.

Esto no es un defecto pendiente de corregir: es el compromiso que hace que el sistema
funcione en HTML+CSS estático sin capa de build.

---

## 3. La regla del hardcoding

> **Los valores crudos viven exclusivamente en `css/1-ref/`.**

| Capa     | `#HEX`, `px`, `ms`, números sueltos | Referencias permitidas |
| -------- | ----------------------------------- | ---------------------- |
| `1-ref/` | ✅ Permitido                        | Ninguna                |
| `2-sys/` | ❌ **Prohibido**                    | Solo `--md-ref-*`      |
| `3-comp/`| ❌ **Prohibido**                    | Solo `--md-sys-*`      |

En `2-sys/` y `3-comp/` **toda** declaración debe ser un `var()`.

### Por qué existe esta regla

`1-ref/` es el **único** lugar donde se toca el tema. Si un componente tuviera
`#6750A4` hardcodeado, cambiar la paleta obligaría a editar ese componente. Al aislar
los valores crudos en una sola capa, un cambio de marca se resuelve editando cuatro
archivos y nada más.

Esta regla es verificable de forma automática con `tools/verify-tokens.ps1`.

---

## 4. Nomenclatura: qué es oficial de M3 y qué es decisión propia

Distinguimos entre tokens publicados por Google y convenciones de este proyecto,
porque mezclarlos lleva a buscar en la documentación oficial algo que no existe.

### Oficial de M3

Verificado contra los archivos publicados por Google. Nombres exactos:

| Familia                  | Archivo          | Notas                                       |
| ------------------------ | ---------------- | ------------------------------------------- |
| `--md-ref-palette-*`     | `1-ref/palette.css` | 91 tonos (v0.192)                      |
| `--md-ref-typeface-*`    | `1-ref/typeface.css`| 7 tokens: 5 de Google (plain, brand, 3 pesos) + 2 propios (`font-optical-sizing`, `font-variation-settings`) |
| `--md-ref-typescale-*`   | `1-ref/typescale.css` | 45 medidas (15 estilos × size/line-height/tracking) |
| `--md-ref-stroke-*`      | `1-ref/stroke.css` | 3 grosores — **extensión propia**       |
| `--md-ref-corner-*`      | `1-ref/corner.css` | 10 radios de esquina                     |
| `--md-sys-color-*`       | `2-sys/theme/*.css` | 37 roles × 2 temas                      |
| `md-bg-*` / `md-text-*` / `md-border-*` | `2-sys/colors.css` | 93 clases utilitarias de color |
| `--md-sys-typescale-*`   | `2-sys/typography.css` | 92 tokens (15 estilos × 5 sub-tokens + 15 compuestos + 2 `weight-prominent`) |
| `.md-type-*`             | `2-sys/typography.css` | 32 clases tipográficas               |
| `--md-sys-shape-*`       | `2-sys/shape.css`| 15 roles de esquina + variantes por lado |
| `--md-sys-motion-*`      | `2-sys/motion.css`| 16 duraciones + 10 curvas                 |
| `--md-ref-easing-*`      | `1-ref/easing.css`| 40 puntos de control (10 curvas × 4)      |
| `--md-sys-elevation-*`   | `2-sys/elevation.css` | 6 niveles (key + ambient)              |
| `--md-ref-shadow-*`      | `1-ref/shadow.css` | 14 tokens: 6 geometrías `key-*` + 6 `ambient-*` + 2 opacidades. Google **no publica** sombras: la geometría salió de los comentarios del código de `<md-elevation>` |
| `--md-sys-state-*`       | `2-sys/state.css`| 5 roles de estado + 6 utilidades          |
| `--md-ref-opacity-*`     | `1-ref/opacity.css`| 4 opacidades crudas                      |

> **Nota sobre `typescale`:** el prefijo real de Google es `typescale`, no `typography`.
> El archivo se llama `typography.css` por legibilidad, pero los tokens usan
> `--md-sys-typescale-*`. Confundir ambos nombres es un error frecuente.

> **Nota sobre `weight-prominent`:** existen **dos**, no tres.
> Google publica `label-large-weight-prominent` y `label-medium-weight-prominent`,
> y **no** publica uno para `label-small`.
> Verificado en `tokens/versions/v0_192/_md-sys-typescale.scss`: el token no existe.
> La documentación de m3.material.io describe quince estilos "emphasized", pero el
> SCSS de Material Web solo emite los que tienen valor, y ese no lo tiene
> (`_typescale.scss`: *"the prominent selector is not emitted by Sass when a
> typescale's prominent values are null"*).
> Por eso existen dos clases `.md-type-label-*-prominent` y no tres. Este proyecto
> declaraba también el tercero; se eliminó para no divergir de la fuente.

> **Nota sobre la versión de tokens:** seguimos **v0.192**, no la última.
> El repositorio de Material Web contiene tres generaciones:
> `tokens/_md-*.scss` (actual), `tokens/v0_192/` (la nuestra) y
> `tokens/versions/latest/sass/`, que corresponde a la **versión de diseño 34.0.21**.
> Esa última cambió el modelo tipográfico: usa tags de variable font
> (`-wght`, `-opsz`, `-wdth`, `-slnt`) en lugar de `-weight`, y sube de 92 a 213
> tokens. También añadió contraste alto (`_md-sys-color__high-contrast.scss`) y
> `md.sys.state.focus-indicator`.
>
> No se adoptó a propósito: cambiaría los 93 tokens de typescale por 213, y
> `font-variation-settings` (ya presente en `1-ref/typeface.css`) cubre ese caso.
> Se anota aquí para que la diferencia sea una decisión documentada y no un olvido.
> La escala de `corner` de `latest/` **sí** coincide con la nuestra, incluidos
> `large-increased` y `extra-large-increased`.

> **Nota sobre `colors.css`:** este archivo **no define variables `:root`**.
> Expone los roles como clases utilitarias que consumen `var(--md-sys-color-*)`.
> Los valores viven exclusivamente en `2-sys/theme/theme.light.css` y
> `theme.dark.css`, porque el mismo rol necesita tonos distintos por tema
> (`primary` es tono 40 en claro y tono 80 en oscuro); asignarlos en un archivo
> único crearía una segunda fuente de verdad que competiría con los temas.
>
> El esquema de nombres es **propiedad primero**: `md-bg-<rol>`, `md-text-<rol>`,
> `md-border-<rol>`. Es el criterio de Tailwind y el que mejor escala, porque se
> lee de un vistazo sin llegar al final de la clase. Prefijar con `md-` coincide
> con el namespace que Google usa en `@material/web` (custom elements como
> `<md-filled-button>`), de modo que nuestras utilidades y sus elementos
> conviven sin colisión.
>
> No existe un atajo que empareje fondo con su texto. Se escribe el par
> explícito —`md-bg-primary` + `md-text-on-primary`— para que el contraste sea
> auditable en el HTML. Eso protege la convención `on-*`, que es la garantía de
> accesibilidad del tema.
>
> La vía recomendada para construir componentes sigue siendo la variable
> directa. Las utilidades existen para el HTML del showroom, prototipos y
> utilities genéricos. Si una utilidad crece hasta reproducir un componente M3
> completo, ese es el indicio de que debe pasar a `3-comp/`.

> **Nota sobre la versión de la paleta (v0.192):** existe una versión "compacta"
> de la paleta con 13 tonos por familia que circulaba antes. **No alcanza** para
> los roles `surface-container-*`, que son la base de la jerarquía visual de M3.
> v0.192 amplía `neutral` con 11 tonos finos (4, 6, 12, 17, 22, 24, 87, 92, 94,
> 96, 98) sin los cuales seis roles de superficie quedarían sin valor o colapsarían
> al mismo gris. Este proyecto usa v0.192:
> `material-components/material-web` → `tokens/versions/v0_192/`.

### Decisión propia de RDM Next

Estos nombres **no existen** en los archivos oficiales de M3. Son nuestras, construidas
sobre specs oficiales de Google:

| Familia                   | Archivo             | Origen                                                    |
| ------------------------- | ------------------- | --------------------------------------------------------- |
| `--md-ref-spacing-*`      | `1-ref/spacing.css` | Escala oficial M3 `Space 0`–`Space 900`                     |
| `--md-sys-measurement-*`  | `2-sys/measurement.css` | 10 roles de medida (**extensión propia**) |
| `--md-ref-stroke-*`       | `1-ref/stroke.css` | Grosor de trazo: `none`/`thin`/`thick`                  |

**Detalle importante sobre la escala de espacio:** los nombres `Space 0` … `Space 900`
**sí son oficiales de M3** (publicados en `m3.material.io/styles/spacing/tokens`, con
valores cada 4dp hasta `Space 200` y múltiplos de 8dp después). Lo que **no** es oficial
es el prefijo `md.sys.measurement`; Google nunca publicó un token set de spacing en CSS.
Por eso el nombre lleva prefijo `md-*` propio y está documentado aquí como extensión.

**Verificado contra la fuente primaria** (`_md-sys-color.scss` de Material Web v0.192):
los tokens de sistema de Google son **solo color, elevation, motion, shape, state y
typography**. No existe ningún token de `margin`, `gap` ni `padding`. Por eso
`measurement.css` expone únicamente medidas de componente y de icono, que sí tienen
respaldo en la especificación.

**Los 12 tokens de color que NO adoptamos: la familia `*-fixed`.**
Google publica doce roles que este proyecto no tiene:

```
primary-fixed          primary-fixed-dim           on-primary-fixed
on-primary-fixed-variant
secondary-fixed        secondary-fixed-dim         on-secondary-fixed
on-secondary-fixed-variant
tertiary-fixed         tertiary-fixed-dim          on-tertiary-fixed
on-tertiary-fixed-variant
```

Verificado en `_md-sys-color.scss` v0.192: son los **únicos roles cuyo valor es idéntico
en el tema claro y en el oscuro** (por ejemplo `primary-fixed` mapea a `primary90` en
ambos). Ese es su propósito: mantener la identidad de marca en superficies que no deben
cambiar al alternar el tema.

Se decidió **no adoptarlos** porque hasta ahora ManGo! App no tiene esa necesidad: no hay
color dinámico de marca ni superficies que deban conservar su tono entre temas. Agregarlos
sería agregar tokens muertos.

Si algún día se necesita color dinámico o una superficie de marca invariante, la lista
exacta está arriba y se puede portar sin volver a investigar el SCSS.

**Un token nuestro que Google no publica:** `--md-sys-color-shadow-rgb` (`0 0 0`).
Google expone `--md-sys-color-shadow` pero no la variante en tripletos. Existe porque la
opacidad solo se puede aplicar a un color en formato `rgb()`, y sin este token el `rgba`
quedaría quemado dentro de la geometría de `1-ref/shadow.css`, que es exactamente lo que
la arquitectura prohíbe: la primitiva no puede decidir el color, eso es del tema.

**Lo que NO está en `measurement.css`, y por qué:** los roles de retícula
(`page-margin`, `section-gap`, `item-gap`, `content-padding`) se eliminaron. Ninguno
tiene respaldo en M3 — el margen lateral de página y la separación entre secciones no
aparecen en la especificación — y, más importante, el ritmo de página no es un token:
depende de cuántas secciones hay y de qué contienen. Esa decisión pertenece a un
componente de `3-comp/`, que consumirá `1-ref/spacing.css` directamente. Un componente
puede leer `1-ref` por su cuenta; lo que la arquitectura prohíbe es que un componente lea
tokens de *otro* componente, o que `3-comp` salte `2-sys` en un token compartido.

**Qué aporta `measurement.css` sobre `spacing.css`:** el número no explica su
propósito. `48px` a secas no dice por qué es 48; `--md-sys-measurement-touch-target`
sí, porque comunica la intención. Y la intención es lo que sobrevive al cambio: si
el mínimo táctil pasara a 44px por decisión de accesibilidad, se edita **una vez** en
`2-sys` y ningún componente se entera, porque ninguno conoce el 48 — todos pidieron
`touch-target`. Sin esta capa habría 40 lugares que editar.

A diferencia de los radios, **todos** los roles de `measurement` caen en la escala de
`spacing`. Es el único archivo de `2-sys` sin una sola excepción.

**Sobre el área táctil:** 48dp es el mínimo de zona táctil de Android, un requisito de
accesibilidad (≈9mm; la recomendación es 7–10mm; iOS usa 44×44pt). No es el tamaño del
elemento visible: un icono de 24×24dp tiene un área táctil de 48×48dp, y el padding
alrededor es lo que cuenta. Por eso M3 separa los 24dp del glifo de los 48dp del área.

**Unidad:** M3 está diseñado en **dp**. En web `1dp = 1px`, así que `1-ref/spacing.css`
escribe valores en `px` para que el mapeo contra cualquier spec de Android sea directo
y sin conversión mental.

**Por qué `stroke` es una primitiva aparte de `spacing`:** un borde de 1px no es
"espacio", es un **trazo**. Y hay una razón técnica, no solo semántica: la escala
oficial de espacio de M3 **no tiene 1px** — su salto más pequeño es 2px (`Space 25`).
No existe ningún token de espacio al que `1px` pueda mapearse; el valor más cercano
duplicaría el grosor. Google tampoco publica tokens de grosor de borde (se verificó en
los archivos oficiales de `material-tokens`), así que `--md-ref-stroke-*` es una
extensión nuestra construida sobre el `1px` literal que usan las specs de M3.

| Token                | Valor | Uso                                              |
| -------------------- | ----- | ------------------------------------------------ |
| `--md-ref-stroke-none`  | `0px` | Resetear un borde, animar desde cero         |
| `--md-ref-stroke-thin`  | `1px` | En reposo: outlined cards, divisores, chips    |
| `--md-ref-stroke-thick` | `2px` | Activo: focus, selected, error                 |

Por eso las utilidades `.md-border-*` aplican **solo `border-color`**: el grosor es
una medida y el grosor correcto depende del estado del componente (un separador es
`thin`, el borde de un checkbox sin marcar es `thick`). Esa decisión es del
componente en `3-comp/`, no de una clase de color.

**Por qué `corner.css` no reutiliza `spacing`:** cinco de los siete radios coinciden
con tokens de espacio (`extra-small` 4px = `space-50`, `small` 8px = `space-100`,
`medium` 12px = `space-150`, `large` 16px = `space-200`), y aun así se redefinen.
Es redundancia deliberada:

- **`extra-large` (28px) no existe en la escala.** La escala oficial va
  `0, 25, 50, 75, 100, 125, 150, 175, 200, 250, 300, 400...`; los vecinos de 28px
  son 24px y 32px, ambos a 4px. Usar `space-300` daría un radio 14% más pequeño de
  lo que M3 especifica, y en un modal sheet el redondeo se nota.
- **`full` (9999px) no es una medida de espacio.** Es un "casi infinito" que
  significa "pastilla o círculo". `space-900` es 72px, y 72px de radio en una tarjeta
  de 300px no produce una pastilla.
- **Un radio no es un espaciado aunque coincida el número.** Si la escala de espacio
  se compactara para la app, los radios de M3 no deberían moverse: son parte de la
  especificación visual del sistema, no de su retícula de layout.

Es el mismo criterio que aplicamos en `palette.css`, donde `--md-ref-palette-black`
duplica `neutral0`: un valor puede coincidir con otro y aun así merecer su propio
token cuando significa algo distinto.

> **Nota sobre M3 Expressive.** Existe una variante posterior de M3 que *redefine*
> algunos de estos valores (por ejemplo `large` pasa de 16dp a 20dp) y cambia `full`
> de valor fijo a porcentaje. Este proyecto implementa la escala **base** de M3, que
> es la estable y la que usan las librerías web de Google. Migrar a Expressive es
> una decisión de proyecto, no un detalle de implementación.

**Versión de la escala de shape:** el paquete de tokens de Material Web **v0.192**
publica solo 7 radios (`none`, `extra-small`, `small`, `medium`, `large`,
`extra-large`, `full`). La escala oficial actual tiene **10**: los tres niveles
`large-increased` (20px), `extra-large-increased` (32px) y `extra-extra-large`
(48px) se añadieron después. Son **coexistentes**, no reemplazan a los anteriores.

Este proyecto implementa la escala oficial completa de 10, verificada contra la
tabla de tokens de `m3.material.io` y contra la documentación de shapes de
material-components-android.

**Por qué `1-ref/easing.css` existe:** las curvas `cubic-bezier` llevan cuatro números
crudos. La alternativa era escribirlos directamente en `2-sys/motion.css` y aceptar
que ese archivo fuera **el único** de la capa 2 con valores crudos. Se descartó.

Descomponiendo cada curva en sus cuatro puntos de control, `motion.css` compone:

```css
--md-sys-motion-easing-standard: cubic-bezier(
  var(--md-ref-easing-standard-x0),
  var(--md-ref-easing-standard-y0),
  var(--md-ref-easing-standard-x1),
  var(--md-ref-easing-standard-y1)
);
```

El `cubic-bezier()` aparece, pero **ninguno de sus números está escrito ahí**. Resultado:
la capa 2 queda 100% limpia y el verificador no necesita ningún caso especial.

**Por qué la elevación está partida en tres archivos:** una sombra necesita tres
cosas, y cada una pertenece a una capa distinta:

| Dimensión       | Dónde vive                  | Por qué ahí                          |
| --------------- | --------------------------- | ------------------------------------ |
| Geometría (px)  | `1-ref/shadow.css`          | Es medida cruda                      |
| Opacidad        | `1-ref/shadow.css`          | Es un valor crudo, declarado **una vez** y reutilizado por las 12 capas |
| Color           | `2-sys/theme/*.css`         | Es una decisión de tema              |

`2-sys/elevation.css` es el puente que une las tres. Si la composición estuviera en
`1-ref/`, ese archivo tendría que referenciar el color del tema —dependencia
circular— y además el color quedaría *quemado* en la primitiva, de modo que cambiar
el tema no cambiaría la sombra.

```css
/* 1-ref/shadow.css — solo medidas */
--md-ref-shadow-key-1:     0 1px 2px 0px;
--md-ref-shadow-key-opacity: 0.3;

/* 2-sys/elevation.css — geometría + color del tema */
--md-sys-elevation-level1:
  var(--md-ref-shadow-key-1)     rgb(var(--md-sys-color-shadow-rgb) / var(--md-ref-shadow-key-opacity)),
  var(--md-ref-shadow-ambient-1) rgb(var(--md-sys-color-shadow-rgb) / var(--md-ref-shadow-ambient-opacity));
```

**Las dos capas de cada sombra.** M3 dibuja cada nivel con dos sombras superpuestas:
la **key** (opacidad `0.30`, nítida, define el borde) y la **ambient** (opacidad
`0.15`, difusa, proyecta la luz). El detalle de que el nivel 2 tiene la key
*idéntica* a la del nivel 1 es intencional: al subir de nivel 1 a 2 solo crece la
sombra difusa.

Los valores están transcritos de los comentarios del código fuente del componente
`<md-elevation>` de Material Web, que es donde Google documenta nivel por nivel.

**Sobre `surface-tint`:** la elevación por superposición del color primario
(*surface tint*) está **deprecada** en la especificación actual. Google lo dice de
forma explícita: *"Surface tint color is deprecated. Use elevation level tokens
(0–5) instead."* Por eso este proyecto **no** expone
`--md-sys-elevation-surface-tint-color`, aunque todavía aparezca en el paquete de
tokens antiguo.

> **En tema oscuro la sombra casi no se ve** (negro sobre negro). Por eso las clases
> `.md-elevation-N-surface` aplican solo el cambio de **tono** de superficie, que es
> lo que M3 recomienda por defecto. Ese mapeo nivel → tono es decisión de RDM Next;
> M3 define la escalera `surface-container-*` pero no la relaciona con los niveles.

**Sobre los state layers y `currentColor`:** un state layer es una capa
semitransparente que se coloca *encima* de un elemento para indicar su estado. M3
establece que **usa el mismo color que el contenido**, no uno propio:

```css
.md-state-layer {
  background-color: currentColor;   /* toma el color del texto o icono */
  opacity: var(--md-sys-state-hover-state-layer-opacity);
}
```

`currentColor` es lo que hace que un solo selector sirva para toda la interfaz: la
capa se adapta sola al componente donde se aplica, sin que cada componente decida un
color.

El state layer va en un pseudo-elemento (`::after`), nunca sobre el elemento mismo,
porque si se aplicara al elemento **taparía el contenido**. El orden de capas que
define M3 es: container → state layer → content.

> **Una discrepancia real en la especificación de Google.** `focus` y `pressed`
> tienen dos valores circulando:
> - `m3.material.io` (documentación, **fuente primaria**) → **0.10**
> - `_md-sys-state.scss` de Material Web (implementación) → 0.12
>
> Este proyecto sigue la documentación. Si Google unifica el valor, se cambia **una
> línea** en `1-ref/opacity.css` y los 5 roles, las utilidades y toda la app se
> actualizan por cascada. Es el escenario para el que existe la capa 1.

**Sobre la nomenclatura de duraciones:** M3 agrupa sus 16 duraciones en cuatro
familias (`short1-4`, `medium1-4`, `long1-4`, `extra-long1-4`). Un componente pide
`medium2`, no `300ms`. El nombre sobrevive a un cambio de criterio; el número no.

**Sobre `emphasized`:** en v0.192 vale lo mismo que `standard` (`0.2, 0, 0, 1`), pero
se mantiene como token separado porque la versión actual de M3 le da una cola más
larga. Cuando Google lo actualice, aquí cambian cuatro números y las tres variantes
se actualizan solas.

---

## 5. Temas: light y dark

Dos temas, activados por dos mecanismos:

1. **Atributo manual** — `html[data-theme="light"]` / `html[data-theme="dark"]`
   (lo usa el toggle de tema de ManGo!)
2. **Preferencia del sistema** — `prefers-color-scheme`

Se resuelven **sin duplicar** los ~30 tokens de color de cada tema, mediante el orden de
importación en `main.css`:

```css
@import url("2-sys/theme/theme.light.css") layer(sys);  /* 1.er plano */
@import url("2-sys/theme/theme.dark.css")  layer(sys);  /* 2.er plano, gana por orden */
```

| Estado                            | Coincide            | Resultado |
| --------------------------------- | ------------------- | --------- |
| Sin atributo + SO en light        | ambos               | **light** |
| Sin atributo + SO en dark         | ambos               | **dark**  |
| `data-theme="light"` + SO en dark | solo light          | **light** |
| `data-theme="dark"` + SO en light | solo dark           | **dark**  |

Los selectores usan `html:not([data-theme="..."])`, de modo que el atributo **excluye**
al tema contrario en lugar de competir con él.

---

## 6. Orden de carga y `@layer`

`main.css` es el orquestador. Declara las capas antes de importar, para que la
jerarquía quede garantizada por el motor del navegador y no solo por el orden de escritura:

```css
@layer ref, sys, comp;

@import url("1-ref/palette.css") layer(ref);
@import url("2-sys/colors.css")  layer(sys);
@import url("3-comp/button.css") layer(comp);
```

Efecto: aunque alguien cometa el error de usar un token `ref` dentro de `3-comp/`, la
capa `ref` **pierde siempre** frente a `sys`. La regla se convierte en una garantía del
motor, no en una convención.

---

## 7. Verificación

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\verify-tokens.ps1
```

> **Por qué `-ExecutionPolicy Bypass`:** la política de ejecución de PowerShell
> en Windows deshabilita los scripts `.ps1` por defecto. El flag lo permite solo
> para esta invocación, sin cambiar la configuración del sistema. También
> funciona con `-File` si ejecutás desde el editor.

El script escanea las 19 hojas del sistema, indexa los **443 tokens** definidos y
aplica 5 reglas:

| Regla | Qué detecta                                                                 | Alcance            |
| ----- | --------------------------------------------------------------------------- | ------------------ |
| **1** | Valores crudos: `#HEX`, `px`, `ms`, `rem`                                   | `2-sys/`, `3-comp/` |
| **2** | Dirección de dependencias (saltos de capa y dependencias circulares)        | todo el proyecto   |
| **3** | Tokens referenciados que **no existen**                                     | todo el proyecto   |
| **4** | `theme.light.css` importado **antes** que `theme.dark.css`                  | `main.css`          |
| **5** | Integridad: carpetas, `@layer` declarado antes de importar, imports válidos | proyecto           |

**La Regla 3 es la más importante.** Un `var(--md-token-inexistente)` no da error:
el navegador descarta la regla **en silencio** y el componente se ve roto sin
explicación. Es el fallo más difícil de detectar revisando CSS a ojo.

**La Regla 4 es la más sutil.** El orden de los dos temas es el único punto del
proyecto donde el orden de escritura cambia el comportamiento: invertido, el
sistema arranca en oscuro para todo el mundo, y nada en el CSS lo delata.

El script devuelve código de salida `0` si todo cumple y `1` si hay fallos, así que
se puede encadenar en un hook de `pre-commit` o en CI.

---

## 8. Flujo de trabajo

Los componentes se implementan **uno a la vez**, cada uno con validación antes de
avanzar al siguiente. Los commits siguen
[Commits Convenacionales](https://www.conventionalcommits.org/es/v1.0.0/):

```
<tipo>(<alcance>): <descripción corta en presente>

<cuerpo: qué tokens o estructuras se añadieron>
```

Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `chore`.

---

## 9. Estructura completa

```
rdm-next-new/
├── .gitignore
├── README.md                 Este documento: contrato de arquitectura
├── index.html                Shell del showroom
├── css/
│   ├── main.css               Orquestador: @layer + @import
│   ├── 1-ref/                Valores crudos (única capa que los permite)
│   │   ├── palette.css       --md-ref-palette-*
│   │   ├── typeface.css      --md-ref-typeface-*
│   │   ├── corner.css        --md-ref-corner-*
│   │   ├── opacity.css       --md-ref-opacity-*
│   │   ├── easing.css        --md-ref-easing-*
│   │   ├── shadow.css        --md-ref-shadow-*
│   │   ├── spacing.css       --md-ref-spacing-*
│   │   ├── stroke.css        --md-ref-stroke-*
│   │   ├── typescale.css     --md-ref-typescale-*
│   │   └── time.css          --md-ref-time-*
│   ├── 2-sys/                Tokens semánticos (solo var())
│   │   ├── colors.css        --md-sys-color-*
│   │   ├── typography.css    --md-sys-typescale-*
│   │   ├── measurement.css   --md-sys-measurement-*
│   │   ├── motion.css        --md-sys-motion-*
│   │   ├── motion.css        --md-sys-motion-*
│   │   ├── shape.css         --md-sys-shape-*
│   │   ├── elevation.css     --md-sys-elevation-*
│   │   ├── state.css         --md-sys-state-*
│   │   └── theme/
│   │       ├── theme.light.css
│   │       └── theme.dark.css
│   └── 3-comp/               Un componente por archivo (se llena por pasos)
└── tools/
    └── verify-tokens.ps1     Candado automático de la regla de hardcoding
```

---

## 10. Fuentes oficiales

- Tokens: `https://m3.material.io/foundations/design-tokens`
- Spacing: `https://m3.material.io/styles/spacing/tokens`
- Escala tipográfica: `https://m3.material.io/styles/typography/type-scale-tokens`
- Material Web (referencia de implementación): `https://material-web.dev`
- Clases `.md-typescale-*` de Google: `material-components/material-web` → `typography/_typescale.scss`
  (el mixin `typescale.styles()` las genera; es la fuente de la columna "oficial" de la
  tabla de prefijos de arriba)
- Tokens de sistema v0.192: `_md-sys-color.scss`, `_md-sys-typescale.scss`, `_md-sys-motion.scss`,
  `_md-sys-state.scss`, `_md-sys-shape.scss` en `tokens/versions/v0_192/` del mismo repositorio
