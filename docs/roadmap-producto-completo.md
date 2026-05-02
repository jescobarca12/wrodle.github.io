# Plan: Wrodle ES — Producto Completo

## Contexto

Wrodle ES es un clon de Wordle en español actualmente funcional pero incompleto para uso público. Tiene el core del juego (tablero, teclado, validación, animaciones), pero le faltan las features que los usuarios esperan de un Wordle moderno: persistencia, estadísticas, compartir resultado, modo diario, y más. El equipo quiere llegar al producto completo trabajando en colaboración.

**Decisiones tomadas:**
- Arquitectura: **ES Modules** (múltiples archivos en `modules/`)
- Modos de juego: **Diario + Infinito** (ambos coexisten)
- Estadísticas: **separadas por modo**

---

## Estructura de archivos final

```
wrodle.github.io/
├── index.html              ← actualizar (nuevos botones, script type="module")
├── style.css               ← actualizar (nuevos componentes UI + tema claro)
├── app.js                  ← refactorizar como orquestador ES module
└── modules/
    ├── words.js            ← array WORDS + getWordOfDay()
    ├── storage.js          ← todas las operaciones de localStorage
    ├── stats.js            ← renderizado y actualización de estadísticas
    ├── share.js            ← generación de emoji grid + clipboard
    └── sounds.js           ← efectos de audio opcionales (Web Audio API)
```

**Cambio crítico en index.html:**
```html
<!-- Antes -->
<script src="app.js"></script>

<!-- Después -->
<script type="module" src="app.js"></script>
```

---

## Features a implementar

### Feature 1 — Migración a ES Modules (prerequisito)

Mover `WORDS` a `modules/words.js`. Refactorizar `app.js` para usar `import`. Todo lo demás queda igual hasta que cada feature se trabaje.

```js
// modules/words.js
export const WORDS = [ ... ];
export function getWordOfDay() { ... }

// app.js
import { WORDS, getWordOfDay } from './modules/words.js';
```

**Archivos afectados:** `app.js`, `index.html`, nuevo `modules/words.js`

---

### Feature 2 — Esquema de localStorage (storage.js)

Todas las operaciones de localStorage pasan por este módulo. Nunca leer/escribir `localStorage` directamente desde `app.js`.

**Claves:**

| Clave | Tipo | Contenido |
|---|---|---|
| `wordle_daily_state` | objeto | estado de la partida diaria activa |
| `wordle_infinite_state` | objeto | estado de la partida infinita activa |
| `wordle_daily_stats` | objeto | estadísticas del modo diario |
| `wordle_infinite_stats` | objeto | estadísticas del modo infinito |
| `wordle_theme` | string | `'dark'` \| `'light'` |
| `wordle_hard_mode` | boolean | hard mode activo |
| `wordle_sounds` | boolean | sonidos activos |
| `wordle_first_visit` | boolean | `false` cuando el tutorial fue visto |

**Schema de estado de partida:**
```json
{
  "answer": "GRANO",
  "guesses": ["PLATA", "GRISO"],
  "states": [["absent","correct",...], ...],
  "date": "2026-05-02",
  "gameOver": false,
  "won": false
}
```

**Schema de estadísticas:**
```json
{
  "played": 42,
  "wins": 35,
  "currentStreak": 5,
  "maxStreak": 12,
  "distribution": [0, 3, 8, 12, 7, 5]
}
```
> `distribution[i]` = número de veces que el usuario ganó en `i+1` intentos.

**Archivos afectados:** nuevo `modules/storage.js`, `app.js`

---

### Feature 3 — Palabra del día (words.js)

Derivar la palabra del día de forma determinística a partir de la fecha. Sin servidor.

```js
export function getWordOfDay() {
  const LAUNCH = new Date('2026-05-02T00:00:00');
  const today = new Date();
  today.setHours(0,0,0,0);
  const diff = Math.floor((today - LAUNCH) / 86400000);
  return WORDS[((diff % WORDS.length) + WORDS.length) % WORDS.length];
}
```

Reglas del modo diario:
- La palabra es la misma para todos los jugadores ese día
- Si `state.date === hoy` → restaurar partida guardada
- Si `state.date !== hoy` → nueva partida del día (resetear estado)
- Una vez completada (ganó o agotó intentos) → tablero visible pero sin input, mostrar botón "Ver estadísticas"

**Archivos afectados:** `modules/words.js`, `app.js`

---

### Feature 4 — Modos de juego (app.js + index.html)

Variable global `currentMode: 'daily' | 'infinite'`.

**Selector en header:**
```html
<div class="mode-tabs">
  <button class="mode-tab active" data-mode="daily">Diario</button>
  <button class="mode-tab" data-mode="infinite">Infinito</button>
</div>
```

Al cambiar de modo: guardar estado del modo actual → cargar estado del modo nuevo.

**Archivos afectados:** `index.html`, `style.css`, `app.js`

---

### Feature 5 — Persistencia de sesión (storage.js + app.js)

Guardar estado después de cada acción: `addLetter`, `deleteLetter`, `submitGuess`.

```js
// Al final de cada acción mutante:
Storage.saveState(currentMode, { answer, guesses, states, date, gameOver, won });

// Al iniciar:
const saved = Storage.loadState(currentMode);
if (saved) restoreGame(saved);
else startFresh();
```

**Archivos afectados:** `app.js`, `modules/storage.js`

---

### Feature 6 — Estadísticas (stats.js + index.html)

Actualizar stats al terminar cada partida. Modal de stats accesible desde header.

**UI del modal de stats:**
```
┌─────────────────────────────────┐
│  ESTADÍSTICAS · MODO DIARIO     │
├────────┬─────────┬──────┬───────┤
│   42   │   83%   │  5   │  12   │
│Jugadas │Victorias│Racha │ Máx.  │
├─────────────────────────────────┤
│  DISTRIBUCIÓN DE INTENTOS       │
│  1 ▓░░░░░░░░░░░  0              │
│  2 ▓▓▓░░░░░░░░░  3              │
│  3 ▓▓▓▓▓▓▓▓░░░  8              │
│  4 ▓▓▓▓▓▓▓▓▓▓▓ 12 ← actual     │
│  5 ▓▓▓▓▓▓▓░░░░  7              │
│  6 ▓▓▓▓▓░░░░░░  5              │
└─────────────────────────────────┘
```

**Archivos afectados:** nuevo `modules/stats.js`, `index.html`, `style.css`

---

### Feature 7 — Compartir resultado (share.js)

Botón "Compartir" en el modal de fin de juego.

**Formato del texto copiado:**
```
Wordle ES 🇪🇸 · Diario
4/6

⬛🟨⬛⬛🟩
🟩🟩🟨⬛🟩
🟩🟩🟩🟨🟩
🟩🟩🟩🟩🟩
```

Usar `navigator.clipboard.writeText()` con fallback a `document.execCommand('copy')`.
Toast de confirmación: "¡Copiado al portapapeles!" por 1.4s.

**Archivos afectados:** nuevo `modules/share.js`, `app.js`, `index.html`

---

### Feature 8 — Modo oscuro/claro (style.css + app.js)

Toggle en el header (☀️ / 🌙). Default: oscuro (comportamiento actual).

Aplicar el tema añadiendo `data-theme="light"` en `<html>`. Evitar flash al cargar:

```html
<!-- En <head>, antes de style.css -->
<script>
  if (localStorage.getItem('wordle_theme') === 'light')
    document.documentElement.dataset.theme = 'light';
</script>
```

En CSS, todas las custom properties del tema claro bajo:
```css
[data-theme="light"] {
  --bg: #ffffff;
  --header-bg: #f9f9f9;
  --text: #1a1a1b;
  /* ... etc */
}
```

**Archivos afectados:** `style.css`, `index.html`, `app.js`

---

### Feature 9 — Tutorial (app.js + style.css + index.html)

Mostrar en primera visita (`wordle_first_visit` no existe en localStorage).
También accesible con botón "?" en el header.

**Contenido del overlay:**
- Título: "¿Cómo se juega?"
- Tres filas de ejemplo con tiles coloreados y explicación de cada estado
- Botón "¡Entendido!" → cierra y marca `wordle_first_visit = false`

**Archivos afectados:** `index.html`, `style.css`, `app.js`

---

### Feature 10 — Hard Mode (app.js)

Toggle en modal de configuración (⚙️ en header). No se puede activar/desactivar mid-partida.

**Reglas de validación adicionales en `submitGuess()`:**
1. Las letras verdes deben estar en la misma posición
2. Las letras amarillas deben estar incluidas en el intento

```js
function checkHardModeConstraints(guess) {
  for (const { letter, pos, type } of hardConstraints) {
    if (type === 'correct' && guess[pos] !== letter)
      return `La posición ${pos+1} debe ser ${letter}`;
    if (type === 'present' && !guess.includes(letter))
      return `El intento debe incluir ${letter}`;
  }
  return null;
}
```

Toast con el mensaje de error + shake de la fila.

**Archivos afectados:** `app.js`

---

### Feature 11 — Sonidos (sounds.js)

Toggle en modal de configuración. Default: desactivado.
Usar Web Audio API (sintetizado, sin archivos externos).

Eventos sonoros:
| Evento | Sonido |
|---|---|
| Letra escrita | tick suave (220Hz, 30ms) |
| Palabra inválida | buzz (80Hz, 200ms) |
| Letra correcta (reveal) | nota ascendente |
| Victoria | fanfare corto |
| Derrota | nota descendente |

Fallar silenciosamente si AudioContext no está disponible.

**Archivos afectados:** nuevo `modules/sounds.js`, `app.js`

---

### Feature 12 — Ampliar lista de palabras

Agregar palabras al array `WORDS` en `modules/words.js`. Target: ~1,000–1,500 palabras (de las ~600 actuales). Puede hacerse en cualquier momento de forma independiente.

**Archivos afectados:** `modules/words.js`

---

## Cambios en index.html (resumen)

Nuevos elementos a agregar en el header:
```html
<header>
  <!-- existente -->
  <h1>WORDLE ES</h1>
  <p class="subtitle">Adivina la palabra de 5 letras</p>

  <!-- nuevos -->
  <div class="mode-tabs">
    <button class="mode-tab active" data-mode="daily">Diario</button>
    <button class="mode-tab" data-mode="infinite">Infinito</button>
  </div>
  <div class="header-actions">
    <button id="btn-help" title="Instrucciones">?</button>
    <button id="btn-stats" title="Estadísticas">📊</button>
    <button id="btn-settings" title="Configuración">⚙️</button>
    <button id="btn-theme" title="Cambiar tema">🌙</button>
  </div>
</header>
```

Nuevos modales a agregar:
- `#modal-stats` — estadísticas
- `#modal-settings` — hard mode toggle + sounds toggle
- `#modal-tutorial` — instrucciones con tiles de ejemplo

Botón "Compartir" a agregar dentro del `#modal` existente (fin de partida).

---

## Orden de implementación sugerido

El equipo puede trabajar estas features en el siguiente orden para minimizar conflictos:

1. **Migración ES Modules** — prerequisito para todo, hacerlo primero en equipo
2. **storage.js** — prerequisito para persistencia, stats y modo diario
3. **Persistencia** — una vez storage.js listo, es straightforward
4. **Modo diario + getWordOfDay** — depende de storage.js
5. **Modos de juego** — tabs en header, cambio de contexto
6. **Estadísticas** — depende de storage.js y fin de partida
7. **Compartir resultado** — independiente, puede ir en paralelo con stats
8. **Modo oscuro/claro** — puramente CSS + toggle, independiente
9. **Tutorial** — independiente del resto
10. **Hard Mode** — modifica submitGuess(), requiere conocer el flujo
11. **Sonidos** — completamente independiente
12. **Ampliar palabras** — independiente, cualquier momento

Features **independientes** (pueden hacerse en paralelo): 7, 8, 9, 11, 12.

---

## Verificación (por feature)

| Feature | Cómo verificar |
|---|---|
| ES Modules | `python3 -m http.server 8080` → juego funciona igual que antes |
| Persistencia | Recargar página mid-juego → tablero se restaura exacto |
| Palabra del día | Mismo resultado al recargar o abrir en otro tab |
| Modos | Cambiar tab conserva estado de cada modo por separado |
| Stats | Completar partida → stats actualizadas correctamente |
| Compartir | Botón → clipboard tiene emoji grid correcto |
| Tema | Toggle → persiste en localStorage, sin flash al recargar |
| Tutorial | Limpiar localStorage → aparece al cargar; botón ? lo abre |
| Hard Mode | Intentar ignorar letra verde → rechazado con mensaje |
| Sonidos | Toggle ON → sonido al presionar teclas |
