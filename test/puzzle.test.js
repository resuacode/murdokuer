import test from 'node:test';
import assert from 'node:assert/strict';
import { countSolutions, generatePuzzle, sceneLabel } from '../src/puzzle.js';

test('generated puzzles have a unique solution and an empty marked cell', () => {
  const puzzles = new Set();
  for (let i = 0; i < 50; i++) {
    const { board, scene, parity } = generatePuzzle();
    assert.equal(board.length, 6);
    assert.ok(board.every((row) => row.length === 6 && row.every((value) => Number.isInteger(value) && value >= 0 && value <= 6)));
    assert.equal(countSolutions(board), 1);
    assert.equal(board[scene.row][scene.col], 0);
    assert.match(sceneLabel(scene), /^[A-F][1-6]$/);
    const solutions = [1, 2, 3, 4, 5, 6].filter((value) => {
      const copy = board.map((row) => [...row]);
      copy[scene.row][scene.col] = value;
      return countSolutions(copy) === 1;
    });
    assert.equal(solutions.length, 1);
    assert.equal(parity, solutions[0] % 2 === 0 ? 'par' : 'impar');
    puzzles.add(JSON.stringify(board));
  }
  assert.ok(puzzles.size > 1);
});

test('solution counting stops at two for an empty board without mutating it', () => {
  const board = Array.from({ length: 6 }, () => Array(6).fill(0));
  assert.equal(countSolutions(board), 2);
  assert.ok(board.every((row) => row.every((value) => value === 0)));
  board[0][0] = board[0][1] = 1;
  assert.equal(countSolutions(board), 0);
});
