---
name: Features del Juego
type: project
---

# Features

## Implementadas

### Core del juego
- [x] Tablero de 6 filas × 5 columnas
- [x] Teclado on-screen con layout español (incluye Ñ)
- [x] Input físico de teclado con normalización de acentos
- [x] Evaluación correcta de letras duplicadas (algoritmo dos pasadas)
- [x] Validación de longitud (exactamente 5 letras)
- [x] Validación de diccionario (listado local + Wiktionary API con fallback)

### Feedback visual
- [x] Animación `pop` al escribir cada letra
- [x] Animación `flip` al revelar resultado de la fila (stagger de 300ms por tile)
- [x] Animación `shake` al rechazar palabra inválida
- [x] Animación `bounce` al ganar
- [x] Toast de mensajes temporales (error, "Buscando...", confirmaciones)
- [x] Botón ENTER en estado loading (`...`) durante validación API
- [x] Colores del teclado on-screen actualizados post-intento (solo sube de estado, nunca baja)

### Fin de partida
- [x] Modal de victoria con mensaje según número de intentos (6 mensajes distintos)
- [x] Modal de derrota con la palabra revelada
- [x] Botón "Nueva Palabra →" para reiniciar sin recargar

### Responsive
- [x] Breakpoint móvil en 420px (tiles más pequeños, teclas más compactas)

---

## Roadmap — Producto Completo

> Ver especificación detallada en `docs/roadmap-producto-completo.md`

**Decisiones de arquitectura:**
- Arquitectura: **ES Modules** (`modules/` directory)
- Modos de juego: **Diario + Infinito** (coexisten, tabs en header)
- Estadísticas: **separadas por modo**

### Prerequisito
- [ ] **Migración a ES Modules** — cambiar `<script>` a `type="module"`, crear `modules/words.js`

### Módulos nuevos a crear
- [ ] **`modules/storage.js`** — todas las operaciones de localStorage (prerequisito para features 3-6)
- [ ] **`modules/stats.js`** — renderizado y actualización de estadísticas
- [ ] **`modules/share.js`** — generación de emoji grid + clipboard API
- [ ] **`modules/sounds.js`** — efectos de audio opcionales (Web Audio API)

### Features de juego
- [ ] **Persistencia de sesión** — guardar/restaurar estado en localStorage por modo
- [ ] **Palabra del día** — misma palabra para todos (seeded por fecha, sin servidor)
- [ ] **Modos de juego** — tabs Diario / Infinito en el header
- [ ] **Estadísticas** — modal con racha, % victorias, distribución por intentos (por modo)
- [ ] **Compartir resultado** — emoji grid copiado al clipboard
- [ ] **Hard Mode** — letras reveladas deben usarse en intentos siguientes
- [ ] **Ampliar lista de palabras** — target ~1,000–1,500 palabras (actualmente ~600)

### Features de UX
- [ ] **Modo oscuro/claro** — toggle en header, preferencia guardada en localStorage
- [ ] **Tutorial/instrucciones** — overlay en primera visita + botón "?" permanente
- [ ] **Sonidos** — efectos opcionales, default OFF

### Orden de implementación sugerido
1. Migración ES Modules
2. storage.js
3. Persistencia
4. Modo diario + getWordOfDay
5. Modos de juego (tabs)
6. Estadísticas
7-12. Compartir, Tema, Tutorial, Hard Mode, Sonidos, Ampliar palabras (independientes)
