import { DIFFICULTIES, OBJECTS, canOccupy, cellLabel } from './puzzle.js';
import { levelLabel, playUrl, renderBoard, renderClues, renderRules } from './board.js';
import { createPuzzle } from './generate.js';
import {
  clueStatus, conflicts, formatTime, giveHint, isComplete, isSolved, newGame, personAt, place, remove, reveal, toggleMark, wrongPlacements,
} from './game.js';
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
  keyMax: $('#key-max'),
  board: $('#board'),
  message: $('#message'),
  clues: $('#clue-list'),
  assist: $('#assist'),
  verdict: $('#verdict'),
  verdictTitle: $('#verdict-title'),
  verdictText: $('#verdict-text'),
  suspects: $('#suspects'),
};

const MARK = 'mark';
let puzzle = null;
let game = null;
let tool = 0;
let history = [];
let highlighted = new Set();
let focusIndex = 0;

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

// ---- Pintado ------------------------------------------------------------------------

function say(text) {
  elements.message.textContent = text;
}

function renderHeader() {
  elements.title.innerHTML = '';
  elements.title.append(puzzle.title, ' ', Object.assign(document.createElement('em'), { textContent: puzzle.subtitle }));
  elements.number.textContent = `EXPEDIENTE Nº ${puzzle.caseNumber}`;
  elements.level.textContent = `DIFICULTAD ${levelLabel(puzzle).toUpperCase()} · ${puzzle.size} × ${puzzle.size}`;
  elements.keyMax.textContent = puzzle.people.length;
  document.title = `${puzzle.title} ${puzzle.subtitle} — Murdokuer`;
  for (const button of elements.levels.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(button.dataset.difficulty === puzzle.difficulty));
  }
}

function renderTools() {
  const clashes = conflicts(game);
  elements.tools.replaceChildren();
  puzzle.people.forEach((person, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tool person-tool';
    if (person.victim) button.classList.add('victim');
    if (game.placements[index]) button.classList.add('placed');
    if (clashes.has(index)) button.classList.add('clash');
    if (game.locked.includes(index)) button.classList.add('locked');
    button.setAttribute('aria-pressed', String(tool === index));
    const where = game.placements[index] ? cellLabel(game.placements[index]) : 'sin colocar';
    button.title = `${person.name}, ${person.role}${person.victim ? ' (víctima)' : ''} · ${where}`;
    button.innerHTML = '<span class="emoji"></span><span class="tool-text"><b></b><small></small></span><kbd></kbd>';
    button.querySelector('.emoji').textContent = person.emoji;
    button.querySelector('b').textContent = person.name;
    button.querySelector('small').textContent = game.placements[index] ? where : person.victim ? 'víctima' : person.role;
    button.querySelector('kbd').textContent = index + 1;
    button.addEventListener('click', () => selectTool(index));
    elements.tools.append(button);
  });
  const mark = document.createElement('button');
  mark.type = 'button';
  mark.className = 'tool mark-tool';
  mark.setAttribute('aria-pressed', String(tool === MARK));
  mark.innerHTML = '<span class="emoji">✕</span><span class="tool-text"><b>Descartar</b><small>tacha casillas</small></span><kbd>X</kbd>';
  mark.addEventListener('click', () => selectTool(MARK));
  elements.tools.append(mark);
}

function renderGameBoard() {
  const clashes = conflicts(game);
  const cells = renderBoard(elements.board, puzzle, {
    cellTag: 'button',
    decorate(cell, row, col) {
      const index = row * puzzle.size + col;
      const person = personAt(game, row, col);
      const object = puzzle.objects[row][col];
      const room = puzzle.rooms[puzzle.roomGrid[row][col]].name;
      cell.dataset.index = index;
      cell.tabIndex = index === focusIndex ? 0 : -1;
      cell.setAttribute('role', 'gridcell');
      let label = `${cellLabel({ row, col })}, ${room}`;
      if (object) label += `, ${OBJECTS[object].name.replace(/^una? /, '')}`;
      if (!canOccupy(puzzle, { row, col })) cell.classList.add('blocked');
      if (person !== -1) {
        const token = document.createElement('span');
        token.className = 'token';
        token.textContent = puzzle.people[person].emoji;
        cell.append(token);
        cell.classList.add('occupied');
        if (clashes.has(person)) cell.classList.add('clash');
        if (highlighted.has(person)) cell.classList.add('wrong');
        if (game.locked.includes(person)) cell.classList.add('locked');
        if (game.finished && (person === puzzle.murderer || person === puzzle.victim)) cell.classList.add(person === puzzle.victim ? 'is-victim' : 'is-murderer');
        label += `: ${puzzle.people[person].name}`;
      } else if (game.marks.includes(`${row},${col}`)) {
        const mark = document.createElement('span');
        mark.className = 'mark';
        mark.textContent = '✕';
        cell.append(mark);
        label += ', descartada';
      }
      // Sombrea filas y columnas ya ocupadas para ayudar a descartar.
      const rowTaken = game.placements.some((p) => p && p.row === row);
      const colTaken = game.placements.some((p) => p && p.col === col);
      if (person === -1 && (rowTaken || colTaken)) cell.classList.add('shadowed');
      cell.setAttribute('aria-label', label);
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
  if (next === MARK) say('Modo descartar: toca casillas para tacharlas (también con clic derecho).');
  else say(`Colocando a ${puzzle.people[next].name}. Toca su casilla en el plano.`);
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
      if (!remove(game, occupant)) { history.pop(); say('Esa persona está confirmada por una ayuda.'); return; }
      say(`${puzzle.people[occupant].name} vuelve a estar sin colocar.`);
    } else {
      toggleMark(game, cell);
      say('');
    }
  } else {
    const wasHere = personAt(game, cell.row, cell.col) === action;
    const error = place(puzzle, game, action, cell);
    if (error) { history.pop(); say(error); return; }
    if (wasHere) say(`${puzzle.people[action].name} vuelve a estar sin colocar.`);
    else {
      say(`${puzzle.people[action].name} → ${cellLabel(cell)}.`);
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
    say('Todas las personas están en el plano, pero hay filas o columnas repetidas.');
  } else if (isSolved(puzzle, game)) {
    openVerdict();
  } else {
    say('Todas las personas están en el plano, pero algo no encaja con las pistas. Revisa las marcadas en rojo.');
    if (!elements.assist.checked) { elements.assist.checked = true; renderClueList(); }
  }
}

function openVerdict() {
  elements.verdictTitle.textContent = '¿Quién es culpable?';
  elements.verdictText.textContent = 'Las piezas están en su sitio. Señala a la persona que estaba a solas con la víctima.';
  elements.suspects.replaceChildren(...puzzle.people.flatMap((person, index) => {
    if (person.victim) return [];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'suspect-choice';
    button.innerHTML = '<span class="emoji"></span><b></b>';
    button.querySelector('.emoji').textContent = person.emoji;
    button.querySelector('b').textContent = person.name;
    button.addEventListener('click', () => accuse(index));
    return [button];
  }));
  elements.verdict.showModal();
}

function accuse(index) {
  const victim = puzzle.people[puzzle.victim];
  const room = puzzle.rooms[puzzle.crimeRoom];
  if (index !== puzzle.murderer) {
    elements.verdictText.textContent = `No: ${puzzle.people[index].name} no estaba a solas con ${victim.name}. Mira quién comparte habitación con la víctima.`;
    return;
  }
  game.finished = 'solved';
  save();
  const murderer = puzzle.people[index];
  const extras = [game.hintsUsed && `${game.hintsUsed} ayuda${game.hintsUsed > 1 ? 's' : ''}`, game.checksUsed && `${game.checksUsed} comprobaci${game.checksUsed > 1 ? 'ones' : 'ón'}`].filter(Boolean);
  elements.verdictTitle.textContent = '¡Caso resuelto!';
  elements.verdictText.textContent = `${murderer.name}, ${murderer.role}, estaba a solas con ${victim.name} en ${room.article}. Tiempo: ${formatTime(game.elapsed)}${extras.length ? ` · ${extras.join(' · ')}` : ' · sin ayudas'}.`;
  elements.suspects.replaceChildren();
  const again = document.createElement('button');
  again.type = 'button';
  again.textContent = `Otro caso ${levelLabel(puzzle).toLowerCase()}`;
  again.addEventListener('click', () => { elements.verdict.close(); startCase(puzzle.difficulty); });
  elements.suspects.append(again);
  renderAll();
  say(`Caso resuelto en ${formatTime(game.elapsed)}.`);
}

function undo() {
  const previous = history.pop();
  if (!previous || game.finished) return;
  Object.assign(game, JSON.parse(previous));
  highlighted = new Set();
  save();
  renderAll();
  say('Movimiento deshecho.');
}

function check() {
  const wrong = wrongPlacements(puzzle, game);
  game.checksUsed++;
  highlighted = new Set(wrong);
  save();
  renderAll();
  if (!game.placements.some(Boolean)) say('Todavía no has colocado a nadie.');
  else if (wrong.length === 0) say('Por ahora, todas las personas colocadas están en su sitio.');
  else say(`${wrong.length} persona${wrong.length > 1 ? 's están' : ' está'} mal colocada${wrong.length > 1 ? 's' : ''} (en rojo).`);
}

function hint() {
  snapshot();
  const person = giveHint(puzzle, game);
  if (person === null) { history.pop(); say('No hace falta ninguna ayuda: ya está todo colocado.'); return; }
  highlighted = new Set();
  say(`Ayuda: ${puzzle.people[person].name} está en ${cellLabel(puzzle.solution[person])}.`);
  tool = nextUnplaced(person);
  afterMove();
}

function restart() {
  if (game.placements.some(Boolean) && !game.finished && !window.confirm('¿Borrar todo lo colocado y empezar este caso de nuevo?')) return;
  game = newGame(puzzle);
  history = [];
  highlighted = new Set();
  tool = 0;
  save();
  renderAll();
  say('Caso reiniciado.');
}

function revealSolution() {
  if (!window.confirm('¿Seguro que quieres ver la solución? La partida terminará.')) return;
  reveal(puzzle, game);
  save();
  renderAll();
  const murderer = puzzle.people[puzzle.murderer];
  say(`Solución: ${murderer.name}, ${murderer.role}, estaba a solas con ${puzzle.people[puzzle.victim].name} en ${puzzle.rooms[puzzle.crimeRoom].article}.`);
}

async function downloadCurrent() {
  say('Preparando el PDF…');
  const { downloadPdf } = await import('./pdf.js');
  downloadPdf(puzzle, playUrl(puzzle));
  say('PDF descargado.');
}

async function share() {
  const url = playUrl(puzzle);
  try {
    await navigator.clipboard.writeText(url);
    say('Enlace copiado: quien lo abra jugará este mismo caso.');
  } catch {
    say(`Comparte este enlace: ${url}`);
  }
}

// ---- Arranque ----------------------------------------------------------------------

async function startCase(difficulty, seed) {
  say('Preparando el caso…');
  elements.board.classList.add('loading');
  try {
    puzzle = await createPuzzle(difficulty, seed);
  } catch (error) {
    console.error(error);
    say('No se ha podido generar el caso. Prueba otra vez.');
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
  const url = new URL(window.location.href);
  url.search = new URLSearchParams({ nivel: puzzle.difficulty, caso: puzzle.seed }).toString();
  window.history.replaceState(null, '', url);
  renderHeader();
  renderAll();
  if (game.finished === 'solved') say('Este caso ya lo resolviste. Puedes empezarlo de nuevo o elegir otro.');
  else if (game.placements.some(Boolean)) say('Partida recuperada: sigue donde lo dejaste.');
  else say(`Empieza colocando a ${puzzle.people[tool].name}, o a quien prefieras.`);
}

function buildLevelPicker() {
  for (const [key, settings] of Object.entries(DIFFICULTIES)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'level-chip';
    button.dataset.difficulty = key;
    button.innerHTML = `<b>${settings.label}</b><small>${settings.size} × ${settings.size}</small>`;
    button.addEventListener('click', () => {
      if (game && !game.finished && game.placements.some(Boolean) && !window.confirm('¿Dejar este caso y empezar uno nuevo? Tu avance se queda guardado en este navegador.')) return;
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
  if (!puzzle || elements.verdict.open || event.target.closest('input, textarea')) return;
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
renderRules($('#rules'));
buildLevelPicker();

const params = new URLSearchParams(window.location.search);
const requested = params.get('nivel');
const difficulty = DIFFICULTIES[requested] ? requested : DIFFICULTIES[readPreference('nivel')] ? readPreference('nivel') : 'media';
const seed = Number(params.get('caso'));
startCase(difficulty, Number.isInteger(seed) && seed > 0 ? seed : undefined);
