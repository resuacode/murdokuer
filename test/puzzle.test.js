import test from 'node:test';
import assert from 'node:assert/strict';
import { DIFFICULTIES, OBJECTS, cellLabel, clueHolds, countSolutions, generatePuzzle } from '../src/puzzle.js';

for (const [difficulty, settings] of Object.entries(DIFFICULTIES)) {
  test(`los casos de nivel ${settings.label} son coherentes y tienen solución única`, () => {
    const seen = new Set();
    for (let i = 0; i < (settings.size > 6 ? 8 : 25); i++) {
      const puzzle = generatePuzzle(difficulty);
      const { size, people, solution, roomGrid, objects } = puzzle;
      assert.equal(size, settings.size);
      assert.equal(people.length, size);
      assert.equal(people.filter((person) => person.victim).length, 1);
      assert.equal(new Set(people.map((person) => person.emoji)).size, size);

      // Una persona por fila y por columna, nunca sobre un mueble bloqueante.
      assert.equal(new Set(solution.map((cell) => cell.row)).size, size);
      assert.equal(new Set(solution.map((cell) => cell.col)).size, size);
      for (const { row, col } of solution) {
        const object = objects[row][col];
        assert.ok(!object || OBJECTS[object].occupiable);
      }

      // La víctima comparte habitación exactamente con la persona culpable.
      const crimeRoom = roomGrid[solution[puzzle.victim].row][solution[puzzle.victim].col];
      const together = solution.map((cell, index) => ({ cell, index })).filter(({ cell }) => roomGrid[cell.row][cell.col] === crimeRoom);
      assert.deepEqual(together.map(({ index }) => index).sort(), [puzzle.murderer, puzzle.victim].sort());

      // Todas las pistas son ciertas y bastan para una única solución.
      assert.ok(puzzle.clues.length > 0);
      for (const clue of puzzle.clues) {
        assert.ok(clueHolds(puzzle, clue, solution), clue.text);
        assert.ok(clue.text.length > 0);
      }
      assert.equal(countSolutions(puzzle), 1);
      if (settings.size >= 6) assert.ok(puzzle.clues.every((clue) => clue.type !== 'row' && clue.type !== 'col'));
      seen.add(JSON.stringify(roomGrid));
    }
    assert.ok(seen.size > 1);
  });
}

test('sin pistas hay más de una solución', () => {
  const puzzle = generatePuzzle('facil');
  assert.equal(countSolutions(puzzle, []), 2);
});

test('la misma semilla genera el mismo caso y otra semilla uno distinto', () => {
  const a = generatePuzzle('experto', 123456);
  assert.deepEqual(generatePuzzle('experto', 123456), a);
  assert.notDeepEqual(generatePuzzle('experto', 654321).roomGrid, a.roomGrid);
  assert.equal(a.caseNumber, '123456');
});

test('hay cinco niveles de 4×4 a 8×8', () => {
  assert.deepEqual(Object.values(DIFFICULTIES).map((settings) => settings.size), [4, 5, 6, 7, 8]);
});

test('las coordenadas usan letra de columna y número de fila', () => {
  assert.equal(cellLabel({ row: 0, col: 0 }), 'A1');
  assert.equal(cellLabel({ row: 5, col: 3 }), 'D6');
});
