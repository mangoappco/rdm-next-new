# CONTEXT.md

Contexto rápido para retomar la sesión en frío. No sustituye a `README.md` ni a la skill del showroom: aquí solo viven los hechos que cambian con cada componente y los candados que ya no se discuten. **Se actualiza en el mismo commit de cada componente**, igual que el enlace en `showroom/index.html`.

## Qué estamos construyendo

La librería de componentes de **RDM ManGo! App**: sistema de diseño estático, HTML + CSS y una capa fina de JavaScript, sin build y sin framework. Basado conceptualmente en Material Design 3, con arquitectura de tokens, nomenclatura y decisiones propias. Cuatro capas — `1-reference-tokens` → `2-system-tokens` → `3-components` → `4-utilities` — y un showroom que lo documenta con dogfooding: cada vista usa las clases reales del sistema. Un componente lleva JS solo si el CSS no alcanza: hoy son dos, el `dialog` y el `toggle`.

## Candados

Solo prohibiciones verbales. Las reglas de showroom, de capas y de ciclo no se copian aquí: viven en la skill y en el README, apuntadas más abajo.

- **Sin `<script>` con código dentro de un HTML, en ningún sitio.** El JavaScript vive en `src/js/`, en un archivo por componente, y el HTML solo lo referencia con `<script type="module" src="...">`. No es una excepción para el showroom: es en los dos lados. `src/js/main.js` es el punto de entrada y quien usa la librería importa `main.css` y `main.js`.
- **Un componente solo lleva JS si el CSS no alcanza.** Abrir y cerrar, o conmutar estado. Hoy son dos: el dialog (con `data-open-dialog` y `data-close-dialog`) y el toggle, que es UN archivo — `src/js/toggle.js` — para DOS componentes (button e icon-button comparten el mismo gancho `data-toggle`). La frontera son los atributos, no los componentes. No se crean archivos vacíos por simetría.
- **El toggle existe (2026-10-18)** y sustituye la prohibición anterior «sin toggles»: button e icon-button conmutan con `data-toggle` + `aria-pressed`, servicio de `src/js/toggle.js`. Grupos exclusivos con `data-toggle-group` (clic en el activo nunca desmarca); múltiples con `data-toggle-group="multi"` o `aria-multiselectable="true"`. Outliers decididos: la variante text no es conmutable, el eje FILL no conmuta con el estado y el disabled gana (uniforme por variante). **Y la inversión de forma morfa** en los dos componentes, con el par spatial + long2 (reversión formal del «sin morphs de forma» del grill) y respetando `prefers-reduced-motion`; el morph de pulsado sigue fuera. El del botón además obliga a un desvío de M3: su `container-shape-round` es `corner-full`, 9999px, y eso no se anima —medido: ida con 334ms de los 500 sin moverse, vuelta instantánea—, así que el botón usa `corner-half-{tamaño}`. Pinta igual en los cinco tamaños y está medido. El showroom lo cubre en los dos sentidos con el par `Toggle square` de cada vista: sin él, la dirección square → round no se veía en ninguna parte.
- **Sin morph de pulsado** en ningún componente, **ratificado el 2026-10-18**. Dos razones, y las dos importan. La primera es técnica y no se esquiva: M3 especifica el pulsado con física de muelle —amortiguación 0.9, rigidez 1400—, que no tiene traslación a CSS, así que hacerlo fiel exigiría inventar una `cubic-bezier` que nadie ha medido. La segunda es de uso: ManGo! App es un POS de alta interacción y un control que cambia de esquinas en cada clic genera fatiga visual. Y hay una tercera, de coherencia: 500ms es absurdo para un evento `:active` de 80ms. **La inversión morfológica queda restringida al estado persistente de selección** —toggle con `aria-pressed="true"`—, que es donde aporta valor semántico y accesibilidad; el `:active` solo pinta su capa de estado.
- **Sin elevación transicionada.**

## Componentes creados

Hoja en `src/css/3-components/`, vista en `showroom/components/`. Hay **10 componentes y 19 vistas** (10 de componente + 9 de tokens), las 19 enlazadas en `showroom/index.html`. El orden es el de `index.css`:

| Componente | Hoja | Vista |
| --- | --- | --- |
| Divider | `divider.css` | `divider.html` |
| Icon button | `icon-button.css` | `icon-button.html` |
| Button | `button.css` | `button.html` |
| Button group | `button-group.css` | `button-group.html` |
| FAB | `fab.css` | `fab.html` |
| FAB extended | `fab-extended.css` | `fab-extended.html` |
| Card | `card.css` | `card.html` |
| Dialog | `dialog.css` | `dialog.html` |
| List | `list.css` | `list.html` |
| Segmented button | `segmented-button.css` | `segmented-button.html` |

Cada componente tiene además su molde en `showroom/templates/<nombre>.template.html`.

**Solo 6 de 18 las tienen byte-idénticas a su vista** — `fab`, `fab-extended`, `card`, `dialog`, `list` y `segmented-button`, las más recientes. Las otras 12 vistas son distintas de su molde, por el puntero de dos líneas de la convención antigua o porque el molde se quedó atrás del trabajo publicado: esa es la convención mayoritaria, pero la cambió el rumbo del 2026-10-13, no al revés. `typography.html` no tiene molde propio y apunta a `component.template.html`.

## FAB — la base NO es el `md-fab-medium`

Medido en el par Sizes de `fab.html`, en alto real:

| variante | alto |
| --- | --- |
| `md-fab-small` | 40px |
| **la base, sin clase de tamaño** | **56px** |
| `md-fab-medium` | **80px** |
| `md-fab-large` | 96px |

No son el mismo tamaño, y **el choque es de vocabulario, no de componente**. M3 tiene un FAB base de 56dp que no lleva clase —porque es el estado por defecto—, y además un token llamado `medium` que vale **80**. Los dos existen en M3 y son cosas distintas: nuestra base es el base de M3, y nuestra `md-fab-medium` es el `medium` de M3.

| | nuestra base | `md-fab-medium` |
| --- | --- | --- |
| alto | 56px | 80px |
| glifo | 24px | 28px |
| radio | `corner-large` | `corner-large-increased` |

**Por qué importa:** quien escriba `<div class="md-fab md-fab-medium">` pensando que repite la base **no la repite** — sale 80px en vez de 56, con glifo y radio distintos. Y quien aplique el `medium` de M3 esperando 56 se lleva 80.

Que el 80 no estaba en ninguna escala nuestra está escrito en `container-height.css:245-252`: la capa 1 se descongeló para declarar `--md-ref-container-height-fab-medium`, porque el espacio se acaba en 72 y las alturas saltan de 56 a 96. Y el aviso de los dos *medium* está en `fab.css:38-43`.

Está medido y no se ha tocado el componente: es una decisión de diseño, no un descuido, y cambiar un tamaño es otra conversación.

Anotado aquí el 2026-10-17. Este dato vivía solo en el encabezado de `fab.html`, y al sustituir ese encabezado por la definición canónica de M3 —que habla de la acción principal y no de tamaños— se habría perdido del showroom. Vive aquí porque es donde se busca.

## Card — publicada

La hoja está hecha y verificada, y la vista **tiene dieciséis pares y está publicada y enlazada**: los nueve del laboratorio —Clase base, Variantes, Ratio, Link, States y cuatro recetas de Slots que cierran como playground para copiar— y los siete **casos de uso de ManGo! App** que se añadieron el 2026-10-21: la ficha elevated con una mesa activa del salón, la filled con una comanda de cocina, la outlined con el arqueo de caja, la ficha con medio y la de producto, la ficha de auditoría, que lleva una `md-list` con sus cinco atributos dentro, la ficha de aviso de stock y el resumen de cuenta con su desglose. `card.html` es copia byte-idéntica a su molde, con el bloque de razonamiento dentro.

**Y va en las dos mitades**, con la división que ya fija el estándar del showroom: los nueve atómicos en la especificación técnica y los siete de negocio en los casos de uso.

- **Una lista dentro de una card va a borde de borde.** El padding lateral del content (16) se sumaba al de la fila (16) y dejaba los atributos a 33px del borde de la ficha, con los divisores en otra columna (a 17): la lista y los divisores no caían en la misma línea. M3 mete la lista a borde de borde —el aire de 16px lo pone la propia fila— y aquí lo hace un margen negativo en `.md-card-content > .md-list`, con el token del padding del content. Medido: el icono pasa de 33 a 17 desde el borde exterior (16 exactos desde el interior), en la misma columna que el titular de la cabecera y que los extremos de los divisores. **Y la regla es de la card, no de la lista**: el padding que hay que cancelar es de la card, y al revés la lista necesitaría un `:has()` para saber que está dentro de una.

> **Corrigido el 2026-10-17.** Esta línea decía «ocho pares» y eran nueve: el índice afirmaba ocho, esta línea repetía el error, y la vista tenía nueve secciones desde antes. Salió al auditar que la descripción del índice y el encabezado de la vista sean el mismo texto —los dos contaban mal y en el mismo sentido—. El recuento de pares de los ocho componentes **se cuenta ahora desde el fichero**, no se escribe a mano.

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
- **El borde del outlined ya no se oscurece con el clic del ratón.** M3 usa `:focus-within` para el contorno --no `:focus`, porque una card `<article>` con botones dentro nunca recibe el foco ella misma--, pero con `:focus-within` el borde sube a `on-surface` con cualquier foco, incluido el del ratón: en un POS, donde se toca con el dedo o con el ratón, eso era un parpadeo del borde en cada clic. Desde el 2026-10-21 la regla son **dos selectores**, `.md-card-outlined:has(:focus-visible)` y `.md-card-outlined:focus-visible`, y hacen falta los dos: `:has()` alcanza el foco de los hijos pero **no el de la propia card**, porque un elemento no es su propio descendiente. Medido, con la outlined siendo ella misma el control, el borde se quedaba en reposo con el teclado y solo avisaba el anillo. Con las dos reglas, el alcance es el de M3 y lo único que cambia es el ratón: en reposo y con clic el borde se queda en `#CAC4D0`, y con el teclado sube a `#1D1B20`.
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

## Dialog — publicada

La hoja está hecha y verificada, y la vista **tiene seis pares y está publicada y enlazada**: Clase base, Sin titular, Modal, Lista, Divisor y Contenido largo. `dialog.html` es copia byte-idéntica de su molde.

**Es el primer componente del catálogo que lleva JavaScript**, y por eso rompe una regla que era de hecho: «un componente es CSS, y solo se escribe JS cuando el CSS no puede». Aquí el CSS no puede —abrir y cerrar un `<dialog>` son llamadas— así que existe `src/js/dialog.js`, que solo hace dos cosas: `showModal()` y `close()`. El resto sigue siendo CSS. La vista se conecta con `<script type="module" src="../../src/js/main.js">` y nada más; ningún HTML del repo lleva `<script>` con código dentro.

- **El elemento es un `<dialog>` nativo, y `position: relative` a secas.** M3 monta su dialog con un web component, así que su host necesita `position: fixed` y `margin: auto`: un elemento propio no tiene el centrado que da el navegador. Aquí el navegador pone la caja en el centro al hacer `showModal()`, y medido: `<dialog open>` fluye en su sitio, `showModal()` sale en el centro del viewport. Sin `z-index`, porque con `showModal()` el dialog entra en el **top layer** y cualquier `z-index` de la página no llega a competir.

- **`target === dialog` no bastaba para saber que se ha clicado fuera, y rompía dos cosas.** La regla de cierre al clicar fuera se escribió con la premisa «con `::backdrop` el clic cae en el elemento, no en un velo aparte», y esa premisa **solo vale si el dialog es modal**. Un `<dialog open>` a secas no cubre el viewport: fluye en su sitio y lo que hay fuera es la página, no un velo, así que «el clic ha caído en el dialog» quería decir lo contrario —que se había tocado la tarjeta. La tarjeta está llena de sitio que cae en el propio elemento: medido en el par Clase base con una rejilla de 12×9, **58 de 108 puntos, el 54%, son el propio `<dialog>`** —los 24px de padding, los dos huecos entre piezas y el hueco que deja `justify-content: flex-end`— y cada uno de esos clics cerraba el dialog. Y como los specimens del showroom son precisamente `<dialog open>` a secas, **cada clic en un specimen lo hacía desaparecer**. Siendo modal, el mismo `target === dialog` mezclaba el velo con la propia tarjeta: la caja del elemento **es** la tarjeta (medido, 280×180 en una ventana de 888×746), así que **tocar el padding de 24px de la tarjeta también cerraba el modal**, cosa que en M3 no pasa porque su scrim es un nodo aparte. Se corrige con dos condiciones —`:modal`, para que un dialog no modal nunca cierre al clicar, y la geometría con `getBoundingClientRect()`, para separar el velo del padding—, y se pierde la ventaja original de «no hace falta medir rectángulos». Se descartó `offsetX/offsetY` porque no se pudo verificar con un clic real al velo: el `::backdrop` no es un elemento al que apuntar. Entró en `6b6b51e`, cuando el scrim propio se sustituyó por `::backdrop`; no salía a la vista en el showroom porque los specimens nunca se tocan solos.

- **El velo es el `::backdrop` nativo, y es desviación deliberada de M3.** M3 pone `background: none` en su `::backdrop` y usa un `<div class="scrim">` propio, porque el suyo es parte de su DOM y de su animación. Aquí no hay animación, así que el `::backdrop` hace falta y el scrim propio sobra: el navegador lo crea y lo destruye solo, y no queda ningún nodo que pueda quedarse huérfano. M3 tampoco corta el scroll del fondo, y aquí tampoco: por eso existe `html:has(dialog.md-dialog:modal) { overflow: hidden }`, que se ha comprobado en el Chrome de Danny, no en el arnés.

- **`display` va en `.md-dialog[open]`, y el fallo es invisible.** El navegador esconde un `<dialog>` sin `open` con `dialog:not([open]) { display: none }`, que es una regla **del navegador**, y la capa 3 declaraba `display: flex` en la base, que es una regla **de autor**. La de autor gana: medido, un `<dialog class="md-dialog">` sin `open` computaba `display: flex` y ocupaba 180px. Cualquier dialog cerrado se habría visto en la página. M3 no tiene el problema porque lo condiciona. Está en `[open]` y no solo en `:modal` porque `showModal()` pone el atributo `open` además de meter el elemento en el top layer.

- **Los límites de alto no salen de la tabla de specs y son lo que hace que el scroll exista.** La tabla dice «Container height: Dynamic» y no da ni un máximo ni un mínimo. Los dos vienen del SCSS de M3 —`max-height: min(560px, calc(100% - 48px))` y `min-height: 140px`— y se adoptaron **no por faithfulness, sino porque sin ellos las reglas de la ranura de contenido son código muerto**: `min-height: 0` y `overflow-y: auto` no se disparan nunca si no hay un tope que obligue a encogerse. Medido antes del arreglo, con 40 párrafos: el dialog llegaba a 1584px en una ventana de 700, con 884px por debajo del borde y el botón de cerrar inalcanzable.

- **El `min-height` de 140px se adoptó sin su mitad, y se notaba como padding.** Un mínimo solo se ve cuando el dialog queda por debajo, y entonces los píxeles que falten tienen que caer en algún sitio. M3 los reparte haciendo que **crezca la ranura de contenido** —su cadena es `.container { flex-grow: 1 }` → `.scroller { flex: 1 }` → `.content { flex: 1 }`—, así que caen dentro del texto y no debajo de los botones. Aquí se declaraba el `min-height` pero nada crecía, y como la columna va con el `justify-content` por defecto el sobrante se iba **al final**: medido, **32px de aire abajo en vez de los 24** que da la tabla de specs, y con las cajas reales de los glifos 43.5px contra 25px. Se corrige con `flex-grow: 1` en `.md-dialog-content`, una sola declaración: los 8px se van al hueco texto→botón (36.5 → 44.5) y los cuatro lados se quedan en 24 de verdad. **Solo se ve con una línea de supporting text y sin titular**: con dos líneas el dialog ya mide 168 y con tres 204 no queda espacio libre, y con titular ni una sola línea llega al mínimo (196px naturales).

- **El 560 del alto se apoya en el token del ancho, y eso ata los dos ejes.** M3 escribe el 560 como literal en los dos, así que `--md-sys-measurement-dialog-max-height` reapunta a `--md-ref-container-width-dialog-max` en vez de repetir la cifra. **Cambiar el ancho máximo del dialog cambia también su alto máximo.** Es decisión y queda escrito en `measurement.css` para que no se lea como un error de nombre. El 140 sí tiene primitiva propia (`--md-ref-container-height-dialog-min`, en `container-height.css`) porque la REGLA 1 no deja un px suelto en la capa 2, y porque no es un `spacing`: la escala acaba en 72px.

- **Solo scrollea siendo modal, y es la misma limitación que tiene M3.** El `max-height` en porcentaje se mide contra una altura que en la página todavía no existe si el dialog es `position: relative`: medido, un `<dialog open>` con 40 párrafos llega a 1584px y el specimen se estira con él. M3 no sufre esto porque su `max-height` va sobre un host `position: fixed` que siempre tiene el viewport como referencia. Por eso el par de scroll lleva botón y `showModal()`.

- **Cada dialog necesita un id único, y el fallo no da error.** `data-open-dialog` es lo único que dice qué botón abre qué dialog, y su valor es un id. Medido con tres filas —una tabla de productos con un botón de eliminar por fila—: abrir el segundo solo abre el segundo, su botón de cerrar cierra el suyo aunque haya otro abierto, cerrar por fuera cierra el que recibió el clic, y dos clics rápidos no abren dos. Aislamiento que no costó código: abrir va por `getElementById` y cerrar por `closest('dialog')`, que sube al ancestro del botón que se pulsó. **Un id repetido, que es lo que sale de un bucle de PHP mal hecho, abre el primero sin error ni aviso** y ejecuta sobre el producto equivocado. Está escrito en el par, en `dialog.js` y en el listener que resuelve el id.

- **El divisor va en `absolute`, y eso solo funciona si se le da aire con `:has()`.** M3 lo hace y sus clases son reales —`.show-top-divider` y `.show-bottom-divider`—, pero su `bottom: 0` funciona porque **su padding vive en cada ranura** (`padding: 24px 24px 0`). Aquí el padding vive en `.md-dialog`, así que `bottom: 0` clavaba la línea contra la tipografía: medido con las cajas reales de los glifos, a **0px** del titular, y por debajo 25 contra 10. Se corrige aireando la ranura por el lado del divisor con la misma medida que ya separa las partes, y **con `:has()`, porque sin la condición los cinco pares sin separador crecerían 32px de golpe**. El aire va en las dos ranuras del divisor y **no** en el contenido: su `margin-block-start` de 16px ya es la distancia bajo la línea, y añadirle padding la duplica (16/33 en vez de 16/17).

- **La jerarquía de las acciones la pone el autor, y en el par Lista no es la de M3.** M3 pone los botones de un dialog en texto —`Button.TextButton.Dialog`— y por eso los tres primeros pares llevan `Cancelar` y `Aceptar` los dos en `md-button-text`. En Lista, `Eliminar` va en `md-button-filled` y `Cancelar` en `md-button-text`, aplicando la jerarquía que ya tiene el componente button: `filled` es la principal porque es la base y las demás la desvisten. En una confirmación de borrado que la acción destructiva sea la más destacada es lo que evita el borrado accidental. Está escrito como desviación, y el componente no impone nada.

### Lo que se descartó, y por qué, para que no vuelva a proponerse

- **Full-screen dialog**: tiene fichero de token y hasta tabla de medidas, y sin embargo el `Dialog.md` de Android dice literal que no tiene implementación de Material.
- **Variantes de color**: M3 publica **una sola** ficha para el dialog, a diferencia de la card que tiene tres.
- **Los tokens `subhead-*`**: nueve tokens, 19 menciones en su fichero y **cero** en la implementación. No hay ranura de subtítulo.
- **`aria-describedby`**: no aparece en M3. Su componente se apoya en `aria-labelledby` y el contenido se lee en orden, así que el texto de apoyo ya se anuncia sin atributo.
- **`role="alertdialog"`**: M3 lo expone como token aparte para el dialog urgente, y aquí no hay modo de cambiarlo desde el marcado.
- **Los paddings que M3 recoloca al hacer scroll**: su SCSS baja el padding de la cabecera a 16 y sube el del contenido a 8 cuando es scrollable. Descartado a propósito: los paddings viven en `.md-dialog` y se comparten entre las cuatro ranuras, y moverlos por estado es justo lo que hace que el padding deje de ser del componente.
- **El diálogo tiene entrada y salida animadas desde el 2026-10-18, y no cuestan una línea de JS.** Deslizamiento de 50px y fundido del velo, con `@starting-style` y `transition-behavior: allow-discrete`; `dialog.js` sigue con sus dos llamadas. Tres cosas que no son evidentes y que costaron una sonda: **las transiciones van en el estado que las dispara** (entrada en `:modal`, salida en `:not([open])`), porque si se declaran en un solo sitio la salida desaparece al dejar de casar el selector; el estado cerrado es `:not([open])` y **no la base**, porque los specimens del showroom usan `<dialog open>` sin `showModal()` y con la base en opacidad 0 desaparecerían; y el velo necesita su propio `@starting-style` o aparece opaco en el primer frame. Los seis valores de M3 caen 1 a 1 en tokens existentes. **No entra** el crecimiento del contenedor de 35% a 100% ni el escalonado de hijos: son Web Animations API, y el primero necesita la superficie en `::before` que el componente rechazó al usar el `::backdrop` nativo.

## List — publicada

Quince pares, en la ruta de menos a más: Clase base mínima, Densidades de texto, Slots, Contenido extenso, Composición y contenedor, Interactividad y estados, Avatar y miniatura, Metadatos y acciones, Lista de personas, Platos del catálogo, Metadatos de comanda, Acciones de gestión, Casos de uso, Métodos de pago y Comanda de cocina. `list.html` es copia byte-idéntica a su molde, y los tokens salen del fichero de M3 v34.0.21 leído en línea —no hay prosa de la lista en `docs/components/`—.

**Y van en dos bloques**, con la división que ya fija el estándar del showroom: los ocho primeros son la especificación técnica y la anatomía (el laboratorio normativo) y los siete últimos los casos de uso de ManGo! App.

**Y la portada come de ella**: las diecinueve filas del índice del showroom son `md-list-item-multiline` con la fila entera hecha enlace —`a.md-list-item`, la anatomía de «Métodos de pago»—, y todas con la misma anatomía: titular y descripción, sin dato detrás. Es dogfooding sin specimen: la portada no documenta el List, lo usa.

**Los cuatro pares "puros" se añadieron el 2026-10-21**: Lista de personas (avatares de 40 con iniciales), Platos del catálogo (miniaturas de 56 con precios en COP), Metadatos de comanda (el dato detrás, con precios y horas) y Acciones de gestión (el `md-icon-button` de 40 en la última ranura). El par de Casos de uso los junta y enseña **las tres anatomías de fila**: enlace, estática y botón.

Los hechos que **no** se leen en el código:

- **El anillo de foco va por FUERA, y es decisión propia.** M3 publica el focus indicator de la fila con offset **-3dp**, o sea dentro y pegado al borde; aquí va con **+2px**, como los otros siete componentes. Medido: `outline-offset: 2px` y el anillo se ve por fuera. Por eso la superficie NO recorta.
- **La capa de estado de la fila seleccionada se hereda del texto de la fila**, no es on-surface como publica M3. La diferencia no se ve: medido, en claro la capa es `#1D192B` contra los `#1D1B20` de M3, y en oscuro `#E8DEF8` contra `#E6E0E9`.
- **El texto se recorta, y no solo el de apoyo.** El titular y el overline son de una línea con puntos suspensivos. El motivo es el slot de detrás: con el texto repartido en dos líneas su tinta se derramaba encima del chevron. Medido: con una palabra que no se puede partir y una fila de 150px, la fila se desbordaba 9px y el chevron quedaba dibujado sobre las letras.
- **El offset óptico de la variante multiline es de 12px y tiene su propio rol** (`--md-sys-measurement-list-item-optical-offset`), desligado del hueco entre ranuras, que es horizontal. Con él, el icono y el chevron caen donde los pone el ítem de dos líneas: medido, 12px de desfase contra el titular y el centro al pixel. **Y los demás accesorios tienen su propio offset, cada uno con su centro**: el avatar y la acción, de 2px, para compartir centro con el icono —(44 − 40) / 2—; y el texto de detrás, de 4px (`--md-sys-measurement-list-item-trailing-text-offset`), para caer con el titular —(24 − 16) / 2—, porque es texto y el precio pertenece al nombre del plato. La miniatura de 56 **no se mueve**: es más grande que el bloque de cabecera, y bajarla la colgaría 6px por encima de la fila, fuera de la superficie.
- **El cosido de las esquinas llega a la fila aunque vaya envuelta en un `<li>`.** La regla vieja solo alcanzaba al hijo directo de la superficie, y las filas interactivas —`<li><button class="md-list-item">`— se quedaban con su radio de 4px: su capa de estado se salía de la esquina de 16px de la superficie. El selector tiene que ser de descendencia, `.md-list > :first-child .md-list-item`. **Ojo: `.md-list-item:first-child` NO vale**, porque casa con todas las filas envueltas y las deja rectas.
- **El divisor va dentro de la fila, y con 16px de sangría.** Un `<hr>` no puede ser hijo directo de un `<ul>`, así que lo ancla la lista al borde de bloque de abajo de la fila. La sangría la mete el propio divisor, con su variante `md-divider-middle-inset`: los 16dp que publica M3. Con icono delante la línea **no** sigue al texto —arranca bajo el icono, 32px a la izquierda— y es una desviación consciente: M3 estricto daría 48px y ese inset no existe en el catálogo.
- **La fila deshabilitada no tiene capa de estado en reposo.** M3 publica el state layer del disabled al 10%, pero la fila deshabilitada no tiene hover ni active, así que la capa solo se pintaba en reposo, como una banda gris sobre la superficie. Se apaga por el contenido, al 38%.
- **Las cuatro ranuras nuevas.** El avatar (40, `corner-full`, `title-medium` sobre `on-primary-container`) y la miniatura (56, `corner-small`) **sustituyen** la ranura del icono, no van dentro: la del icono mide 20. El texto de detrás (`label-small`, `on-surface-variant`) y la acción van en su propia ranura, con el hueco de 12px de la fila entre ellos, y no dentro de la ranura del icono como hace la web de M3 —que ahí usa un hueco de 8px que no está publicado en ningún token.
- **Las tres densidades son las de M3 —56, 72 y 88— y son MÍNIMOS, no alturas fijas.** La fila crece hacia abajo con lo que haya escrito, con el relleno vertical de 10px respetado. Y la variante `.md-list-item-multiline` no declara altura ninguna: es la de la ficha larga, la que crece sin techo.
- **GUÍA RÁPIDA DE MARCADO PARA ManGo! App.** Los platos: miniatura de 56, titular, descripción y precio detrás, **con la variante multiline** para que el precio caiga a la altura del nombre. Las comandas: lo mismo sin miniatura, con el dato detrás —el precio o la hora—, también en multiline. Los turnos: avatar de 40 con las iniciales. Y una regla que no es de estilo sino de HTML: **una fila con un control de acción no puede ser ella misma control** —un `<button>` dentro de un `<button>` es contenido interactivo anidado—, así que esas filas son `<li>` estáticas y el control es la acción.
- **El vídeo no entra.** M3 publica su medida —100x56, y 114x64 para la grande— y es un 16:9, no el cuadrado de la miniatura. Y el checkbox y el radio de la ranura tampoco, porque el catálogo no tiene esos componentes: la ranura de acción se documenta con el `md-icon-button` que sí hay.
- **`showroom/assets/list-thumb.svg` es el segundo asset de imagen del repo**, y es un bloque neutro como el de la card: la miniatura de la fila enseña el hueco donde iría la foto, no un plato inventado. Sus comentarios llevan rayas de puntos y no guiones, por el mismo motivo que el primero.

## Segmented button — publicada

Doce pares, en la estructura de dos bloques que fijó la List: la especificación técnica y anatomía —Clase base, Selección, Cambiar icono por check, El desliz del check, Multi-selección, De dos a cinco, Densidad, Estados y Playground de recetas— y los tres casos de uso de ManGo! App —la comanda del POS, el filtro del KDS y las dos vistas del catálogo—, ensamblados por dogfooding con card, divider, button e icon-button. `segmented-button.html` es copia byte-idéntica a su molde.

Los hechos que **no** se leen en el código:

- **El check es 18dp medido, no estimado.** Los tokens web y Android convergen en 18 (`with-icon-icon-size` literal en web, IconSize=18dp en Android), y el primitivo vive en `--md-ref-icon-size-segmented-button` (`1-reference-tokens/iconfont.css`), con su rol comp `--md-comp-segmented-button-icon-size`.
- **Tres ranuras nominadas, y el aire de 8dp es del margin de la leyenda.** Toda leyenda textual va envuelta en `<span class="md-segmented-button-item-label">` —el precedente `md-button-label`— y el `column-gap` ya no vive en el item: el aire lo custodia el margin del label (`--md-comp-segmented-button-between-space`). Un solo evento mueve dos elementos: el check abre width y opacity, el label abre margin-inline-start, con el mismo par `short4` + `effects-default` del canje.
- **El canon del check: reposo colapsado, marcado abierto.** En reposo el check está `width: 0; opacity: 0; overflow: hidden` y la leyenda queda centrada al píxel sobre el eje del segmento; al marcarse abre a los 18px y la pareja se re-centra. Los desliz visibles son +13px. El par 9, «El desliz del check», documenta exactamente esto en anatomía solo-texto y reproducible: clic, y la curva corre de 0 a 18.00px en ~175ms, el mismo par del canje.
- **Y el ancho del grupo es invariante en los estados —la manga del par.** Marcada o en reposo, la pastilla solo-texto mide lo mismo: su padding lleva reservada la mitad del avance del par (calc((icon-size + between-space) / 2) = 13, token `--md-comp-segmented-button-check-sleeve`), y la regla del selected con check devuelve el padding a los 12 nominados para que el par la ocupe exacta. Las tres caras del evento —check width, label margin, item padding— funden con el mismo par en una sola lista y la suma cuadro a cuadro queda constante: la conmutación re-centra el contenido dentro de la pastilla activa y no mueve a ninguna vecina ni al grupo. La familia con icono no lleva manga (su ranura de 18 pinta siempre). El precio, por diseño: en reposo la pastilla solo-texto respira 25dp por lado.
- **Los ganchos de anatomía son `:has()`, sin clases nuevas.** El ajuste del label con icono y con check se acota por `:has(> .md-icon)` y `:has(> .md-segmented-button-item-check)`, para que los segmentos de puro texto —que no llevan rastro del check en su marcado— no hereden margen que no les toca.
- **La fila de la portada come del List, y la frase del índice es la de M3 traducida** («El grupo de segmentos ayuda a las personas a seleccionar opciones, cambiar de vista y ordenar datos. Se suele ubicar después de un título de página o de grupo.»), byte a byte al encabezado de la vista, solo con el añadido del recuento de pares.
- **La fila `.md-row` nace aquí y vive en `4-utilities/row.css`.** Un solo `<div class="md-row">` reparte un título y una acción en horizontal —el caso de lista+acción de la card—, con exclusión del padding de specimen en `showroom.css`. La medida de densidad −2 = 32dp comparte primitiva con el peldaño `xsmall` del escalon de `container-height`.

## Las dos mitades de una vista del showroom

A partir del `list` (2026-10-21), cada vista del showroom se estructura en dos bloques, y el corte se marca con un divisor:

1. **Especificación técnica y anatomía** — el laboratorio normativo. Pares minimalistas que aíslan una sola cosa: la clase base, las densidades, las ranuras, la variante multilínea, el cosido de esquinas, el anclaje de los divisores y los estados interactivos. Enfoque: verificación estricta de REGLA 11 y consistencia tokenizada.
2. **Casos de uso de ManGo! App** — la aplicación en producción. Composiciones reales listas para el POS: platos de catálogo con miniatura, multilínea y precio en COP; comandas de mesa con acciones secundarias; turnos de personal con avatar.

**El bloque 1 es el que se mide y el que se copia; el 2 es el que se lee.** Y el bloque 2 **hereda la anatomía del 1 sin repetirla**: si una variación ya se enseñó arriba, aquí solo se combina. Por eso el par de Casos de uso enseña las tres anatomías de fila —enlace, `<li>` estática y botón— sin volver a explicar ninguna.

En el marcado, el corte es un `<hr class="md-divider">` —el mismo mecanismo con el que la vista de typography separa sus familias de tipos—, el título de cada bloque es un `<h2>` y los pares van en `<h3>` debajo: el h1 es el nombre del componente, y el esquema queda h1 > h2 (bloque) > h3 (par). La apariencia de los pares no cambia, porque el tipo lo pone la clase y no la etiqueta; y el aire entre pares lo sigue poniendo el gap de `.sr-section`.

## Siguiente tarea

**El catálogo está cerrado.** Los diez componentes del README §11 están hechos, publicados y enlazados, y las diecinueve vistas también. `segmented-button`, el último, se acaba de publicar: es el primero que nace con la estructura de dos bloques —laboratorio normativo + casos de ManGo! App— y a la vez trajo la utilidad `.md-row` a `4-utilities`.

Lo que queda por delante no es un componente nuevo sino la **deuda conocida** de más abajo, que es lo que de verdad está pendiente:

- **Los diez moldes desfasados** siguen desfasados, y ahora hay uno más que no lo está (`dialog.template.html`), así que conviene no usar los viejos como molde.
- **`scrollbar-gutter` decidido, y el arreglo que se venía dando no funciona.** El bloqueo de scroll del fondo funciona, pero al abrir el modal desaparece la barra y el contenido ensancha unos 15px. Está **medido**, y el arreglo que hasta ahora recomendaba `dialog.css` —`scrollbar-gutter: stable` en el `html`— **no quita el salto**: cinco variantes probadas, las cinco a 15px. El fallo es del elemento raíz, no de la propiedad: su `overflow` se propaga al viewport y ahí se descarta el hueco reservado, mientras que en un `div` normal el mismo arreglo sí conserva los 15px. La variante que sí lo quita —`stable` en el `html` más `overflow: hidden` en el `body`— mantiene el bloqueo del fondo y baja el salto a 0px, pero paga **15px fijos en todas las páginas**, también las que nunca scrollean y las que nunca abren un modal, así que no se ha aplicado. Y en macOS con barras overlay es todo un no-op: el salto solo existe en Windows, Linux y macOS con las barras siempre visibles.

**Lo que se descartó al cerrar Card, y por qué, para que no vuelva a proponerse:**

- **Padding**: los tres ficheros de token de M3 no dan **ni una** coincidencia de `padding`, `spacing` ni `margin`. El nuestro es un valor único, `--md-sys-measurement-card-padding` = 16px, que declaran las tres ranuras de texto; el medio va sin padding a propósito y la base pone `padding: 0` para neutralizar el `<button>`. Encima **el autor no puede cambiarlo**: no hay clase modificadora y `4-utilities` no publica utilidad de espaciado. Mostrar «el padding son 16px» no es un par. Lo único con contenido era el ritmo de 16px al quitar ranuras —la regla `:has()`, ya medida en `card.css`—.
- **Anatomía**: la cumple la receta **Slots completa**, que ya lleva las seis partes de M3 en su marcado.
- **Sizes** no aplica (M3 no publica tamaños de card) y **Shapes** tampoco (la forma es `corner-medium` fija, sin clase, igual que en el FAB, commit `f3a0da0`).

## Deuda conocida

Nada de esto se ha tocado. Está anotado para que no se dé por verdad:

- `showroom.css:223` mete `padding: 16px` en todo `div` directo de `.sr-specimen`. Un specimen escrito como `<div class="md-card">` lo ganaría en silencio y REGLA 11 no lo detectaría. La card usa `<article>` por eso.
- Tres vistas quedaron sobre el techo de prosa al recortarla: `button-group` (199 de media), `icon-button` (287 máx.) y `motion` (211 máx.).
- El split button existe en M3 (`-split-button-{xs…xl}` + 3 `menu-button`) y depende de un `menu` que no existe. Queda registrado en `button.css`, en el bloque «LO QUE NO ESTA, Y POR QUE». Sus medidas ya están en `container-height.css:40`. **La razón cambió:** estaba refutado por «no puede abrirse sin JavaScript», y con `src/js/` eso ya no lo bloquea. Sigue sin hacerse porque nadie ha escrito el `menu`, no porque sea imposible. El FAB menu está en el mismo caso.
- FAB y extended FAB tienen 1 de las 8 familias de color de M3. Decidido y escrito en `fab.css:448-451`.
- `4-utilities` no publica ninguna utilidad de espaciado, así que las ranuras de la card no pueden delegar su hueco al autor: lo declara el componente.
- **`dialog` ya no es una deuda de `main.css`.** La línea de la capa `comp` lo enunciaba como «button, card, dialog» cuando no existía, y el README §11 avisaba de ello —«esa línea es hoy más un recordatorio que una descripción: `card` ya existe y `dialog` no»—. Con la publicación esa línea describe lo que hay, así que la nota queda cerrada. **El recordatorio sigue sirviendo para los siguientes**: `3-components/index.css` avisa de los que vendrán.
- **12 de 18 moldes no son copia de su vista** respecto a la vista publicada: `button-group`, `button`, `color`, `divider`, `elevation`, `icon`, `icon-button`, `measurement`, `motion`, `shape`, `spacing` y `state` (a `icon-button.template.html` el trabajo posterior a su publicación lo dejó atrás). Llevan el bloque largo `COMO USAR ESTE TEMPLATE` donde la vista lleva el puntero de dos líneas, y se quedaron atrás en `5422fb2` (recorte de prosa), que tocó las vistas y no los moldes. Usar cualquiera de esos doce como molde arrastraría prosa ya recortada; los buenos son `fab`, `fab-extended`, `card`, `dialog`, `list` y `segmented-button`. `typography.html` y `spacing.html` no siguen la vía de molde: la primera no tiene propio y apunta a `component.template.html`.
- **`navigator.clipboard` solo existe en contexto seguro**, así que abierto por la IP de la red el botón «Copiar» no tenía copia ni alternativa y quedaba muerto en las quince vistas de entonces; ahora son diecinueve y todas tienen el respaldo. Corregido con un respaldo de `document.execCommand` y con texto honesto en los dos sentidos. Probado en las dos rutas: por `localhost` y por `http://10.226.28.43/`.
- **Las diecinueve vistas llevan `<meta name="description">`.** El README §5 decía que solo `card.html` lo cumplía y que las otras quince eran deuda conocida; al publicar `dialog.html` se comprobó una por una y las diecisiete lo tienen. La deuda estaba ya cerrada y no se había anotado. Con `list.html` son dieciocho; con `segmented-button.html`, diecinueve.
- **El Chrome del arnés no sirve para medir scroll ni rueda, y ya se ha perdido tiempo por ello.** La herramienta de rueda da resultados contradictorios —movió la página con un modal abierto y no la movió sin él— y **sus lecturas van un paso atrasadas**, así que hay que leer cuatro veces seguidas para que cuadre. No se fía de ella para nada que sea scroll. El bloqueo del fondo con modal está comprobado en el Chrome de Danny. Y en este entorno no hay barra de desplazamiento clásica (`innerWidth - clientWidth` da 0), así que **el salto de la barra al abrir un modal no se puede ver aquí**: es el único punto de `dialog` que queda sin comprobar, y la solución si molesta es `scrollbar-gutter: stable` en el `html`, que no se ha añadido porque cambia el layout de todas las vistas.

## El verificador en macOS

```
node tools/verify-tokens.mjs
```

**La implementación está en Node desde el 2026-10-18** (`tools/verify-tokens.mjs`), no en PowerShell. Corre igual en macOS, Windows y Linux sin instalar nada. `tools/verify-tokens.ps1` sigue ahí y sigue funcionando, pero son tres líneas que llaman al `.mjs` y devuelven su código de salida: una sola implementación, que es lo que evita que dos verificadores se separen en silencio.

El motivo del port no fue que el `.ps1` no corriera en macOS —**sí corría**, y está medido: da los mismos 43 hojas y 664 tokens que el `.mjs`—, sino depender de PowerShell para verificar un sistema de CSS en un equipo donde Node ya está. Lo que sí encontró el port es un bug de REGLA 11 que llevaba tiempo: su patrón exigía que `class` fuese el último atributo del `<div class="sr-specimen">`, así que los dos pares con `<div class="sr-specimen sr-specimen-gap" data-toggle-group>` —los únicos del sistema que necesitan un atributo funcional en el contenedor— no se comparaban con su snippet, y el tempered greedy se comía dos parejas de un tirón. Ahora el patrón acepta atributos después de `class`, y REGLA 11 acepta que el snippet envuelva el contenido en el `div` funcional, porque `sr-*` no se puede copiar (REGLA 13) y `data-toggle-group` sí.

Sigue en pie lo de PowerShell, por si se usa: `~/.local/powershell/pwsh -NoProfile -File ./tools/verify-tokens.ps1`. PowerShell 7.6.7 en `~/.local/powershell/`, sin sudo y sin instalador: se descomprimió del tarball oficial. No está en el PATH; si se quiere, se añade con un enlace o una línea en `~/.zshrc`. En macOS **no** va `-ExecutionPolicy Bypass`: es un concepto de Windows y ahí el bloqueo de scripts no existe.

El sustituto de bash que se usó mientras tanto ya no hace falta y no está en el repo.

## Fuentes de M3

No hay copia local. Se leen por GitHub, en `https://github.com/material-components`.

| Repositorio | Qué es | Para qué |
| --- | --- | --- |
| `material-web` | Material Design Web Components, activo | **valores de token y recetas**: `tokens/versions/latest/sass/_md-comp-*.scss` |
| `@material/web` en npm | el mismo material-web, empaquetado | **el SCSS del dialog**. Ya no está en el repo de GitHub, pero sí en el paquete |
| `material-components-android` | la implementación de referencia de M3 | **prosa**: `docs/components/<Nombre>.md`, uno por componente |
| `material-components-web` | MDC Web, la librería *anterior* a M3 | **nada**. El nombre parece autoritativo y no es M3 |
| `material-components-ios`, `-flutter`, `material-components` | mantenimiento o parados | nada |

Sin checkout:

```
https://api.github.com/repos/material-components/material-web/git/trees/main?recursive=1
https://raw.githubusercontent.com/material-components/material-web/main/<ruta>
https://raw.githubusercontent.com/material-components/material-components-android/master/<ruta>
https://unpkg.com/@material/web@<version>/<ruta>
```

La rama por defecto de Android es `master`, no `main`.

### El dialog solo se lee en npm

`material-web/components/dialog/` **devuelve 404** en GitHub, tanto en `master` como en `main`, y también `dialog/internal/_dialog.scss` y `dialog/dialog.ts`. Los tokens sí siguen ahí. El SCSS del dialog —que es de donde salen `position: fixed`, `margin: auto`, `min-height: 140px`, `max-height` y las dos clases de divisor— se lee del paquete:

```
https://unpkg.com/@material/web@2.0.0/dialog/internal/_dialog.scss
```

Es el mismo fichero, y es la razón de que el dialog sea el único componente cuya implementación se documentó sin tener el repo delante. La prosa sale de `material-components-android/master/docs/components/Dialog.md` (14 KB), que se sigue leyendo sin problema.

### Lo que NO se lee, para no perder tiempo

| Fuente | Resultado |
| --- | --- |
| `m3.material.io` por `webfetch` | **CUIDADO: sí se lee, pero no así.** Un `fetch` directo devuelve la shell de Angular —solo el título—, y el buscador sí devuelve el texto. La nota antigua decía «cero contenido, para no perder tiempo» y **estaba equivocada en la conclusión**: hay que abrirlo en un **navegador**, que ejecuta la app y renderiza las 14 KB del glosario |
| `api.github.com/search/code` | pide autenticación, vacío sin ella |
| `material-web/card/` | 404. El card está en `labs/card/` |
| `material-web/tokens/versions/latest/` | 404. Los ficheros van en `…/latest/sass/` |
| `material-web/components/dialog/` | 404, en `master` y en `main`. Va en npm: `unpkg.com/@material/web@2.0.0/` |
| `api.github.com/repos/…/contents/` | 404 en todo `material-web`. El árbol tampoco responde |
| `archive.org/wayback` para material-web y para m3.material.io | sin snapshots de esos ficheros |

### El glosario oficial, y lo que sí y lo que no tiene

**`https://m3.material.io/foundations/glossary`** define cada término en una frase. Renderizado en un navegador son **14.075 caracteres**. Es la fuente de las definiciones canónicas, y **corrige la idea de que M3 no tiene prosa oficial**: sí la tiene, y es la mejor del sistema.

**Y no cubre 17 cosas, sino menos.** Comprobado una a una:

| | entrada en el glosario |
| --- | --- |
| Button, Card, Dialog, Divider, FAB, Extended FAB | **sí**, con su frase |
| Icon button, Button group | **no**. Hay definiciones en sus páginas de componente y en el índice de componentes |
| Typography, Elevation | **no**. Están en `styles/`, y sí tienen frase propia |
| **Color, Shapes, Spacing, Icon, State, Motion** | **no hay definición de una frase**. Las páginas de `styles/` abren con listas de guía, no con una definición |
| **Measurement** | **no existe en M3**. Es un concepto nuestro de capa 2 |

Eso condiciona lo que se puede llamar «canónico» y lo que no. Ver la nota de las definiciones del índice.

Para prosa de M3 hay que pegarla a mano. No se afirma lo que diga la web sin haberlo leído.

### Cards en concreto

`material-web` **no** tiene documentación de cards: su `docs/components/` tiene button, checkbox, chip, dialog, divider, elevation y fab, y ningún `card.md`. La prosa de cards sale de `material-components-android/master/docs/components/Card.md`, 21 KB, con anatomía, propiedades, variantes, implementación y theming.

## Dónde vive el resto

| Qué | Dónde |
| --- | --- |
| Reglas del showroom, ciclo de publicación, orden de secciones, deuda de prosa | `.opencode/skills/rdm-component-showroom/SKILL.md` |
| Cómo correr el verificador en macOS | este archivo, abajo |
| Arquitectura de capas, nomenclatura, temas, iconos y fuentes | `README.md` |
| Las 13 reglas automáticas y cómo se ejecutan | `tools/verify-tokens.mjs` |
| Filosofía de las fichas del showroom | `docs/showroom-philosophy.md` |
