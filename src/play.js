import { DIFFICULTIES, canOccupy, cellLabel } from './puzzle.js';
import { caseTitle, levelLabel, personText, playUrl, renderBoard, renderClues, renderRules, roomText } from './board.js';
import { createPuzzle } from './generate.js';
import {
  clueStatus, conflicts, formatTime, giveHint, isComplete, isSolved, newGame, personAt, place, remove, reveal, toggleMark, wrongPlacements,
} from './game.js';
import { locale, mountLanguagePicker, onLocaleChange, t, translateDocument } from './i18n/index.js';
import { levelName, objectText } from './i18n/content.js';
import './style.css';
import './play.css';

const $ = (selector) => document.querySelector(selector);
const elements = {
  title: $('#case-title'),
  number: $('#case-number'),
  level: $('#case-level'),
  timer: $('#timer'),
  levels: $('#level-picker'),
  tools: $('#tools'),
  keysHelp: $('#keys-help'),
  board: $('#board'),
  message: $('#message'),
  clues: $('#clue-list'),
  assist: $('#assist'),
  verdict: $('#verdict'),
  verdictTitle: $('#verdict-title'),
  verdictText: $('#verdict-text'),
  verdictEyebrow: $('#verdict-eyebrow'),
  suspects: $('#suspects'),
};

const MARK = 'mark';
let puzzle = null;
let game = null;
let tool = 0;
let history = [];
let highlighted = new Set();
let focusIndex = 0;
// Último mensaje y estado del diálogo, guardados como clave + datos para poder traducirlos.
let message = null;
let verdict = null;

const person = (index) => personText(puzzle, index, locale());

// ---- Guardado local (comodidad: si falla, la partida sigue funcionando) ----------

const storageKey = () => `murdokuer:${puzzle.difficulty}:${puzzle.seed}`;
function save() {
  try { localStorage.setItem(storageKey(), JSON.stringify(game)); } catch { /* sin almacenamiento */ }
}
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey()));
    if (saved && saved.placements?.length === puzzle.people.length) return { ...newGame(puzzle), ...saved };
  } catch { /* sin almacenamiento */ }
  return newGame(puzzle);
}
function savePreference(key, value) {
  try { localStorage.setItem(`murdokuer:${key}`, value); } catch { /* sin almacenamiento */ }
}
function readPreference(key) {
  try { return localStorage.getItem(`murdokuer:${key}`); } catch { return null; }
}

// ---- Mensajes -----------------------------------------------------------------------

// `say(() => texto)`: la función se vuelve a evaluar si cambia el idioma.
function say(build) {
  message = build;
  elements.message.textContent = build ? build() : '';
}
const sayKey = (key, ...args) => say(() => t(key, ...args));

// ---- Pintado ------------------------------------------------------------------------

function renderHeader() {
  const { title, subtitle } = caseTitle(puzzle);
  elements.title.replaceChildren(title, ' ', Object.assign(document.createElement('em'), { textContent: subtitle }));
  elements.number.textContent = t('caseNumber', puzzle.caseNumber);
  elements.level.textContent = t('levelLine', levelLabel(puzzle).toUpperCase(), puzzle.size);
  elements.keysHelp.textContent = t('keysHelp', puzzle.people.length);
  document.title = t('playDocTitle', `${title} ${subtitle}`);
  for (const button of elements.levels.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(button.dataset.difficulty === puzzle.difficulty));
  }
}

function renderTools() {
  const clashes = conflicts(game);
  elements.tools.replaceChildren();
  puzzle.people.forEach((_, index) => {
    const who = person(index);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tool person-tool';
    if (who.victim) button.classList.add('victim');
    if (game.placements[index]) button.classList.add('placed');
    if (clashes.has(index)) button.classList.add('clash');
    if (game.locked.includes(index)) button.classList.add('locked');
    button.setAttribute('aria-pressed', String(tool === index));
    const where = game.placements[index] ? cellLabel(game.placements[index]) : t('unplaced');
    button.title = t('toolTitle', who.name, who.role, who.victim, where);
    button.innerHTML = '<span class="emoji"></span><span class="tool-text"><b></b><small></small></span><kbd></kbd>';
    button.querySelector('.emoji').textContent = who.emoji;
    button.querySelector('b').textContent = who.name;
    button.querySelector('small').textContent = game.placements[index] ? where : who.victim ? t('victimTag') : who.role;
    button.querySelector('kbd').textContent = index + 1;
    button.addEventListener('click', () => selectTool(index));
    elements.tools.append(button);
  });
  const mark = document.createElement('button');
  mark.type = 'button';
  mark.className = 'tool mark-tool';
  mark.setAttribute('aria-pressed', String(tool === MARK));
  mark.innerHTML = '<span class="emoji">✕</span><span class="tool-text"><b></b><small></small></span><kbd>X</kbd>';
  mark.querySelector('b').textContent = t('markTool');
  mark.querySelector('small').textContent = t('markNote');
  mark.addEventListener('click', () => selectTool(MARK));
  elements.tools.append(mark);
}

function renderGameBoard() {
  const clashes = conflicts(game);
  const code = locale();
  const cells = renderBoard(elements.board, puzzle, {
    cellTag: 'button',
    decorate(cell, row, col) {
      const index = row * puzzle.size + col;
      const occupant = personAt(game, row, col);
      const object = puzzle.objects[row][col];
      cell.dataset.index = index;
      cell.tabIndex = index === focusIndex ? 0 : -1;
      cell.setAttribute('role', 'gridcell');
      if (!canOccupy(puzzle, { row, col })) cell.classList.add('blocked');
      const discarded = occupant === -1 && game.marks.includes(`${row},${col}`);
      if (occupant !== -1) {
        const token = document.createElement('span');
        token.className = 'token';
        token.textContent = puzzle.people[occupant].emoji;
        cell.append(token);
        cell.classList.add('occupied');
        if (clashes.has(occupant)) cell.classList.add('clash');
        if (highlighted.has(occupant)) cell.classList.add('wrong');
        if (game.locked.includes(occupant)) cell.classList.add('locked');
        if (game.finished && (occupant === puzzle.murderer || occupant === puzzle.victim)) cell.classList.add(occupant === puzzle.victim ? 'is-victim' : 'is-murderer');
      } else if (discarded) {
        const markIcon = document.createElement('span');
        markIcon.className = 'mark';
        markIcon.textContent = '✕';
        cell.append(markIcon);
      }
      // Sombrea filas y columnas ya ocupadas para ayudar a descartar.
      const rowTaken = game.placements.some((p) => p && p.row === row);
      const colTaken = game.placements.some((p) => p && p.col === col);
      if (occupant === -1 && (rowTaken || colTaken)) cell.classList.add('shadowed');
      cell.setAttribute('aria-label', t('cellAria', {
        cell: cellLabel({ row, col }),
        room: roomText(puzzle, puzzle.roomGrid[row][col], code).name,
        object: object ? objectText(object, code).noun : '',
        person: occupant !== -1 ? person(occupant).name : '',
        discarded,
      }));
    },
  });
  cells.forEach((cell) => {
    cell.addEventListener('click', () => onCell(Number(cell.dataset.index)));
    cell.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      onCell(Number(cell.dataset.index), MARK);
    });
  });
  elements.board.classList.toggle('finished', Boolean(game.finished));
}

function renderClueList() {
  const status = clueStatus(puzzle, game);
  renderClues(elements.clues, puzzle, {
    decorate(item, index) {
      item.tabIndex = 0;
      item.setAttribute('role', 'button');
      if (game.struck.includes(index)) item.classList.add('struck');
      if (elements.assist.checked || game.finished) item.classList.add(status[index]);
      item.setAttribute('aria-pressed', String(game.struck.includes(index)));
      const toggle = () => {
        game.struck = game.struck.includes(index) ? game.struck.filter((i) => i !== index) : [...game.struck, index];
        save();
        renderClueList();
        elements.clues.children[index]?.focus();
      };
      item.addEventListener('click', toggle);
      item.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(); }
      });
    },
  });
}

function renderAll() {
  renderTools();
  renderGameBoard();
  renderClueList();
  elements.timer.textContent = formatTime(game.elapsed);
  for (const id of ['#undo', '#check', '#hint', '#restart', '#reveal']) $(id).disabled = Boolean(game.finished) && id !== '#restart';
  $('#undo').disabled ||= history.length === 0;
}

// ---- Acciones ----------------------------------------------------------------------

function snapshot() {
  history.push(JSON.stringify({ placements: game.placements, marks: game.marks, locked: game.locked }));
  if (history.length > 200) history.shift();
}

function selectTool(next) {
  tool = next;
  renderTools();
  if (next === MARK) sayKey('markMode');
  else say(() => t('placing', person(next).name));
}

function nextUnplaced(after) {
  const total = puzzle.people.length;
  for (let step = 1; step <= total; step++) {
    const candidate = (after + step) % total;
    if (!game.placements[candidate]) return candidate;
  }
  return after;
}

function onCell(index, forced) {
  if (!game || game.finished) return;
  const cell = { row: Math.floor(index / puzzle.size), col: index % puzzle.size };
  focusIndex = index;
  highlighted = new Set();
  const action = forced ?? tool;
  snapshot();
  if (action === MARK) {
    const occupant = personAt(game, cell.row, cell.col);
    if (occupant !== -1) {
      if (!remove(game, occupant)) { history.pop(); sayKey('err_locked'); return; }
      say(() => t('unplacedAgain', person(occupant).name));
    } else {
      toggleMark(game, cell);
      say(null);
    }
  } else {
    const wasHere = personAt(game, cell.row, cell.col) === action;
    const error = place(puzzle, game, action, cell);
    if (error) { history.pop(); sayKey(`err_${error}`); return; }
    if (wasHere) say(() => t('unplacedAgain', person(action).name));
    else {
      say(() => t('placedAt', person(action).name, cellLabel(cell)));
      tool = nextUnplaced(action);
    }
  }
  afterMove();
  elements.board.querySelector(`[data-index="${index}"]`)?.focus();
}

function afterMove() {
  save();
  renderAll();
  if (!isComplete(game) || game.finished) return;
  if (conflicts(game).size) {
    sayKey('duplicates');
  } else if (isSolved(puzzle, game)) {
    openVerdict();
  } else {
    sayKey('mismatch');
    if (!elements.assist.checked) { elements.assist.checked = true; renderClueList(); }
  }
}

// ---- Acusación ---------------------------------------------------------------------

function renderVerdict() {
  if (!verdict) return;
  const victim = person(puzzle.victim);
  elements.suspects.replaceChildren();
  if (verdict.state === 'solved') {
    const murderer = person(puzzle.murderer);
    const extras = [game.hintsUsed && t('extraHints', game.hintsUsed), game.checksUsed && t('extraChecks', game.checksUsed)].filter(Boolean);
    elements.verdictTitle.textContent = t('solvedTitle');
    elements.verdictText.textContent = t('solvedText', {
      murderer: murderer.name,
      role: murderer.role,
      victim: victim.name,
      roomIn: roomText(puzzle, puzzle.crimeRoom, locale()).in,
      time: formatTime(game.elapsed),
      extras: extras.length ? extras.join(' · ') : t('noHelp'),
      gender: murderer.gender,
    });
    const again = document.createElement('button');
    again.type = 'button';
    again.textContent = t('anotherCase', levelLabel(puzzle).toLowerCase());
    again.addEventListener('click', () => { elements.verdict.close(); startCase(puzzle.difficulty); });
    elements.suspects.append(again);
    return;
  }
  elements.verdictTitle.textContent = t('verdictQuestion');
  if (verdict.wrong === undefined) elements.verdictText.textContent = t('verdictPrompt');
  else {
    const wrong = person(verdict.wrong);
    elements.verdictText.textContent = t('wrongAccuse', wrong.name, victim.name, wrong.gender);
  }
  elements.suspects.replaceChildren(...puzzle.people.flatMap((_, index) => {
    const who = person(index);
    if (who.victim) return [];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'suspect-choice';
    button.innerHTML = '<span class="emoji"></span><b></b>';
    button.querySelector('.emoji').textContent = who.emoji;
    button.querySelector('b').textContent = who.name;
    button.addEventListener('click', () => accuse(index));
    return [button];
  }));
}

function openVerdict() {
  verdict = { state: 'asking' };
  renderVerdict();
  elements.verdict.showModal();
}

function accuse(index) {
  if (index !== puzzle.murderer) {
    verdict = { state: 'asking', wrong: index };
    renderVerdict();
    return;
  }
  game.finished = 'solved';
  save();
  verdict = { state: 'solved' };
  renderVerdict();
  renderAll();
  const time = formatTime(game.elapsed);
  sayKey('solvedStatus', time);
}

elements.verdict.addEventListener('close', () => { verdict = null; });

function undo() {
  const previous = history.pop();
  if (!previous || game.finished) return;
  Object.assign(game, JSON.parse(previous));
  highlighted = new Set();
  save();
  renderAll();
  sayKey('undone');
}

function check() {
  const wrong = wrongPlacements(puzzle, game);
  game.checksUsed++;
  highlighted = new Set(wrong);
  save();
  renderAll();
  if (!game.placements.some(Boolean)) sayKey('nothingPlaced');
  else if (wrong.length === 0) sayKey('allCorrect');
  else sayKey('wrongCount', wrong.length);
}

function hint() {
  snapshot();
  const helped = giveHint(puzzle, game);
  if (helped === null) { history.pop(); sayKey('noHintNeeded'); return; }
  highlighted = new Set();
  say(() => t('hintText', person(helped).name, cellLabel(puzzle.solution[helped])));
  tool = nextUnplaced(helped);
  afterMove();
}

function restart() {
  if (game.placements.some(Boolean) && !game.finished && !window.confirm(t('confirmRestart'))) return;
  game = newGame(puzzle);
  history = [];
  highlighted = new Set();
  tool = 0;
  save();
  renderAll();
  sayKey('restarted');
}

function revealSolution() {
  if (!window.confirm(t('confirmReveal'))) return;
  reveal(puzzle, game);
  save();
  renderAll();
  say(() => {
    const murderer = person(puzzle.murderer);
    return t('solutionText', {
      murderer: murderer.name,
      role: murderer.role,
      victim: person(puzzle.victim).name,
      roomIn: roomText(puzzle, puzzle.crimeRoom, locale()).in,
      gender: murderer.gender,
    });
  });
}

async function downloadCurrent() {
  sayKey('pdfPreparing');
  const code = locale();
  const { downloadPdf } = await import('./pdf.js');
  downloadPdf(puzzle, playUrl(puzzle, code), code);
  sayKey('pdfDone');
}

async function share() {
  const url = playUrl(puzzle);
  try {
    await navigator.clipboard.writeText(url);
    sayKey('linkCopied');
  } catch {
    sayKey('shareLink', url);
  }
}

// ---- Arranque ----------------------------------------------------------------------

function updateUrl() {
  const url = new URL(window.location.href);
  url.search = new URLSearchParams({ nivel: puzzle.difficulty, caso: puzzle.seed, lang: locale() }).toString();
  window.history.replaceState(null, '', url);
}

async function startCase(difficulty, seed) {
  sayKey('preparing');
  elements.board.classList.add('loading');
  try {
    puzzle = await createPuzzle(difficulty, seed);
  } catch (error) {
    console.error(error);
    sayKey('loadError');
    elements.board.classList.remove('loading');
    return;
  }
  elements.board.classList.remove('loading');
  game = load();
  history = [];
  highlighted = new Set();
  tool = nextUnplaced(-1);
  focusIndex = 0;
  savePreference('nivel', difficulty);
  updateUrl();
  renderHeader();
  renderAll();
  if (game.finished === 'solved') sayKey('alreadySolved');
  else if (game.placements.some(Boolean)) sayKey('resumed');
  else {
    const first = tool;
    say(() => t('startWith', person(first).name));
  }
}

function buildLevelPicker() {
  elements.levels.replaceChildren();
  for (const [key, settings] of Object.entries(DIFFICULTIES)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'level-chip';
    button.dataset.difficulty = key;
    button.innerHTML = '<b></b><small></small>';
    button.querySelector('b').textContent = levelName(key, locale());
    button.querySelector('small').textContent = `${settings.size} × ${settings.size}`;
    button.setAttribute('aria-pressed', String(puzzle?.difficulty === key));
    button.addEventListener('click', () => {
      if (game && !game.finished && game.placements.some(Boolean) && !window.confirm(t('confirmLeave'))) return;
      startCase(key);
    });
    elements.levels.append(button);
  }
}

function moveFocus(delta) {
  const total = puzzle.size * puzzle.size;
  const { size } = puzzle;
  let next = focusIndex;
  if (delta === 'left' && focusIndex % size > 0) next--;
  if (delta === 'right' && focusIndex % size < size - 1) next++;
  if (delta === 'up' && focusIndex >= size) next -= size;
  if (delta === 'down' && focusIndex + size < total) next += size;
  focusIndex = next;
  elements.board.querySelectorAll('.cell').forEach((cell) => { cell.tabIndex = Number(cell.dataset.index) === next ? 0 : -1; });
  elements.board.querySelector(`[data-index="${next}"]`)?.focus();
}

document.addEventListener('keydown', (event) => {
  if (!puzzle || elements.verdict.open || event.target.closest('input, textarea, select')) return;
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); undo(); return; }
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const number = Number(event.key);
  if (number >= 1 && number <= puzzle.people.length) { selectTool(number - 1); return; }
  if (event.key.toLowerCase() === 'x') { selectTool(MARK); return; }
  if (event.target.classList?.contains('cell')) {
    const directions = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
    if (directions[event.key]) { event.preventDefault(); moveFocus(directions[event.key]); }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      const occupant = personAt(game, Math.floor(focusIndex / puzzle.size), focusIndex % puzzle.size);
      if (occupant !== -1) onCell(focusIndex, MARK);
    }
  }
});

setInterval(() => {
  if (!game || game.finished || document.hidden || elements.verdict.open) return;
  game.elapsed++;
  elements.timer.textContent = formatTime(game.elapsed);
  if (game.elapsed % 5 === 0) save();
}, 1000);

elements.assist.checked = readPreference('ayudas') !== 'no';
elements.assist.addEventListener('change', () => {
  savePreference('ayudas', elements.assist.checked ? 'si' : 'no');
  renderClueList();
});
$('#undo').addEventListener('click', undo);
$('#check').addEventListener('click', check);
$('#hint').addEventListener('click', hint);
$('#restart').addEventListener('click', restart);
$('#reveal').addEventListener('click', revealSolution);
$('#pdf').addEventListener('click', downloadCurrent);
$('#share').addEventListener('click', share);

// ---- Idioma -------------------------------------------------------------------------

mountLanguagePicker($('#language'));
translateDocument();
renderRules($('#rules'));
buildLevelPicker();
onLocaleChange(() => {
  renderRules($('#rules'));
  buildLevelPicker();
  if (!puzzle) return;
  updateUrl();
  renderHeader();
  renderAll();
  renderVerdict();
  if (message) say(message);
});

const params = new URLSearchParams(window.location.search);
const requested = params.get('nivel');
const difficulty = DIFFICULTIES[requested] ? requested : DIFFICULTIES[readPreference('nivel')] ? readPreference('nivel') : 'media';
const seed = Number(params.get('caso'));
startCase(difficulty, Number.isInteger(seed) && seed > 0 ? seed : undefined);
