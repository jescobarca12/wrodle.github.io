---
name: Contexto de Negocio
type: project
---

# Contexto de Negocio — Wordle ES

## ¿Qué es?

Wordle ES es un clon del juego Wordle de NYT, adaptado completamente al español. El objetivo es adivinar una palabra de 5 letras en un máximo de 6 intentos. Cada intento revela pistas por color:

- **Verde** (`correct`): letra en la posición correcta
- **Amarillo** (`present`): letra existe en la palabra pero en otra posición
- **Gris** (`absent`): letra no existe en la palabra

## Audiencia objetivo

Hispanohablantes que quieren jugar Wordle en su idioma nativo, sin barreras de inglés.

## Propuesta de valor

- Completamente en español (UI, palabras, mensajes)
- Validación extendida via Wiktionary: no está limitado solo al listado curado; cualquier palabra española válida puede usarse como intento
- Sin registro, sin cuenta, sin datos guardados — experiencia de un solo uso por sesión
- Responsive: funciona en mobile y desktop
- Desplegado gratis en GitHub Pages

## Reglas de negocio clave

1. Solo se aceptan palabras de exactamente 5 letras
2. Una palabra es válida si está en el listado `WORDS` local **o** si existe en es.wiktionary.org
3. Si no hay conexión a internet, solo se aceptan palabras del listado local
4. La palabra objetivo se elige aleatoriamente del listado `WORDS` en cada nueva partida
5. El juego termina al acertar la palabra o agotar los 6 intentos
6. Las letras acentuadas en teclado físico (Á, É, Í, Ó, Ú, Ü) se normalizan a su versión sin acento
7. La Ñ sí se mantiene como carácter independiente

## Limitaciones actuales

- No hay persistencia: al recargar la página, el progreso se pierde
- No hay estadísticas de partidas
- Una sola partida activa por sesión
- Sin modo oscuro/claro (solo dark mode)
- Sin compartir resultados (e.g., grid de emojis)
