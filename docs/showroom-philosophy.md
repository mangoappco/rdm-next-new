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
