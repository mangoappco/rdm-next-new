# CONTEXT.md

Contexto rápido para retomar la sesión en frío. No sustituye a `README.md` ni a la skill del showroom: aquí solo viven los hechos que cambian con cada componente y los candados que ya no se discuten. **Se actualiza en el mismo commit de cada componente**, igual que el enlace en `showroom/index.html`.

## Qué estamos construyendo

La librería de componentes de **RDM ManGo! App**: sistema de diseño estático, HTML + CSS, sin build, sin framework y sin JavaScript. Basado conceptualmente en Material Design 3, con arquitectura de tokens, nomenclatura y decisiones propias. Cuatro capas — `1-reference-tokens` → `2-system-tokens` → `3-components` → `4-utilities` — y un showroom que lo documenta con dogfooding: cada vista usa las clases reales del sistema.

## Candados

Solo prohibiciones verbales. Las reglas de showroom, de capas y de ciclo no se copian aquí: viven en la skill y en el README, apuntadas más abajo.

- **Sin JavaScript** en el sistema. `showroom/lab.html` es la única excepción y está en `.gitignore`.
- **Sin toggles** en ManGo! App.
- **Sin morph de pulsado** en ningún componente.
- **Sin elevación transicionada.**

## Componentes creados

Hoja en `src/css/3-components/`, vista en `showroom/components/`. Hay **6 componentes y 15 vistas** (6 de componente + 9 de tokens), las 15 enlazadas en `showroom/index.html`. El orden es el de `index.css`:

| Componente | Hoja | Vista |
| --- | --- | --- |
| Divider | `divider.css` | `divider.html` |
| Icon button | `icon-button.css` | `icon-button.html` |
| Button | `button.css` | `button.html` |
| Button group | `button-group.css` | `button-group.html` |
| FAB | `fab.css` | `fab.html` |
| FAB extended | `fab-extended.css` | `fab-extended.html` |

Cada componente tiene además su superficie de trabajo en `showroom/templates/<nombre>.template.html`: mientras no se trabaja en él, plantilla y vista publicada son byte-idénticas.

## Siguiente tarea

**`card`** — el siguiente componente de la capa 3. Encaja al final de `src/css/3-components/index.css`, después de `fab-extended.css`.

## Deuda conocida

Nada de esto se ha tocado. Está anotado para que no se dé por verdad:

- `README.md` §11 documenta 3 componentes (Divider, Button, Icon Button) y hay 6: no menciona button-group, fab ni fab-extended.
- `src/css/main.css:54` dice `comp Componentes: button, card, dialog.`
- El README §11 usa como marcador unas líneas comentadas de `card.css` y `dialog.css` en `3-components/index.css` que ya no existen, y su justificación —«cerraría las dos vistas que declaran chip y card como pendiente»— no se verifica: ninguna vista lo declara.
- Tres vistas quedaron sobre el techo de prosa al recortarla: `button-group` (199 de media), `icon-button` (287 máx.) y `motion` (211 máx.).

## Dónde vive el resto

| Qué | Dónde |
| --- | --- |
| Reglas del showroom, ciclo de publicación, orden de secciones, deuda de prosa | `.opencode/skills/rdm-component-showroom/SKILL.md` |
| Arquitectura de capas, nomenclatura, temas, iconos y fuentes | `README.md` |
| Las 13 reglas automáticas y cómo se ejecutan | `tools/verify-tokens.ps1` |
| Filosofía de las fichas del showroom | `docs/showroom-philosophy.md` |
