# CONTEXT.md

Contexto rápido para retomar la sesión en frío. No sustituye a `README.md` ni a la skill del showroom: aquí solo viven los hechos que cambian con cada componente y los candados que ya no se discuten. **Se actualiza en el mismo commit de cada componente**, igual que el enlace en `showroom/index.html`.

## Qué estamos construyendo

La librería de componentes de **RDM ManGo! App**: sistema de diseño estático, HTML + CSS, sin build, sin framework y sin JavaScript. Basado conceptualmente en Material Design 3, con arquitectura de tokens, nomenclatura y decisiones propias. Cuatro capas — `1-reference-tokens` → `2-system-tokens` → `3-components` → `4-utilities` — y un showroom que lo documenta con dogfooding: cada vista usa las clases reales del sistema.

## Candados

Solo prohibiciones verbales. Las reglas de showroom, de capas y de ciclo no se copian aquí: viven en la skill y en el README, apuntadas más abajo.

- **Sin JavaScript** en el sistema. `showroom/lab.html` es la única excepción: el banco de pruebas, sin enlace en `index.html`.
- **Sin toggles** en ManGo! App.
- **Sin morph de pulsado** en ningún componente.
- **Sin elevación transicionada.**

## Componentes creados

Hoja en `src/css/3-components/`, vista en `showroom/components/`. Hay **7 componentes y 15 vistas** (6 de componente + 9 de tokens), las 15 enlazadas en `showroom/index.html`. El orden es el de `index.css`:

| Componente | Hoja | Vista |
| --- | --- | --- |
| Divider | `divider.css` | `divider.html` |
| Icon button | `icon-button.css` | `icon-button.html` |
| Button | `button.css` | `button.html` |
| Button group | `button-group.css` | `button-group.html` |
| FAB | `fab.css` | `fab.html` |
| FAB extended | `fab-extended.css` | `fab-extended.html` |
| Card | `card.css` | **en curso**, sin publicar |

Cada componente tiene además su molde en `showroom/templates/<nombre>.template.html`.

**Solo 3 de 13 las tienen byte-idénticas a su vista** — `fab`, `fab-extended` e `icon-button`, las tres más recientes — y `card` sigue esa vía: al publicarse, `card.html` será una copia exacta de `card.template.html`, con el bloque de razonamiento dentro. Las otras 10 vistas llevan un puntero de dos líneas al molde y el molde se quedó atrás: esa es la convención mayoritaria, pero la cambió el rumbo del 2026-10-13, no al revés. `typography.html` no tiene molde propio y apunta a `component.template.html`.

## Card — a medias

La hoja está hecha y verificada; **la vista tiene un solo par**, el de Clase base, y se construye par a par. No está publicada ni enlazada, y no debe estarlo hasta que tenga los pares que se decidieron.

- **Base = elevated.** `filled` y `outlined` no existen todavía. Cuando entren, aparece también `.md-card-elevated`, la clase que ya trae la base, por el motivo de `.md-button-filled`.
- **Cuatro ranuras**: `.md-card-media`, `-header`, `-content`, `-actions`. Las cuatro van en el par de Clase base, con la ficha de producto que da ManGo! App.
- **El `src` del snippet es del showroom, a propósito.** `../assets/card-media.svg` no es copiable tal cual: es REGLA 11, el `innerHTML` del specimen y el texto del `<pre>` son idénticos, y como el specimen renderiza su ruta tiene que ser real. La prosa del par lo dice.
- **El `src` NO atraviesa ningún hueco de REGLA 13**, contra lo que se afirmó dos veces aquí y en la plantilla. REGLA 13 comprueba que el snippet no necesite CSS ni JS ajenos, y una imagen necesita un fichero de imagen, no una hoja de estilos. El problema real era otro: una imagen rota sin dimensiones colapsaba la ranura.
- **Una imagen rota colapsaba la ranura a 20px.** El `alt` se pinta igual en los dos casos; lo que faltaba era la caja. Se resolvió con `aspect-ratio` en la ranura, no con dimensiones en el `<img>`: medido, la imagen rota reserva 169px igual que la cargada. El `img` **no** lleva `width` ni `height` —dirían el tamaño de la foto de ejemplo, y en la app puede ser otro, que es el mismo problema que el nombre del asset.
- **Las tres proporciones son clases, no números:** `.md-card-media-landscape`, `-square` y `-portrait`, que dan 16:9, 1:1 y 3:4. La base no lleva clase, como la base de `.md-button` es la `filled` y no lleva la suya, y `-landscape` existe aun sabiendo que hace lo mismo: es el caso de `.md-button-filled`. Los tres leen un rol de `--md-sys-measurement-card-media-aspect*`; escribir `--md-ref-aspect-*` en `3-components` es REGLA 2 y el verificador lo caza.
- **`.md-card-media` lleva fondo en `surface-container-high`**, un escalón por debajo del tono de la card (`surface-container-low`), para que la caja se vea mientras carga o si nunca llega. M3 no publica ningún token para esto —sus tres ficheros de card no mencionan imagen, media, fallback ni aspect-ratio, y `labs/gb/components/card/card.scss` no tiene un selector de `img`— así que es decisión nuestra. El precio: una imagen con transparencia deja pasar el fondo, y no hay forma de evitarlo en CSS porque no existe selector para «la imagen ha fallado».
- **`showroom/assets/card-media.svg` es el primer asset de imagen del repo**, y el primer `<img>` de las 15 vistas. SVG y no PNG porque es texto. Sus comentarios llevan rayas de puntos y no guiones: un `---` dentro de un comentario XML lo vuelve inválido, y el navegador lo tiraba entero sin avisar (`naturalWidth` daba 0).
- **El specimen dice `Title`, `Subhead`, `Body`, `Action` y `Primary`, y el asset no dibuja nada concreto.** Se renunció a la ficha de producto que tenía antes: `.md-card-media` no lee el contenido de la imagen, solo la recorta, así que inventar un «Caja de Carthago» convertía un placeholder en una mentira que se iba también al portapapeles. Los nombres de rol son lo que ya hace `typography.html`. El SVG es un rectángulo `neutral92` con un bloque `neutral87` centrado.
- **`.md-card-media` estira a su hijo, y lo hace el componente y no el reset.** `max-width: 100%` es un tope, no un ancho: con una imagen de 320px en una ranura de 438px quedaban 118px de card a su derecha. La regla es `.md-card-media > :where(img, video, canvas)` con `inline-size: 100%`, y vive en el componente porque estirar a un hijo es decisión de esta ranura: una imagen suelta en un párrafo no debe estirarse.
- **El hover y el press están acotados a los controles**, con `:is(a[href], button, [tabindex]):not(:disabled)`. M3 los publica incondicional porque allí una card casi siempre es pulsable; aquí no, y sin acotar una card de solo lectura se oscurecía al pasar el ratón **y también al pulsar un botón que tuviera dentro**. El `:active` se propaga a los ancestros del elemento pulsado, así que hacía falta acotarlo igual que el hover. El cursor sigue la misma regla y la base **no declara `cursor`**. El `:not(:disabled)` es por especificidad: `:is()` hereda (0,1,1) de `a[href]` y le ganaba a `.md-card:disabled` (0,2,0). `:focus-visible` sí queda sin acotar porque una card estática no es enfocable. La interactividad llega con el par de **Link**.
- **No se puede medir un pulsado sostenido desde el arnés.** Un clic de herramienta va de pulsar a soltar en el mismo instante; se probó con un sampler de 560 cuadros y no atrapó ni un `:active`. Para eso está `lab.html`. Lo que sí se pudo comprobar es la guarda, que depende solo de lo que es el elemento.
- **Disabled tiene dos vías**: `:disabled` solo llega si la card es un `<button>`; para un `<article>` hay que usar `.md-disabled` de `4-utilities`.
- **El título necesita `md-type-title-large`.** Medido: dentro de `.md-card-header` un `<h3>` computa 25.74px, no 22px, porque `reset.css:245-247` conserva a propósito los tamaños de `h1..h6`.

Decidido para la vista y aún no escrito: el par de Color **no se hace** hasta que existan las otras dos variantes; el del título lleva pareja propia; el de disabled se hace con el autor en el momento.

## Siguiente tarea

**Terminar la vista de `card`**, par a par, en `showroom/templates/card.template.html`. Sin contenido real: **Sizes** no aplica (M3 no publica tamaños de card) y **Shapes** tampoco (la forma es `corner-medium` fija, sin clase, igual que en el FAB, commit `f3a0da0`). Los que sí lo tienen: **Slots**, **Padding**, **States**, **Anatomía** y **Link**, que es el que trae la interactividad que la base no tiene.

## Deuda conocida

Nada de esto se ha tocado. Está anotado para que no se dé por verdad:

- `README.md` §11 documenta 3 componentes (Divider, Button, Icon Button) y hay 7: no menciona button-group, fab, fab-extended ni card.
- `src/css/main.css:54` dice `comp Componentes: button, card, dialog.` — card ya existe, dialog no.
- El README §11 usa como marcador unas líneas comentadas de `card.css` y `dialog.css` en `3-components/index.css` que ya no existen, y su justificación —«cerraría las dos vistas que declaran chip y card como pendiente»— no se verifica: ninguna vista lo declara.
- **Ninguna de las 15 vistas lleva `<meta name="description">`**, que la skill exige. `card.template.html` sí lo lleva, y es el único.
- `showroom.css:223` mete `padding: 16px` en todo `div` directo de `.sr-specimen`. Un specimen escrito como `<div class="md-card">` lo ganaría en silencio y REGLA 11 no lo detectaría. La card usa `<article>` por eso.
- Tres vistas quedaron sobre el techo de prosa al recortarla: `button-group` (199 de media), `icon-button` (287 máx.) y `motion` (211 máx.).
- El split button existe en M3 (`-split-button-{xs…xl}` + 3 `menu-button`), depende de un `menu` que no existe y no puede abrirse sin JavaScript. Queda registrado en `button.css`, en el bloque «LO QUE NO ESTA, Y POR QUE». Sus medidas ya están en `container-height.css:40`.
- FAB y extended FAB tienen 1 de las 8 familias de color de M3. Decidido y escrito en `fab.css:448-451`.
- `4-utilities` no publica ninguna utilidad de espaciado, así que las ranuras de la card no pueden delegar su hueco al autor: lo declara el componente.
- **10 de 13 moldes están desfasados** respecto a su vista publicada: `button-group`, `button`, `color`, `divider`, `elevation`, `icon`, `measurement`, `motion`, `spacing` y `state`. Llevan el bloque largo `COMO USAR ESTE TEMPLATE` donde la vista lleva el puntero de dos líneas, y se quedaron atrás en `5422fb2` (recorte de prosa), que tocó las vistas y no los moldes. Usar cualquiera de esos diez como molde arrastraría prosa ya recortada; los buenos son `fab`, `fab-extended`, `icon-button` y `card`.
- **`navigator.clipboard` solo existe en contexto seguro**, así que abierto por la IP de la red el botón «Copiar» no tenía copia ni alternativa y quedaba muerto en las quince vistas. Corregido con un respaldo de `document.execCommand` y con texto honesto en los dos sentidos. Probado en las dos rutas: por `localhost` y por `http://10.226.28.43/`.

## El verificador en macOS

```
~/.local/powershell/pwsh -NoProfile -File ./tools/verify-tokens.ps1
```

PowerShell 7.6.7 instalado en `~/.local/powershell/`, sin sudo y sin instalador: se descomprimió del tarball oficial. No está en el PATH; si se quiere, se añade con un enlace o una línea en `~/.zshrc`, y entonces el comando es `pwsh -File ./tools/verify-tokens.ps1`.

En macOS **no** va `-ExecutionPolicy Bypass`: es un concepto de Windows y ahí el bloqueo de scripts no existe. El script tampoco necesitó cambios: `Get-RelPath` normaliza cualquier separador a `\` antes de comparar, que es justo lo que hace portable.

Desde que corre aquí, el sustituto de bash que se usó mientras tanto ya no hace falta y no está en el repo.

## Dónde vive el resto

| Qué | Dónde |
| --- | --- |
| Reglas del showroom, ciclo de publicación, orden de secciones, deuda de prosa | `.opencode/skills/rdm-component-showroom/SKILL.md` |
| Cómo correr el verificador en macOS | este archivo, abajo |
| Arquitectura de capas, nomenclatura, temas, iconos y fuentes | `README.md` |
| Las 13 reglas automáticas y cómo se ejecutan | `tools/verify-tokens.ps1` |
| Filosofía de las fichas del showroom | `docs/showroom-philosophy.md` |
