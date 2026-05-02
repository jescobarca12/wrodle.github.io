# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Wordle ES** — clon de Wordle en español, desplegado como sitio estático en GitHub Pages (`wrodle.github.io`). Sin build tools, sin package manager, sin framework. Abrir `index.html` directamente en el navegador para correr localmente.

Ver `.claude/` para documentación detallada de negocio, stack y features.

## Desarrollo local

No hay pasos de build, lint ni tests. Servir con cualquier servidor estático:

```bash
python3 -m http.server 8080
# o
npx serve .
```

Abrir `http://localhost:8080`.

## Despliegue

Push a `main` → GitHub Pages lo publica automáticamente en `wrodle.github.io`.

## Arquitectura

Tres archivos, todo vanilla:

| Archivo | Rol |
|---|---|
| `index.html` | Shell estático; el único nodo dinámico es `#board` (construido por JS) |
| `style.css` | Tema dark-only via CSS custom properties; estados de tile por atributo `data-state` |
| `app.js` | Toda la lógica del juego; sin módulos |

### Estado global (`app.js`)

| Variable | Propósito |
|---|---|
| `answer` | Palabra objetivo actual |
| `guesses` | Array de palabras enviadas |
| `currentGuess` | Palabra en curso |
| `isRevealing` | Animación de flip en progreso — bloquea input |
| `isChecking` | Llamada a API de Wiktionary en progreso — bloquea input |

### Flujo de validación de palabras

`submitGuess()` → `isWordValid(word)`:
1. Consulta `validCache` (un `Set` inicializado con el array local `WORDS`) — hit instantáneo
2. En miss: llama a `https://es.wiktionary.org/w/api.php` con timeout de 5 s via `fetchWithTimeout()`
3. Las palabras válidas se agregan a `validCache` para la sesión
4. Si hay falla de red, solo se aceptan palabras del listado local `WORDS`

### Máquina de estados del tile

Tiles identificados por `tile-{fila}-{col}`. Transiciones:
- Sin atributo → `tbd` (letra escrita, no enviada)
- `tbd` → `correct` / `present` / `absent` (post animación flip en `revealRow()`)

### Algoritmo de evaluación (`evaluate()`)

Dos pasadas: primero marca exactos (`correct`) nulleándolos, luego busca presentes (`present`) de izquierda a derecha. Maneja correctamente letras duplicadas.

### Ranking de colores en teclado

`applyKeyboard()` solo sube el estado de una tecla, nunca lo baja: `correct` (3) > `present` (2) > `absent` (1).

### Animaciones

Todas via clase CSS + auto-remoción en `animationend`:
- `pop` — escala del tile al escribir letra
- `flipping` — flip del tile al revelar (color aplicado al midpoint via `setTimeout(FLIP_MS)`)
- `shake` — fila agita al rechazar palabra
- `bounce` — fila rebota al ganar

### Manejo específico del español

- Teclado incluye tecla Ñ
- `normalizeVowel()` elimina acentos en input físico (Á→A, É→E, etc.)
- Todas las palabras almacenadas y comparadas en mayúsculas ASCII + Ñ
