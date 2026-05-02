---
name: Stack Tecnológico
type: project
---

# Stack Tecnológico

## Frontend

| Tecnología | Versión | Uso |
|---|---|---|
| HTML5 | — | Shell de la app, estructura semántica |
| CSS3 | — | Estilos, animaciones, responsive |
| JavaScript | ES2020+ (vanilla) | Toda la lógica del juego |

**Sin frameworks, sin bundlers, sin dependencias npm.** El proyecto no tiene `package.json`.

## Hosting

- **GitHub Pages** — despliegue estático automático desde `main`
- URL: `wrodle.github.io`
- Sin CI/CD configurado manualmente; GitHub maneja el despliegue

## API Externa

- **Wikimedia/Wiktionary REST API** (`https://es.wiktionary.org/w/api.php`)
  - Uso: validar palabras que no están en el listado local
  - Método: `action=query` con `prop=info`
  - CORS: habilitado con `origin=*`
  - Timeout: 5 segundos via `AbortController`
  - Fallback: si falla, acepta solo palabras del listado local

## Patrones de CSS

- **CSS Custom Properties** en `:root` para todos los colores y tamaños de tile
- **`data-state` attributes** como selector de estado (en lugar de clases): `[data-state="correct"]`
- **`@keyframes`** para las 4 animaciones: `pop`, `flip`, `shake`, `bounce`
- Responsive via un único breakpoint `@media (max-width: 420px)`

## Patrones de JavaScript

- `'use strict'` habilitado
- Sin módulos ES (todo en un solo archivo, scope global)
- `async/await` para la validación de palabras
- `AbortController` + `setTimeout` para timeout de fetch
- `Set` para caché de palabras válidas (`validCache`)
- Event delegation en el teclado on-screen (`keyboardEl.addEventListener('click', ...)`)
- `{ once: true }` en todos los listeners de `animationend`

## Restricciones técnicas

- No se puede usar `import/export` (no hay bundler ni servidor que sirva módulos ES nativos localmente sin CORS issues)
- Sin TypeScript
- Sin preprocesador CSS (SASS/Less)
- El tamaño total del proyecto debe permanecer pequeño para carga rápida en GitHub Pages
