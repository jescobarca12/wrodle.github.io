import { WORDS } from './modules/words.js';

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
const FLIP_MS = 250;   // half-flip duration (color changes at midpoint)
const STAGGER_MS = 300; // delay between tiles

let answer = '';
let guesses = [];
let currentGuess = '';
let gameOver = false;
let isRevealing = false;
let isChecking = false;
let toastTimer = null;

// Words validated by API get cached here so we only call once per word
const validCache = new Set(WORDS);

const boardEl      = document.getElementById('board');
const keyboardEl   = document.getElementById('keyboard');
const modalEl      = document.getElementById('modal');
const toastEl      = document.getElementById('toast');
const hiddenInputEl= document.getElementById('hidden-input');

const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

// ── Dictionary validation ─────────────────────────────

function fetchWithTimeout(url, ms) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

async function isWordValid(word) {
    const normalized = normalizeWord(word);
    if (validCache.has(normalized)) return true;
    try {
        const resp = await fetchWithTimeout(
            `https://es.wiktionary.org/w/api.php?action=opensearch&search=${encodeURIComponent(normalized.toLowerCase())}&limit=10&namespace=0&format=json&origin=*`,
            5000
        );
        const data = await resp.json();
        const suggestions = data[1] ?? [];
        // Acepta si alguna sugerencia, normalizada, coincide con la palabra buscada
        const found = suggestions.some(s => normalizeWord(s) === normalized);
        if (found) validCache.add(normalized);
        return found;
    } catch {
        return false;
    }
}

// ── Init ──────────────────────────────────────────────

function initGame() {
    answer = WORDS[Math.floor(Math.random() * WORDS.length)];
    guesses = [];
    currentGuess = '';
    gameOver = false;
    isRevealing = false;
    buildBoard();
    keyboardEl.querySelectorAll('[data-state]').forEach(k => delete k.dataset.state);
    if (!isTouch) hiddenInputEl.focus();
}

function buildBoard() {
    boardEl.innerHTML = '';
    for (let r = 0; r < MAX_GUESSES; r++) {
        const row = document.createElement('div');
        row.className = 'row';
        row.id = `row-${r}`;
        for (let c = 0; c < WORD_LENGTH; c++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.id = `tile-${r}-${c}`;
            row.appendChild(tile);
        }
        boardEl.appendChild(row);
    }
}

// ── Input ─────────────────────────────────────────────

function handleKey(key) {
    if (key === 'ENTER')          submitGuess();
    else if (key === 'BACKSPACE') deleteLetter();
    else                          addLetter(key);
}

function addLetter(letter) {
    if (gameOver || isRevealing || currentGuess.length >= WORD_LENGTH) return;
    currentGuess += letter;
    const t = getTile(guesses.length, currentGuess.length - 1);
    t.textContent = letter;
    t.dataset.state = 'tbd';
    t.classList.add('pop');
    t.addEventListener('animationend', () => t.classList.remove('pop'), { once: true });
}

function deleteLetter() {
    if (gameOver || isRevealing || currentGuess.length === 0) return;
    const t = getTile(guesses.length, currentGuess.length - 1);
    t.textContent = '';
    delete t.dataset.state;
    currentGuess = currentGuess.slice(0, -1);
}

async function submitGuess() {
    if (gameOver || isRevealing || isChecking) return;
    if (currentGuess.length < WORD_LENGTH) {
        showToast('Escribe 5 letras');
        shakeRow(guesses.length);
        return;
    }

    isChecking = true;
    setEnterLoading(true);
    showToast('Buscando...', 0);
    const valid = await isWordValid(currentGuess);
    clearToast();
    setEnterLoading(false);
    isChecking = false;

    if (!valid) {
        showToast('Palabra no encontrada');
        shakeRow(guesses.length);
        return;
    }

    const guess = currentGuess;
    const states = evaluate(guess, answer);
    guesses.push(guess);
    currentGuess = '';
    isRevealing = true;

    revealRow(guesses.length - 1, states, () => {
        isRevealing = false;
        applyKeyboard(guess, states);

        if (guess === answer) {
            gameOver = true;
            bounceRow(guesses.length - 1);
            const msgs = ['¡Genio!','¡Increíble!','¡Magnífico!','¡Muy bien!','¡Bien!','¡Por los pelos!'];
            setTimeout(() => openModal(true, msgs[guesses.length - 1]), 1000);
        } else if (guesses.length >= MAX_GUESSES) {
            gameOver = true;
            setTimeout(() => openModal(false), 400);
        }
    });
}

// ── Evaluation ────────────────────────────────────────

function evaluate(guess, answer) {
    const result = Array(WORD_LENGTH).fill('absent');
    const aArr = [...answer];
    const gArr = [...guess];

    for (let i = 0; i < WORD_LENGTH; i++) {
        if (gArr[i] === aArr[i]) {
            result[i] = 'correct';
            aArr[i] = null;
            gArr[i] = null;
        }
    }
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (gArr[i] !== null) {
            const idx = aArr.indexOf(gArr[i]);
            if (idx !== -1) { result[i] = 'present'; aArr[idx] = null; }
        }
    }
    return result;
}

// ── Animations ────────────────────────────────────────

function revealRow(rowIdx, states, onDone) {
    states.forEach((state, col) => {
        const t = getTile(rowIdx, col);
        setTimeout(() => {
            t.classList.add('flipping');
            setTimeout(() => { t.dataset.state = state; }, FLIP_MS);
            t.addEventListener('animationend', () => t.classList.remove('flipping'), { once: true });
        }, col * STAGGER_MS);
    });
    setTimeout(onDone, (WORD_LENGTH - 1) * STAGGER_MS + FLIP_MS * 2 + 60);
}

function bounceRow(rowIdx) {
    for (let c = 0; c < WORD_LENGTH; c++) {
        const t = getTile(rowIdx, c);
        setTimeout(() => {
            t.classList.add('bounce');
            t.addEventListener('animationend', () => t.classList.remove('bounce'), { once: true });
        }, c * 80);
    }
}

function shakeRow(rowIdx) {
    const row = document.getElementById(`row-${rowIdx}`);
    row.classList.add('shake');
    row.addEventListener('animationend', () => row.classList.remove('shake'), { once: true });
}

// ── UI helpers ────────────────────────────────────────

function applyKeyboard(guess, states) {
    const rank = { correct: 3, present: 2, absent: 1 };
    for (let i = 0; i < WORD_LENGTH; i++) {
        const key = keyboardEl.querySelector(`[data-key="${guess[i]}"]`);
        if (!key) continue;
        const cur = key.dataset.state;
        if (!cur || (rank[states[i]] ?? 0) > (rank[cur] ?? 0)) key.dataset.state = states[i];
    }
}

function showToast(msg, ms = 1400) {
    clearTimeout(toastTimer);
    toastEl.textContent = msg;
    toastEl.classList.remove('hidden');
    if (ms > 0) toastTimer = setTimeout(() => toastEl.classList.add('hidden'), ms);
}

function clearToast() {
    clearTimeout(toastTimer);
    toastEl.classList.add('hidden');
}

function setEnterLoading(on) {
    const enterKey = keyboardEl.querySelector('[data-key="ENTER"]');
    if (!enterKey) return;
    enterKey.textContent = on ? '...' : 'ENTER';
    enterKey.toggleAttribute('disabled', on);
}

function openModal(won, winMsg = '') {
    document.getElementById('modal-icon').textContent = won ? '🎉' : '😔';
    document.getElementById('modal-title').textContent = won ? winMsg : '¡Mejor suerte la próxima!';
    document.getElementById('modal-word-reveal').innerHTML =
        `La palabra era: <strong>${answer}</strong>`;
    document.getElementById('modal-attempts').textContent =
        won ? `En ${guesses.length} intento${guesses.length !== 1 ? 's' : ''}` : '';
    modalEl.classList.remove('hidden');
}

function getTile(r, c) { return document.getElementById(`tile-${r}-${c}`); }

// ── Event listeners ───────────────────────────────────

document.getElementById('btn-new-game').addEventListener('click', () => {
    modalEl.classList.add('hidden');
    initGame();
});

// Teclado virtual en móvil: tocar el tablero enfoca el input oculto
document.getElementById('board-container').addEventListener('click', () => hiddenInputEl.focus());

hiddenInputEl.addEventListener('keydown', e => {
    e.stopPropagation();
    if (e.key === 'Enter')     { e.preventDefault(); handleKey('ENTER'); }
    else if (e.key === 'Backspace') { e.preventDefault(); handleKey('BACKSPACE'); }
});

hiddenInputEl.addEventListener('input', () => {
    const val = hiddenInputEl.value;
    hiddenInputEl.value = '';
    for (const char of val) {
        const ch = normalizeVowel(char.toUpperCase());
        if (/^[A-ZÑ]$/.test(ch)) handleKey(ch);
    }
});

keyboardEl.addEventListener('click', e => {
    const key = e.target.closest('[data-key]');
    if (key) handleKey(key.dataset.key);
});

document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.target === hiddenInputEl) return;
    const k = e.key;
    if (k === 'Enter')     { handleKey('ENTER'); return; }
    if (k === 'Backspace') { handleKey('BACKSPACE'); return; }
    if (k.length === 1) {
        const ch = normalizeVowel(k.toUpperCase());
        if (/^[A-ZÑ]$/.test(ch)) handleKey(ch);
    }
});

function normalizeVowel(ch) {
    return ({ 'Á':'A','É':'E','Í':'I','Ó':'O','Ú':'U','Ü':'U' })[ch] ?? ch;
}

function normalizeWord(word) {
    return word.toUpperCase().split('').map(normalizeVowel).join('');
}

// ── Start ─────────────────────────────────────────────
initGame();
