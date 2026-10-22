# RDM Next — Design System

Showroom de componentes UI para **ManGo! App** (`mango-next`).
Estándar: **Google Material Design 3 (M3)**.

---

## 1. Propósito

Este repositorio es la **fuente única de verdad** del sistema de diseño de ManGo!.

No es una maqueta ni un prototipo: es la implementación real de tokens y recetas que
consumirá el sistema final. El showroom y la app de producción cargan **el mismo
orquestador `src/css/main.css`**. Lo que se ve aquí es exactamente lo que se ejecuta allí.

---

## 2. Arquitectura: la jerarquía de 4 capas

El sistema se organiza en cuatro capas con dependencias **unidireccionales**.
Los tokens fluyen hacia abajo (1 ──► 2 ──► 3) y las utilidades (4) pueden
leer las capas 1 y 2. Nada lee la Capa 4: es el extremo final de la cascada.

```
css/
├── 1-reference-tokens/  Primitivas       --md-ref-*
├── 2-system-tokens/     Tokens semánticos --md-sys-*
├── 3-components/        Componentes      --md-comp-*
└── 4-utilities/         Clases atómicas  (solo clases, sin tokens nuevos)
```

### Regla de dependencia

```
1-reference-tokens  ──►  2-system-tokens  ──►  3-components
 (valores)   (roles)     (componentes)

4-utilities ──► lee 1-reference-tokens y 2-system-tokens (solo clases)
```

- `3-components/` **nunca** referencia `1-reference-tokens/` directamente.
- `2-system-tokens/` **nunca** referencia `3-components/`.
- `1-reference-tokens/` **nunca** referencia `2-system-tokens/` ni `3-components/` (sería dependencia circular).
- `4-utilities/` **nunca** define tokens: solo clases que consumen `var()` de las capas 1 y 2.

Si un componente necesita un valor crudo, **no lo usa**: pide un token semántico a
`2-system-tokens/`, y si ese rol no existe, se crea primero en `2-system-tokens/`. Esa es la disciplina que
hace que el tema sea cambiable sin tocar componentes.

### Prefijos de tokens

| Capa     | Prefijo          | Contiene                                |
| -------- | ---------------- | --------------------------------------- |
| `1-reference-tokens/` | `--md-ref-*`     | Valores crudos, sin contexto semántico  |
| `2-system-tokens/` | `--md-sys-*`     | Roles con significado de diseño         |
| `3-components/`| `--md-comp-*`    | Decisiones específicas de un componente |
| `4-utilities/` | *(clases `md-*`, sin tokens)* | Atajos atómicos que consumen las capas 1 y 2 |

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
| Iconos                   | `--md-sys-icon-*`          | `.md-icon`          |

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

### Criterio del guion en los modificadores de clase

**Los modificadores se escriben con UN guion. Nunca con dos.**

```
.md-type-label-medium-prominent     ← un guion
.md-state-layer-hover               ← un guion
.md-type-label-medium--prominent    ← incorrecto, ya no existe
.md-state-layer--hover              ← incorrecto, ya no existe
```

El nombre completo es una concatenación de partes separadas por guion simple:
`md-` + familia + elemento + modificador. El guion ya cumple ese papel.

**Por qué no el doble guion de BEM:** BEM reserva `--` para marcar un elemento *dentro de*
otro, como `.card__title` o `.btn--primary`. En este proyecto no hay anidamiento de
elementos: `md-state-layer` es un bloque plano y `hover` es su estado, no una cosa dentro de
otra. El doble guion anunciaba una jerarquía que no existe.

**Google tampoco lo usa en sus utilidades.** Escribe `.md-typescale-label-medium-prominent`,
con un guion. Los 18 modificadores de doble guion que sí existen en su repositorio
(`.md3-segmented-button--selected`, `.md3-badge--large`) son **atributos internos** de
componentes del SDK `md3`, con prefijo `md3-` y no `md-`, y no son utilidades globales. Son
otra cosa: estado de un elemento concreto, no una clase que se pueda poner en cualquier lado.

**Los tokens nunca recibieron doble guion**, y son la prueba de que el criterio es interno y
no una mezcla:

```
--md-sys-state-hover-state-layer-opacity
--md-sys-typescale-label-medium-weight-prominent
```

Clases y tokens usan el mismo separador. Cuando las clases traían `--`, los tokens seguían
con uno solo, y esa asimetría era el síntoma de que algo no cuadraba.

Aplicado a: `.md-type-label-*-prominent` (commit `b9d9e5d`) y
`.md-state-layer-*-{hover,focus,pressed,dragged}`.

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

Clases de este proyecto:  254
  4-utilities   178   color 93 · typography 32 · shape 16 · elevation 12
                 icon 9 · motion 8 · state 6 · measurement 2
  3-components   76   list 16 · button 15 · icon-button 15 · card 11 · fab 7
                 divider 4 · dialog 5 · button-group 2 · fab-extended 1
```

El recuento es sobre el CSS declarado, con los bloques `/* … */` fuera: la prosa de
cabecera cita clases de ejemplo —`.md-btn` en `state.css`— que no son declaraciones.

Las 6 de `state` son `.md-state-layer` más sus cuatro modificadores
(`-hover`, `-focus`, `-pressed`, `-dragged`) y `.md-disabled`, que aplica `opacity` al
contenido inactivo —no es un *state layer*: no hay capa encima, el propio contenido se
atenúa—. Los cuatro modificadores usan un guion, según el criterio de la sección anterior.

Las 60 de `3-components` no son utilidades: son la API de cada componente, con sus variantes.
`button.css` declara además los selectores de `.md-state-layer` y `.md-disabled` que ya
existen en `4-utilities`, porque los compone para colocar la capa; no son clases suyas, y por eso
no se cuentan dos veces.

**Material Web declara 10 clases en todo su repositorio, y de ellas 8 son de utilidad.
Publicamos 238.** Compartemos una sola
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

**3. `currentColor` para los colores.** Igual que nosotros en `2-system-tokens/state.css`: la capa de
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

> **Los valores crudos viven exclusivamente en `src/css/1-reference-tokens/`.**

| Capa     | `#HEX`, `px`, `ms`, números sueltos | Referencias permitidas |
| -------- | ----------------------------------- | ---------------------- |
| `1-reference-tokens/` | ✅ Permitido                        | Ninguna                |
| `2-system-tokens/` | ❌ **Prohibido**                    | Solo `--md-ref-*`      |
| `3-components/`| ❌ **Prohibido**                    | Solo `--md-sys-*`      |

En `2-system-tokens/` y `3-components/` **toda** declaración debe ser un `var()`.

### Por qué existe esta regla

`1-reference-tokens/` es el **único** lugar donde se toca el tema. Si un componente tuviera
`#6750A4` hardcodeado, cambiar la paleta obligaría a editar ese componente. Al aislar
los valores crudos en una sola capa, un cambio de marca se resuelve editando cuatro
archivos y nada más.

Esta regla es verificable de forma automática con `tools/verify-tokens.mjs`.

---

## 4. Nomenclatura: qué es oficial de M3 y qué es decisión propia

Distinguimos entre tokens publicados por Google y convenciones de este proyecto,
porque mezclarlos lleva a buscar en la documentación oficial algo que no existe.

### Oficial de M3

Verificado contra los archivos publicados por Google. Nombres exactos:

| Familia                  | Archivo          | Notas                                       |
| ------------------------ | ---------------- | ------------------------------------------- |
| `--md-ref-palette-*`     | `1-reference-tokens/palette.css` | 91 tonos (v0.192)                      |
| `--md-ref-typeface-*`    | `1-reference-tokens/typeface.css`| 7 tokens: 5 de Google (plain, brand, 3 pesos) + 2 propios (`font-optical-sizing`, `font-variation-settings`) |
| `--md-icon-font`    | `1-reference-tokens/iconfont.css` | 1 token de Google: la familia. Las otras dos familias son extensión propia |
| `--md-ref-typescale-*`   | `1-reference-tokens/typescale.css` | 45 medidas (15 estilos × size/line-height/tracking) |
| `--md-ref-stroke-*`      | `1-reference-tokens/stroke.css` | 3 grosores — **extensión propia**       |
| `--md-ref-corner-*`      | `1-reference-tokens/corner.css` | 10 radios de esquina                     |
| `--md-sys-color-*`       | `2-system-tokens/theme/*.css` | 37 roles × 2 temas                      |
| `md-bg-*` / `md-text-*` / `md-border-*` | `4-utilities/color.css` | 93 clases utilitarias de color |
| `--md-sys-typescale-*`   | `2-system-tokens/typography.css` | 92 tokens (15 estilos × 5 sub-tokens + 15 compuestos + 2 `weight-prominent`) |
| `.md-type-*`             | `4-utilities/typography.css` | 32 clases tipográficas               |
| `--md-sys-shape-*`       | `2-system-tokens/shape.css`| 16 roles: 15 de esquina + variantes por lado, y 1 de grosor de trazo |
| `--md-sys-motion-*`      | `2-system-tokens/motion.css`| 16 duraciones + 10 curvas                 |
| `--md-ref-easing-*`      | `1-reference-tokens/easing.css`| 40 puntos de control (10 curvas × 4)      |
| `--md-sys-elevation-*`   | `2-system-tokens/elevation.css` | 6 niveles (key + ambient)              |
| `--md-ref-shadow-*`      | `1-reference-tokens/shadow.css` | 14 tokens: 6 geometrías `key-*` + 6 `ambient-*` + 2 opacidades. Google **no publica** sombras: la geometría salió de los comentarios del código de `<md-elevation>` |
| `--md-sys-state-*`       | `2-system-tokens/state.css`| 5 roles de estado + 6 utilidades          |
| `--md-ref-opacity-*`     | `1-reference-tokens/opacity.css`| 4 opacidades crudas                      |

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
> `font-variation-settings` (ya presente en `1-reference-tokens/typeface.css`) cubre ese caso.
> Se anota aquí para que la diferencia sea una decisión documentada y no un olvido.
> La escala de `corner` de `latest/` **sí** coincide con la nuestra, incluidos
> `large-increased` y `extra-large-increased`.
>
> **Y hay un caso donde `latest` no es una opción sino la única fuente:** los tokens
> de elevación de componente. `$container-elevation`, `$focused-container-elevation`,
> `$hovered-container-elevation`, `$pressed-container-elevation` y
> `$disabled-container-elevation` **no existen en `v0_192/` para ningún componente**:
> los cinco archivos de botón y los cuatro de botón de icono salen sin ellos, verificado
> uno por uno. La única fuente es `tokens/versions/latest/sass/_md-comp-button-*.scss`.
> Es lo que permite que el botón suba la elevación en hover, y está desarrollado en la
> sección de Componentes.

> **Nota sobre `4-utilities/color.css`:** este archivo **no define variables `:root`**.
> Expone los roles como clases utilitarias que consumen `var(--md-sys-color-*)`.
> Los valores viven exclusivamente en `2-system-tokens/theme/theme.light.css` y
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
> completo, ese es el indicio de que debe pasar a `3-components/`.

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
| `--md-ref-spacing-*`      | `1-reference-tokens/spacing.css` | Escala oficial M3 `Space 0`–`Space 900`                     |
| `--md-sys-measurement-*`  | `2-system-tokens/measurement.css` | 10 roles de medida (**extensión propia**) |
| `--md-ref-stroke-*`       | `1-reference-tokens/stroke.css` | Grosor de trazo: `none`/`thin`/`thick`                  |

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
quedaría quemado dentro de la geometría de `1-reference-tokens/shadow.css`, que es exactamente lo que
la arquitectura prohíbe: la primitiva no puede decidir el color, eso es del tema.

**Lo que NO está en `measurement.css`, y por qué:** los roles de retícula
(`page-margin`, `section-gap`, `item-gap`, `content-padding`) se eliminaron. Ninguno
tiene respaldo en M3 — el margen lateral de página y la separación entre secciones no
aparecen en la especificación — y, más importante, el ritmo de página no es un token:
depende de cuántas secciones hay y de qué contienen. Esa decisión pertenece a un
componente de `3-components/`, que consumirá un rol de `2-system-tokens/` (creándolo primero si no
existe). `3-components/` nunca lee `1-reference-tokens/` directamente (REGLA 2 estricta); lo que la arquitectura prohíbe es el salto de capa y que un componente lea
tokens de *otro* componente.

**Qué aporta `measurement.css` sobre `spacing.css`:** el número no explica su
propósito. `48px` a secas no dice por qué es 48; `--md-sys-measurement-touch-target`
sí, porque comunica la intención. Y la intención es lo que sobrevive al cambio: si
el mínimo táctil pasara a 44px por decisión de accesibilidad, se edita **una vez** en
`2-system-tokens` y ningún componente se entera, porque ninguno conoce el 48 — todos pidieron
`touch-target`. Sin esta capa habría 40 lugares que editar.

Casi todos los roles de `measurement` caen en la escala de `spacing`. **La excepción son
las alturas de contenedor**, que se leen de `1-reference-tokens/container-height.css`: los cinco tamaños
de botón de M3 miden 32, 40, 56, 96 y 136dp, y los dos últimos **no existen** en la escala
oficial de espacio, que termina en Space 900 = 72px.

No es que sobre un valor, es que la escala no llega. Y el motivo de que sean primitivas
propias está en el nombre que les da M3: `$container-height`, no un token de espaciado —
M3 no publica ningún archivo de espaciado, y `$container-height` aparece en 17 archivos de
token de sus componentes. Los tres primeros valores, 32, 40 y 56, sí estaban en la escala y
se leían de ahí; ahora se leen de la familia nueva, porque si una medida no es espaciado
tampoco lo es cuando el número coincide con un token de espaciado. Es el mismo criterio que
gobierna `corner.css` y `stroke.css`, aplicado al caso en que el número sí coincide.

**Sobre el área táctil:** 48dp es el mínimo de zona táctil de Android, un requisito de
accesibilidad (≈9mm; la recomendación es 7–10mm; iOS usa 44×44pt). No es el tamaño del
elemento visible: un icono de 24×24dp tiene un área táctil de 48×48dp, y el padding
alrededor es lo que cuenta. Por eso M3 separa los 24dp del glifo de los 48dp del área.

**Unidad:** M3 está diseñado en **dp**. En web `1dp = 1px`, así que `1-reference-tokens/spacing.css`
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
componente en `3-components/`, no de una clase de color.

**El rol de grosor en `2-system-tokens/shape.css`:** `--md-sys-shape-stroke-thin`.

`1-reference-tokens/stroke.css` tiene tres valores crudos, pero `2-system-tokens/` no tenia ninguno. Ese
hueco se encontro al construir el primer componente real: el divisor de Google
hardcodea `'thickness': 1px`, y aqui eso choca con dos reglas a la vez: escribir
`1px` en `3-components/` viola la REGLA 1, y leer `--md-ref-stroke-thin` desde `3-components/`
viola la REGLA 2.

La salida es un token semantico:

```css
--md-sys-shape-stroke-thin: var(--md-ref-stroke-thin);
```

Vive en `shape.css` y no en `measurement.css` porque el stroke es una **forma**, no
un espaciado: un borde de 1px no es una distancia, es el grosor de una linea. Por eso
`1-reference-tokens` lo tiene como primitiva aparte de `spacing`.

Solo se declara `thin`. `thick` y `none` quedan en `1-reference-tokens` hasta que un componente
los pida: un token que nadie consume es un token muerto.

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

**Por qué `1-reference-tokens/easing.css` existe:** las curvas `cubic-bezier` llevan cuatro números
crudos. La alternativa era escribirlos directamente en `2-system-tokens/motion.css` y aceptar
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
| Geometría (px)  | `1-reference-tokens/shadow.css`          | Es medida cruda                      |
| Opacidad        | `1-reference-tokens/shadow.css`          | Es un valor crudo, declarado **una vez** y reutilizado por las 12 capas |
| Color           | `2-system-tokens/theme/*.css`         | Es una decisión de tema              |

`2-system-tokens/elevation.css` es el puente que une las tres. Si la composición estuviera en
`1-reference-tokens/`, ese archivo tendría que referenciar el color del tema —dependencia
circular— y además el color quedaría *quemado* en la primitiva, de modo que cambiar
el tema no cambiaría la sombra.

```css
/* 1-reference-tokens/shadow.css — solo medidas */
--md-ref-shadow-key-1:     0 1px 2px 0px;
--md-ref-shadow-key-opacity: 0.3;

/* 2-system-tokens/elevation.css — geometría + color del tema */
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
> línea** en `1-reference-tokens/opacity.css` y los 5 roles, las utilidades y toda la app se
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
@import url("2-system-tokens/theme/theme.light.css") layer(sys);  /* 1.er plano */
@import url("2-system-tokens/theme/theme.dark.css")  layer(sys);  /* 2.er plano, gana por orden */
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
@layer reset, ref, sys, comp, utilities;

@import url("reset.css")                      layer(reset);
@import url("1-reference-tokens/index.css")   layer(ref);
@import url("2-system-tokens/index.css")      layer(sys);
@import url("3-components/index.css")         layer(comp);
@import url("4-utilities/index.css")          layer(utilities);
```

Efecto: aunque alguien cometa el error de usar un token `ref` dentro de `3-components/`, la
capa `ref` **pierde siempre** frente a `sys`. La regla se convierte en una garantía del
motor, no en una convención.

---

## 7. Verificación

El verificador es Node, y Node corre en los dos sistemas:

```bash
node tools/verify-tokens.mjs
```

> **Es OBLIGATORIO, y su salida es el requisito.** Antes de cada commit hay que
> ejecutarlo y ver `OK - La arquitectura se respeta en las 13 reglas` con código
> de salida 0. No basta con que el código parezca correcto ni con dar por
> supuesto que el commit anterior ya pasó: cada commit se verifica con lo que
> ese commit contiene.
>
> No es una formalidad. El 2026-10-18 se commiteó la coordinación del color y
> la forma, el `tail -2` de la salida mostraba `Corregir antes de hacer commit`, y
> el commit entró igual porque el comando estaba encadenado y la salida no se
> miró. Cinco ejecuciones posteriores dieron verde con el mismo árbol, así que
> aquel fallo no se ha podido reproducir — lo que solo demuestra que correr el
> verificador y mirarlo son dos pasos, y que el segundo se puede saltar.
>
> Y el orden importa: el verificador va **antes** del `git add`, no después del
> `git commit`. Ejecutado después, su salida llega tarde y es el commit el que
> ya está hecho.

> **`tools/verify-tokens.ps1` sigue existiendo y sigue funcionando**: son tres
> líneas que llaman al `.mjs` y devuelven su código de salida, para quien lo
> lanzaba por ahí. `pwsh -File ./tools/verify-tokens.ps1` en macOS y
> `powershell -ExecutionPolicy Bypass -File .\tools\verify-tokens.ps1` en
> Windows siguen dando el mismo resultado, porque ejecutan el mismo código.
> Una sola implementación es justamente lo que evita que dos verificadores se
> separen en silencio.
>
> El port a Node (2026-10-18) no fue porque PowerShell no funcionara en macOS:
> funcionaba, y está medido. Fue no depender de PowerShell para verificar un
> sistema de CSS en un equipo donde Node ya está. La primera versión era
> PowerShell con `Get-RelPath` normalizando cualquier separador a `\`, y por eso
> las reglas, escritas contra rutas a mano con barra invertida, funcionaban
> igual en los dos sistemas.

El verificador escanea las **43 hojas** del sistema, indexa los **666 tokens**
definidos y aplica **13 reglas**:

| Regla | Qué detecta                                                                 | Alcance            |
| ----- | --------------------------------------------------------------------------- | ------------------ |
| **1** | Valores crudos: `#HEX`, `px`, `ms`, `rem`                                   | `2-system-tokens/`, `3-components/`, `4-utilities/` |
| **2** | Dirección de dependencias (saltos de capa y dependencias circulares)        | todo el proyecto   |
| **3** | Tokens referenciados que **no existen**                                     | todo el proyecto   |
| **4** | `theme.light.css` importado **antes** que `theme.dark.css` (convención)     | `main.css` + `2-system-tokens/index.css` |
| **5** | Integridad: carpetas, `@layer` declarado antes de importar, imports válidos | proyecto           |
| **6** | Estilos en línea (`style=`) o bloques `<style>` en el HTML                  | todo el HTML       |
| **7** | Los dos bloques de cada tema declaran los mismos tokens                     | `2-system-tokens/theme/`     |
| **8** | Las tablas de tokens del showroom pintan su valor y dan contraste           | `showroom/`        |
| **9** | Los iconos se piden con `.md-icon`, no con la clase de Google                | HTML + `4-utilities/`    |
| **10** | Toda clase `md-*` que usa el showroom existe en `src/css/`                 | `showroom/` + `src/css/` |

**La Regla 3 es la más importante.** Un `var(--md-token-inexistente)` no da error:
el navegador descarta la regla **en silencio** y el componente se ve roto sin
explicación. Es el fallo más difícil de detectar revisando CSS a ojo.

**La Regla 4 es la más sutil.** El orden de los dos temas se mantiene como
convención de legibilidad (claro primero, oscuro último): cada archivo trae
sus propios bloques con `@media`, así que invertirlo ya no cambia el
comportamiento, solo el orden de declaración. La regla sigue comprobando la
convención, expandiendo los índices de `main.css`.

**La Regla 9 previene un fallo que ya ocurrió.** La fuente de iconos se carga con
`@import`, y con ella entran las clases de utilidad que trae la hoja de Google. Es
decir que la clase ajena está disponible y además neutralizada por la capa: usarla
*funciona* y no delata nada. Lo único que se pierde es que el componente deje de
controlar el tamaño de su glifo, y eso se ve mirando el icono, no el código. La
regla lo comprueba en los atributos `class` del HTML, y no en el archivo entero,
porque el nombre aparece legitimamente en la prosa del showroom.

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
├── .gitattributes
├── .gitignore
├── .opencode/
│   └── skills/
│       └── rdm-component-showroom/
│           └── SKILL.md            Skill de la vista de componente: el flujo
│                                    que obliga a inspeccionar, proponer las
│                                    secciones y esperar la confirmación
├── README.md                 Este documento: contrato de arquitectura
├── docs/
│   └── showroom-philosophy.md Filosofía de las fichas del showroom
├── src/                    La librería. Nada más del proyecto la importa.
│   ├── css/
│   │   ├── main.css           Orquestador: @layer + @import
│   │   ├── reset.css          Capa 0: anula al navegador
│   │   ├── 1-reference-tokens/             Valores crudos (única capa que los permite)
│   │   │   ├── index.css        Índice: reexporta las 13 primitivas
│   │   │   ├── aspect.css     --md-ref-aspect-*
│   │   │   ├── container-height.css --md-ref-container-*
│   │   │   ├── palette.css    --md-ref-palette-*
│   │   │   ├── typeface.css   --md-ref-typeface-*
│   │   │   ├── iconfont.css   --md-ref-icon-* (+ carga la fuente)
│   │   │   ├── corner.css     --md-ref-corner-*
│   │   │   ├── opacity.css    --md-ref-opacity-*
│   │   │   ├── easing.css     --md-ref-easing-*
│   │   │   ├── shadow.css     --md-ref-shadow-*
│   │   │   ├── spacing.css    --md-ref-spacing-*
│   │   │   ├── stroke.css     --md-ref-stroke-*
│   │   │   ├── typescale.css  --md-ref-typescale-*
│   │   │   └── time.css       --md-ref-time-*
│   │   ├── 2-system-tokens/             Tokens semánticos (solo var(), sin clases)
│   │   │   ├── index.css      Índice: claro primero, oscuro último
│   │   │   ├── typography.css --md-sys-typescale-*
│   │   │   ├── icon.css       --md-sys-icon-* (las clases .md-icon-* viven en 4-utilities/)
│   │   │   ├── measurement.css--md-sys-measurement-*
│   │   │   ├── motion.css     --md-sys-motion-*
│   │   │   ├── shape.css      --md-sys-shape-*
│   │   │   ├── elevation.css  --md-sys-elevation-*
│   │   │   ├── state.css      --md-sys-state-*
│   │   │   └── theme/
│   │   │       ├── theme.light.css  --md-sys-color-* (tema claro)
│   │   │       └── theme.dark.css   --md-sys-color-* (tema oscuro)
│   │   ├── 3-components/            Un componente por archivo (se llena por pasos)
│   │   │   ├── index.css      Índice: un @import por componente, en orden de dependencia
│   │   │   ├── divider.css    --md-comp-divider-*
│   │   │   ├── icon-button.css--md-comp-icon-button-*
│   │   │   ├── button.css     --md-comp-button-*
│   │   │   ├── button-group.css --md-comp-button-group-*
│   │   │   ├── fab.css        --md-comp-fab-*
│   │   │   ├── fab-extended.css --md-comp-fab-* (va DESPUÉS de fab.css)
│   │   │   ├── card.css       --md-comp-card-*
│   │   │   ├── dialog.css     --md-comp-dialog-*
│   │   │   └── list.css       --md-comp-list-* (va el último)
│   │   └── 4-utilities/             Clases atómicas (solo var(), sin tokens)
│   │       ├── index.css      Índice: una familia por archivo
│   │       ├── color.css      .md-bg-* / .md-text-* / .md-border-*
│   │       ├── typography.css .md-type-* (32)
│   │       ├── icon.css       .md-icon / .md-icon-* / .md-measure-icon-*
│   │       ├── measurement.css.md-measure-touch-target / .md-measure-icon
│   │       ├── motion.css     .md-motion-*
│   │       ├── shape.css      .md-shape-*
│   │       ├── elevation.css  .md-elevation-*
│   │       └── state.css      .md-state-layer-* / .md-disabled
│   └── js/                   Comportamiento de componentes, uno por componente
│       ├── main.js            Punto de entrada: carga los que tienen JS
│       └── dialog.js          Abre y cierra el <dialog>: showModal() y close()
├── showroom/                 Documentación. No la importa nadie más.
│   ├── index.html            Portada: título, tagline, enlaces a las vistas
│   ├── assets/
│   │   ├── showroom.css      Estilos mínimos del showroom (capa showroom)
│   │   ├── showroom.js       Resaltado de snippets + botón «Copiar», sin build
│   │   ├── card-media.svg    Assets de imagen del repo (con el de la lista)
│   │   ├── list-thumb.svg
│   ├── components/           Una vista por componente o por familia de capa 1 y 2
│   │   ├── button-group.html Button group · 6 secciones
│   │   ├── button.html       Button · 13 secciones
│   │   ├── card.html         Card · 9 secciones
│   │   ├── color.html        Color · 18 secciones
│   │   ├── dialog.html       Dialog · 6 secciones
│   │   ├── divider.html      Divider · 6 secciones
│   │   ├── elevation.html    Elevation · 6 secciones
│   │   ├── fab-extended.html FAB extended · 6 secciones
│   │   ├── fab.html          FAB · 7 secciones
│   │   ├── icon-button.html  Icon Button · 10 secciones
│   │   ├── icon.html         Iconos · 9 secciones
│   │   ├── list.html         List · 9 secciones
│   │   ├── measurement.html  Measurement · 6 secciones
│   │   ├── motion.html       Motion · 20 secciones
│   │   ├── shapes.html       Shapes · 11 secciones
│   │   ├── spacing.html      Spacing · 1 sección
│   │   ├── state.html        State · 2 secciones
│   │   └── typography.html   Typography · 15 secciones
│   └── templates/
│       ├── component.template.html   Plantilla base, la que usó typography.html
│       └── <nombre>.template.html    Molde propio de cada vista (17 más)
└── tools/
    ├── verify-tokens.mjs     Candado automático: 13 reglas de arquitectura
    └── verify-tokens.ps1     Envoltura de tres líneas para quien lo lanzaba por aquí
```

Dos carpetas y una regla:

- **`src/` es la librería.** Es lo único que se distribuye: `src/css/`, que se
  importa desde `main.css` y nunca por partes, y `src/js/`, que se importa
  desde `main.js` y solo si un componente necesita algo que el CSS no expresa.
  Quien use RDM Next importa **los dos** y nada más:

  ```html
  <link rel="stylesheet" href="src/css/main.css">
  <script type="module" src="src/js/main.js"></script>
  ```

- **`showroom/` es documentación.** Se sirve, pero no se distribuye: nadie
  importa `showroom.css` en un producto.
- **Los dos no se mezclan.** `showroom/assets/showroom.css` vive en una capa
  `@layer showroom` propia, declarada después de las cinco del sistema, y
  ningún selector suyo toca una clase `.md-*`. Lo mismo con el JavaScript:
  `src/js/` es comportamiento de componentes y `showroom/assets/showroom.js`
  es el chrome del showroom —resaltar snippets, «Copiar», tema—, y ninguno de
  los dos sabe del otro.

---

## 10. Arquitectura de vistas

El showroom está dividido en archivos. `showroom/index.html` es la **única** puerta de
entrada y **no** contiene secciones de componentes.

```
showroom/
├── index.html                          portada: título, tagline, enlaces
├── components/<vista>.html             una vista por componente o por familia
└── templates/                          un molde por vista + component.template.html
```

**Reglas:**

- `index.html` nunca contiene secciones de componentes. Solo el título, la tagline y
  los enlaces.
- Cada componente tiene su propia vista en `showroom/components/`: `divider.html`,
  `icon-button.html`, `button.html`, `button-group.html`, `fab.html`,
  `fab-extended.html`, `card.html`, `dialog.html`, `list.html`,
  `segmented-button.html`.
- **Y la descripción de un componente en `index.html` es el mismo texto que el encabezado
  de su vista**, byte a byte. La fuente es el encabezado: si cambia, el índice cambia con
  él. El recuento de pares vive en el encabezado de cada vista, no en la portada: la fila
  del índice lleva solo el nombre y la descripción.
- **Los enlaces de la portada viven en filas del propio List.** Dogfooding: la fila entera
  es el enlace (`a.md-list-item`, la anatomía del caso «Métodos de pago»), el nombre es el
  titular y la descripción el texto de apoyo, con la variante multiline para que la prosa
  de M3 no se recorte.
- **Trece de esas descripciones son la definición oficial de M3, traducida.** La fuente es
  `m3.material.io/foundations/glossary` para seis componentes —button, card, dialog, divider,
  FAB y extended FAB—, las páginas de componente para icon button, button group y segmented
  button, y las páginas de *styles* para typography, elevation, spacing y shapes. **Las otras
  cinco primitivas no tienen definición de una frase en M3** —color, icon, state, motion y
  measurement—, y en ese caso el texto es nuestro. Se comprueba una a una antes de llamar
  canónica a una frase; `CONTEXT.md` tiene la tabla de qué hay y qué no en el glosario.
- **Y también las familias de `1-reference-tokens/` y `2-system-tokens/` que son
  documentación por sí mismas**, aunque no sean componentes: `color.html`,
  `typography.html`, `icon.html`, `elevation.html`, `measurement.html`, `motion.html`,
  `shapes.html`, `spacing.html`, `state.html`. Ninguna está en `3-components/`. La
  vista de `elevation` documenta `2-system-tokens/elevation.css`; la de `spacing`,
  `1-reference-tokens/spacing.css`.
- Cada vista tiene su molde en `showroom/templates/<nombre>.template.html`.
  `component.template.html` es la plantilla de la que salen y hoy solo la usa
  `typography.html`.
- Toda vista carga el sistema completo (`src/css/main.css`), la fuente y los estilos del
  showroom, en ese orden. Las rutas son relativas a la profundidad del archivo: la portada
  usa `../src/css/main.css` y una vista en `components/` usa `../../src/css/main.css`.
- Toda vista declara sus estilos base **sobre su `<body>`**, con clases de `2-system-tokens/`.
  La base **nunca** está en `reset.css`, y **nunca** en un contenedor `<div>` interior.

```html
<body class="md-bg-background md-text-on-background md-type-body-medium">
  <!-- contenido de la vista -->
</body>
```

**Por qué `background` y no `surface`:** según M3, `background` es el fondo del lienzo de la
página y `surface` el de una superficie concreta (una tarjeta, un menú, un diálogo). Una
vista completa es el lienzo, no una superficie. Por eso el texto que va encima se lee con
`on-background`, y no con `on-surface`. `surface` queda para lo que se dibuje *encima* del
lienzo.

**Por qué en el `<body>` y no en un `<div>`:** el `<body>` es el elemento que pinta la
ventana, y el `reset` ya le da `min-height: 100vh`. Un `<div>` interior deja sin pintar la
banda de abajo en un documento corto, con el color del sistema en vez del color del tema.

El par fondo + texto se escribe **explícito** a propósito: `4-utilities/color.css` no ofrece
ningún atajo que empareje un fondo con su texto, para que el contraste sea auditable en el
marcado. El texto de apoyo usa `md-text-on-surface-variant`, el rol de menor énfasis de M3:
no existe un `on-background-variant`.

- El enlace de vuelta en una vista apunta a `../index.html` y dice `RDM ManGo! App`.
- El `<title>` de una vista es `<Vista> - RDM ManGo! App`. El del índice es
  `RDM ManGo! App`.
- Toda vista lleva `<meta name="description">`. Las diecinueve lo cumplen.

Cuando se construye un componente nuevo, su vista se añade a `index.html` como enlace y
se crea el archivo en `showroom/components/`. La portada nunca crece más allá de título +
tagline + enlaces.

**Por qué la base no está en `reset.css`:** el fondo, el color y la fuente son decisiones
de **tema**, no del navegador, y por tanto no pertenecen a la capa que anula al navegador.
Antes el `body` las declaraba; ahora cada vista las declara explícitamente. El HTML muestra
de dónde sale cada cosa, y el precio es que cada vista tiene que acordarse de esas clases.

---

## 11. Componentes

El catálogo de M3 tiene decenas de componentes y aquí hay **diez**. Se construyen uno a
uno, y ninguno se da por bueno sin medirlo en el navegador: `tools/verify-tokens.mjs`
comprueba la arquitectura, no que el componente se vea bien.

El orden es el de `3-components/index.css`, que es el de carga y el de dependencia:

| Componente | Archivo | Clases | Tokens propios | Vista del showroom |
| ---------- | ------- | ------ | -------------- | ------------------ |
| Divider | `3-components/divider.css` | 4 | 2 | `divider.html`, 6 secciones |
| Icon Button | `3-components/icon-button.css` | 15 | 17 | `icon-button.html`, 10 secciones |
| Button | `3-components/button.css` | 15 | 18 | `button.html`, 13 secciones |
| Button group | `3-components/button-group.css` | 2 | 1 | `button-group.html`, 6 secciones |
| FAB | `3-components/fab.css` | 7 | 14 | `fab.html`, 7 secciones |
| FAB extended | `3-components/fab-extended.css` | 1 | 3 | `fab-extended.html`, 6 secciones |
| Card | `3-components/card.css` | 11 | 12 | `card.html`, 16 secciones |
| Dialog | `3-components/dialog.css` | 5 | 3 | `dialog.html`, 6 secciones |
| List | `3-components/list.css` | 16 | 25 | `list.html`, 15 secciones |
| Segmented Button | `3-components/segmented-button.css` | 6 | 18 | `segmented-button.html`, 14 secciones |

Las "clases" son las que expone el componente, sin contar las de `2-system-tokens` que compone para
colocar la capa de estado: `button.css` nombra `.md-state-layer` y `.md-disabled` en sus
selectores, pero no son clases suyas. Los "tokens propios" son los `--md-comp-*` que el
componente declara; en los dos casos se cuenta el CSS declarado, con la prosa de cabecera
fuera.

### Divider — el primero

`src/css/3-components/divider.css` es el primer componente construido. Es el más simple del
catálogo de M3: dos tokens, sin variantes de tipo.

**Receta**, según `material-components/material-web`:

```scss
'color':     map.get($deps, 'md-sys-color', 'outline-variant')
'thickness': 1px

:host { color: <color>; display: flex; height: <thickness>; width: 100%; }
:host::before { background: currentColor; content: ''; height: 100%; width: 100%; }
```

**Tres decisiones de la receta que se conservan:**

1. **`currentColor`** en vez de un `background-color` directo. El color se aplica al
   `color` del texto y el `::before` lo toma con `currentColor`.
2. **`display: flex`**. El `::before` necesita ocupar el 100% del ancho.
3. **`border: 0`**. El `<hr>` nativo trae un border que se sumaría al `height`. Sin esto
   el divisor medía 2px en vez de 1px.

> **Lo que `currentColor` no hace.** No hace que el divisor herede el color de su
> contenedor: `.md-divider` *declara* `color`, y una declaración gana a la herencia.
> Medido en el navegador: un `<hr class="md-divider">` dentro de un contenedor con
> `color: var(--md-sys-color-primary)` se sigue viendo en `outline-variant`
> (`#cac4d0` en claro, `#49454f` en oscuro). Lo que sí permite es reapuntar
> `--md-comp-divider-color` desde el marcado sin tocar el `::before`. La deducción
> inversa es fácil y es falsa: para que un divisor adopte el color de su contexto hay que
> cambiar el token, que es lo que hace `.md-divider-primary`.

**Tres variantes de inset**, según las medidas oficiales de M3:

| Variante | padding-inline-start | padding-inline-end |
| -------- | -------------------- | ------------------ |
| full-width | 0 | 0 |
| inset | 16dp | 0 |
| middle-inset | 16dp | 16dp |

Se usan añadiendo una clase a `.md-divider`:

```html
<hr class="md-divider">
<hr class="md-divider md-divider-inset">
<hr class="md-divider md-divider-middle-inset">
```

**Tokens que consume:**

| Token | Capa | Valor |
| ----- | ---- | ----- |
| `--md-sys-color-outline-variant` | 2-system-tokens | `#cac4d0` en light |
| `--md-sys-shape-stroke-thin` | 2-system-tokens | 1px |
| `--md-sys-measurement-inset` | 2-system-tokens | 16px |
| `--md-comp-divider-color` | 3-components | → outline-variant |
| `--md-comp-divider-thickness` | 3-components | → stroke-thin |

**Modificador de color (extensión de RDM Next, no de M3):** M3 define un único rol de
color para el divisor. Aquí además existe `.md-divider-primary`, que reapunta el token
público `--md-comp-divider-color` del propio componente:

```html
<hr class="md-divider md-divider-primary">
```

Existe por un motivo concreto: sin él, la única forma de cambiar el color desde el
markup era un atributo `style=` en línea, y la REGLA 6 lo prohíbe. El token ya estaba
declarado, pero no era alcanzable desde el HTML.

No se puede resolver componiendo con una utilidad de `2-system-tokens` como `.md-text-primary`:
`@layer` declara `comp` **después** de `sys`, así que la regla del componente gana el
empate por orden de capa y el color no cambiaría. Un modificador del componente, en su
propia capa, sí funciona.

**Showroom:** `showroom/components/divider.html` es la vista del componente, con 6
secciones. Estructura confirmada con el usuario según la skill `rdm-component-showroom`.

Su sección de accesibilidad lleva la tabla de contrastes que faltaba: el rol por defecto
no llega a **3:1 en ninguna superficie del sistema** —su máximo es 2.07:1—, lo cual no es
un fallo de esta implementación sino el dato de M3, que elige `outline-variant` para que la
línea se funda con el fondo. Lo que sí se mide es la salida para cuando la separación tiene
que leerse: `.md-divider-primary` no baja de 4.97:1 en claro ni de 7.20:1 en oscuro, y
`outline` no baja de 3.51 ni de 3.87.

### Button

`src/css/3-components/button.css`. Es el componente con más superficie del catálogo, porque es el
primero completo: el que obliga a resolver casi todo lo que el sistema tenía abierto.

**Cinco variantes**, y **cinco tamaños**:

| Variante | Relleno | Etiqueta | Elevación reposo | Elevación hover |
| -------- | ------- | -------- | --------------- | --------------- |
| `filled` (la base) | `primary` | `on-primary` | level0 | **level1** |
| `tonal` | `secondary-container` | `on-secondary-container` | level0 | **level1** |
| `elevated` | `surface-container-low` | `primary` | level1 | **level2** |
| `outlined` | transparente, con borde de 1px | `on-surface-variant` | level0 | level0 |
| `text` | transparente | `primary` | level0 | level0 |

| Tamaño | Alto | Padding lateral | Etiqueta |
| ------ | ---- | --------------- | -------- |
| `xsmall` | 32dp | 12dp | `label-large` |
| `small` (la base) | 40dp | 16dp | `label-large` |
| `medium` | 56dp | 24dp | `title-medium` |
| `large` | 96dp | 48dp | `headline-small` |
| `xlarge` | 136dp | 64dp | `headline-large` |

M3 publica cinco tamaños y aquí hay los cinco. Antes faltaban `large` y `xlarge`: las
alturas de 96dp y 136dp no tenían dónde vivir, porque la escala de espaciado se acaba en
72. Se resolvió abriendo una primitiva propia, `1-reference-tokens/container-height.css`,
con la familia entera de alturas de contenedor (32 · 40 · 56 · 96 · 136). El mismo criterio
que el resto del proyecto: no se repetía el valor crudo en la capa 3, se declaraba una vez
en la capa 1.

**Estados:** `:hover`, `:focus-visible`, `:active` y `[disabled]`. Los tres primeros mueven
la capa de estado, que es un `::after` con `background-color: currentColor`, `opacity: 0` y
una transición de 100ms. Ninguno de los tres cambia el nivel de elevación. El cuarto baja a
level0 y no recibe eventos.

**El hover sí sube la elevación, y es el único estado que lo hace.** No es una decisión
propia: los tokens de M3 declaran cuatro valores privados por variante y el de hover es el
único que difiere del de reposo —`focused` y `pressed` repiten el de reposo—. Se implementa
con `--md-comp-button-elevation-hover` y una regla, y la transición es de 300ms con la curva
`emphasized`, no los 280ms de Material Web, porque esa cifra no es ningún token del sistema.
Las dos tablas con los valores, medidos con el ratón encima de cada botón, están en la
vista de Elevation.

**Lo que no se implementa:** el *ripple*. M3 lo resuelve con `<md-ripple>`, que es
JavaScript y necesita conocer las coordenadas del puntero. La propia especificación
reconoce la capa de estado como la alternativa para contextos sin JS.

### Icon Button

`src/css/3-components/icon-button.css`. Cuatro variantes —`standard`, `filled`, `tonal` y
`outlined`—, cinco tamaños, tres anchos y una forma extra, `square`, aparte del
redondeo por defecto.

Es el componente que más clases expone del catálogo, y el motivo es que combina cuatro
ejes independientes: variante × tamaño × ancho × forma. Los tres anchos —`narrow`,
`uniform` (la base, sin clase) y `wide`— solo cambian la dimensión horizontal:

| Tamaño | Alto | `narrow` | `wide` |
| ------ | ---- | -------- | ------ |
| `xsmall` | 32dp | 28dp | 40dp |
| `small` | 40dp | 32dp | 52dp |
| `medium` | 56dp | 48dp | 72dp |
| `large` | 96dp | 64dp | 128dp |
| `xlarge` | 136dp | 104dp | 184dp |

La altura, el glifo y el área táctil de 48dp se quedan en los tres: es lo que M3
garantiza, el objetivo táctil nunca baja de 48 aunque el contenedor sea más estrecho.

La diferencia con el Button que más se nota es que **no tiene etiqueta**, y eso simplifica
el archivo: no hay `overflow: hidden` en ningún sitio, porque no hay texto que recortar. A
cambio, el área táctil tiene que crecer en los dos ejes:

| Regla | Ejes que crece | Cómo |
| ----- | -------------- | ---- |
| `.md-button-touch` | solo vertical | `block-size: max(48px, 100%)`, `left: 0` y `right: 0` |
| `.md-icon-button-touch` | los dos | `block-size` e `inline-size: max(48px, 100%)` |

Es la misma receta de M3 en los dos casos —una superficie invisible superpuesta que no
altera el tamaño visible— y son dos reglas distintas porque el botón de icono es estrecho
en los dos ejes y el de texto solo en uno.

**Su elevación es `level0` en las cuatro variantes y no hay token de hover.** No es una
decisión conservadora: M3 no declara ningún token de elevación para ningún botón de icono,
ni `standard`, ni `filled`, ni `tonal`, ni `outlined`, en ninguna de sus tres
generaciones de tokens.

**Los cinco tamaños de M3 están.** Durante un tiempo faltaban `large` (96dp) y `xlarge`
(136dp), y era la decisión más larga del repositorio: no había dónde declarar esas
alturas. Se resolvió con `1-reference-tokens/container-height.css`, la misma primitiva
que habilita los dos tamaños grandes del Button, y ambos componentes leen la misma
escalera. La historia está desarrollada en la vista del componente.

### Button group

`src/css/3-components/button-group.css`. Los botones de acción puestos en fila, con su
separación fijada. Dos clases: `.md-button-group` y `.md-button-group-standard`.

**No trae nada nuevo, y trae una sola cosa.** Ni color, ni medida, ni forma: trae el
conocimiento de que a su lado hay otro botón. `.md-button` no sabe si tiene hermanos;
`.md-button-group` sí, y esa información es todo lo que aporta.

Se entrega una variante, `standard`: la fila suelta, con aire entre botones y cada botón
con su propia forma. El tamaño **no se escribe, se infiere de los hijos** con `:has()`,
igual que en M3, así que el snippet es solo los botones y no hay una clase que acordarse
de escribir. De los cinco `between-space` que publica M3 (18 / 12 / 8 / 8 / 8), cuatro
caen en nuestra escala; el de xsmall va con 16px, y el desvío está anotado en
`2-system-tokens/measurement.css`.

**Lo que no está:** la variante `connected`, que cospe los botones quitando las esquinas
interiores, y el crecimiento del botón pulsado. Los dos están unidos: en M3 el pulsado se
ensancha un 15% y los demás se cierran, con una transición de ancho con resorte —eso es un
**morph de pulsado**, prohibido en este sistema—, y `connected` depende de ese
crecimiento para que el grupo se lea al pulsar. Connected entra sin eso, o no entra.
Tampoco sirve para `.md-icon-button`: M3 lo define para `.btn`, y el icono-button tiene su
propia lógica de zona táctil que el grupo no conoce.

### FAB

`src/css/3-components/fab.css`. El botón de acción principal, y **no un icono-button
disfrazado**: M3 lo publica como componente separado, con familias de token propias. La
receta que había antes en la vista del icono-button dibujaba algo parecido pero hacía tres
cosas mal en silencio: daba `primary`/`on-primary` donde M3 pide `primary-container`/
`on-primary-container`, heredaba los cinco tamaños del icono-button (un FAB de 32px y otro
de 136px no existen en M3) y ninguna clase del snippet decía «fab».

**Cuatro tamaños, ni xsmall ni xlarge.** Small 40, base 56 (sin clase), medium 80, large
96. Que no haya seis es el propósito: un `md-fab-xlarge` no llega a pintarse, mientras que
en el icono-button esa clase existe y daría 136px.

**Ancho y alto son siempre iguales:** el FAB es un cuadrado perfecto en M3, así que no hay
eje de anchos como en el botón de icono. Se declara la altura una vez y el ancho se le
reapunta, porque dos valores que puedan desincronizarse es una puerta abierta.

**Ojo con los dos «medium».** El nuestro de 56px no lleva nombre de tamaño porque en M3 es
el base: `medium` en M3 *es* el de 80px. Son dos vocabularios para la misma escalera, y aquí
manda el del FAB, porque así lo nombran sus ficheros de token. El 80 no estaba en ninguna
de nuestras escalas —la de espaciado se acaba en 72 y la de alturas salta de 56 a 96—, así
que la capa 1 se descongeló para declararlo: `--md-ref-container-height-fab-medium`.

**Sin FAB menu.** M3 lo publica y es JavaScript: abrir un panel desde el botón no se puede
expresar aquí. Tiene 1 de las 8 familias de color de M3, decisión escrita en `fab.css`.

### FAB extended

`src/css/3-components/fab-extended.css`. El FAB al que se le añade texto: icono + etiqueta,
o solo etiqueta. **M3 no tiene componente aparte para ello** —en `fab/fab.ts` el `label` es
un atributo del mismo `<md-fab>`—, así que aquí se copia esa forma: una clase sobre la base
`.md-fab`, y la dependencia siempre va en el mismo sentido, el extendido exige la base y la
base no sabe que existe el extendido. Va en fichero propio porque la vista y la
documentación también son propias.

```html
<button class="md-fab md-fab-extended" type="button">
  <span class="md-icon" aria-hidden="true">navigation</span>
  Navegar
</button>
```

**Tres tamaños con medida propia** (los de M3 Expressive): small 56, medium 80 y large 96.
El small es el por defecto, el único sin clase.

Se descartó primero con un «nuestro `md-button` ya es un botón con etiqueta y solo falta
ponerle el icono». Era falso en tres sitios al mirar los ficheros de token: M3 tiene ocho
ficheros de color propios para el extended, la forma es `corner-large` y no la pilota del
botón, y tiene juego de medida propio. El padding de cierre también se escribió a ojo: se
propuso 24px y el baseline dice 20, verificado en `fab/internal/_shared.scss:64-65`.

### Card

`src/css/3-components/card.css`. Una superficie contenedora con elevación, forma y color.
M3 la publica como **un componente con tres fichas de color**, no como tres componentes, y
aquí se sigue esa forma: la base es la `elevated` y las otras dos solo reapuntan tokens,
sin escribir ninguna propiedad.

Cuatro ranuras —`.md-card-media`, `-header`, `-content` y `-actions`—, de las que solo el
contenedor es obligatorio. El padding es 16px, fijo y sin clase modificadora, porque M3 no
publica ninguno.

**Lo que más se nota:**

- **El borde de `outlined` cuesta 2px, y no es un descuido.** Una card es de altura
  automática, así que `box-sizing: border-box` no lo arregla. M3 hace lo mismo: tiene
  `border` en la raíz de su receta.
- **Una card con acciones no puede ser `<a>`.** El modelo de contenido de `a` no admite
  contenido interactivo dentro y el parser no lo repara, así que el HTML inválido pasa
  inadvertido. Para esa combinación está el `<button class="md-card">`, que sí admite
  botones dentro porque no es un enlace.
- **El hover se acota a que la card sea un control.** M3 lo acota al hijo pulsable; aquí se
  acota igual al `:hover` y al `:active`, porque el `:active` se propaga a los ancestros y
  una card de solo lectura se oscurecía al pulsar un botón que tuviera dentro.
- **No tiene ancho mínimo**, comprobado por dos vías en los ficheros de M3. Lo que hace una
  card ancha es el layout: en móvil se estira al ancho de pantalla, en grande van columnas.

**Lo que no está:** `dragged`, que M3 publica para las tres fichas pero que no está implementado —con `src/js/` disponible ya no es imposible, es que nadie lo ha escrito—; `selected`, que los tres ficheros de token no
publican; y el icono, que M3 sí tiene tokens pero es el icono que el autor pone *dentro* de
la card, no algo que la card posea.

### Las vistas que no son componentes

Nueve vistas del showroom documentan familias de `1-reference-tokens/` y
`2-system-tokens/` que son documentación por sí mismas. Ninguna está en
`3-components/`, y ninguna es un componente: no tienen anatomía, ni slots, ni estados, ni
interacción.

| Vista | Documenta | Secciones |
| ----- | --------- | --------- |
| `color.html` | `1-reference-tokens/palette.css` y `4-utilities/color.css` con los dos temas | 18 |
| `typography.html` | `2-system-tokens/typography.css`, `1-reference-tokens/typeface.css`, `1-reference-tokens/typescale.css` | 15 |
| `icon.html` | `2-system-tokens/icon.css` e `1-reference-tokens/iconfont.css` | 9 |
| `elevation.html` | `2-system-tokens/elevation.css` e `1-reference-tokens/shadow.css` | 6 |
| `measurement.html` | `2-system-tokens/measurement.css`: touch, alturas, button, iconos, icon button e inset | 6 |
| `motion.html` | `2-system-tokens/motion.css`, `1-reference-tokens/time.css` y `easing.css`: 16 duraciones y 4 curvas | 20 |
| `shapes.html` | `2-system-tokens/shape.css`, `1-reference-tokens/corner.css` y `stroke.css`: 10 formas y los grosores | 11 |
| `spacing.html` | `1-reference-tokens/spacing.css`, los 18 pasos de la escala | 1 |
| `state.html` | `2-system-tokens/state.css` y `4-utilities/state.css`: estados y disabled | 2 |

### Dialog — el primero con JavaScript

`dialog.css` es el primer componente del catálogo que necesita `src/js/`. La regla del
sistema es que un componente es CSS y solo se escribe JS cuando el CSS no puede: abrir y
cerrar un `<dialog>` son llamadas, así que existen. Pero son dos —`showModal()` y
`close()`— y todo lo demás sigue siendo CSS. La vista se conecta con
`<script type="module" src="../../src/js/main.js">`; ningún HTML del repo lleva `<script>`
con código dentro.

El elemento es un `<dialog>` nativo, y por eso su base declara solo `position: relative`:
el navegador pone la caja en el centro cuando la app llama a `showModal()`. M3 necesita
`position: fixed` y `margin: auto` porque su host es un web component.

Tres cosas que se saltaban por estar solo en la hoja y conviene tener a mano:

- **`display` va en `.md-dialog[open]`, nunca en la base.** El navegador esconde un
  `<dialog>` sin `open` con una regla suya, y la capa 3 la pisaba con un `display: flex`
  de autor. Un dialog cerrado se veía en la página.
- **Los límites de alto no están en la tabla de specs** —dice «Container height:
  Dynamic»— y son los que hacen que el scroll interno funcione. Sin ellos, `min-height: 0`
  y `overflow-y: auto` son código muerto.
- **El id de cada dialog tiene que ser único.** `data-open-dialog` es lo único que dice
  qué botón abre qué dialog, y con un id repetido los dos abren el primero, sin error.

---

## 12. Iconos

La fuente de los iconos es parte de la librería, no un asset del showroom. Vive en
`1-reference-tokens/iconfont.css` y `main.css` la importa en la capa `ref`.

### Qué publica M3

Material Web publica **dos** tokens de icono, en `tokens/_md-comp-icon.scss`:

| Token             | Valor                        |
| ----------------- | ---------------------------- |
| `--md-icon-font`  | `'Material Symbols Outlined'` |
| `--md-icon-size`  | `24px`                       |

Ni un eje, ni un relleno, ni un área táctil, ni una clase. Los equivalentes aquí son
`--md-sys-icon-font` y `--md-sys-measurement-icon-size`. El segundo **no** está en
`2-system-tokens/icon.css`: es una medida, así que comparte capa con las del botón y vive en
`2-system-tokens/measurement.css`.

**Extensión propia** (no publicada por nadie como token): los ejes, el relleno, el
desplazamiento de línea base y las familias `rounded` y `sharp`. Están documentados
como tale en la cabecera de `1-reference-tokens/iconfont.css`.

### Los tres estilos y cuándo se usa cada uno

M3 declara tres estilos, y también dice cuál usar:

| Clase              | Estilo    | Cuándo                                                  |
| ------------------ | --------- | ------------------------------------------------------- |
| `.md-icon`         | outlined  | UI densa. Esquinas exteriores de 2dp, interiores cuadradas |
| `.md-icon-rounded` | rounded   | Marca pesada: tipografía fuerte, logos curvos, elementos circulares |
| `.md-icon-sharp`   | sharp     | Marcas rectangulares, y para que el glifo siga legible a escala pequeña |

`.md-icon` es **Outlined** porque es el valor del token oficial `--md-icon-font`.

### Los cuatro ejes

| Eje     | Rango     | Rol                | Qué hace                                        |
| ------- | --------- | ------------------ | ----------------------------------------------- |
| `wght`  | 100 – 700 | `--md-sys-icon-weight` | Grosor del trazo. El sistema usa 400         |
| `FILL`  | 0 – 1     | `--md-sys-icon-fill`   | De delineado a macizo. `.md-icon-filled` lo pone en 1 |
| `opsz`  | 20 – 48   | `--md-sys-icon-optical-size-*` | Grosor del trazo según el tamaño del glifo |
| `GRAD`  | -50 – 200 | `--md-sys-typescale-icon-grade` | Compensa el contraste con el fondo. **Lo elige el tema** |

### Los cuatro tamaños

M3 publica exactamente cuatro, ni uno más: **20, 24, 40 y 48 dp**.

| Rol                                        | dp | Cuándo                                          |
| ------------------------------------------ | -- | ----------------------------------------------- |
| `--md-sys-measurement-icon-size-small`    | 20 | Escritorio, layouts densos, botones pequeños    |
| `--md-sys-measurement-icon-size`           | 24 | El estándar                                      |
| `--md-sys-measurement-icon-size-large`     | 40 | Acciones primarias destacadas                    |
| `--md-sys-measurement-icon-size-xlarge`    | 48 | Texto de display o titular, pantallas grandes   |

**Antes había un 16dp y se quitó.** `--md-sys-measurement-icon-size-small` valía
`16px` con el comentario *«icono pequeño, para chips y badges»*. 16dp no está en la
escala de M3, y cae justo en la zona que la propia especificación marca como
delicada: por debajo de 20dp un icono necesita etiqueta de texto al lado. Pasó a
20dp, que es el tamaño denso que M3 sí define y que el sistema ya usaba de hecho
para los botones pequeños.

### El área táctil va emparejada con el glifo

| Glifo | Objetivo | Rol                                       | Clase                            |
| ----- | -------- | ----------------------------------------- | -------------------------------- |
| 24dp  | 48dp     | `--md-sys-measurement-icon-target`        | `.md-measure-icon`               |
| 20dp  | 40dp     | `--md-sys-measurement-icon-target-small`  | `.md-measure-icon-target-small`   |

M3 justifica el par corto con una condición concreta: cuando el mouse y el teclado
son los métodos de entrada principales, las medidas pueden condensarse para permitir
layouts más densos.

### Por qué la fuente se carga con `@import` y Google Sans Flex con `<link>`

Es la única asimetría del orquestador, y no es una inconsistencia.

Google Sans Flex, en `1-reference-tokens/typeface.css`, se carga con `<link>`: su hoja solo trae
`@font-face`, ninguna regla que compita con las capas, y `<link>` evita el coste del
`@import`.

Material Symbols **no puede** ir con `<link>`. Su hoja trae además tres clases de
utilidad —`.material-symbols-outlined`, `-rounded` y `-sharp`— que declaran su propio
`font-size: 24px`. Con un `<link>` esas reglas llegan **sin capa**, y en CSS una regla
sin capa gana a cualquier regla con capa sin importar la especificidad.

Medido en el navegador: `.md-button-icon` declaraba 20dp y computaba bien, pero la
regla de Google le ganaba y el glifo se dibujaba a 24px. La caja seguía midiendo
20×20 y la tinta del glifo llegaba a medir 24×28, recortada por el `overflow` del
botón. Afectaba a los seis iconos de la vista del botón.

Un `<link>` no admite `layer()`. La única forma de meter una hoja externa en una capa
es `@import`, y para que el navegador la descubra tiene que ir en un archivo CSS.

**La capa anidada `ref.reset`.** `iconfont.css` entra en `ref`, y su `@import`
declara `layer(reset)`. La combinación produce una capa anidada que ordena antes de
las reglas de `ref`:

```
ref.reset  <  ref  <  sys  <  comp  <  utilities
```

La opinión de Google pierde contra las primitivas propias. Verificado: los iconos del
botón computan `20px` con `opsz 20`, y el del botón medium `24px` con `opsz 24`.

### `display=block`, y por qué no `swap`

Un icono de Material Symbols es un texto: el HTML lleva el **nombre** del glifo,
`add`, `download`. Con `display=swap`, durante la descarga se pinta ese texto con la
fuente de respaldo y el usuario ve un instante la palabra *download* donde debería
haber un icono. `block` no dibuja nada hasta que la fuente llega.

### Las clases de Google no se usan

El sistema declara su propia `.md-icon` en `2-system-tokens/icon.css`. La hoja de Google **sí**
se carga entera —su `@import` no puede filtrar una clase— así que la clase ajena está
disponible y además neutralizada por la capa: usarla *funciona* y no delata nada.
Lo único que se pierde es que el componente deje de controlar el tamaño de su glifo,
y eso se ve mirando el icono, no el código.

Por eso existe la **REGLA 9** del verificador: comprueba los atributos `class` del
HTML, y no el archivo entero, porque el nombre aparece legitimamente en la prosa del
showroom.

### Coste de declarar tres familias

Ninguno, mientras no se usen. Los navegadores descargan una fuente solo cuando un
elemento pintado la usa. Verificado: `divider.html`, que no tiene ni un icono, pide
**cero** fuentes de icono.

### Dos correcciones que hizo esta implementación

**El `-25` del grado sí es oficial.** El valor estaba bien, pero la justificación que
lo acompañaba en `1-reference-tokens/typeface.css` era falsa: decía que *«no viene de la
especificación de M3, que no da un número para este caso»*. M3 sí lo da:

> To match the apparent icon size, the default grade for a dark icon on a light
> background is 0, and **-25 for a light icon on a dark background**.

Lo que se había elegido por comparación visual era el *nombre* del token, copiado de
`rdm-next-old` sin revisar la fuente.

**El desplazamiento de línea base es `0.115em`, no `11.5%`.** La primera versión
aplicaba `top: 11.5%`, que es la lectura literal de la especificación, y funcionaba
mal: un porcentaje en `top` se resuelve contra la **altura del bloque contenedor**, no
contra el tamaño de fuente. Medido con el icono en un contenedor de 30px, daba
`top: 3.4375px` — el 11.5% de la línea del padre, sin relación con el texto. Con
`0.115em` un glifo de 24px da `2.76px`, y escala con el glifo.

### Accesibilidad

M3 da tres reglas. No hay ninguna clase que las imponga, porque no son reglas de CSS:
son obligaciones de quien escribe el HTML.

1. Icono decorativo junto a una etiqueta → el icono lleva `aria-hidden="true"`.
2. Icono solo → el control lleva `aria-label` y el icono `aria-hidden`.
3. Por debajo de 20dp → etiqueta de texto al lado, salvo iconos complejos o con una
   acción clave. Los iconos de navegación **siempre** llevan etiqueta.

### El color

No hay token de color de icono. M3 dice que un icono toma `currentColor`: el glifo se
dibuja con el color del texto que lo contiene. Es la misma regla que aplica
`2-system-tokens/state.css` a la capa de estado, y por eso un icono cambia de color solo con que
su contenedor cambie el suyo.

### Showroom

**Sí hay vista de iconos:** `showroom/components/icon.html`, con sus 9 secciones
confirmadas una por una con el usuario. Documenta `2-system-tokens/icon.css` e
`1-reference-tokens/iconfont.css`, no un componente de `3-components/`: los iconos son una capacidad de
sistema y no existe `3-components/icon.css`. El precedente es `typography.html`, que documenta
una escala del `2-system-tokens` de la misma manera.

Lo que sí es cierto es lo que decía antes este párrafo: el trabajo de la fuente de iconos
—cargarla con `@import` para poder meterla en una capa, neutralizar las tres clases de
utilidad que trae, y corregir el desplazamiento de línea base— fue un cambio de la
librería, y no de la documentación.

---

## 13. Fuentes oficiales

- Tokens: `https://m3.material.io/foundations/design-tokens`
- Spacing: `https://m3.material.io/styles/spacing/tokens`
- Escala tipográfica: `https://m3.material.io/styles/typography/type-scale-tokens`
- Iconos: `https://m3.material.io/styles/icons/overview`,
  `https://m3.material.io/styles/icons/designing-icons`,
  `https://m3.material.io/styles/icons/applying-icons`
- Material Web (referencia de implementación): `https://material-web.dev`
- Clases `.md-typescale-*` de Google: `material-components/material-web` → `typography/_typescale.scss`
  (el mixin `typescale.styles()` las genera; es la fuente de la columna "oficial" de la
  tabla de prefijos de arriba)
- Tokens de sistema v0.192: `_md-sys-color.scss`, `_md-sys-typescale.scss`, `_md-sys-motion.scss`,
  `_md-sys-state.scss`, `_md-sys-shape.scss` en `tokens/versions/v0_192/` del mismo repositorio
- Iconos de M3: `_md-comp-icon.scss` en `tokens/` del mismo repositorio. Publica dos
  tokens: `--md-icon-font` y `--md-icon-size`
