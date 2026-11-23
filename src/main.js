import { DIFFICULTIES } from './puzzle.js';
import { caseTitle, levelLabel, playUrl, renderBoard, renderClues, renderPeople, renderRules, story } from './board.js';
import { createPuzzle, createPuzzles, parallelism } from './generate.js';
import { downloadBooklet, downloadPdf } from './pdf.js';
import { BOOKLET_DEFAULT, BOOKLET_MIN, MIXED, bookletLevels, bookletLimit, clampCount, estimateSeconds } from './booklet.js';
import { locale, mountLanguagePicker, onLocaleChange, t, translateDocument } from './i18n/index.js';
import { levelName, slug } from './i18n/content.js';
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

let previewPuzzle = null;

function render(puzzle = previewPuzzle) {
  if (!puzzle) return;
  previewPuzzle = puzzle;
  const { title, subtitle } = caseTitle(puzzle);
  elements.title.replaceChildren(title, document.createElement('br'), Object.assign(document.createElement('em'), { textContent: subtitle }));
  elements.number.textContent = ` / ${t('caseNumber', puzzle.caseNumber)}`;
  elements.level.textContent = t('levelLine', levelLabel(puzzle).toUpperCase(), puzzle.size);
  elements.story.textContent = story();
  renderRules(elements.rules);
  renderPeople(elements.people, puzzle);
  renderClues(elements.clues, puzzle);
  renderBoard(elements.board, puzzle);
  elements.board.setAttribute('aria-label', t('boardAria', puzzle.size, puzzle.rooms.length));
  elements.playPreview.href = playUrl(puzzle);
}

function renderLevelButtons() {
  elements.levels.replaceChildren();
  for (const [key, settings] of Object.entries(DIFFICULTIES)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.difficulty = key;
    button.innerHTML = '<span>↓</span> <b></b> <small></small>';
    button.querySelector('b').textContent = levelName(key, locale());
    button.querySelector('small').textContent = `${settings.size} × ${settings.size}`;
    button.addEventListener('click', () => downloadOne(key));
    elements.levels.append(button);
  }
}

async function downloadOne(difficulty) {
  const buttons = [...elements.levels.querySelectorAll('button')];
  const code = locale();
  buttons.forEach((item) => { item.disabled = true; });
  elements.status.textContent = t('preparing');
  try {
    const puzzle = await createPuzzle(difficulty);
    downloadPdf(puzzle, playUrl(puzzle, code), code);
    render(puzzle);
    elements.status.textContent = t('caseReady', levelLabel(puzzle).toLowerCase());
  } catch (error) {
    console.error(error);
    elements.status.textContent = t('pdfError');
  } finally {
    buttons.forEach((item) => { item.disabled = false; });
  }
}

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

const CHOICES = [...Object.keys(DIFFICULTIES), MIXED];
const choiceLabel = (key) => (key === MIXED ? t('mixedLabel') : levelName(key, locale()));
const choiceDetail = (key) => (key === MIXED ? t('mixedDetail') : `${DIFFICULTIES[key].size} × ${DIFFICULTIES[key].size}`);

function readStored() {
  try { return JSON.parse(localStorage.getItem('murdokuer:cuadernillo')) ?? {}; } catch { return {}; }
}
function store(value) {
  try { localStorage.setItem('murdokuer:cuadernillo', JSON.stringify(value)); } catch { /* sin almacenamiento */ }
}

const stored = readStored();
let choice = CHOICES.includes(stored.choice) ? stored.choice : 'media';
let count = clampCount(choice, stored.count ?? BOOKLET_DEFAULT);
let running = null;
let note = '';

function renderBookletOptions() {
  booklet.levels.replaceChildren();
  for (const key of CHOICES) {
    const label = document.createElement('label');
    label.className = 'booklet-option';
    label.innerHTML = '<input type="radio" name="booklet-level" /><span><b></b><small></small></span>';
    const input = label.querySelector('input');
    input.value = key;
    input.checked = key === choice;
    input.disabled = Boolean(running);
    label.querySelector('b').textContent = choiceLabel(key);
    label.querySelector('small').textContent = `${choiceDetail(key)} · ${t('maxShort', bookletLimit(key))}`;
    input.addEventListener('change', () => {
      choice = key;
      const before = count;
      count = clampCount(choice, count);
      note = before !== count ? t('limitAdjusted', count) : '';
      updateBooklet();
    });
    booklet.levels.append(label);
  }
}

function updateBooklet() {
  const max = bookletLimit(choice);
  for (const input of [booklet.count, booklet.range]) {
    input.min = BOOKLET_MIN;
    input.max = max;
    input.value = count;
  }
  booklet.range.style.setProperty('--fill', `${((count - BOOKLET_MIN) / Math.max(1, max - BOOKLET_MIN)) * 100}%`);
  booklet.minus.disabled = Boolean(running) || count <= BOOKLET_MIN;
  booklet.plus.disabled = Boolean(running) || count >= max;
  booklet.limit.textContent = note || t('limitRange', BOOKLET_MIN, max);
  booklet.limit.classList.toggle('note', Boolean(note));
  const levels = bookletLevels(choice, count);
  const seconds = estimateSeconds(levels, parallelism());
  let mix = '';
  if (choice === MIXED) {
    const parts = Object.keys(DIFFICULTIES)
      .map((key) => [levelName(key, locale()), levels.filter((level) => level === key).length])
      .filter(([, n]) => n)
      .map(([label, n]) => t('mixItem', label, n));
    mix = ` (${parts.join(', ')})`;
  }
  const strong = document.createElement('strong');
  strong.textContent = `${t('summaryCases', count)}${mix}`;
  booklet.summary.replaceChildren(strong, t('summaryRest', count * 2, count, t('estimate', seconds)));
  store({ choice, count });
}

function setCount(value) {
  const max = bookletLimit(choice);
  count = clampCount(choice, value);
  note = Number(value) > max ? t('limitMax', max) : '';
  updateBooklet();
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
  // El idioma se fija al empezar: el cuadernillo sale entero en el idioma elegido.
  const code = locale();
  const levels = bookletLevels(choice, count);
  const controller = new AbortController();
  setRunning(controller);
  booklet.status.textContent = '';
  const started = performance.now();
  showProgress(0, t('generating', 0, levels.length));
  try {
    // La generación ocupa el 85 % de la barra y el montaje del PDF el resto.
    const puzzles = await createPuzzles(levels, {
      signal: controller.signal,
      onProgress: (done, total) => showProgress((done / total) * 0.85, done < total ? t('generating', done, total) : t('assembling')),
    });
    const suffix = slug(choice === MIXED ? t('mixedLabel') : levelName(choice, code));
    await downloadBooklet(puzzles, {
      code,
      urlFor: (puzzle) => playUrl(puzzle, code),
      filename: t('fileBooklet', suffix, puzzles.length),
      signal: controller.signal,
      onProgress: (done, total) => showProgress(0.85 + (done / total) * 0.15, t('assemblingPages', done * 2, total * 2)),
    });
    const seconds = Math.max(1, Math.round((performance.now() - started) / 1000));
    booklet.status.textContent = t('bookletDone', puzzles.length, puzzles.length * 2, seconds);
  } catch (error) {
    if (error.name === 'AbortError') booklet.status.textContent = t('bookletCancelled');
    else {
      console.error(error);
      booklet.status.textContent = t('bookletError');
    }
  } finally {
    setRunning(null);
  }
});

booklet.cancel.addEventListener('click', () => running?.abort());

// ---- Idioma -------------------------------------------------------------------------

function renderAll() {
  document.title = t('metaTitleHome');
  renderLevelButtons();
  renderBookletOptions();
  updateBooklet();
  render();
}

mountLanguagePicker(document.querySelector('#language'));
translateDocument();
renderAll();
onLocaleChange(() => {
  elements.status.textContent = '';
  booklet.status.textContent = '';
  note = '';
  renderAll();
});

createPuzzle('media').then(render).catch((error) => console.error(error));
