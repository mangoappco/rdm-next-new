# Visión y Filosofía del Showroom: Modelo "Copy-Paste Components" (Recipes & Blueprints)

## 1. Misión Principal
El Showroom de "ManGo! App" es un **banco de trabajo vivo y acelerador de desarrollo** para la aplicación (PHP/MySQL nativo). Su objetivo es permitir que cualquier desarrollador construya vistas e interfaces completas ensamblando fragmentos HTML directamente al portapapeles: **copiar, pegar y componer**. Cero fricción, código directo para producción.

## 2. Principios de Construcción
1. **Dogfooding Estricto:** Toda la interfaz del Showroom (layout, tipografía, superficies, estados y navegación) se construye consumiendo exclusivamente las 4 capas de nuestro propio sistema CSS:
   - `1-reference-tokens` (Valores absolutos)
   - `2-system-tokens` (Roles semánticos)
   - `3-components` (Estructura base de componentes)
   - `4-utilities` (Ajustes atómicos de layout y espaciado)
2. **Distribución Copy-Paste:** Cada variante de componente, primitivo o patrón debe exponer su bloque de código fuente HTML canónico, limpio y accesible, listo para llevar a una vista `.php` o `.html`.
3. **Composición Modular (Slot-Based Composition):** Los componentes no son monolíticos. Exponen una arquitectura de ranuras (*slots*) que permite anidar primitivos de forma natural (por ejemplo: una `Card` contiene `Headline`, `Divider`, `Body` y `Button` sin colisiones).
4. **Respeto a las Reglas de Contención:** Todo snippet entregado debe cumplir por defecto la matemática del sistema (ej. regla de contención vertical: icono ≤ line-height del texto acompañante; sin inventar clases o estilos inline).

## 3. Estructura Obligatoria de Cada Ficha en el Showroom
Cada elemento o sección documentada dentro de `showroom/` debe contener únicamente:
- **Preview Visual:** El componente renderizado en vivo interactuando con los tokens reales del sistema.
- **Acción Rápida:** Botón interactivo "Copiar HTML" que almacene el marcado directamente en el portapapeles.
- **Snippet / Blueprint:** Código HTML visible o colapsable (`<pre><code>`) con la estructura exacta lista para producción, sin clases innecesarias ni estilos en línea.

## 4. Las Dos Mitades de Una Vista del Showroom
A partir de `list` (2026-10-21), cada vista del showroom se estructura en **dos bloques** formalizados, y el corte entre ellos se marca con un divisor:

1. **Bloque 1 · Especificación Técnica y Anatomía** — el *laboratorio normativo*. Pares atómicos que aíslan una sola cosa cada uno: la clase base, las densidades estándar, las ranuras (*slots*), la variante multilínea, el cosido de esquinas, el anclaje de los divisores y los estados interactivos (`:hover`, `:focus-visible`, `disabled`). Su enfoque es la **verificación estricta**: REGLA 11 en cada par —el snippet es idéntico a su espécimen—, las medidas comprobadas en el navegador y cada valor tirado de un token.
2. **Bloque 2 · Casos de Uso de ManGo! App** — la *aplicación en producción*. Composiciones contextuales de negocio que demuestran el dogfooding del sistema sobre material real: platos de catálogo con miniatura, multilínea y precio en COP; comandas de mesa con acciones secundarias; turnos de personal con avatar. Su enfoque es la **lectura**: el desarrollador mira cómo se usa lo que aprendió arriba.

**El bloque 2 no repite la anatomía del 1: la combina.** Si una variación ya se enseñó y se midió en el laboratorio, aquí solo se combina con otras para formar una pieza real. Y hay una regla que no es de estilo sino de HTML, y que el bloque 2 hace visible: una fila con un control de acción no puede ser ella misma control —un `<button>` dentro de un `<button>` es contenido interactivo anidado—, así que esas filas son `<li>` estáticas y el control es la acción.

En el marcado, el corte es un `<hr class="md-divider">` —el mismo mecanismo con el que `typography` separa sus familias de tipos—, el título de cada bloque es un `<h2>` y los pares van en `<h3>` debajo: el `h1` es el nombre del componente, y el esquema queda `h1 > h2 (bloque) > h3 (par)`. La apariencia de los pares no cambia, porque el tipo lo pone la clase y no la etiqueta.


## 5. Directrices Consolidadas: Construcción de Select (2026-10-27/28)

Durante la construcción del componente Select se consolidaron las siguientes directrices arquitectónicas, aplicables a todo el sistema:

### 5.1 Principio de Host Atómico
Los componentes de formulario (.md-text-field, .md-select, .md-button) **no deben poseer márgenes exteriores** (margin: 0) **ni paddings envolventes** (padding: 0) que deformen su caja o compliquen su reutilización en layouts externos. El ritmo y la separación vertical siempre los impone el contenedor padre mediante gap de layout (space-200 / 16dp) o clases auxiliares del showroom (.sr-specimen-gap). Un componente atómico debe ser puro: su box model solo contiene su contenido y su padding interno funcional.

### 5.2 Anclaje de Menús (Exposed Dropdowns)
En los selectores de formulario, el menú flotante (.md-menu) debe:
- Acompañar el **100% del ancho del campo** (width: 100%; min-width: 100%; max-width: 100%), sobrescribiendo los límites de 112dp/280dp del menú genérico.
- Posicionarse **estrictamente tras la cota de 56dp del ancla interactiva** (	op: calc(56dp + 4dp)), sobrevolando el supporting text y cualquier elemento contiguo.
- Usar z-index: 1 dentro de su stacking context (el host eleva a z-index: 1 cuando está abierto).

### 5.3 Preservación UTF-8
Todas las herramientas de transformación de templates (	ools/escape-*.mjs y scripts de sincronización) deben forzar I/O en 'utf8' estricto:
- s.readFileSync(path, 'utf8')
- s.writeFileSync(path, content, 'utf8')
- Nunca usar redirección de PowerShell (>, Out-File, Set-Content) sobre archivos con acentos, ya que re-codifican a Windows-1252.
- Para correcciones de encoding, usar operaciones a nivel de bytes (Buffer) en Node.js.

### 5.4 Supporting Text como Slot Anatómico
El Supporting Text (.md-*-supporting-text) es un slot estructural estándar del componente de formulario. Debe estar presente en todos los pares demostrativos (no solo en Error), con:
- margin-block-start: 4dp (space-50)
- padding-inline: 16dp (space-200)
- Color on-surface-variant en reposo, error en estado de error, opacidad 38% en disabled.
- Enlace mediante ria-describedby en el input.
## 6. Directrices Consolidadas: Top App Bar (2026-10-29)

### 6.1 El código fuente vence a la guideline

La primera versión del Top App Bar se construyó leyendo las guidelines visuales: una banda de iconos de 56dp que se comprimía junto con la barra, con un morph de los slots para que no saltaran al colapsar. La fuente viva de Compose (`androidx/androidx@androidx-main` → `AppBar.kt`, `TwoRowsTopAppBar` y `placeTopAppBar`) demostró que la premisa era falsa: la banda de iconos **es la propia barra compacta desde el estado expandido** (`height = collapsedHeight`, `scrolledOffset = 0f`) y los iconos se centran siempre en `(contentHeight − iconHeight) / 2` de esa banda fija.

Queda como criterio del sistema: **para geometría, movimiento y estados, la fuente contractual es el código de implementación de AndroidX**, no la lectura de alto nivel de las guidelines. La documentación visual sirve para el propósito del componente; el código, para sus números.

### 6.2 Arquitectura R2: banda fija y alturas hug content

La corrección autorizada (R2) preserva la anatomía de un solo título —REGLA 11 intacta— y adopta del canon lo estructural:

- **Banda de iconos fija de 64dp**; leading y trailing centrados en 32dp y estáticos. Sin morph de slots, sin compensaciones.
- **Alturas adaptativas** resueltas declarativamente con `:has(.md-top-app-bar-subtitle)`: Medium 112dp sin subtítulo / 136dp con subtítulo; Large 120dp / 152dp. Los recorridos del compress (48/72 y 56/88) viven como tokens.
- **Tipografía flexible Expressive**: HeadlineMedium + LabelLarge en Medium; DisplaySmall + TitleMedium en Large; LabelMedium en Small. El colapso interpola de forma continua hasta TitleLarge.
- **Un solo titular en el HTML**: el signature morph viaja del techo de la zona (top 64) al asiento compacto (x 64 / y 18) con un token único de desplazamiento (−46dp), el aire del stack se desvanece con el progreso y el swap estructural resetea transform y anclaje para aterrizar en el nativo.

Se descartó el crossfade de dos títulos del canon oficial (grande que se desvanece + pequeño que aparece) porque exige duplicar el marcado y rompe la regla de un solo bloque semántico de título/subtítulo.

### 6.3 Física de inercia friccional

El progreso del compress no se asigna directo desde el scroll: lo persigue con un decaimiento exponencial dependiente del tiempo real (`FRICCION_MS = 60`, asentamiento al 99.9% en ~415ms, el recorrido canon de medium4). El scroll sigue siendo el destino —detener a mitad congela la barra a mitad—, pero un gesto rápido ya no teletransporta la geometría: la barra se asienta con la curva de desaceleración Expressive. `compressionDelta()` se deriva en runtime por variante y presencia de subtítulo.

### 6.4 Protocolo de verificación de componentes con scroll

Un componente con compress no se certifica con capturas. Se mide con Playwright en el navegador real y se afirman, en cada punto del recorrido: la altura contra el mapeo lineal, la opacidad del subtítulo, el tamaño tipográfico interpolado, la posición del titular, la **inmutabilidad de los iconos** y el salto residual del swap estructural (≤1px por redondeo de glifos). Además: congelado a mitad, umbral de la clase colapsada, relleno tonal + sombra del estado scrolled, cero oscilación de clases y cero errores de página. Las configuraciones sin subtítulo se verifican clonando el espécimen y midiendo la altura en reposo.

El resultado del cierre: 0 fallos en Medium y Large, iconos en 32/32 con desvío 0.00px, swap del titular a 0.64px, y el verificador de tokens en el baseline `FALLOS: 2`.

## 7. Directrices Consolidadas: Snackbar (2026-11-03)

### 7.1 Geometría Canónica y Prevención de Inflación de Altura
El Snackbar de M3 establece alturas rigurosas de **48px** (1 línea) y **68px** (2 líneas).
Cuando un Snackbar incluye botones de acción (`.md-snackbar-action`) o de cierre (`.md-snackbar-close`), la altura del botón (36dp / `space-450`) no puede acumularse sobre el padding estándar de 14dp (`space-175`), ya que inflaría la caja a más de 64-68px.
- En reposo sin acciones: `padding-block: var(--md-sys-measurement-space-175)` (14px). Total: $20\text{px} + 14\text{px} + 14\text{px} = 48\text{px}$.
- En presencia de acciones: el contenedor reduce su relleno a `padding-block: var(--md-sys-measurement-space-50)` (4px). Total: $36\text{px} + 4\text{px} + 4\text{px} = 48\text{px}$.
- En multilínea (2 líneas): `padding-block: var(--md-sys-measurement-space-150)` (12px). Total: $40\text{px} + 12\text{px} + 12\text{px} = 68\text{px}$.

### 7.2 Ripple y Estados de Interacción en Superficie Inversa
La acción `.md-snackbar-action` es un *Text Button* sobre superficie oscura (`inverse-surface`).
- **Reposo:** `background-color: transparent` absoluto. Solo el texto flota en `var(--md-sys-color-inverse-primary)`. Cero residuo o pastilla visible.
- **Hover:** State layer sutil al 8% (`--md-sys-state-hover-state-layer-opacity`) en forma de cápsula (`border-radius: var(--md-sys-shape-corner-full)`).
- **Pressed (Ripple):** El motor universal `ripple.js` captura `.md-snackbar-action` y confina la onda al 12% con `overflow: hidden` y `border-radius: 9999px`.
- **Foco por teclado:** Anillo accesible con `outline: var(--md-sys-shape-stroke-thin) solid` y `outline-offset`.

### 7.3 Cinemática Asimétrica M3
El componente implementa transición asimétrica declarativa con tokens de sistema:
- **Entrada (Activo):** Desaceleración enfática `emphasized-decelerate` (300ms, `medium2`) con ascenso de 16px (`translateY(16px)` a 0).
- **Salida (Reposo):** Aceleración enfática `emphasized-accelerate` (150ms, `short3`) con desvanecimiento inmediato.
- **Ergonomía:** Auto-dismiss temporizado a 4.000ms que congela el cronómetro al pasar el puntero (`mouseover`) o enfocar por teclado (`focusin`).

## 8. Directrices Consolidadas: Navigation Bar (2026-11-04)

### 8.1 Geometría Canónica de 80dp y Active Indicator
La Navigation Bar de M3 establece una altura fija de **80dp** (`--md-sys-measurement-navigation-bar-height`, enlazada a `--md-ref-container-height-fab-medium`).
- **Active Indicator:** Cápsula integrada de **$64\times32\text{dp}$** en `corner-full` con fondo tonal `secondary-container` y glifo en `on-secondary-container`.
- **Transición Horizontal de Pastilla:** En reposo inactivo mide 32dp y se expande simétricamente a 64dp en 100ms (`short2` + `standard`).
- **Glifo:** 24dp en `font-variation-settings: 'FILL' 1` cuando está activo, y `FILL 0` en `on-surface-variant` cuando está inactivo.
- **Etiqueta:** Tipografía `label-medium` con gap vertical de 4dp respecto a la pastilla. En modo selected-only (`.md-navigation-bar-selected-label`), colapsa a `block-size: 0` y `opacity: 0` en destinos inactivos.

### 8.2 Doctrina de Flotantes y Contención en Showroom
Los modificadores de anclaje de componentes flotantes o acoplados (`.md-fab-anchored`, `.md-fab-over-nav`, `.md-navigation-bar-docked`):
- Se declaran nativamente con `position: fixed` para ser 100% autosuficientes (REGLA 13) y resistir el scroll real en cualquier página que consuma `main.css`.
- En el Showroom, las tarjetas de prueba (`.sr-specimen-tall`, `.sr-specimen-dock`) aplican `transform: translateZ(0);`, creando un nuevo *containing block* que confina estrictamente los elementos fijos a su marco local sin invadir el monitor ni solaparse con la documentación.

## 9. Directrices Consolidadas: Navigation Rail (2026-11-05)

### 9.1 Geometría Canónica M3 Expressive (96dp Colapsado / 280dp Expandido)
El Navigation Rail es el carril de navegación vertical primaria para pantallas medianas, tabletas y escritorio.
- **Modo Colapsado (96dp):** Ancho fijo de 96dp (`--md-sys-measurement-navigation-rail-width`), destinos en columna con altura mínima de 64dp (`--md-sys-measurement-navigation-rail-item-min-height`), gap entre destinos de 4dp y pastilla activa (`.md-navigation-rail-indicator`) de $56\times32\text{dp}$ (`corner-full`).
- **Modo Expandido (280dp):** Sustituto canónico no modal del Navigation Drawer (`m3_navigation_rail` en Expressive). El carril se expande a 280dp (`--md-sys-measurement-navigation-rail-expanded-width`) con rango de respiro 220dp-360dp (`HUG content`). Los destinos devienen pastillas completas corridas de 56dp de alto (`corner-full`) en filas continuas sin gap vertical (`expanded_item_spacing: 0dp`).
- **Neutralización del Indicador Colapsado en Modo Expandido:** La pastilla colapsada pasa a $24\times24\text{dp}$ transparente sin pseudo-elementos (`display: none` en `::before`) para alojar limpiamente el glifo sin halos ni dobles indicadores residuales.

### 9.2 Alineación Coaxial Canónica (Eje Central de 48dp y Keyline de 36dp)
El principio arquitectónico fundamental de M3 Expressive en navegación vertical es la **coaxialidad estricta**:
- **Eje Coaxial Común:** El centro de todos los iconos interactivos (glifo de menú, icono del FAB colapsado y glifos de los destinos) se sitúa invariablemente a **48dp** del borde izquierdo del carril.
- **Keyline del Glifo (24dp):** Ocupa la franja de 36dp a 60dp (con centro en 48dp).
- **Desglose Anatómico de Márgenes Coaxiales:**
  - *Ítems de destino expandidos:* Margen exterior de 20dp (`--md-sys-measurement-navigation-rail-expanded-item-margin-horizontal`) + padding interior de 16dp (`--md-sys-measurement-navigation-rail-expanded-leading-space`) = 36dp al borde del glifo (centro en $36 + 12 = 48\text{dp}$).
  - *Standard FAB colapsado (56×56dp):* Margen de 20dp + radio/centrado interior de 28dp = centro en 48dp.
  - *Botón de menú / alternancia (`.md-icon-button` small de 40×40dp):* Margen independiente de **28dp** (`--md-sys-measurement-navigation-rail-header-toggle-margin-start`) + centrado interior de 20dp = centro en 48dp.
- **Anclaje de Control Inmutable ($\Delta = 0.0\text{px}$):** Durante la transición cinemática de colapsado (96dp) a expandido (280dp), el control maestro de menú no experimenta ningún desplazamiento horizontal.

### 9.3 FAB Responsivo y Confinamiento de Ripple
- El FAB en cabecera muta morfológicamente mediante CSS puro: en rail colapsado se compacta a **Standard FAB de 56×56dp** (`corner-large` de 16dp) ocultando el nodo de texto; en rail expandido se transforma en **Extended FAB** con gap de 12px, superficie tonal `primary-container` y tipografía `label-large`.
- **Confinamiento de Onda:** Se prescribe `overflow: hidden;` riguroso en `.md-fab` para que la onda de choque (`ripple.js`) y las capas de estado no desborden las esquinas redondeadas de 16px.

### 9.4 Cinemática M3 y Continuidad Vertical
- **Spatial Transform:** La expansión y colapso horizontal se animan fluidamente en 300ms con la curva canónica de desaceleración enfática M3 (`--md-sys-motion-easing-emphasized`: `cubic-bezier(0.05, 0.7, 0.1, 1)`).
- **Continuidad Vertical:** El carril gobierna `block-size: 100%` y `min-block-size: 100dvh` para garantizar presencia continua en la retícula de pantalla, complementado con el modificador `.md-navigation-rail-docked` (`position: fixed; inset-block: 0; inset-inline-start: 0`).

## 10. Directrices Consolidadas: Blueprints de Desarrollo y Formateo Canónico (2026-11-06)

### 10.1 Snippets como Blueprints Legibles (Anti-Monolito Horizontal)
Los bloques de código expuestos en `<pre class="sr-code"><code>` y en los `.sr-specimen` renderizados dejan de colapsarse en una sola línea horizontal. Deben estructurarse como **blueprints listos para desarrollo**:
- Indentación jerárquica estricta de **2 espacios** por nivel de anidamiento.
- Saltos de línea claros en contenedores, hijos y controles adyacentes.

### 10.2 Documentación Semántica de Slots (`<!-- Slot: ... -->`)
En componentes complejos y multirranura (`Navigation Rail`, `Top App Bar`, `Card`, `List`, `Dialog`, `Text Field`, `Snackbar`, `Search`), cada ranura canónica debe estar formalmente identificada con comentarios HTML pedagógicos antes de su bloque:
- `<!-- Slot: Leading / Icono o navegación inicial -->`
- `<!-- Slot: Content / Titular, subtítulo y cuerpo -->`
- `<!-- Slot: Trailing / Acciones y comandos secundarios -->`
- (o ranuras equivalentes según la anatomía del componente: `Header`, `Media`, `Actions`, `Supporting text`).

### 10.3 Compatibilidad Matemática con la REGLA 11
Para permitir que los comentarios de slots vivan en los snippets copiables sin romper la correspondencia estructural con el DOM renderizado, `tools/verify-tokens.mjs` purga comentarios HTML (`<!--[\s\S]*?-->`) tras decodificar entidades (`&lt;!-- ... --&gt;`) y colapsa los espacios entre etiquetas (`>\s+<` → `><`). La paridad estructural se preserva al 100% manteniendo el baseline de verificación en verde.

## 11. Directrices Consolidadas: Menu (M3 Expressive Floating Surface & Submenus) (2026-11-11)

### 11.1 Confinamiento y Concentricidad Simétrica
Para eliminar cualquier tensión visual y evitar que las opciones colisionen contra las esquinas del menú:
- El contenedor `.md-menu` establece `padding: 8dp` perimetral simétrico en sus 4 flancos (`--md-sys-measurement-space-100`) y radio exterior de 16dp (`--md-sys-shape-corner-large`).
- Los ítems `.md-menu-item` se moldean con radio interior uniforme de **8dp** (`--md-sys-shape-corner-small`). Cumplen la ley de concentricidad natural: $R_{\text{interno}} = R_{\text{externo}} - \text{Padding}$ ($16\text{dp} - 8\text{dp} = 8\text{dp}$).
- El divisor interno `.md-divider` sangra de borde a borde mediante márgenes negativos (`margin-inline: -8dp`) y ancho extendido (`inline-size: calc(100% + 16dp)`), preservando la respiración perimetral sin interrumpir el padding.

### 11.2 Cascada Coaxial y Respiro de Sombras
- **Coaxialidad Vertical:** Todo submenú subordinado (`.md-menu-submenu > .md-menu`) se desplaza verticalmente con `inset-block-start: -8dp` (`calc(-1 * space-100)`), logrando una alineación coaxial pastilla-con-pastilla perfecta con el ítem disparador padre.
- **Despeje Horizontal de Sombra:** Se proyecta lateralmente con `inset-inline-start: calc(100% + 8dp)` (compensando el padding interior del padre) más `margin-inline-start: 4dp` (`space-50`) de aire exterior, impidiendo que la sombra flotante (`level2`) empaste sobre el texto o glifos del nivel anterior.
- **Desbordamiento Inteligente:** El menú padre declara `overflow: visible` ante la presencia de submenús mediante `:has(.md-menu-submenu)`.

### 11.3 Rastro Activo Persistente (Active Path / Breadcrumb Trail)
En menús multinivel en cascada:
- Mientras un submenú permanezca desplegado (`[aria-expanded="true"]`), su ítem disparador padre retiene de forma persistente su pastilla activa en color `secondary-container`, guiando visualmente al usuario sin importar que el puntero o el foco de teclado se hayan movido al nivel subordinado.
- El disparador anfitrión raíz retiene su capa de estado sutil (`opacity: 0.08`) para certificar el origen del flujo sin usurpar el rol de un botón de alternancia.

### 11.4 Viewport Edge Detection y Auto-Flipping Inteligente
Para prevenir que los menús se proyecten fuera de la pantalla en esquinas críticas (ej. barras superiores o últimas columnas de tablas):
- `src/js/menu.js` mide dinámicamente con `getBoundingClientRect()` contra los límites del viewport (guarda de 8px).
- Activa `data-align="end"` para invertir la proyección hacia la izquierda (`inset-inline-end: 0` en Nivel 1; `inset-inline-end: calc(100% + 8dp)` en submenús) y `data-valign="top"` para proyectar hacia arriba.
- El ciclo de teclado WAI-ARIA APG se adapta automáticamente: en menús invertidos a la izquierda, `ArrowLeft` despliega submenús y `ArrowRight` repliega hacia el nivel padre.

### 11.5 Polimorfismo Semántico y Confinamiento de Ripple
- El componente soporta indistintamente botones de comando (`<button>`) y enlaces de navegación (`<a href>`), compartiendo la clase `.md-menu-item`, `text-decoration: none` y `min-height: 48dp`.
- La activación con tecla `Space` en ítems `<a>` simula la pulsación nativa según WAI-ARIA APG.
- Se integra en `src/js/ripple.js` con recorte riguroso en `overflow: hidden;` para que la onda táctil no sobrepase las esquinas redondeadas concéntricas de 8dp.

## 12. Directrices Consolidadas: Scaffold y Layouts Canónicos M3 (2026-11-13)

### 12.1 Arquitectura Estructural de Pantalla y Contención de Scroll
- **Host `.md-scaffold`:** Gobierna el viewport completo con `block-size: 100dvh; overflow: hidden;` evitando scroll parasitario en el `body`.
- **Delegación de Scroll a `.md-scaffold-main`:** El desplazamiento vertical reside exclusivamente en `.md-scaffold-main` (`overflow-y: auto; overscroll-behavior: contain;`), permitiendo que el header (`.md-scaffold-header`) permanezca estrictamente fijo/sticky en `top: 0` y active el sombreado de scroll (`.md-top-app-bar-scrolled`) sin oscilaciones ni desplazamientos indeseados.

### 12.2 Aislamiento de Showroom y Filosofía Copy-Paste Puro
- Para confinar el `position: fixed` de `.md-scaffold-fab` y `.md-scaffold-snackbar` dentro de las tarjetas del showroom sin tocar el HTML copiable:
  - El marco `.sr-specimen-scaffold .md-scaffold` declara `transform: translateZ(0); contain: paint; block-size: 420px;`.
  - El marcado copiable expone la receta estructural canónica de producción pura, garantizando REGLA 11 estricta.

### 12.3 Blindaje Ergonómico M3 con `:has()`
- Las ranuras fijas flotantes (`.md-scaffold-fab` y `.md-scaffold-snackbar`) calculan automáticamente su elevación sobre la barra de navegación inferior (`.md-navigation-bar`, 80dp) mediante:
  ```css
  .md-scaffold:has(.md-navigation-bar) .md-scaffold-fab {
    inset-block-end: calc(var(--md-sys-measurement-navigation-bar-height) + var(--md-sys-measurement-space-200));
  }
  ```
- No requiere clases auxiliares ni intervención de JavaScript: el motor de CSS resuelve la coexistencia de componentes.

### 12.4 Rejilla Responsiva Fluida y Clamping Preventivo
- `.md-grid` responde a Container Queries (`@container scaffold`):
  - Compact (< 600px): 4 columnas, gutters de 16dp.
  - Medium (600px–839px): 8 columnas, gutters de 24dp.
  - Expanded (>= 840px): 12 columnas, gutters de 24dp.
- **Clamping de Columnas:** Las utilidades `.md-col-span-*` se clampean preventivamente por breakpoint para que solicitudes de span mayores a las columnas disponibles en la ventana computen `1 / -1`, evitando desbordamientos o pistas implícitas ficticias.

### 12.5 Layout Canónico: Supporting Panel (360dp)
- En pantallas anchas ($\ge 840\text{px}$), `.md-layout-supporting-panel` dispone un área principal de catálogo (`.md-layout-supporting-panel-main`) y un panel lateral de apoyo (`.md-layout-supporting-panel-aside`) acotado al ancho contractual de 360dp (`--md-sys-measurement-layout-supporting-panel-width`), con divisor vertical `outline-variant` y scroll independiente.
- En pantallas estrechas ($< 840\text{px}$), apila verticalmente ambos paneles al 100% de ancho con scroll unificado para optimizar la toma de órdenes en terminales POS móviles.



