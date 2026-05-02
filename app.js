'use strict';

const WORDS = [
  // A
  "ABRIR","ABUSO","AEREO","AGRIO","AGUDO","AGUJA","AJENO","ALAMO","ALERO","ALFIL",
  "ALGAS","ALIÑO","ALISO","ALTAR","ALZAR","AMADO","AMAGO","AMBAR","AMENO","AMIGA",
  "AMIGO","ANCHO","ANCLA","ANDAR","ANTES","AÑEJO","AÑORO","APODO","APOYA","APURO",
  "AQUEL","ARCOS","ARDOR","ARDER","ARDUO","ARENA","AREPA","ARGOT","ARMAR","ARMAS",
  "AROMA","ARPON","ARTES","ASADO","ASEAR","ASILO","ASOMO","ASTRO","ATADO","ATAJO",
  "ATLAS","ATAUD","ATICO","ATRIL","ATRIO","ATROZ","AUDAZ","AUDIO","AUTOR","AVARO",
  "AVENA","AVION","AVISO","AXILA","AYUDA","AYUNO","AZOTE","AHORA",
  // B
  "BABOR","BAILE","BANCO","BANDO","BARBA","BARCO","BARRO","BATIR","BEBER","BELLO",
  "BICHO","BLUSA","BOLSA","BOLLO","BOMBA","BORDE","BOXEO","BRAZO","BRAVO","BRAZA",
  "BREGA","BREVE","BREZO","BRIDA","BRISA","BROMA","BROTE","BRUJA","BRUJO","BUENO",
  "BUQUE","BULTO","BURLA","BURRO","BUSCA","BUSTO","BAÑAR",
  // C
  "CABLE","CABRA","CACTO","CAIDO","CALAR","CALDO","CALMA","CALOR","CALVO","CAMPO",
  "CANAL","CANOA","CANTO","CAPAZ","CARGO","CARNE","CARPA","CARTA","CASCO","CASTO",
  "CAUSA","CAVAR","CEBRA","CENAR","CERDO","CERRO","CESTO","CETRO","CHICO","CHINA",
  "CICLO","CIEGO","CIELO","CIFRA","CINCO","CIRCO","CISNE","CITAR","CLARO","CLASE",
  "CLAVO","CLERO","CLIMA","COBRE","COBRO","COCER","COCHE","COFRE","COLMO","COLOR",
  "COMBO","COMER","CORAL","CORSO","CORZO","CORTO","COSTA","COSER","CREMA","CRUEL",
  "CRUDO","CROMO","CRUCE","CUAJO","CUERO","CUEVA","CULPA","CURAR","CURSI","CURVA",
  // D
  "DANZA","DARDO","DECIR","DEBER","DELTA","DENSO","DEUDA","DICHA","DICHO","DIETA",
  "DIGNO","DIQUE","DISCO","DOBLE","DOLOR","DOMAR","DONDE","DORSO","DROGA","DUCHA",
  "DUELO","DULCE","DUEÑO","DURAR",
  // E
  "EBRIO","ENANO","ENERO","ENTRE","ERROR","ETAPA",
  // F
  "FALDA","FALSO","FANGO","FARSA","FAVOR","FELIZ","FEROZ","FIBRA","FINCA","FIRMA",
  "FISCO","FLACO","FLECO","FLOTA","FOBIA","FONDO","FORMA","FORRO","FRASE","FRENO",
  "FRESA","FRUTA","FUEGO","FUGAZ","FURIA","FUSIL",
  // G
  "GAFAS","GALLO","GANAS","GANSO","GARZA","GARRA","GANAR","GASTO","GEMIR","GENIO",
  "GENTE","GIRAR","GLOBO","GOLPE","GORDO","GORRA","GOZAR","GRADO","GRAMO","GRANO",
  "GRASA","GRATO","GRIPE","GRUPO","GRUTA","GUAPO","GUISO","GUSTO",
  // H
  "HABLA","HACIA","HACHA","HAMPA","HECHO","HELAR","HEROE","HIELO","HIENA","HIMNO",
  "HOGAR","HONDA","HONOR","HONGO","HORCA","HORDA","HORNO","HOTEL","HUESO","HUEVO",
  "HUMOR","HURTO",
  // I
  "ICONO","IDEAL","IDOLO","IGUAL","ILESO","ILUSO","IMPAR","INDIO",
  // J
  "JABON","JAMON","JARRO","JASPE","JAULA","JEREZ","JOVEN","JUEGO","JUNTO","JURAR",
  "JUSTO",
  // K
  "KARMA","KOALA",
  // L
  "LABIO","LACRA","LAICO","LAMER","LANCE","LANZA","LAPSO","LARGO","LARVA","LASER",
  "LAVAR","LECHO","LEGUA","LEJOS","LENTE","LENTO","LETAL","LETRA","LIBRA","LIGAR",
  "LINCE","LINEA","LIRIO","LISTA","LITRO","LOCAL","LOCRO","LOGRO","LUNES","LUNAR",
  "LUCHA","LLAMA","LLANO","LLAVE",
  // M
  "MADRE","MACHO","MAGMA","MAGRO","MALVA","MAMBO","MAMUT","MANCO","MANGA","MANSO",
  "MANTA","MANTO","MARCA","MARCO","MAREA","MAREO","MARZO","MATAR","MATIZ","MAYOR",
  "MEDIA","MEJOR","MELON","MENOR","MENOS","MENTA","METAL","METRO","MIEDO","MILLA",
  "MIRAR","MISMO","MITAD","MOLDE","MOLAR","MOLER","MONJE","MONTE","MORAL","MORIR",
  "MORRO","MORSA","MOTOR","MOVER","MUELA","MUCHO","MUNDO","MUJER","MUGIR","MULTA",
  "MURAL","MURGA","MUSLO",
  // N
  "NACER","NAFTA","NARDO","NARIZ","NAVAL","NEGRO","NICHO","NIETO","NIMBO","NIÑEZ",
  "NIVEL","NOCHE","NOGAL","NORMA","NORIA","NORTE","NOVEL","NOVIA","NOVIO","NUEVA",
  "NUEVO","NUNCA",
  // O
  "OBRAR","OBVIO","OBRAS","OCASO","OJERA","OLIVA","OPACO","ORATE","ORDEN","ORGIA",
  "ORUGA","OSADO","OSTRA","OTEAR","OTERO","OTOÑO","OVEJA",
  // P
  "PADRE","PACTO","PAGAR","PAJAR","PALCO","PALMA","PAMPA","PANAL","PANDA","PANZA",
  "PAPEL","PARCO","PARED","PARRA","PASEO","PASMO","PASTA","PASTO","PATIO","PAUSA",
  "PAVOR","PECHO","PEDIR","PEGAR","PELAR","PERLA","PERRO","PICAR","PIEZA","PILAR",
  "PINAR","PINTO","PINZA","PISAR","PISTA","PLAGA","PLANO","PLATA","PLAYA","PLAZA",
  "PLENO","PLOMO","PLUMA","PODER","POLCA","POLVO","PONER","POTRO","PRADO","PRESA",
  "PRIMO","PRISA","PROSA","PULGA","PULIR","PULPO","PULSO","PUNTO","PURGA","PUÑAL",
  "PAÑAL",
  // Q
  "QUEJA","QUEMA","QUESO",
  // R
  "RABIA","RADIO","RANGO","RAPAZ","RAPTO","RASGO","RASPA","RATON","RAUDO","RECIO",
  "RECTA","RECTO","REGLA","REGIO","REINA","REINO","RELOJ","RENTA","RETAR","RESTO",
  "RETRO","REZAR","RIADA","RIEGO","RIFLE","RIGOR","RISCO","RITMO","RIVAL","ROBOT",
  "ROBLE","ROCIO","RODEO","ROLLO","ROMBO","RONDA","RONCO","ROSAL","ROSCA","RUBIA",
  "RUBIO","RUEDA","RUIDO","RUMBO","RURAL",
  // S
  "SAETA","SABIO","SABOR","SABLE","SAGAZ","SALIR","SALMO","SALSA","SALTO","SALUD",
  "SARNA","SARRO","SAUNA","SAUCE","SECAR","SELVA","SEMEN","SEÑAL","SEPIA","SERIE",
  "SERIO","SEXTO","SIDRA","SIEGA","SIGLO","SIGNO","SILLA","SIMIO","SISAL","SITIO",
  "SOBAR","SOBRA","SOBRE","SOCIO","SOLAZ","SOLAR","SOLER","SONAR","SOPOR","SORBO",
  "SORDO","SORNA","SUCIO","SUECO","SUELO","SUERO","SUEÑO","SUMAR","SURCO",
  // T
  "TABLA","TALLO","TANDA","TANTO","TAPAR","TAPIZ","TARDE","TAREA","TARRO","TASAR",
  "TECHO","TEMPO","TEMOR","TENER","TENUE","TERCO","TESIS","TEXTO","TIARA","TIBIA",
  "TIESO","TIGRE","TILDE","TIMAR","TINTO","TIRAR","TOCAR","TOLDO","TOMAR","TOQUE",
  "TORDO","TOREO","TORNO","TORPE","TORRE","TORSO","TOTAL","TRAGO","TRAMO","TRAPO",
  "TRATO","TRAZO","TRECE","TRETA","TRIGO","TRONO","TROPA","TROTE","TROZO","TRUFA",
  "TUMBO","TUMOR","TURBA","TURCO","TURNO","TUTOR",
  // U
  "UFANO","ULTRA","UNGIR","UNICO","UNTAR","URANO",
  // V
  "VACIO","VAINA","VALOR","VALLA","VAPOR","VASCO","VASTO","VEJEZ","VELAR","VELLO",
  "VELOZ","VENAS","VENGA","VENTA","VERDE","VERBO","VERSO","VIAJE","VIEJO","VIGOR",
  "VILLA","VIRAL","VIRAR","VIRUS","VISOR","VISTA","VITAL","VIUDA","VIVIR","VOCAL",
  "VODKA","VOLAR","VOTAR","VUELO","VULGO",
  // Y
  "YACER","YARDA","YEGUA","YERBA","YERNO","YERMO",
  // Z
  "ZAFIO","ZAMBO","ZARCO","ZARPA","ZARZO","ZORRA","ZORRO","ZUECO","ZUMBA","ZURDO",
];

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

const boardEl   = document.getElementById('board');
const keyboardEl= document.getElementById('keyboard');
const modalEl   = document.getElementById('modal');
const toastEl   = document.getElementById('toast');

// ── Dictionary validation ─────────────────────────────

function fetchWithTimeout(url, ms) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

async function isWordValid(word) {
    if (validCache.has(word)) return true;
    try {
        const resp = await fetchWithTimeout(
            `https://es.wiktionary.org/w/api.php?action=query&titles=${encodeURIComponent(word.toLowerCase())}&prop=info&format=json&origin=*`,
            5000
        );
        const data = await resp.json();
        const pageId = Object.keys(data.query.pages)[0];
        const exists = pageId !== '-1';
        if (exists) validCache.add(word);
        return exists;
    } catch {
        // Sin conexión o timeout: sólo acepta palabras del listado local
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

keyboardEl.addEventListener('click', e => {
    const key = e.target.closest('[data-key]');
    if (key) handleKey(key.dataset.key);
});

document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
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

// ── Start ─────────────────────────────────────────────
initGame();
