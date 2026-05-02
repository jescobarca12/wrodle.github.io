// modules/storage.js
// ============================================================
// Capa de almacenamiento para Wrodle ES
//
// Estrategia dual:
//  - Usuario autenticado → Supabase (persistencia cross-device)
//  - Usuario anónimo     → localStorage (como siempre)
//
// app.js nunca toca localStorage ni supabase directamente.
// Todo pasa por este módulo.
// ============================================================

import {
  getCurrentUser,
  getDailyGame,
  saveDailyGame,
  getStats,
  updateStats
} from './supabase.js';


// ============================================================
// CLAVES DE localStorage
// ============================================================
const KEYS = {
  daily_state:    'wordle_daily_state',
  infinite_state: 'wordle_infinite_state',
  daily_stats:    'wordle_daily_stats',
  infinite_stats: 'wordle_infinite_stats',
  theme:          'wordle_theme',
  hard_mode:      'wordle_hard_mode',
  sounds:         'wordle_sounds',
  first_visit:    'wordle_first_visit',
};


// ============================================================
// HELPERS INTERNOS
// ============================================================

function localGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function localSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('[Storage] localStorage no disponible:', e);
  }
}

function todayString() {
  return new Date().toISOString().split('T')[0]; // "2026-05-02"
}


// ============================================================
// ESTADO DE PARTIDA
// ============================================================

/**
 * Cargar el estado guardado de una partida.
 * @param {string} mode - 'daily' | 'infinite'
 * @returns {object|null} Estado de la partida o null si no existe
 */
export async function loadState(mode) {
  if (mode === 'daily') {
    const user = await getCurrentUser();

    if (user) {
      // Usuario autenticado: buscar en Supabase
      try {
        const game = await getDailyGame(user.id, todayString());
        if (!game) return null;

        return {
          answer:   game.answer,
          guesses:  game.guesses,
          states:   game.states,
          date:     game.date,
          gameOver: game.completed,
          won:      game.won,
        };
      } catch (e) {
        console.warn('[Storage] Fallo Supabase, usando localStorage:', e);
      }
    }

    // Anónimo o fallback: localStorage
    const saved = localGet(KEYS.daily_state);
    if (!saved || saved.date !== todayString()) return null;
    return saved;
  }

  // Modo infinito: siempre localStorage
  return localGet(KEYS.infinite_state);
}

/**
 * Guardar el estado de una partida.
 * @param {string} mode - 'daily' | 'infinite'
 * @param {object} state - { answer, guesses, states, date, gameOver, won }
 */
export async function saveState(mode, state) {
  if (mode === 'daily') {
    // Siempre guardar en localStorage como backup
    localSet(KEYS.daily_state, { ...state, date: todayString() });

    const user = await getCurrentUser();
    if (user) {
      try {
        await saveDailyGame(user.id, todayString(), {
          answer:    state.answer,
          guesses:   state.guesses,
          states:    state.states,
          won:       state.won ?? false,
          attempts:  state.won ? state.guesses.length : null,
          completed: state.gameOver ?? false,
        });
      } catch (e) {
        console.warn('[Storage] No se pudo guardar en Supabase:', e);
      }
    }
    return;
  }

  // Modo infinito: solo localStorage
  localSet(KEYS.infinite_state, state);
}

/**
 * Limpiar el estado de una partida (al iniciar una nueva).
 * @param {string} mode - 'daily' | 'infinite'
 */
export function clearState(mode) {
  const key = mode === 'daily' ? KEYS.daily_state : KEYS.infinite_state;
  localStorage.removeItem(key);
  // Las partidas diarias en Supabase no se borran, son historial
}


// ============================================================
// ESTADÍSTICAS
// ============================================================

/**
 * Cargar estadísticas de un modo.
 * @param {string} mode - 'daily' | 'infinite'
 * @returns {object} Stats
 */
export async function loadStats(mode) {
  const defaultStats = {
    played: 0, wins: 0, currentStreak: 0, maxStreak: 0,
    distribution: [0, 0, 0, 0, 0, 0]
  };

  const user = await getCurrentUser();

  if (user) {
    try {
      const data = await getStats(user.id, mode);
      return {
        played:         data.played,
        wins:           data.wins,
        currentStreak:  data.current_streak,
        maxStreak:      data.max_streak,
        distribution:   data.distribution,
      };
    } catch (e) {
      console.warn('[Storage] Fallo al cargar stats de Supabase:', e);
    }
  }

  // Fallback localStorage
  const key = mode === 'daily' ? KEYS.daily_stats : KEYS.infinite_stats;
  return localGet(key) ?? defaultStats;
}

/**
 * Actualizar estadísticas al terminar una partida.
 * @param {string} mode - 'daily' | 'infinite'
 * @param {boolean} won
 * @param {number|null} attempts - intentos usados si ganó
 */
export async function recordGameResult(mode, won, attempts) {
  const user = await getCurrentUser();

  if (user) {
    try {
      await updateStats(user.id, mode, won, attempts);
      return;
    } catch (e) {
      console.warn('[Storage] Fallo al actualizar stats en Supabase:', e);
    }
  }

  // Fallback: actualizar en localStorage
  const key = mode === 'daily' ? KEYS.daily_stats : KEYS.infinite_stats;
  const current = localGet(key) ?? {
    played: 0, wins: 0, currentStreak: 0, maxStreak: 0,
    distribution: [0, 0, 0, 0, 0, 0]
  };

  current.played += 1;
  if (won) {
    current.wins += 1;
    current.currentStreak += 1;
    current.maxStreak = Math.max(current.maxStreak, current.currentStreak);
    if (attempts >= 1 && attempts <= 6) {
      current.distribution[attempts - 1] += 1;
    }
  } else {
    current.currentStreak = 0;
  }

  localSet(key, current);
}


// ============================================================
// PREFERENCIAS DE UI (solo localStorage, no necesitan servidor)
// ============================================================

export const Prefs = {
  getTheme:      () => localStorage.getItem(KEYS.theme) ?? 'dark',
  setTheme:      (v) => localStorage.setItem(KEYS.theme, v),

  getHardMode:   () => localGet(KEYS.hard_mode) ?? false,
  setHardMode:   (v) => localSet(KEYS.hard_mode, v),

  getSounds:     () => localGet(KEYS.sounds) ?? false,
  setSounds:     (v) => localSet(KEYS.sounds, v),

  isFirstVisit:  () => localStorage.getItem(KEYS.first_visit) === null,
  markVisited:   () => localStorage.setItem(KEYS.first_visit, 'false'),
};
