import { DIFFICULTIES } from './puzzle.js';
import { STORY, levelLabel, playUrl, renderBoard, renderClues, renderPeople, renderRules } from './board.js';
import { createPuzzle } from './generate.js';
import { downloadPdf } from './pdf.js';
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
