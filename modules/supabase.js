import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL  = 'https://crsuemgrtbavsdsvbsvf.supabase.co';
const SUPABASE_KEY  = 'sb_publishable_-x34eiJ9eVWwQwuzJzJihA_HVhId7aX';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Registrar un nuevo usuario con email, password y username.
 * Supabase crea el user en auth.users y el trigger crea el perfil.
 */
export async function signUp(email, password, username) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } }
  });
  if (error) throw error;
  return data;
}

/**
 * Login con email y password.
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/**
 * Cerrar sesión.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Obtener el usuario autenticado actualmente.
 * Retorna null si no hay sesión activa.
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Escuchar cambios de sesión (login / logout).
 * Usar en app.js al inicializar:
 *   onAuthStateChange((user) => { ... });
 */
export function onAuthStateChange(callback) {
  supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}

/**
 * Obtener la partida del día para el usuario actual.
 * Retorna null si no existe aún.
 */
export async function getDailyGame(userId, date) {
  const { data, error } = await supabase
    .from('daily_games')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Guardar o actualizar el estado de la partida diaria.
 * Usa upsert para insertar si no existe, o actualizar si ya existe.
 */
export async function saveDailyGame(userId, date, gameState) {
  const { answer, guesses, states, won, attempts, completed } = gameState;

  const { data, error } = await supabase
    .from('daily_games')
    .upsert(
      { user_id: userId, date, answer, guesses, states, won, attempts, completed },
      { onConflict: 'user_id,date' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Obtener stats de un usuario para un modo específico.
 */
export async function getStats(userId, mode) {
  const { data, error } = await supabase
    .from('stats')
    .select('*')
    .eq('user_id', userId)
    .eq('mode', mode)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Actualizar stats después de terminar una partida.
 * @param {string} userId
 * @param {string} mode - 'daily' | 'infinite'
 * @param {boolean} won
 * @param {number|null} attempts - número de intentos si ganó, null si perdió
 */
export async function updateStats(userId, mode, won, attempts) {
  // Obtener stats actuales
  const current = await getStats(userId, mode);

  const newPlayed = current.played + 1;
  const newWins   = won ? current.wins + 1 : current.wins;

  // Actualizar rachas
  const newCurrentStreak = won ? current.current_streak + 1 : 0;
  const newMaxStreak     = Math.max(current.max_streak, newCurrentStreak);

  // Actualizar distribución (solo si ganó)
  const newDistribution = [...current.distribution];
  if (won && attempts >= 1 && attempts <= 6) {
    newDistribution[attempts - 1] += 1;
  }

  const { data, error } = await supabase
    .from('stats')
    .update({
      played:          newPlayed,
      wins:            newWins,
      current_streak:  newCurrentStreak,
      max_streak:      newMaxStreak,
      distribution:    newDistribution
    })
    .eq('user_id', userId)
    .eq('mode', mode)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Obtener el ranking global para un modo.
 * @param {string} mode - 'daily' | 'infinite'
 * @param {number} limit - cantidad de jugadores a traer (default 10)
 */
export async function getRanking(mode, limit = 10) {
  const { data, error } = await supabase
    .from('ranking')
    .select('username, played, wins, win_rate, current_streak, max_streak')
    .eq('mode', mode)
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * Obtener la posición del usuario actual en el ranking.
 */
export async function getUserRankPosition(userId, mode) {
  // Traemos todos los jugadores del modo ordenados por wins desc
  const { data, error } = await supabase
    .from('ranking')
    .select('user_id')
    .eq('mode', mode);

  if (error) throw error;

  const position = data.findIndex(row => row.user_id === userId) + 1;
  return position > 0 ? position : null;
}