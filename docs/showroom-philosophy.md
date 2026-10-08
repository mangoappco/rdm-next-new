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
