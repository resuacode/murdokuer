// Estado y reglas de una partida en línea (sin DOM, para poder probarlo).
import { canOccupy, clueHolds, clueParticipants } from './puzzle.js';

const sameCell = (a, b) => a && b && a.row === b.row && a.col === b.col;

export function newGame(puzzle) {
  return {
    placements: puzzle.people.map(() => null),
    marks: [],
    struck: [],
    locked: [],
    hintsUsed: 0,
    checksUsed: 0,
    elapsed: 0,
    finished: null, // 'solved' | 'revealed'
  };
}

export function personAt(game, row, col) {
  return game.placements.findIndex((cell) => sameCell(cell, { row, col }));
}

// Coloca a una persona (o la quita si ya estaba ahí).
// Si no se puede, devuelve un código: 'locked', 'lockedCell' o 'blocked'.
export function place(puzzle, game, person, cell) {
  if (game.locked.includes(person)) return 'locked';
  if (!canOccupy(puzzle, cell)) return 'blocked';
  if (sameCell(game.placements[person], cell)) {
    game.placements[person] = null;
    return null;
  }
  const other = personAt(game, cell.row, cell.col);
  if (other !== -1) {
    if (game.locked.includes(other)) return 'lockedCell';
    game.placements[other] = null;
  }
  game.placements[person] = { row: cell.row, col: cell.col };
  game.marks = game.marks.filter((key) => key !== `${cell.row},${cell.col}`);
  return null;
}

export function remove(game, person) {
  if (game.locked.includes(person)) return false;
  game.placements[person] = null;
  return true;
}

export function toggleMark(game, { row, col }) {
  const key = `${row},${col}`;
  if (personAt(game, row, col) !== -1) return;
  game.marks = game.marks.includes(key) ? game.marks.filter((item) => item !== key) : [...game.marks, key];
}

// Personas que comparten fila o columna con otra.
export function conflicts(game) {
  const result = new Set();
  game.placements.forEach((a, i) => game.placements.forEach((b, j) => {
    if (i < j && a && b && (a.row === b.row || a.col === b.col)) { result.add(i); result.add(j); }
  }));
  return result;
}

// Estado de cada pista: 'ok', 'broken' o 'pending' (faltan personas por colocar).
export function clueStatus(puzzle, game) {
  const complete = game.placements.every(Boolean);
  return puzzle.clues.map((clue) => {
    const participants = clueParticipants(clue);
    const ready = participants ? participants.every((person) => game.placements[person]) : complete;
    if (!ready) return 'pending';
    return clueHolds(puzzle, clue, game.placements) ? 'ok' : 'broken';
  });
}

export const isComplete = (game) => game.placements.every(Boolean);

export function isSolved(puzzle, game) {
  return puzzle.solution.every((cell, person) => sameCell(cell, game.placements[person]));
}

export function wrongPlacements(puzzle, game) {
  return game.placements.flatMap((cell, person) => (cell && !sameCell(cell, puzzle.solution[person]) ? [person] : []));
}

// Ayuda: coloca correctamente a una persona (primero corrige las mal colocadas).
export function giveHint(puzzle, game) {
  const wrong = wrongPlacements(puzzle, game).filter((person) => !game.locked.includes(person));
  const missing = game.placements.flatMap((cell, person) => (!cell ? [person] : []));
  const person = wrong[0] ?? missing[0];
  if (person === undefined) return null;
  const target = puzzle.solution[person];
  const other = personAt(game, target.row, target.col);
  if (other !== -1) game.placements[other] = null;
  game.placements[person] = { ...target };
  game.marks = game.marks.filter((key) => key !== `${target.row},${target.col}`);
  game.locked.push(person);
  game.hintsUsed++;
  return person;
}

export function reveal(puzzle, game) {
  game.placements = puzzle.solution.map((cell) => ({ ...cell }));
  game.marks = [];
  game.finished = 'revealed';
}

export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
