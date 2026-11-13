# GEMINI.md — Directrices Maestras de RDM Next (ManGo! App)

Fuente única de verdad operativa y mandamientos innegociables para el agente Antigravity en este workspace.
Este documento consolida la arquitectura de `README.md`, los candados de `CONTEXT.md`, la filosofía de `docs/showroom-philosophy.md` y la gobernanza de `.opencode/skills/`.

---

## 1. Identidad y Misión del Proyecto

* **Proyecto:** RDM Next (`mango-next`), sistema de diseño para **ManGo! App** (entornos de punto de venta POS, cocina KDS y administración).
* **Naturaleza Técnica:** Sistema estático puro de **HTML semántico + CSS moderno estructurado en 5 capas**.
* **Cero Fricción:** Cero herramientas de build (Vite, Webpack, etc.), cero frameworks (React, Vue), cero preprocesadores (Sass/Less) y cero PHP en la librería CSS.
* **Orquestador Central:** `src/css/main.css` es cargado de forma idéntica tanto por el Showroom como por la app de producción. Lo que se diseña aquí es exactamente lo que corre en producción.
* **JavaScript Estrictamente Delimitado:** Solo se introduce JS cuando CSS es técnicamente impotente (ej. `dialog` modal, roving tabindex accesible en `navigation-rail`, `tabs` y `navigation-bar`, o `toggle`). Todo script reside en `src/js/` como módulo ES; **prohibido `<script>` inline dentro de archivos HTML**.

---

## 2. Jerarquía de 5 Capas y Precedencia en Cascada

Declaradas en `src/css/main.css` mediante `@layer reset, ref, sys, comp, utilities;`. La precedencia es absoluta:

```text
1-reference-tokens/  (--md-ref-*)   Valores absolutos y crudos (paleta, espaciados, radios, tiempos).
       │
       ▼
2-system-tokens/     (--md-sys-*)   Roles semánticos M3 (color, typescale, shape, motion, measurement).
       │
       ▼
3-components/        (--md-comp-*)  Recetas estructurales de cada componente.
       │
4-utilities/         (.md-*)        Clases atómicas utilitarias (consumen Capas 1 y 2).
       │
       ▼
@layer utilities: la última capa; la opinión final del autor en el markup prevalece sobre el componente.
```

### Reglas de Dependencia Unidireccional:
* `3-components/` **NUNCA** lee de `1-reference-tokens/` (violación de REGLA 2). Consume siempre Capa 2 (`--md-sys-*`).
* `2-system-tokens/` nunca referencia componentes ni utilidades.
* `1-reference-tokens/` es la base absoluta: no consume ningún token (`nothing`).
* `4-utilities/` **nunca crea tokens**: solo emite clases `.md-*` que consumen Capa 1 y Capa 2.

### Criterio Tokens Largos vs Clases Cortas:
* Los tokens usan el **nombre canónico completo de Google M3**: `--md-sys-typescale-title-small`, `--md-sys-color-primary`.
* Las clases de utilidad usan el **prefijo corto**: `.md-type-title-small`, `.md-bg-primary`, `.md-text-primary`, `.md-shape-large`.
* **Modificadores con UN solo guion:** `.md-state-layer-hover`, `.md-type-label-medium-prominent`. **PROHIBIDO el doble guion (`--`) de BEM**.

---

## 3. Las 13 Reglas de Verificación Automatizada

Todo cambio debe validarse ejecutando: `node tools/verify-tokens.mjs`.

| Regla | Mandato Innegociable |
| :--- | :--- |
| **REGLA 1** | Cero valores crudos (`px`, `rem`, `ms`, `#HEX`, `%`) fuera de `1-reference-tokens/`. En `@keyframes`, solo `0%`, `50%` y `100%` están exentos. |
| **REGLA 2** | Dirección de dependencias: `3-components/` jamás referencia primitivas de `1-reference-tokens/`. |
| **REGLA 3** | Todo token referenciado mediante `var()` debe existir declarado en el sistema. |
| **REGLA 4** | En temas, `theme.light.css` debe importarse estrictamente antes que `theme.dark.css`. |
| **REGLA 5** | Integridad de carpetas y declaración formal de `@layer reset, ref, sys, comp, utilities`. |
| **REGLA 6** | Prohibido el atributo `style="..."` inline y etiquetas `<style>` en cualquier documento HTML. |
| **REGLA 7** | Los bloques de tema claro y oscuro deben mantenerse perfectamente sincronizados. |
| **REGLA 8** | Las tablas de tokens del showroom deben renderizar sus valores reales y cumplir con el contraste WCAG. |
| **REGLA 9** | Los glifos tipográficos se invocan exclusivamente con la clase `.md-icon`, nunca con clases externas (`material-symbols-*`). |
| **REGLA 10** | Toda clase `.md-*` consumida en el showroom debe existir físicamente en `src/css/`. |
| **REGLA 11** | El snippet copiable debe ser idéntico al marcado del espécimen renderizado (normalizando espacios inter-etiqueta y descartando comentarios HTML). |
| **REGLA 12** | La vista de color documenta roles semánticos de sistema, nunca paletas tonales crudas. |
| **REGLA 13** | Los snippets deben ser 100% autónomos: renderizar y funcionar importando únicamente `main.css` y `main.js`. |

*Nota de baseline:* El verificador tiene un baseline histórico tolerado de **`FALLOS: 2`** en `src/css/3-components/select.css` (líneas 448 y 453). Ningún cambio debe elevar este número.

---

## 4. Candados Operacionales y Prohibiciones Verbales

1. **Sin `<script>` inline en HTML:** Cualquier comportamiento interactivo se programa en `src/js/<componente>.js` y se despacha con eventos desacoplados o delegación sobre atributos `data-*`.
2. **Sin morph de pulsado (`:active`):** El estado `:active` dura apenas ~80ms en un POS; únicamente pinta la capa de estado (state layer) al 12%. La inversión o metamorfosis geométrica de esquinas (`corner-full` ↔ `corner-half`) queda **restringida al estado persistente de selección** (`aria-pressed="true"` en toggles o colapso/expansión de rieles).
3. **Sin elevación transicionada:** No interpolar sombras pesadas ni transicionar `box-shadow` en movimiento continuo.
4. **Protección de `showroom/lab.html`:** Archivo reservado para experimentos del usuario. **NUNCA modificarlo** salvo instrucción explícita e inequívoca del usuario.
5. **Git Push:** El agente prepara los commits locales semánticos; el usuario ejecuta siempre el `git push`.

---

## 5. Filosofía del Showroom y Modelo "Copy-Paste Blueprints"

* **Misión:** Banco de trabajo vivo para que el desarrollador copie fragmentos HTML canónicos directamente al portapapeles y construya vistas completas sin fricción.
* **Dogfooding Estricto:** El showroom consume sus propios componentes reales de `src/css/3-components/`, nunca elementos simulados.
* **Las Dos Mitades de Cada Vista:**
  1. *Bloque 1 · Laboratorio Técnico y Anatomía:* Aísla clases base, variantes, ranuras, alineaciones y estados interactivos con REGLA 11 estricta.
  2. *Bloque 2 · Casos de Uso ManGo! App:* Composiciones reales de negocio (fichas de comandas, mesas de salón, arqueos de caja, listados con precios en COP).
* **Regla de Prosa de los Pares (Deuda de Texto):**
  * Cada par (`<section class="sr-section">`) lleva un párrafo bajo su `<h2>` que funciona como **caption visual**, no como manual histórico.
  * **Target:** 1 oración (~120 caracteres). **Techo:** Máximo 2 oraciones (~200 caracteres).
  * Explicar qué muestra el par y qué notar. El razonamiento técnico, cotas y trade-offs van en los comentarios del CSS.
* **Formateo de Blueprints:** Sangría estricta de **2 espacios** y comentarios identificadores de slots pedagógicos (`<!-- Slot: Leading -->`, `<!-- Slot: Content -->`, `<!-- Slot: Trailing -->`).

---

## 6. Metodología Vigente: Showroom de Dos Bloques y Flujo Par por Par

### PRECONDICIÓN ABSOLUTA:
El archivo `src/css/3-components/<componente>.css` **debe existir antes de documentar**. Si no existe: **DETENERSE**, informar al usuario y no inventar capacidades.

### Estructura Minimalista en Dos Bloques:
Las vistas del showroom NO llevan checklists teóricos ni secciones de relleno. La estructura actual es directa y compacta:
1. **Header del Showroom:** Título, descripción canónica corta de M3 (~120 caracteres) y metadatos.
2. **Bloque 1: Especificación Técnica y Anatomía:**
   - Evaluado mediante **Pares de Inspección normativos** (`.sr-specimen` + `pre.sr-code`).
   - Cada par demuestra una receta atómica de la API pública.
   - Paridad estricta e idéntica (carácter a carácter) bajo la REGLA 11.
3. **Bloque 2: Casos de Uso ManGo! App:**
   - Escenarios de producción reales para el software POS, cocina (KDS) o administración.
   - Integración real con otros componentes mediante dogfooding.

### Flujo Obligatorio Par por Par (Innegociable):
NUNCA se construyen todos los pares de un solo golpe. El desarrollo es estrictamente incremental:
```text
1. Proponer alcance del Par N (Anatomía, tokens, comportamiento)
2. Implementar Par N en CSS y en el template
3. Validar con `node tools/verify-tokens.mjs` y confirmar cero nuevos fallos
4. DETENERSE Y ESPERAR (STOP / WAIT) la revisión y confirmación del usuario
5. Recién tras la aprobación del usuario, avanzar al Par N+1
```

---

## 7. Directrices de Componentes Consolidados

* **Form Controls (Select / TextField):** *Principio de host atómico* — margen exterior `0` y padding envolvente `0`; el espaciado lo dicta el contenedor padre. Menús desplegables acompañan el 100% del ancho del campo y se posicionan tras la cota de 56dp (`top: calc(56dp + 4dp)`).
* **Top App Bar:** La banda de iconos es fija de 64dp (eje coaxial estático a 32dp). El código fuente de Compose AndroidX (`AppBar.kt`) prima sobre las guidelines. Inercia friccional en el progreso del compress (`FRICCION_MS = 60`).
* **Navigation Rail (M3 Expressive):** Ancho colapsado de 96dp; expandido continuo de 280dp (rango 220–360dp). **Eje coaxial inmutable a 48dp** desde el borde del riel (menú a 28dp, FAB a 20dp, destinos expandidos con margen 20dp + padding interno 16dp = 36dp de keyline al glifo). Indicador activo elástico continuo que transiciona sin saltos de $56\times32\text{dp} \to 240\times56\text{dp}$ en 450ms (`emphasized`). Metamorfosis conmutada en Frame 0 ($t = 0\text{ms}$) sin temporizadores de JS.
* **Navigation Bar:** Altura de 80dp; cápsula activa de $64\times32\text{dp}$ con glifo en `FILL 1`. Confinamiento con `transform: translateZ(0)` en showroom para aislar el `position: fixed`.
* **Snackbar:** Alturas canónicas de 48dp (1 línea) y 68dp (2 líneas). Compensación de padding de 14dp a 4dp cuando hay botones de acción de 36dp para evitar inflación de la caja. Cinemática asimétrica (300ms decelerate de entrada / 150ms accelerate de salida).
* **Menu (M3 Expressive / Cascada / Viewport Auto-Flip):** Superficie flotante `surface-container` con elevación `level2`, radio exterior de 16dp (`corner-large`) y padding perimetral simétrico de 8dp (`space-100`). Concentricidad geométrica $R_{\text{interno}} = R_{\text{externo}} - \text{Padding}$ ($16\text{dp} - 8\text{dp} = 8\text{dp}$) en pastillas `.md-menu-item` (48dp touch-target, padding horizontal 12dp). Divisor sangrado de borde a borde (`margin-inline: -8dp; inline-size: calc(100% + 16dp)`). Submenús en cascada recursivos (`.md-menu-submenu`): coaxial con desfase de -8dp (`calc(-1 * space-100)`) y despeje de 100% + 8dp + 4dp de respiro de sombra exterior. Rastro activo persistente (*Breadcrumb Trail*): disparadores anfitriones y padres retienen `secondary-container` o `state-layer` (0.08) mientras la jerarquía subordinada esté abierta. Viewport Edge Detection inteligente en CSS y JS (`data-align="end"` y `data-valign="top"`) con inversión adaptativa de flechas en teclado WAI-ARIA APG. Polimorfismo semántico pleno para `<button>` y `<a href>` con onda táctil universal de ripple confinado (`src/js/ripple.js`).
* **Scaffold & Layout Canónico M3 (`.md-scaffold`):** Ensamblador estructural de pantalla gobernado por Container Queries (`@container scaffold`). Ranuras dedicadas para Header (`position: sticky`), Body, Main (scroll independiente con contención `overscroll-behavior: contain`), Nav y slots fijos (`.md-scaffold-fab`, `.md-scaffold-snackbar`) con elevación contextual automática sobre `.md-navigation-bar` vía `:has()`. Rejilla responsiva fluida `.md-grid` (4 cols en Compact con gutters de 16dp, 8 cols en Medium y 12 cols en Expanded con gutters de 24dp) y layout canónico `Supporting Panel` (`.md-layout-supporting-panel`) con área principal fluida y panel de apoyo lateral de 360dp (`--md-sys-measurement-layout-supporting-panel-width`) en escritorio, apilado continuo en móvil.

---

## 8. Idioma, Codificación y Fuentes de Verdad

* **Idioma y Acentos:** Toda la documentación, comentarios de CSS y prosa del showroom se redacta en **español con acentos y tildes ortográficas correctas**.
* **Codificación:** UTF-8 estricto sin BOM, terminaciones de línea LF (`\n`), un único salto de línea final. **Cero scripts no latinos** (sin CJK, cirílico ni Hangul).
* **Fuentes de Verdad M3:** Los valores contractuales se extraen directamente de GitHub:
  * Tokens SCSS: `material-components/material-web` (`tokens/versions/latest/sass/`).
  * Implementación y anatomía: `androidx/androidx` (`androidx-main`) y `material-components-android`.
  * No asumir especificaciones de memoria ni basarse en scraping HTML de Angular (`m3.material.io`).
