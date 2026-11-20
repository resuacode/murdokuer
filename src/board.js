// Piezas compartidas entre la portada, el juego en línea y el PDF.
import { DIFFICULTIES, OBJECTS } from './puzzle.js';

export const ROOM_COLORS = ['#e3ede0', '#f4e8d4', '#dfe7f0', '#f2e1e3', '#e9e2f1', '#e0efeb', '#f1eed7', '#e7e5df'];

export const RULES = [
  'Coloca a cada persona (los sospechosos y la víctima) en una casilla: en cada fila y en cada columna hay exactamente una persona.',
  'Se puede estar en sillas, sofás y camas, pero no en casillas con plantas, estanterías, televisiones o pianos.',
  '"Junto a" significa en una casilla contigua (arriba, abajo, izquierda o derecha) de la misma habitación.',
  'El norte está arriba. "Más al norte" significa en cualquier fila superior; "justo una fila" significa la de al lado.',
  'Todas las pistas son ciertas. La persona culpable es la única que estaba a solas con la víctima en una habitación.',
];

export const STORY = 'Esta noche alguien no salió con vida de la casa. Ordena a los implicados en el plano y descubre quién se quedó a solas con la víctima.';

export const HOUSE_EMOJI = '🏠';

export const letter = (index) => String.fromCharCode(65 + index);
export const levelLabel = (puzzle) => DIFFICULTIES[puzzle.difficulty].label;

// Muros de cada casilla: true si ese lado separa habitaciones distintas o es la fachada.
export function roomBorders(puzzle, row, col) {
  const room = puzzle.roomGrid[row][col];
  const differs = (r, c) => puzzle.roomGrid[r]?.[c] !== room;
  return { top: differs(row - 1, col), bottom: differs(row + 1, col), left: differs(row, col - 1), right: differs(row, col + 1) };
}

// Casilla donde se rotula el nombre de cada habitación (la primera en orden de lectura).
export function labelCells(puzzle) {
  const cells = new Map();
  puzzle.roomGrid.forEach((row, r) => row.forEach((room, c) => { if (!cells.has(room)) cells.set(room, `${r},${c}`); }));
  return new Map([...cells].map(([room, key]) => [key, puzzle.rooms[room].name]));
}

export const clueEmoji = (puzzle, clue) => (clue.subject === undefined ? HOUSE_EMOJI : puzzle.people[clue.subject].emoji);

// Enlace para jugar en línea un caso concreto.
export function playUrl(puzzle, base = window.location.href) {
  const url = new URL('jugar.html', base);
  url.search = new URLSearchParams({ nivel: puzzle.difficulty, caso: puzzle.seed }).toString();
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
  container.replaceChildren(...puzzle.people.map((person, index) => {
    const item = make(tag, person.victim ? 'person victim' : 'person');
    if (tag === 'button') item.type = 'button';
    item.append(make('span', 'emoji', person.emoji));
    const text = make('span', 'person-text');
    text.append(make('b', '', person.name), make('small', '', person.victim ? `${person.role} · víctima` : person.role));
    item.append(text);
    decorate?.(item, index);
    return item;
  }));
}

export function renderClues(container, puzzle, { decorate } = {}) {
  container.replaceChildren(...puzzle.clues.map((clue, index) => {
    const item = make('li');
    item.append(make('span', 'emoji', clueEmoji(puzzle, clue)), make('span', 'clue-text', clue.text));
    decorate?.(item, index);
    return item;
  }));
}

export function renderRules(container) {
  container.replaceChildren(...RULES.map((rule) => make('li', '', rule)));
}
