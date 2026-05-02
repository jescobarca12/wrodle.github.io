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

function get(key) {
    try {
        const v = localStorage.getItem(key);
        return v !== null ? JSON.parse(v) : null;
    } catch { return null; }
}

function set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function remove(key) {
    try { localStorage.removeItem(key); } catch {}
}

const defaultStats = () => ({
    played: 0, wins: 0, currentStreak: 0, maxStreak: 0,
    distribution: [0, 0, 0, 0, 0, 0],
});

/*
 * State schema:
 * {
 *   answer:   string,
 *   guesses:  string[],
 *   states:   Array<Array<'correct'|'present'|'absent'>>,
 *   date:     string,   // YYYY-MM-DD, daily mode only
 *   gameOver: boolean,
 *   won:      boolean,
 * }
 *
 * Stats schema:
 * {
 *   played: number, wins: number,
 *   currentStreak: number, maxStreak: number,
 *   distribution: number[6],  // wins by attempt count index 0-5
 * }
 */
export const Storage = {
    // ── Game state ───────────────────────────────────────
    loadState:  (mode)        => get(KEYS[`${mode}_state`]),
    saveState:  (mode, state) => set(KEYS[`${mode}_state`], state),
    clearState: (mode)        => remove(KEYS[`${mode}_state`]),

    // ── Statistics ───────────────────────────────────────
    loadStats:  (mode)        => get(KEYS[`${mode}_stats`]) ?? defaultStats(),
    saveStats:  (mode, stats) => set(KEYS[`${mode}_stats`], stats),

    // ── Preferences ──────────────────────────────────────
    getTheme:        ()  => get(KEYS.theme) ?? 'dark',
    setTheme:        (t) => set(KEYS.theme, t),
    getHardMode:     ()  => get(KEYS.hard_mode) ?? false,
    setHardMode:     (v) => set(KEYS.hard_mode, v),
    getSounds:       ()  => get(KEYS.sounds) ?? false,
    setSounds:       (v) => set(KEYS.sounds, v),
    isFirstVisit:    ()  => get(KEYS.first_visit) !== false,
    setTutorialSeen: ()  => set(KEYS.first_visit, false),
};
