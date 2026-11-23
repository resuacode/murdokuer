import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePuzzle, canOccupy } from '../src/puzzle.js';
import { clueStatus, conflicts, giveHint, isComplete, isSolved, newGame, personAt, place, reveal, toggleMark, wrongPlacements } from '../src/game.js';

const puzzle = generatePuzzle('media', 424242);

function freeCell(predicate = () => true) {
  for (let row = 0; row < puzzle.size; row++) {
    for (let col = 0; col < puzzle.size; col++) if (canOccupy(puzzle, { row, col }) && predicate({ row, col })) return { row, col };
  }
  throw new Error('sin casillas libres');
}

test('colocar, mover y quitar personas', () => {
  const game = newGame(puzzle);
  const cell = freeCell();
  assert.equal(place(puzzle, game, 0, cell), null);
  assert.equal(personAt(game, cell.row, cell.col), 0);
  // Otra persona en la misma casilla desplaza a la primera.
  assert.equal(place(puzzle, game, 1, cell), null);
  assert.equal(game.placements[0], null);
  assert.equal(personAt(game, cell.row, cell.col), 1);
  // Volver a tocar la misma casilla con la misma persona la quita.
  place(puzzle, game, 1, cell);
  assert.equal(game.placements[1], null);
});

test('no se puede colocar a nadie sobre muebles bloqueantes', () => {
  const blocked = puzzle.objects.flatMap((row, r) => row.flatMap((_, c) => (canOccupy(puzzle, { row: r, col: c }) ? [] : [{ row: r, col: c }])));
  if (!blocked.length) return;
  const game = newGame(puzzle);
  assert.equal(place(puzzle, game, 0, blocked[0]), 'blocked');
  assert.equal(game.placements[0], null);
});

test('detecta personas en la misma fila o columna', () => {
  const game = newGame(puzzle);
  const a = freeCell();
  const b = freeCell((cell) => cell.row === a.row && cell.col !== a.col);
  place(puzzle, game, 0, a);
  place(puzzle, game, 1, b);
  assert.deepEqual([...conflicts(game)].sort(), [0, 1]);
});

test('las marcas no se ponen sobre personas y se quitan al colocar', () => {
  const game = newGame(puzzle);
  const cell = freeCell();
  toggleMark(game, cell);
  assert.equal(game.marks.length, 1);
  place(puzzle, game, 0, cell);
  assert.equal(game.marks.length, 0);
  toggleMark(game, cell);
  assert.equal(game.marks.length, 0);
});

test('la solución cumple todas las pistas y las ayudas llevan a ella', () => {
  const game = newGame(puzzle);
  assert.ok(clueStatus(puzzle, game).every((status) => status === 'pending'));
  for (let i = 0; i < puzzle.people.length; i++) assert.notEqual(giveHint(puzzle, game), null);
  assert.equal(giveHint(puzzle, game), null);
  assert.ok(isComplete(game));
  assert.ok(isSolved(puzzle, game));
  assert.equal(game.hintsUsed, puzzle.people.length);
  assert.ok(clueStatus(puzzle, game).every((status) => status === 'ok'));
  // Las personas confirmadas por una ayuda no se pueden mover.
  assert.equal(place(puzzle, game, 0, freeCell()), 'locked');
});

test('las colocaciones erróneas se detectan y la ayuda las corrige primero', () => {
  const game = newGame(puzzle);
  const wrongCell = freeCell((cell) => cell.row !== puzzle.solution[0].row || cell.col !== puzzle.solution[0].col);
  place(puzzle, game, 0, wrongCell);
  assert.deepEqual(wrongPlacements(puzzle, game), [0]);
  assert.equal(giveHint(puzzle, game), 0);
  assert.deepEqual(wrongPlacements(puzzle, game), []);
});

test('ver la solución termina la partida', () => {
  const game = newGame(puzzle);
  reveal(puzzle, game);
  assert.equal(game.finished, 'revealed');
  assert.ok(isSolved(puzzle, game));
});
