import { DIFFICULTIES } from './puzzle.js';
import { STORY, levelLabel, playUrl, renderBoard, renderClues, renderPeople, renderRules } from './board.js';
import { createPuzzle, createPuzzles, parallelism } from './generate.js';
import { downloadBooklet, downloadPdf } from './pdf.js';
import { BOOKLET_DEFAULT, BOOKLET_MIN, MIXED, bookletLevels, bookletLimit, clampCount, describeEstimate, estimateSeconds } from './booklet.js';
import './style.css';

const elements = {
  board: document.querySelector('#board'),
  title: document.querySelector('#case-title'),
  number: document.querySelector('#case-number'),
  level: document.querySelector('#case-level'),
  story: document.querySelector('#story'),
  rules: document.querySelector('#rules'),
  people: document.querySelector('#people'),
  clues: document.querySelector('#clue-list'),
  status: document.querySelector('#status'),
  playPreview: document.querySelector('#play-preview'),
  levels: document.querySelector('#levels'),
};

function render(puzzle) {
  elements.title.replaceChildren(puzzle.title, document.createElement('br'), Object.assign(document.createElement('em'), { textContent: puzzle.subtitle }));
  elements.number.textContent = ` / EXPEDIENTE Nº ${puzzle.caseNumber}`;
  elements.level.textContent = `DIFICULTAD ${levelLabel(puzzle).toUpperCase()} · ${puzzle.size} × ${puzzle.size}`;
  elements.story.textContent = STORY;
  renderRules(elements.rules);
  renderPeople(elements.people, puzzle);
  renderClues(elements.clues, puzzle);
  renderBoard(elements.board, puzzle);
  elements.board.setAttribute('aria-label', `Plano de ${puzzle.size} por ${puzzle.size} casillas con ${puzzle.rooms.length} habitaciones.`);
  elements.playPreview.href = playUrl(puzzle);
}

for (const [key, settings] of Object.entries(DIFFICULTIES)) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.difficulty = key;
  button.innerHTML = `<span>↓</span> ${settings.label} <small>${settings.size} × ${settings.size}</small>`;
  elements.levels.append(button);
}

const buttons = [...elements.levels.querySelectorAll('button')];
for (const button of buttons) {
  button.addEventListener('click', async () => {
    buttons.forEach((item) => { item.disabled = true; });
    elements.status.textContent = 'Preparando el caso…';
    try {
      const puzzle = await createPuzzle(button.dataset.difficulty);
      downloadPdf(puzzle, playUrl(puzzle));
      render(puzzle);
      elements.status.textContent = `Tu nuevo caso (dificultad ${levelLabel(puzzle).toLowerCase()}) está listo.`;
    } catch (error) {
      console.error(error);
      elements.status.textContent = 'No se ha podido generar el PDF. Inténtalo de nuevo.';
    } finally {
      buttons.forEach((item) => { item.disabled = false; });
    }
  });
}

createPuzzle('media').then(render).catch((error) => console.error(error));

// ---- Cuadernillo --------------------------------------------------------------------

const booklet = {
  form: document.querySelector('#booklet-form'),
  levels: document.querySelector('#booklet-levels'),
  count: document.querySelector('#booklet-count'),
  range: document.querySelector('#booklet-range'),
  minus: document.querySelector('#count-minus'),
  plus: document.querySelector('#count-plus'),
  limit: document.querySelector('#booklet-limit'),
  summary: document.querySelector('#booklet-summary'),
  submit: document.querySelector('#booklet-submit'),
  progress: document.querySelector('#booklet-progress'),
  bar: document.querySelector('#booklet-bar'),
  progressText: document.querySelector('#booklet-progress-text'),
  cancel: document.querySelector('#booklet-cancel'),
  status: document.querySelector('#booklet-status'),
};

const CHOICES = [
  ...Object.entries(DIFFICULTIES).map(([key, settings]) => ({ key, label: settings.label, detail: `${settings.size} × ${settings.size}` })),
  { key: MIXED, label: 'Mezcla', detail: 'de fácil a maestro' },
];

function readStored() {
  try { return JSON.parse(localStorage.getItem('murdokuer:cuadernillo')) ?? {}; } catch { return {}; }
}
function store(value) {
  try { localStorage.setItem('murdokuer:cuadernillo', JSON.stringify(value)); } catch { /* sin almacenamiento */ }
}

const stored = readStored();
let choice = CHOICES.some((item) => item.key === stored.choice) ? stored.choice : 'media';
let count = clampCount(choice, stored.count ?? BOOKLET_DEFAULT);
let running = null;

for (const item of CHOICES) {
  const label = document.createElement('label');
  label.className = 'booklet-option';
  label.innerHTML = '<input type="radio" name="booklet-level" /><span><b></b><small></small></span>';
  const input = label.querySelector('input');
  input.value = item.key;
  input.checked = item.key === choice;
  label.querySelector('b').textContent = item.label;
  label.querySelector('small').textContent = `${item.detail} · máx. ${bookletLimit(item.key)}`;
  input.addEventListener('change', () => {
    choice = item.key;
    const before = count;
    count = clampCount(choice, count);
    updateBooklet(before !== count ? `Ajustado a ${count}: es el máximo para este nivel.` : '');
  });
  booklet.levels.append(label);
}

const plural = (value, one, many) => `${value} ${value === 1 ? one : many}`;

function updateBooklet(note = '') {
  const max = bookletLimit(choice);
  for (const input of [booklet.count, booklet.range]) {
    input.min = BOOKLET_MIN;
    input.max = max;
    input.value = count;
  }
  booklet.range.style.setProperty('--fill', `${((count - BOOKLET_MIN) / Math.max(1, max - BOOKLET_MIN)) * 100}%`);
  booklet.minus.disabled = Boolean(running) || count <= BOOKLET_MIN;
  booklet.plus.disabled = Boolean(running) || count >= max;
  booklet.limit.textContent = note || `Entre ${BOOKLET_MIN} y ${max} casos para este nivel.`;
  booklet.limit.classList.toggle('note', Boolean(note));
  const levels = bookletLevels(choice, count);
  const seconds = estimateSeconds(levels, parallelism());
  let mix = '';
  if (choice === MIXED) {
    const counts = Object.keys(DIFFICULTIES).map((key) => [DIFFICULTIES[key].label.toLowerCase(), levels.filter((level) => level === key).length]).filter(([, n]) => n);
    mix = ` (${counts.map(([label, n]) => `${n} ${label}`).join(', ')})`;
  }
  booklet.summary.innerHTML = '';
  const strong = document.createElement('strong');
  strong.textContent = `${plural(count, 'caso', 'casos')}${mix}`;
  booklet.summary.append(strong, ` · ${count * 2} páginas en ${plural(count, 'hoja', 'hojas')} a doble cara · listo en ${describeEstimate(seconds)}`);
  store({ choice, count });
}

function setCount(value, note) {
  const max = bookletLimit(choice);
  const clamped = clampCount(choice, value);
  count = clamped;
  updateBooklet(note ?? (Number(value) > max ? `El máximo para este nivel es ${max}.` : ''));
}

booklet.minus.addEventListener('click', () => setCount(count - 1));
booklet.plus.addEventListener('click', () => setCount(count + 1));
booklet.range.addEventListener('input', () => setCount(booklet.range.value));
booklet.count.addEventListener('change', () => setCount(booklet.count.value));
booklet.count.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') { event.preventDefault(); setCount(booklet.count.value); }
});

function setRunning(state) {
  running = state;
  booklet.form.classList.toggle('running', Boolean(state));
  booklet.progress.hidden = !state;
  booklet.submit.hidden = Boolean(state);
  for (const control of booklet.form.querySelectorAll('input')) control.disabled = Boolean(state);
  updateBooklet();
}

function showProgress(fraction, text) {
  const percent = Math.round(fraction * 100);
  booklet.bar.style.width = `${percent}%`;
  booklet.progress.querySelector('[role="progressbar"]').setAttribute('aria-valuenow', percent);
  booklet.progressText.textContent = text;
}

booklet.form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (running) return;
  setCount(booklet.count.value);
  const levels = bookletLevels(choice, count);
  const controller = new AbortController();
  setRunning(controller);
  booklet.status.textContent = '';
  const started = performance.now();
  showProgress(0, `Generando casos: 0 de ${levels.length} listos…`);
  try {
    // La generación ocupa el 85 % de la barra y el montaje del PDF el resto.
    const puzzles = await createPuzzles(levels, {
      signal: controller.signal,
      onProgress: (done, total) => showProgress((done / total) * 0.85, done < total ? `Generando casos: ${done} de ${total} listos…` : 'Montando el PDF…'),
    });
    const suffix = choice === MIXED ? 'mezcla' : choice;
    await downloadBooklet(puzzles, {
      urlFor: (puzzle) => playUrl(puzzle),
      filename: `murdokuer-cuadernillo-${suffix}-${puzzles.length}-casos.pdf`,
      signal: controller.signal,
      onProgress: (done, total) => showProgress(0.85 + (done / total) * 0.15, `Montando el PDF: página ${done * 2} de ${total * 2}…`),
    });
    const seconds = Math.max(1, Math.round((performance.now() - started) / 1000));
    booklet.status.textContent = `Cuadernillo descargado: ${plural(puzzles.length, 'caso', 'casos')}, ${puzzles.length * 2} páginas (${plural(seconds, 'segundo', 'segundos')}).`;
  } catch (error) {
    if (error.name === 'AbortError') booklet.status.textContent = 'Cuadernillo cancelado.';
    else {
      console.error(error);
      booklet.status.textContent = 'No se ha podido preparar el cuadernillo. Inténtalo de nuevo con menos casos.';
    }
  } finally {
    setRunning(null);
  }
});

booklet.cancel.addEventListener('click', () => running?.abort());
updateBooklet();
