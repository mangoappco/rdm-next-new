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

Hoja en `src/css/3-components/`, vista en `showroom/components/`. Hay **7 componentes y 16 vistas** (7 de componente + 9 de tokens), las 16 enlazadas en `showroom/index.html`. El orden es el de `index.css`:

| Componente | Hoja | Vista |
| --- | --- | --- |
| Divider | `divider.css` | `divider.html` |
| Icon button | `icon-button.css` | `icon-button.html` |
| Button | `button.css` | `button.html` |
| Button group | `button-group.css` | `button-group.html` |
| FAB | `fab.css` | `fab.html` |
| FAB extended | `fab-extended.css` | `fab-extended.html` |
| Card | `card.css` | `card.html` |

Cada componente tiene además su molde en `showroom/templates/<nombre>.template.html`.

**Solo 4 de 14 las tienen byte-idénticas a su vista** — `fab`, `fab-extended`, `icon-button` y `card`, las cuatro más recientes. Las otras 10 vistas llevan un puntero de dos líneas al molde y el molde se quedó atrás: esa es la convención mayoritaria, pero la cambió el rumbo del 2026-10-13, no al revés. `typography.html` no tiene molde propio y apunta a `component.template.html`.

## Card — publicada

La hoja está hecha y verificada, y la vista **tiene ocho pares y está publicada y enlazada**: Clase base, Variantes, Ratio, Link, States y cuatro recetas de Slots que cierran como playground para copiar. `card.html` es copia byte-idéntica de su molde, con el bloque de razonamiento dentro.

**Padding y Anatomía no tienen par, y está decidido por qué.** Padding no es una API: M3 no publica ni un token de padding para card, el nuestro es un valor único de 16px que el autor no puede cambiar —no hay clase modificadora y `4-utilities` no publica utilidad de espaciado—, así que mostrar «son 16px» no sería un par. Anatomía la cumple la receta **Slots completa**, que ya lleva las seis partes de M3 en su marcado; es la misma unificación que hizo `button.html`, donde "Anatomy sizes" es a la vez anatomía y modelo de contenido.

**Lo que queda de la vista:** solo **States** estaba pendiente y ya entró con el bug que destapó. Los pares que no se harán, además de esos dos: **Color** —descartado hasta que las variantes tengan algo que distinguir más allá de las fichas— y **Sizes** y **Shapes**, que no aplican.

- **Base = elevated.** Las tres fichas están implementadas: `.md-card-elevated`, `.md-card-filled` y `.md-card-outlined`.
- **LA FICHA SE ESCRIBE SIEMPRE, INCLUIDA LA QUE TRAE LA BASE.** Todo contenedor de card lleva la suya, aunque sea la elevated, y no solo `md-card`. Decidido el 2026-10-16 al auditar la vista: **7 de los 10 contenedores** del template iban sin ella, en tres de los cuatro pares. Solo el par de Variantes la llevaba, que es el que existe para nombrarlas.
  - **El motivo no es estética, es de lectura del snippet.** Quien copia un fragmento necesita ver de un vistazo qué parte se juega. Con la clase a secas hay que abrir el CSS para descubrir que existe una variante. Es el mismo argumento que ya está escrito para `.md-button-filled` sobre `.md-button` (commit 5489438) y para `md-card-media-landscape`, que se escribe aunque la base ya sea 16:9.
  - **Y era una incoherencia dentro del mismo elemento.** El par de Ratio producía `<article class="md-card">` junto a `<div class="md-card-media md-card-media-landscape">`: la ranura con su variante escrita y el contenedor sin ella, a dos líneas.
  - **Medido, el render no se mueve ni un píxel.** Se fotografiaron las diez cards antes y después —caja, fondo, sombra, radio, borde, color y posición de cada ranura— y las cifras coinciden. `.md-card-elevated` reapunta los dos mismos tokens que `.md-card`, así que declarar la clase solo cambia el texto del snippet.
  - **Dos sitios se dejan a propósito**, porque su argumento es sobre otra cosa: el `<div class="md-card">` del comentario de `card.template.html:38`, que explica por qué la card es `<article>` y no `<div>`; y las trece apariciones en prosa de `card.css`, que argumentan qué elementos son control.
- **El borde de `outlined` cuesta 2px, y no es un descuido.** Medido con el mismo contenido en las tres: elevated y filled miden 134×120, outlined **136×122**. `box-sizing: border-box` no lo arregla porque solo manda con altura declarada, y una card es de altura automática. La otra cara: el texto del outlined cae 17px desde el borde en vez de 16. M3 hace lo mismo —tiene `border` en la raíz— e igualarlo sería cambiar el componente para tapar la aritmética del borde.
- **Cada ficha reapunta tokens y nunca escribe una propiedad**, como en `.md-button`. Por eso el orden de las clases en el atributo no importa: con dos fichas en la misma card gana siempre la última **del fichero**, no la última escrita. Comprobado: `md-card-outlined md-card-elevated` y `md-card-elevated md-card-outlined` dan las dos veces outlined.
- **Las tres variantes de M3 están definidas y son copiables tal cual.** De `labs/gb/components/card/_card-tokens.scss` y `card.scss` de material-web, que no se habían leído hasta ahora:

  | variante | container-color | elevación | contorno |
  | --- | --- | --- | --- |
  | elevated | `surface-container-low` | level1 → hover **level2** | — |
  | filled | `surface-container-highest` | **level0** → hover level1 | — |
  | outlined | `surface` | **level0** → hover level1 | 1px `color-outline-variant` |

  M3 lo hace con una sola declaración: `border: var(--outline-width) solid var(--outline-color)`. **Todos los tokens que hacen falta ya existen**, incluido `--md-sys-shape-stroke-thin`, que vale 1px, el grosor que usa M3. No hay que crear ni un token.
- **La base de M3 es transparente y sin elevación; las variantes añaden.** `card-tokens.root` es `--container-color: transparent` y `--container-elevation: shadow-0`. Nuestra base es la *elevated*, divergencia deliberada y ya anotada.
- **El hover de M3 sube un escalón, y la elevated sube el segundo.** No es arbitrario: `.card-filled` y `.card-outlined` solo redefinen el color —y el contorno—, así que heredan el `@mixin hover` de la raíz. **Resuelto** en el par de Link: `filled` y `outlined` declaran también `--md-comp-card-elevation-hovered: level1`. Medido antes del arreglo: su hover iba de 0 a 2 saltándose el primer escalón, y en la outlined ganaba una sombra pesada siendo una ficha que por definición no lleva sombra.
- **M3 acota el hover al hijo pulsable, no a la card**: `:has(.card-btn:not(:disabled, .disabled))`. El nuestro lo acota a que la card *sea* un control. Las dos reglas excluyen el botón deshabilitado, pero no son la misma, y la nuestra se decidió con una razón medida: el `:active` se propaga a los ancestros. Queda como deuda de documentación.
- **UNA CARD CON ACCIONES NO PUEDE SER `<a>`, Y EL NAVEGADOR NO LO AVISA.** El modelo de contenido de `a` no admite contenido interactivo dentro, y el parser **no lo repara**: medido, `<a class="md-card"><div class="md-card-actions"><button>` deja los `<button>` dentro del enlace y renderiza igual. El HTML inválido pasa inadvertido. Para esa combinación está el `<button class="md-card">`, que sí admite botones dentro porque no es un enlace. M3 esquiva el problema con otro modelo: deja la card como `<article>` y pone encima un `<button>` transparente en `inset: 0` (`labs/gb/…/card.scss`). **Se eligió el nuestro** porque no obliga a escribir un botón que no se ve; el límite queda documentado en la prosa del par.
- **`<button class="md-card">` dejaba pasar cinco estilos del navegador, y la ruta estaba documentada sin verificar.** Medido, `<article class="md-card">` contra `<button class="md-card">` con el mismo contenido:

  | propiedad | article / a | button |
  | --- | --- | --- |
  | padding-left / top | 0 | **6px / 1px** |
  | text-align | start | **center** |
  | appearance | none | **auto** |
  | line-height | 20px | **normal** |
  | font-size | 14px | **13.33px** |
  | font-family | Google Sans Flex | **Arial** |

  El `text-align: center` era lo que más se veía: lo heredan las ranuras, así que el titular de una card-botón salía centrado mientras el de las otras salía a la izquierda. `.md-card` declara ahora `appearance: none`, `padding: 0`, `text-align: start`, `font: inherit` y `text-decoration: none`. **No va en `reset.css` y no es una excepción a su regla**: allí está escrito que los controles no se neutralizan ahí, porque cada componente los define con lo suyo.
- **El subrayado es el único sitio del sistema donde la regla del reset no aplica.** `reset.css` lo conserva a propósito —«no debe depender solo del color»— y para un enlace de texto en línea tiene razón. En una card-enlace la señal ya está puesta por la forma, la elevación, la capa de estado y el cursor, y el subrayado además **miente**: solo subraya el titular y sugiere que solo el titular es el enlace. Se quita en `.md-card` y se comprobó que el reset sigue subrayando los enlaces sueltos. Detalle fino: **`text-decoration` se propaga a los descendientes y no se puede quitar desde dentro** —el `<h3>` computa `text-decoration-line: none` y aun así sale subrayado— así que se quita en la card, no en la ranura.
- **M3 usa `:focus-within` para el contorno del outlined**, no `:focus`. Implementado en `.md-card-outlined:focus-within` (commit `b2c86ca`): una card `<article>` con botones dentro nunca recibe el foco ella misma, así que `:focus` no se dispararía nunca.
- **El par de Slots se construyó y se quitó** para ir a Variantes. Eran cuatro recetas ordenadas por *qué le quitas* —las cuatro · sin medio · medio y cabecera · sin acciones—, mejor eje que "qué ranuras hay presente". Queda en el commit `8b9ec90`. Con él se quitó también `.sr-specimen-grid`: **no hay helper de cuadrilla en el showroom** y las cards salen a su ancho por contenido.
- **M3 no publica ancho mínimo para cards, comprobado por dos vías.** `Card.md` de Android (538 líneas) solo menciona `app:strokeWidth` —el grosor del borde—, `android:layout_width` en XML de ejemplo y `width="500"` en capturas: cero menciones de ancho mínimo, columnas o breakpoints. Y las guidelines pegadas a mano dicen que en móvil se estiran al ancho de pantalla y que en pantalla grande se usan varias columnas. El ancho lo decide el layout, y por eso `.md-card` no declara ninguno.
- **UNA CARD ANCHA SE COME LA PANTALLA, Y EL NÚMERO ESTÁ MEDIDO.** El medio crece lineal con el ancho porque `aspect-ratio` manda sobre la altura. Con un viewport de 746px:

  | ancho de card | alto del medio | % del viewport antes del titular | card entera |
  | --- | --- | --- | --- |
  | 320 | 180 | 24% | 50% |
  | 480 | 270 | 36% | 62% |
  | 600 | 338 | 45% | 71% |
  | **663** | **373** | **50% — el umbral** | |
  | 900 | 506 | 68% | 94% |
  | 1200 | 675 | 90% | 116% |
  | 1600 | 900 | 121% | 146% |

  El umbral exacto de 663px sale de `alto = ancho · 9/16` con `alto = 373`, la mitad de 746. Por encima de ahí la imagen sola ya es media pantalla.
- **La respuesta a la card ancha es el layout, y `.md-card` no se toca.** Decidido el 2026-10-16: en ManGo! las cards viven en grid y el ancho enorme es la excepción. Lo que dice M3, de las guidelines ya pegadas a mano: *«Avoid extending UI elements across the screen when possible»*, *«On larger screens with an expanded breakpoint, use multiple columns»* e *«In mobile layouts, components such as lists or cards are stretched to fit the full width of the screen»*. O sea: en móvil ancho completo, en grande columnas. Lo que no hace es publicarte un número.
- **LO QUE M3 NO PUBLICA, Y DÓNDE SE BUSCÓ, porque se volvió a proponer con números inventados:**

  | dónde | resultado |
  | --- | --- |
  | `material-web`, todo el árbol | **cero** ficheros de layout |
  | los tres tokens de card | **cero** tokens de ancho |
  | `--md-ref-layout-*` / `--md-sys-layout-*` | **no existen** en el repo |
  | el contraejemplo | `--md-comp-button-min-width` **sí existe** |

  Los botones tienen ancho mínimo. Las cards no. El rango «280 a 360px» que se propuso como óptimo de lectura **no aparece en ninguna fuente**.
- **Tres refutaciones, por si vuelven a colarse:**
  - **`max-height` en el medio no es de M3.** Los tokens de card no tienen alto máximo, y un tope crudo viola REGLA 1. Peor: a 600px el 16:9 daría 338, así que un tope de 240 **aplasta la proporción y abre bandas vacías** con el `contain`. Rompe justo lo que pretende arreglar.
  - **`.md-card-horizontal` no existe.** `labs/card/internal/_shared.scss` fuerza `:host { flex-direction: column }` y no hay variante de fila. El texto que lo propuso confundió *«rearrange groups of related cards into horizontal rows»* —poner varias cards en fila— con *hacer una card horizontal por dentro*. Son cosas distintas.
  - **`object-fit: cover` está rechazado a propósito**, en `card.css:607`: recorta lo que sobra y en una ficha de producto puede recortar el producto.
- **Dato que salió de paso y no estaba en ninguna nota: M3 tiene dos cards que se portan distinto.** `labs/gb/…/card.scss` pone `border: var(--outline-width) solid var(--outline-color)` en la raíz, y eso **cuesta 2px** porque la card es de altura automática (ver la nota del borde de outlined). `labs/card/internal/_shared.scss` en cambio pone `.outline { border: 1px solid transparent; position: absolute; inset: 0; z-index: 1 }` — **cuesta 0**, y con el `z-index: 1` la imagen queda ENCIMA del borde en vez de hundida detrás. Nuestra hoja usa `border`. No se cambia aquí: es otro par de medidas y otro fichero de M3.
- **Dos trampas de CSS que costaron tiempo y conviene no repetir.** Una: `--md-ref-spacing-900` vale **72px, no 288** —los 288 son `× 4`— y leerlo mal hacía que `auto-fit` sacara ocho pistas en vez de dos. Dos: `minmax(0, 1fr)` dentro de `repeat(auto-fit)` mete tantas pistas como quepan y colapsa las vacías; se midieron **1276 pistas, 4 con contenido y 1272 de 0px**.
- **Que el specimen decida el ancho no es un fallo del componente, y es justo lo que la card debe hacer.** En un grid con pistas definidas, las cuatro cards salen del mismo ancho y la imagen se ajusta sola: medido, con `repeat(4, 1fr)` las cuatro miden 148px y el SVG baja de 320 a 148 sin quejarse. El 320px del ancho intrínseco solo aparece cuando el contenedor deja que decida el contenido, que es lo que hace `flex`.
- **La regla `:has()` no evita un hueco visible, evita un doble padding.** Medido: con la regla, de subhead a primera línea hay 16px, y de borde a primera línea sin cabecera también 16px. Sin ella son 32px, porque el header pone 16 abajo y el content 16 arriba. Los dos casos caen en 16 exactos, y ese es el ritmo que la hoja promete. Es la **única** dependencia entre ranuras en los 600+ líneas de `card.css`.
- **Cuatro ranuras**: `.md-card-media`, `-header`, `-content`, `-actions`. Las cuatro van en el par de Clase base.
- **El `src` del snippet es del showroom, a propósito.** `../assets/card-media.svg` no es copiable tal cual: es REGLA 11, el `innerHTML` del specimen y el texto del `<pre>` son idénticos, y como el specimen renderiza su ruta tiene que ser real. La prosa del par lo dice.
- **El `src` NO atraviesa ningún hueco de REGLA 13**, contra lo que se afirmó dos veces aquí y en la plantilla. REGLA 13 comprueba que el snippet no necesite CSS ni JS ajenos, y una imagen necesita un fichero de imagen, no una hoja de estilos. El problema real era otro: una imagen rota sin dimensiones colapsaba la ranura.
- **Una imagen rota colapsaba la ranura a 20px.** El `alt` se pinta igual en los dos casos; lo que faltaba era la caja. Se resolvió con `aspect-ratio` en la ranura, no con dimensiones en el `<img>`: medido, la imagen rota reserva 169px igual que la cargada. El `img` **no** lleva `width` ni `height` —dirían el tamaño de la foto de ejemplo, y en la app puede ser otro, que es el mismo problema que el nombre del asset.
- **Las tres proporciones son clases, no números:** `.md-card-media-landscape`, `-square` y `-portrait`, que dan 16:9, 1:1 y 3:4. La base no lleva clase, como la base de `.md-button` es la `filled` y no lleva la suya, y `-landscape` existe aun sabiendo que hace lo mismo: es el caso de `.md-button-filled`. Los tres leen un rol de `--md-sys-measurement-card-media-aspect*`; escribir `--md-ref-aspect-*` en `3-components` es REGLA 2 y el verificador lo caza.
- **`.md-card-media` lleva fondo en `surface-container-high`**, un escalón por debajo del tono de la card (`surface-container-low`), para que la caja se vea mientras carga o si nunca llega. M3 no publica ningún token para esto —sus tres ficheros de card no mencionan imagen, media, fallback ni aspect-ratio, y `labs/gb/components/card/card.scss` no tiene un selector de `img`— así que es decisión nuestra. El precio: una imagen con transparencia deja pasar el fondo, y no hay forma de evitarlo en CSS porque no existe selector para «la imagen ha fallado».
- **El par de Ratio sirve el asset genérico en las tres ranuras, y eso es la demostración.** `card-media.svg` es una imagen 16:9; en la ranura cuadrada el `contain` deja **70px** arriba y abajo, y en la vertical **124px**. Eso demuestra que la caja la reserva **la ranura** y no la imagen, y que el fondo de `surface-container-high` aparece justo en lo que sobra. Con un asset por proporción los `viewBox` coincidirían con sus ranuras, las bandas serían 0 y el fondo de respaldo ya no se vería en ningún specimen. Las tres cards miden **320**, así que la diferencia de forma viene solo del ratio.
- **`showroom/assets/card-media.svg` es el primer asset de imagen del repo**, y el primer `<img>` de las 15 vistas. SVG y no PNG porque es texto. Sus comentarios llevan rayas de puntos y no guiones: un `---` dentro de un comentario XML lo vuelve inválido, y el navegador lo tiraba entero sin avisar (`naturalWidth` daba 0).
- **El specimen dice `Headline`, `Subhead` y `Supporting text`, que es el vocabulario de M3**, y el asset no dibuja nada concreto. Se renunció a la ficha de producto que tenía antes: `.md-card-media` no lee el contenido de la imagen, solo la recorta, así que inventar un «Caja de Carthago» convertía un placeholder en una mentira que se iba también al portapapeles. Los nombres de rol son lo que ya hace `typography.html`. El SVG es un rectángulo `neutral92` con un bloque `neutral87` centrado.
- **`.md-card-media` estira a su hijo, y lo hace el componente y no el reset.** `max-width: 100%` es un tope, no un ancho: con una imagen de 320px en una ranura de 438px quedaban 118px de card a su derecha. La regla es `.md-card-media > :where(img, video, canvas)` con `inline-size: 100%`, y vive en el componente porque estirar a un hijo es decisión de esta ranura: una imagen suelta en un párrafo no debe estirarse.
- **El hover y el press están acotados a los controles**, con `:is(a[href], button, [tabindex]):not(:disabled)`. M3 los publica incondicional porque allí una card casi siempre es pulsable; aquí no, y sin acotar una card de solo lectura se oscurecía al pasar el ratón **y también al pulsar un botón que tuviera dentro**. El `:active` se propaga a los ancestros del elemento pulsado, así que hacía falta acotarlo igual que el hover. El cursor sigue la misma regla y la base **no declara `cursor`**. El `:not(:disabled)` es por especificidad: `:is()` hereda (0,1,1) de `a[href]` y le ganaba a `.md-card:disabled` (0,2,0). `:focus-visible` sí queda sin acotar porque una card estática no es enfocable. La interactividad llegó con el par de **Link**.
- **No se puede medir un pulsado sostenido desde el arnés.** Un clic de herramienta va de pulsar a soltar en el mismo instante; se probó con un sampler de 560 cuadros y no atrapó ni un `:active`. Para eso está `lab.html`. Lo que sí se pudo comprobar es la guarda, que depende solo de lo que es el elemento.
- **Disabled tiene dos vías**: `:disabled` solo llega si la card es un `<button>`; para un `<article>` hay que usar `.md-disabled` de `4-utilities`.
- **La outlined apagada lava el contenido, contra M3 y a propósito.** Ni los tokens (`disabled-outline-*` y nada más), ni el mixin `outlined-disabled`, ni `labs/card` —que lo deja en TODO, `b/307361748`— atenúan el contenido; solo la ilustración de la web lo muestra lavado. Se sigue a la ilustración por decisión del autor: sin el lavado no se lee como apagada. Se hace en los hijos y no en la card para no multiplicar el borde del 0.12, y en alto contraste no se aplica.
- **La alineación de `.md-card-actions` es `flex-end`, y es decisión nuestra.** M3 no publica ningún token de alineación de acciones —sus tres ficheros de card dan seis tokens y ninguno es de eso—, y `labs/gb/components/card/card.scss` no tiene selector de acciones: la card de M3 es un contenedor con un `<slot>`. La prosa de `m3.material.io/components/cards/guidelines` revisada tampoco da valor por defecto: su sección «Actions» no menciona alineación, y la única frase sobre ella está bajo «Adaptive design» —«cards and their elements can align left, right, or center as the layout scales»—, que es permiso para variar por breakpoint. El único dato comparable leído es `dialog/internal/_dialog.scss`: `.actions { justify-content: flex-end }`.
- **La prosa de las guidelines de card sí se pudo leer**, pegada a mano: es la única fuente de M3 sobre cards legible, porque la web es Angular y su texto va en chunks de JS. Confirma tres cosas de la implementación actual: el contenedor **no tiene tamaño propio** («size is determined by the space those elements occupy»), solo el contenedor es obligatorio y todo lo demás opcional, y hay tres variantes. Su vocabulario es **Headline / Subhead / Supporting text**, no Title / Subhead / Body.
- **Ninguna fuente de M3 sobre cards se lee por la vía web.** `m3.material.io` responde 57 KB sin contenido, igual con Googlebot y Bingbot, y el snapshot de Wayback del 2026-10-11 solo guarda la shell de Angular. La prosa legible sale de `material-components-android/master/docs/components/Card.md`. Ver la sección de fuentes, arriba.
- **`Card.md` de Android no dice nada de la alineación de la fila de acciones.** Se comprobó palabra por palabra: lo único que menciona `align` es `layout_marginEnd`, `Gravity`, `scaleType` y `cornerSize`. Confirma por segunda vía oficial lo que se había deducido de los tokens.
- **La anatomía de M3 son seis partes**: Container, Headline, Subhead, Supporting text, Image, Buttons. Es el vocabulario que lleva el specimen de card, y coincide con el `Card.md` de Android y con las guidelines pegadas a mano.
- **El título necesita `md-type-title-large`.** Medido: dentro de `.md-card-header` un `<h3>` computa 25.74px, no 22px, porque `reset.css:245-247` conserva a propósito los tamaños de `h1..h6`.

Decidido para la vista: el par de **Color** no se hace hasta que las variantes tengan algo que distinguir más allá de las fichas; el del título lleva pareja propia.

## Siguiente tarea

**Card está cerrada.** Con la publicación, el único componente que queda por hacer es `dialog` —ya aparece en `main.css:54` como declarado y no existe—, y el trabajo pendiente es la **deuda conocida** de más abajo, no un par nuevo.

**Lo que se descartó al cerrarla, y por qué, para que no vuelva a proponerse:**

- **Padding**: los tres ficheros de token de M3 no dan **ni una** coincidencia de `padding`, `spacing` ni `margin`. El nuestro es un valor único, `--md-sys-measurement-card-padding` = 16px, que declaran las tres ranuras de texto; el medio va sin padding a propósito y la base pone `padding: 0` para neutralizar el `<button>`. Encima **el autor no puede cambiarlo**: no hay clase modificadora y `4-utilities` no publica utilidad de espaciado. Mostrar «el padding son 16px» no es un par. Lo único con contenido era el ritmo de 16px al quitar ranuras —la regla `:has()`, ya medida en `card.css`—.
- **Anatomía**: la cumple la receta **Slots completa**, que ya lleva las seis partes de M3 en su marcado.
- **Sizes** no aplica (M3 no publica tamaños de card) y **Shapes** tampoco (la forma es `corner-medium` fija, sin clase, igual que en el FAB, commit `f3a0da0`).

## Deuda conocida

Nada de esto se ha tocado. Está anotado para que no se dé por verdad:

- `src/css/main.css:54` dice `comp Componentes: button, card, dialog.` — card ya existe, dialog no.
- **Solo `card.html` lleva `<meta name="description">`**, que la skill exige; las otras quince vistas no.
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

## Fuentes de M3

No hay copia local. Se leen por GitHub, en `https://github.com/material-components`.

| Repositorio | Qué es | Para qué |
| --- | --- | --- |
| `material-web` | Material Design Web Components, activo | **valores de token y recetas**: `tokens/versions/latest/sass/_md-comp-*.scss` |
| `material-components-android` | la implementación de referencia de M3 | **prosa**: `docs/components/<Nombre>.md`, uno por componente |
| `material-components-web` | MDC Web, la librería *anterior* a M3 | **nada**. El nombre parece autoritativo y no es M3 |
| `material-components-ios`, `-flutter`, `material-components` | mantenimiento o parados | nada |

Sin checkout:

```
https://api.github.com/repos/material-components/material-web/git/trees/main?recursive=1
https://raw.githubusercontent.com/material-components/material-web/main/<ruta>
https://raw.githubusercontent.com/material-components/material-components-android/master/<ruta>
```

La rama por defecto de Android es `master`, no `main`.

### Lo que NO se lee, para no perder tiempo

| Fuente | Resultado |
| --- | --- |
| `m3.material.io` | app de Angular. 57 KB de HTML con cero contenido, igual con Googlebot y Bingbot, y el snapshot de Wayback solo guarda la shell |
| `api.github.com/search/code` | pide autenticación, vacío sin ella |
| `material-web/card/` | 404. El card está en `labs/card/` |
| `material-web/tokens/versions/latest/` | 404. Los ficheros van en `…/latest/sass/` |

Para prosa de M3 hay que pegarla a mano. No se afirma lo que diga la web sin haberlo leído.

### Cards en concreto

`material-web` **no** tiene documentación de cards: su `docs/components/` tiene button, checkbox, chip, dialog, divider, elevation y fab, y ningún `card.md`. La prosa de cards sale de `material-components-android/master/docs/components/Card.md`, 21 KB, con anatomía, propiedades, variantes, implementación y theming.

## Dónde vive el resto

| Qué | Dónde |
| --- | --- |
| Reglas del showroom, ciclo de publicación, orden de secciones, deuda de prosa | `.opencode/skills/rdm-component-showroom/SKILL.md` |
| Cómo correr el verificador en macOS | este archivo, abajo |
| Arquitectura de capas, nomenclatura, temas, iconos y fuentes | `README.md` |
| Las 13 reglas automáticas y cómo se ejecutan | `tools/verify-tokens.ps1` |
| Filosofía de las fichas del showroom | `docs/showroom-philosophy.md` |
