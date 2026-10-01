---
name: mango-component-showroom
description: Create and maintain the RDM Next component showroom. Use this skill whenever creating, modifying, documenting, or reviewing a component showroom view. The showroom documents the real RDM Next component implementation from css/3-comp/ using dogfooding. Before implementing any new component showroom view, the agent MUST confirm the component exists, inspect its real implementation, propose the applicable documentation sections, ask the user to confirm each section, and wait for confirmation before writing or modifying the showroom view.
---

# RDM Next Component Showroom

## Purpose

This skill defines the mandatory workflow for creating and maintaining the component showroom of the RDM Next design system, built for the ManGo! App.

RDM Next is conceptually based on Material Design 3 (M3), but it has its own implementation, token architecture, naming conventions, and architectural decisions. It is a static HTML + CSS system: no build step, no framework, no JavaScript, no PHP.

The showroom is both:

- visual documentation,
- technical documentation,
- and a real demonstration of the component library.

The showroom must therefore always document the **actual RDM Next implementation**, not an assumed or copied Material Design 3 implementation.

---

# PRECONDITION — THE COMPONENT MUST ALREADY EXIST

Read this before anything else in the skill.

Before inspecting a component, verify it exists:

```text
css/3-comp/<component>.css
```

| Situation | What to do |
| --------- | ---------- |
| File exists | Proceed with STEP 1 |
| File does not exist | **STOP. Do not inspect. Do not propose sections. Do not implement.** |

If the component does not exist yet, there is nothing to document. Proposing a
showroom structure for it would mean inventing capabilities, which is exactly what
this skill forbids.

In that case, say so and stop:

```text
css/3-comp/divider.css no existe todavia.
No hay nada que inspeccionar, y un showroom de un componente que aun no se
construyo seria inventarlo.

Construimos el componente primero?
```

**This precondition exists because RDM Next builds its own components.** `css/3-comp/`
is authored here, from the tokens in `1-ref/` and `2-sys/`. It does not import them from
another library. So the component is the source, and the showroom documents it, never
the other way around.

---

# CRITICAL RULE

## NEVER IMPLEMENT A NEW COMPONENT SHOWROOM VIEW WITHOUT USER CONFIRMATION

This is the most important rule in this skill.

When the user asks to create a showroom view for a component, DO NOT immediately create files or write the view.

The mandatory workflow is:

```text
0. Confirm css/3-comp/<component>.css exists
        ↓
1. Inspect the real component
        ↓
2. Analyze its actual capabilities
        ↓
3. Determine which showroom sections appear applicable
        ↓
4. Ask the user about EVERY showroom section
        ↓
5. Wait for the user's confirmation
        ↓
6. Present the final confirmed structure
        ↓
7. Only then implement the showroom view
        ↓
8. Verify the result
```

Never skip step 4.

Never assume that a section applies merely because it exists in Material Design 3.

Never implement first and ask questions afterward.

If the user has not confirmed the sections, implementation must not begin.

---

# STEP 1 — INSPECT THE REAL COMPONENT

Before asking the user about sections, inspect the actual implementation of
`css/3-comp/<component>.css`, and its `@import` line in `css/main.css`.

Determine, when applicable:

- class names it exposes,
- variants,
- behavioral variations,
- colors,
- shapes,
- sizes,
- padding,
- states,
- icons,
- content,
- interactions,
- behavior,
- anatomy,
- accessibility,
- responsive behavior,
- content states,
- composition,
- dimensions,
- tokens it consumes.

**How to read a component in this project.** RDM Next components are plain CSS classes.
There is no JavaScript and no web component, so the "API" is:

| Concept | What it means here |
| ------- | ------------------ |
| Public API | the class names the file declares |
| Props | values the HTML author passes as additional classes from `2-sys/` |
| Attributes | HTML attributes the selectors respond to (`disabled`, `aria-*`, `data-*`) |
| Slots | which child elements the selector structure expects |
| Behavior | what the CSS does on `:hover`, `:focus-visible`, `:active`, `[disabled]` |

Read the whole file, including its header comment: the reason a value exists is usually
documented there, and that reason belongs in the showroom's documentation.

Do not invent capabilities.

If the implementation does not expose a feature, do not document it as if it exists.

If something is unclear, ask the user.

---

# STEP 2 — SHOWROOM SECTION CHECKLIST

Every new component must be evaluated against this complete checklist.

## Core sections

1. Header
2. Uso
3. Ejemplo básico

## Visual and API variations

4. Variantes / Types
5. Variaciones de comportamiento
6. Color
7. Shapes
8. Sizes
9. Padding
10. States

## Content and interaction

11. Iconografía
12. Contenido / Slots
13. Interacción
14. Comportamiento

## Documentation

15. Anatomía
16. Accesibilidad
17. Responsive
18. Content States
19. Composición
20. Do / Don't

## Technical information

21. Medidas
22. Tokens

These 22 sections are the standard checklist.

They are NOT mandatory sections for every component.

Each component must determine its own applicable sections.

**There is deliberately no shortcut for "simple" components.** No reduced set, no preset
like "a divider only needs 7 sections". Every component goes through all 22, and the
assistant proposes an assessment for each one.

The reason is that the value of this skill is precisely that nothing is assumed. A shortcut
would reintroduce exactly the guessing the skill exists to prevent: a component that looks
simple often has one surprising capability that a preset would silently drop.

---

# STEP 3 — ASK THE USER

After inspecting the component, present a concise checklist to the user.

For every section explicitly show:

- applicable according to the implementation,
- not apparently applicable,
- or requires user decision.

Example, for a hypothetical `card`:

```text
Voy a crear el showroom de Card.

Después de revisar css/3-comp/card.css, estas son las secciones:

01. Header — Sí
02. Uso — Sí
03. Ejemplo básico — Sí
04. Variantes / Types — Sí (elevated, filled, outlined)
05. Variaciones de comportamiento — Sí (default, selected)
06. Color — Sí
07. Shapes — Sí
08. Sizes — No parece aplicar
09. Padding — Sí
10. States — Sí
11. Iconografía — Sí, opcional
12. Contenido / Slots — Sí (label requerido, icono opcional)
13. Interacción — Sí (:hover, :focus-visible)
14. Comportamiento — Sí (transición de estado)
15. Anatomía — Sí
16. Accesibilidad — Sí
17. Responsive — No parece aplicar
18. Content States — No parece aplicar
19. Composición — Sí
20. Do / Don't — Sí
21. Medidas — Sí
22. Tokens — Sí

Confírmame cuáles quieres incluir antes de que implemente la vista.
```

The user must be given the opportunity to confirm each section.

If the user changes the applicability of a section, follow the user's decision unless it contradicts the actual implementation.

---

# IMPORTANT: WAIT

After asking the checklist:

STOP.

Do not:

- create files,
- modify files,
- create components,
- modify components,
- create CSS,
- create JavaScript,
- change tokens,
- restructure the project,
- or implement the showroom.

Wait for the user's answer.

---

# STEP 4 — FINAL STRUCTURE

After the user confirms the sections, show the final structure before implementation.

Example:

```text
Card showroom

✓ Header
✓ Uso
✓ Ejemplo básico
✓ Variantes / Types
✓ Variaciones de comportamiento
✓ Color
✓ Shapes
✗ Sizes
✓ Padding
✓ States
✓ Iconografía
✓ Contenido / Slots
✓ Interacción
✓ Comportamiento
✓ Anatomía
✓ Accesibilidad
✗ Responsive
✗ Content States
✓ Composición
✓ Do / Don't
✓ Medidas
✓ Tokens
```

Only after this confirmation may implementation begin.

---

# DOGFOODING

## Mandatory

The showroom must use the actual RDM Next components from `css/3-comp/`.

If documenting:

```text
Divider
```

the showroom must render:

```text
an element carrying the real class from css/3-comp/divider.css
```

It must NOT render:

```text
a bare <hr> or a styled <div> that merely looks like a Divider
```

Likewise:

```text
Button → the real md-button
Card → the real md-card
Dialog → the real md-dialog
```

The showroom is a consumer of the component library.

It is not a second implementation of the component.

## What "the public API" means here

There is no web component, so the public API is the class name plus whatever utility
classes the author composes on top:

```html
<!-- Dogfooding: el componente, más las clases de 2-sys que elige el autor -->
<hr class="md-divider md-bg-outline-variant">
```

The first class is the component. The rest are decisions from `2-sys/`, and they are
legitimate: that composition is exactly what the system is for.

The line that must not be crossed is writing component CSS inside the showroom.

---

# NEVER DUPLICATE COMPONENT LOGIC

Do not reproduce component implementation inside the showroom.

Do not copy:

- component CSS,
- component markup structure,
- component tokens,
- component state logic,
- component styling,
- component dimensions.

Link to the component's own file and consume its class.

If the component does not support something the showroom needs to demonstrate, report the
limitation before modifying the component.

Do not silently modify the component just to make the showroom easier to build.

---

# MATERIAL DESIGN 3

Material Design 3 is a reference, not an automatic implementation specification.

Use M3 to understand:

- terminology,
- design principles,
- expected anatomy,
- interaction patterns,
- accessibility concepts,
- common states,
- visual concepts,
- and the values behind the tokens.

However:

## The RDM Next implementation always wins.

If M3 supports something that RDM Next does not currently implement:

Do not pretend that RDM Next supports it.

Instead explain:

```text
Material Design 3 supports X,
but the current RDM Next implementation does not expose X.
```

Then ask the user how they want to proceed.

## How to read M3 here

The local copy of Material Web is available for reference:

```text
C:\xampp\htdocs\proyectos\material-web-main
```

Useful facts already verified, so they do not need re-checking:

| Fact | Detail |
| ---- | ------ |
| M3 publishes **no** utility classes except typography | 8 `.md-typescale-*`; zero `.md-bg-*` / `.md-text-*` / `.md-border-*` |
| RDM Next's own utilities are a project decision | 166 of them, documented in the README |
| Token values match M3 | palette 91/91 identical, typescale 92/92 identical |
| 12 color roles are not adopted | the `*-fixed` family; documented in README section 4 |
| The divider is 2 roles upstream | `color = outline-variant`, `thickness = 1px` |

For token values, prefer the local copy over memory. For anything about utility classes,
remember that M3 has none: our approach is ours.

---

# SECTION DEFINITIONS

## 1. Header

Contains:

- component name,
- short description.

Example:

```text
Button

Los botones permiten a los usuarios ejecutar acciones o completar tareas.
```

Keep the description concise.

---

## 2. Uso

Explain:

- purpose,
- when to use,
- typical contexts,
- role in the interface.

Adapt the explanation to RDM Next.

Do not blindly copy M3 documentation.

---

## 3. Ejemplo básico

Render the component using its simplest/default configuration.

This must be real dogfooding.

---

## 4. Variantes / Types

Documents structural or visual types of the component.

For example, a Button might have:

```text
Filled
Tonal
Outlined
Elevated
Text
```

Do not confuse these with color.

---

## 5. Variaciones de comportamiento

Documents different behavioral configurations.

Examples:

```text
Default
Toggle
Selected
Unselected
```

Only document actual supported behavior.

---

## 6. Color

Documents actual supported color schemes.

Examples could include:

```text
Primary
Secondary
Tertiary
Error
Surface
```

Only show colors actually supported by RDM Next.

Use real Design System tokens.

---

## 7. Shapes

Documents supported shapes.

Examples:

```text
Round
Square
```

Only show real supported shapes.

---

## 8. Sizes

Documents supported sizes.

Examples:

```text
Extra Small
Small
Medium
Large
Extra Large
```

Use actual implementation values.

---

## 9. Padding

Documents supported internal spacing configurations.

Use real implementation values.

Do not invent values simply because M3 defines them.

---

## 10. States

Documents visual/interactive states.

Examples:

```text
Enabled
Hovered
Focused
Pressed
Disabled
Selected
Checked
Loading
Error
```

Only include states actually applicable to the component.

Do not confuse state with variant.

---

## 11. Iconografía

Documents icon support.

Potential examples:

```text
Leading icon
Trailing icon
Icon only
Optional icon
Required icon
```

If unsupported, explicitly state:

```text
Este componente no utiliza iconografía.
```

---

## 12. Contenido / Slots

Documents what content the component accepts.

RDM Next has no shadow DOM and no `<slot>`, so "slot" means: **which child elements the
selector structure expects, and which are optional.**

Read the selectors. If the component styles `> span` or uses `::before`, then a child
element is part of its public markup, and that is what the showroom must show.

Example:

```text
Label — required, text node
Leading icon — optional, element with .md-icon
Trailing icon — optional, element with .md-icon
```

State which of the two kinds it is:

- **structural**: the component will look broken without it, so the showroom must always render it;
- **optional**: the component works without it, so the showroom shows both cases.

This describes the component's content model, not its styling.

---

## 13. Interacción

Documents how users interact with the component.

RDM Next has no JavaScript, so interaction is implemented with **CSS pseudo-classes and
attributes**. That is real interaction, not an absent feature.

Document what the CSS actually responds to:

```text
:hover            pointer hover
:focus-visible    keyboard focus (NOT :focus, which also fires on mouse click)
:active           press, while held
[disabled]        not interactive
[aria-*]          announced state
```

Two things that are easy to get wrong here, and that the showroom must not fabricate:

- **`:focus` is not the same as `:focus-visible`.** `:focus` fires on mouse click too. If
  the component styles `:focus`, say so, and note the difference.
- **Keyboard activation.** A component styled for `:hover` may still need an explicit
  `:focus-visible` rule to be usable by keyboard. If it does not have one, that is a real
  gap worth reporting to the user, not something to paper over in the showroom.

Do not confuse this with visual states: "how the user gets there" is Interacción;
"how it looks when they get there" is States.

---

## 14. Comportamiento

Documents what the component does in response to interaction or conditions.

With no JavaScript, behavior is whatever the CSS does when state changes: transitions,
opacity, transforms, visibility, pointer-events.

Example:

```text
Al hacer hover:
  La capa de estado aparece con una transición de opacidad
  de duration-short2 con la curva standard.

Al estar disabled:
  pointer-events: none, y el contenido baja a opacity 0.38.

Al recibir foco de teclado:
  El anillo de foco aparece, courtesy de :focus-visible.
```

Describe transitions with their real token values, not with "fast" or "smooth".

---

## 15. Anatomía

Documents the visual parts of the component.

Example:

```text
Button
├── Container
├── Label text
└── Icon
```

The anatomy must match the actual implementation.

---

## 16. Accesibilidad

Document applicable accessibility information.

Examples:

- semantic role,
- accessible name,
- keyboard interaction,
- focus behavior,
- screen reader behavior,
- required labels,
- accessible states.

Never invent accessibility behavior.

---

## 17. Responsive

Only document when the component has meaningful responsive behavior.

Possible examples:

```text
Desktop
Tablet
Mobile
```

If there is no component-specific responsive behavior, state that explicitly.

---

## 18. Content States

Documents content-related states.

Examples:

```text
Loading
Empty
Error
Success
```

This is different from interaction states.

---

## 19. Composición

Shows how the component works with other real RDM Next components.

Examples:

```text
Button + Card
Button + Dialog
Button + Icon
```

All examples must use real components.

---

## 20. Do / Don't

Show useful correct and incorrect usage.

Examples:

```text
DO
✓ Use a clear action label.

DON'T
✕ Use excessively long labels.
```

Do not invent arbitrary rules.

---

## 21. Medidas

Documents important dimensions.

Examples:

```text
Height
Horizontal padding
Icon size
Gap
Minimum width
```

Use actual implementation values.

---

## 22. Tokens

Documents Design System tokens used by the component.

Potential categories:

```text
Color
Typography
Shape
Spacing
Elevation
State
```

Use actual RDM Next token names.

Never invent token names.

---

# NON-APPLICABLE SECTIONS

If a confirmed section does not apply, the showroom should communicate this explicitly.

Examples:

```text
Este componente no tiene estados.
```

```text
Este componente no tiene variaciones de shape.
```

```text
Este componente no utiliza iconografía.
```

```text
Este componente no tiene comportamiento responsive específico.
```

```text
Este componente no tiene estados de contenido.
```

Do not invent examples merely to populate a section.

---

# TERMINOLOGY

Maintain these distinctions:

### Variantes / Types

Structural or visual component types.

Example:

```text
Filled
Tonal
Outlined
Elevated
Text
```

### Variaciones de comportamiento

Behavioral configurations.

Example:

```text
Default
Toggle
Selected
```

### Color

Color schemes.

### Shape

Geometric form.

### Size

Dimensions.

### Padding

Internal spacing.

### States

Visual/interaction states.

### Anatomy

Visual component parts.

### Content / Slots

Allowed content.

### Interaction

How the user interacts.

### Behavior

What happens as a result.

### Tokens

Design System variables.

Do not merge these concepts without justification.

---

# SHOWROOM STRUCTURE

The final page should generally follow:

```text
Component
│
├── Header
│
├── Uso
│
├── Ejemplo básico
│
├── Variantes / Types
│
├── Variaciones de comportamiento
│
├── Color
│
├── Shapes
│
├── Sizes
│
├── Padding
│
├── States
│
├── Iconografía
│
├── Contenido / Slots
│
├── Interacción
│
├── Comportamiento
│
├── Anatomía
│
├── Accesibilidad
│
├── Responsive
│
├── Content States
│
├── Composición
│
├── Do / Don't
│
├── Medidas
│
└── Tokens
```

Only render the sections confirmed by the user.

For confirmed sections that do not apply, use the explicit "does not have..." message where appropriate.

---

# PROJECT ARCHITECTURE

RDM Next is a static HTML + CSS system. There is no build step, no framework, no
JavaScript, and no PHP. Everything below is a hard constraint of this project, not a
preference.

## View architecture

The showroom is split across files. `index.html` is the **only** entry point and
contains **no** component sections.

```text
index.html          portada: titulo, tagline, enlaces a las vistas
<componente>.html   una vista por componente en 3-comp/
```

Rules:

- `index.html` never contains component sections. Only the title, the tagline,
  and links to the component views.
- Each component view is a standalone HTML file named after the component:
  `divider.html`, `button.html`, `card.html`.
- Every view loads the full system (`css/main.css`) and the font, exactly like
  `index.html`.
- Every view declares its base styles **on its `<body>`**, with `2-sys/` classes.
  The base is **never** in `reset.css`, and **never** on an inner container
  `<div>`.

```html
<body class="md-bg-background md-text-on-background md-type-body-medium">
  <!-- contenido de la vista -->
</body>
```

- The background role is `background`, not `surface`. In M3, `background` is the
  page canvas and `surface` is a concrete surface (card, menu, dialog) drawn on
  top of it. The text on the canvas is read with `on-background`; `surface` +
  `on-surface` belong to those concrete surfaces.
- The pair background + text is written **explicitly** on purpose:
  `2-sys/colors.css` ships no shortcut that pairs a background with its text,
  so the contrast is auditable in the markup.
- Supporting text uses `md-text-on-surface-variant`. M3 has no
  `on-background-variant`; `on-surface-variant` is the lower-emphasis role.
- Never wrap the view in an extra `<div>` just to carry these classes: the
  `<body>` is the element that paints the window, and `reset` gives it
  `min-height: 100vh`. An inner `<div>` leaves the bottom band unpainted on a
  short document.

- The back link in a component view points to `index.html` and reads `RDM Next`.
- The `<title>` of a component view is `<Component> — ManGo! App`. The title of
  the portada is `ManGo! App — RDM Next`.

When a new component is built, its view is added to `index.html` as a link, and
the view file is created. The portada never grows beyond title + tagline + links.

## The 5 cascade layers

Declared in `css/main.css`, in this order. The order **is** the precedence table.

```css
@layer reset, ref, sys, comp, utilities;
```

| Layer | Contains | Reads from |
| ----- | -------- | ---------- |
| `reset` | anula al navegador, tipografia y colores base | `--md-ref-*`, `--md-sys-color-*` |
| `1-ref/` | valores crudos: paleta, spacing, radios, tiempos | **nothing** |
| `2-sys/` | roles semanticos: color, typescale, shape, motion, state, elevation, measurement | `--md-ref-*` |
| `3-comp/` | componentes | `--md-sys-*` |
| `utilities` | atajos de alto nivel | reserved, currently empty |

## The 7 rules, enforced by `tools/verify-tokens.ps1`

Run it before committing, always:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\verify-tokens.ps1
```

| Rule | Enforces |
| ---- | -------- |
| REGLA 1 | No raw values (`#HEX`, `px`, `ms`, `rem`) outside `1-ref/` |
| REGLA 2 | Direction of dependencies: `3-comp` never reads `1-ref` |
| REGLA 3 | Every referenced token exists |
| REGLA 4 | `theme.light.css` imported before `theme.dark.css` |
| REGLA 5 | Folder structure and `@layer` declaration are intact |
| REGLA 6 | No inline `style=` and no `<style>` block in any HTML |
| REGLA 7 | The two blocks of each theme file stay synchronized |

## What a showroom may and may not do

**May:**

- consume classes from `1-ref`, `2-sys` and `3-comp`,
- add new HTML markup,
- document token names and real measurements,
- add `css/3-comp/<component>.css` when the user confirms the sections.

**May not:**

- write raw values outside `1-ref/` (REGLA 1),
- read `--md-ref-*` from `3-comp/` (REGLA 2),
- invent a token name,
- add an inline `style=` attribute or a `<style>` block to any HTML (REGLA 6).

If demonstrating a component requires a token that does not exist, **report the gap to the
user** before creating it. A showroom that needs a token the system does not have has
found a real hole in the design system. That is the point of the showroom.

## Naming conventions

| Thing | Convention | Example |
| ----- | ---------- | ------- |
| Token, ref layer | `--md-ref-<family>-<name>` | `--md-ref-spacing-400` |
| Token, sys layer | `--md-sys-<family>-<name>` | `--md-sys-color-primary` |
| Token, comp layer | `--md-comp-<name>` | `--md-comp-divider-thickness` |
| Utility class | property first: `md-<property>-<role>` | `md-bg-primary` |
| Typography class | `md-type-<role>` | `md-type-body-medium` |
| Component class | `md-<component>` | `md-divider` |
| Modifier | ONE hyphen | `md-state-layer-hover` |

Two conventions that are easy to break:

- **One hyphen for modifiers, never two.** BEM's `--` does not apply: this project has no
  element nesting, so `md-state-layer` is a flat block and `hover` is its state.
- **Tokens use the official M3 name in full; classes use the short form.** `--md-sys-typescale-*`
  becomes `.md-type-*`.

## Language and encoding

| File | Characters |
| ---- | ---------- |
| `README.md` | Spanish, **accents allowed** |
| `*.css`, `*.html`, `tools/*.ps1` | **ASCII only, no accents** |

Comments in code are written in Spanish without accents. Check for stray non-Latin
characters before committing; they have slipped into this project before and the verifier
does not catch them.

Do not introduce new frameworks, build systems, or duplicated styling systems unless the
user explicitly requests it.

---

# CONSISTENCY

All component showroom pages should feel like parts of the same documentation system.

Maintain consistency in:

- section hierarchy,
- typography,
- spacing,
- cards/containers,
- example presentation,
- code presentation,
- headings,
- descriptions,
- tables,
- empty/non-applicable states.

Do not create a completely different showroom structure for individual components without a good reason.

---

# VERIFICATION

After implementation, verify:

1. The showroom uses the real component from `css/3-comp/`.
2. No fake component implementation was created.
3. No component logic was duplicated.
4. All displayed variants actually exist.
5. All displayed colors actually exist.
6. All displayed shapes actually exist.
7. All displayed sizes actually exist.
8. All displayed padding values are real.
9. All displayed states actually exist.
10. All displayed icons are supported.
11. All displayed slots/content are supported.
12. Documented interactions are real.
13. Documented behavior is real.
14. Anatomy matches the actual component.
15. Accessibility documentation matches implementation.
16. Responsive behavior is not fabricated.
17. Content states are not fabricated.
18. Composition examples use real components.
19. Measurements are real.
20. Token names are real.
21. Non-applicable sections are explicitly communicated when confirmed.
22. The page follows the established showroom visual language.

## Then run the three checks

This project has its own verifier. It is not optional, and it is not covered by items 1-22.

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\verify-tokens.ps1
```

It must print `OK - La arquitectura se respeta en las 7 reglas` and exit 0. This is what
proves REGLA 6 in particular: that no `style=` attribute and no `<style>` block crept into
the new HTML.

**Then check encoding**, which the verifier does not cover:

- no BOM, LF line endings, one trailing newline;
- no CJK or Hangul characters (they have slipped into this project before);
- ASCII only in `.css`, `.html` and `.ps1`.

**Then verify in a real browser**, not by reading the code. Load the showroom and confirm
with `getComputedStyle` that the tokens resolve to the values the documentation claims.
Reading CSS tells you what you wrote, not what the browser computed.

---

# WHEN SOMETHING IS UNCLEAR

Never guess.

If you cannot determine whether a feature exists, ask the user.

Examples:

```text
No puedo determinar si Toggle es una variante o un comportamiento
en la implementación actual. ¿Cómo quieres clasificarlo?
```

or:

```text
M3 define este estado, pero no encuentro una implementación
equivalente en RDM Next. ¿Quieres documentarlo como no soportado
o deseas implementar primero la capacidad?
```

---

# FINAL NON-NEGOTIABLE RULE

For every NEW component showroom view:

```text
CONFIRM THE COMPONENT EXISTS
  ↓
INSPECT
  ↓
ANALYZE
  ↓
PROPOSE SECTIONS
  ↓
ASK USER
  ↓
WAIT
  ↓
CONFIRM STRUCTURE
  ↓
IMPLEMENT
  ↓
VERIFY
```

Never:

```text
INSPECT
  ↓
IMPLEMENT
  ↓
ASK
```

And never document a component that does not exist yet in `css/3-comp/`.

The user's explicit confirmation of the showroom sections is mandatory before implementation.
