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

## Pendientes / Ideas futuras

### Alta prioridad
- [ ] **Persistencia de sesión**: guardar estado en `localStorage` para no perder la partida al recargar
- [ ] **Estadísticas**: racha de victorias, distribución de intentos, partidas jugadas
- [ ] **Compartir resultado**: generar grid de emojis verde/amarillo/gris para copiar

### Media prioridad
- [ ] **Palabra del día**: misma palabra para todos los jugadores ese día (seeded por fecha)
- [ ] **Modo oscuro/claro**: toggle; actualmente solo existe dark mode
- [ ] **Tutorial/instrucciones**: overlay de primeras instrucciones para nuevos jugadores

### Baja prioridad / Nice-to-have
- [ ] **Sonidos**: efectos de audio opcionales
- [ ] **Hard mode**: las letras descubiertas deben usarse en intentos siguientes
- [ ] **Wordle infinito**: ya existe (aleatoria), pero podría tener contador de racha
- [ ] **Ampliar lista de palabras**: el listado actual tiene ~600 palabras; podría crecer
