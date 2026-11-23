// Piezas compartidas entre la portada, el juego en línea y el PDF.
// Todo lo que se muestra se pide en un idioma concreto (por defecto, el activo).
import { OBJECTS } from './puzzle.js';
import { locale } from './i18n/index.js';
import * as content from './i18n/content.js';
import { dictionary, levelName } from './i18n/content.js';

export const ROOM_COLORS = ['#e3ede0', '#f4e8d4', '#dfe7f0', '#f2e1e3', '#e9e2f1', '#e0efeb', '#f1eed7', '#e7e5df'];

export const rules = (code = locale()) => dictionary(code).rules;
export const story = (code = locale()) => dictionary(code).story;
export const levelLabel = (puzzle, code = locale()) => levelName(puzzle.difficulty, code);
// Igual que en i18n/content.js, pero con el idioma activo cuando no se indica otro.
export const caseTitle = (puzzle, code = locale()) => content.caseTitle(puzzle, code);
export const clueText = (puzzle, clue, code = locale()) => content.clueText(puzzle, clue, code);
export const personText = (puzzle, index, code = locale()) => content.personText(puzzle, index, code);
export const roomText = (puzzle, index, code = locale()) => content.roomText(puzzle, index, code);

export const HOUSE_EMOJI = '🏠';

export const letter = (index) => String.fromCharCode(65 + index);

// Muros de cada casilla: true si ese lado separa habitaciones distintas o es la fachada.
export function roomBorders(puzzle, row, col) {
  const room = puzzle.roomGrid[row][col];
  const differs = (r, c) => puzzle.roomGrid[r]?.[c] !== room;
  return { top: differs(row - 1, col), bottom: differs(row + 1, col), left: differs(row, col - 1), right: differs(row, col + 1) };
}

// Casilla donde se rotula el nombre de cada habitación (la primera en orden de lectura).
export function labelCells(puzzle, code = locale()) {
  const cells = new Map();
  puzzle.roomGrid.forEach((row, r) => row.forEach((room, c) => { if (!cells.has(room)) cells.set(room, `${r},${c}`); }));
  return new Map([...cells].map(([room, key]) => [key, content.roomText(puzzle, room, code).name]));
}

export const clueEmoji = (puzzle, clue) => (clue.subject === undefined ? HOUSE_EMOJI : puzzle.people[clue.subject].emoji);

// Enlace para jugar en línea un caso concreto.
export function playUrl(puzzle, code = locale(), base = window.location.href) {
  const url = new URL('jugar.html', base);
  url.search = new URLSearchParams({ nivel: puzzle.difficulty, caso: puzzle.seed, lang: code }).toString();
  return url.toString();
}

const make = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};

/**
 * Dibuja el plano dentro de `container`.
 * `decorate(cell, row, col)` permite añadir personas o marcas; `cellTag: "button"` se usa en el juego.
 */
export function renderBoard(container, puzzle, { cellTag = 'span', decorate } = {}) {
  const labels = labelCells(puzzle);
  container.replaceChildren();
  container.style.setProperty('--size', puzzle.size);
  container.append(make('span', 'coordinate'));
  for (let c = 0; c < puzzle.size; c++) container.append(make('span', 'coordinate', letter(c)));
  const cells = [];
  puzzle.roomGrid.forEach((row, r) => {
    container.append(make('span', 'coordinate', r + 1));
    row.forEach((room, c) => {
      const cell = make(cellTag, 'cell');
      if (cellTag === 'button') cell.type = 'button';
      const borders = roomBorders(puzzle, r, c);
      cell.style.background = ROOM_COLORS[room % ROOM_COLORS.length];
      cell.style.borderWidth = ['top', 'right', 'bottom', 'left'].map((side) => (borders[side] ? '2px' : '0.5px')).join(' ');
      const object = puzzle.objects[r][c];
      if (object) {
        const icon = make('span', 'object', OBJECTS[object].emoji);
        if (!OBJECTS[object].occupiable) icon.classList.add('blocking');
        cell.append(icon);
      }
      const label = labels.get(`${r},${c}`);
      if (label) cell.append(make('span', 'room-label', label));
      decorate?.(cell, r, c);
      container.append(cell);
      cells.push(cell);
    });
  });
  return cells;
}

export function renderPeople(container, puzzle, { tag = 'div', decorate } = {}) {
  const code = locale();
  const victimTag = dictionary(code).ui.victimTag;
  container.replaceChildren(...puzzle.people.map((_, index) => {
    const person = content.personText(puzzle, index, code);
    const item = make(tag, person.victim ? 'person victim' : 'person');
    if (tag === 'button') item.type = 'button';
    item.append(make('span', 'emoji', person.emoji));
    const text = make('span', 'person-text');
    text.append(make('b', '', person.name), make('small', '', person.victim ? `${person.role} · ${victimTag}` : person.role));
    item.append(text);
    decorate?.(item, index);
    return item;
  }));
}

export function renderClues(container, puzzle, { decorate } = {}) {
  container.replaceChildren(...puzzle.clues.map((clue, index) => {
    const item = make('li');
    item.append(make('span', 'emoji', clueEmoji(puzzle, clue)), make('span', 'clue-text', content.clueText(puzzle, clue, locale())));
    decorate?.(item, index);
    return item;
  }));
}

export function renderRules(container) {
  container.replaceChildren(...rules().map((rule) => make('li', '', rule)));
}
