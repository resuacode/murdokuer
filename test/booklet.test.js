import test from 'node:test';
import assert from 'node:assert/strict';
import { BOOKLET_LIMITS, BOOKLET_MIN, MIXED, bookletLevels, clampCount, estimateSeconds } from '../src/booklet.js';
import { DIFFICULTIES } from '../src/puzzle.js';

test('la cantidad se ajusta a los límites de cada nivel', () => {
  assert.equal(clampCount('maestro', 50), BOOKLET_LIMITS.maestro);
  assert.equal(clampCount('facil', 0), BOOKLET_MIN);
  assert.equal(clampCount('media', '7'), 7);
  assert.equal(clampCount('media', 'abc'), 6);
  for (const key of [...Object.keys(DIFFICULTIES), MIXED]) assert.ok(BOOKLET_LIMITS[key] >= BOOKLET_MIN);
});

test('un nivel concreto repite ese nivel', () => {
  assert.deepEqual(bookletLevels('experto', 3), ['experto', 'experto', 'experto']);
});

test('la mezcla va de fácil a maestro y reparte los casos', () => {
  const levels = bookletLevels(MIXED, 10);
  assert.equal(levels.length, 10);
  assert.deepEqual([...new Set(levels)], Object.keys(DIFFICULTIES));
  const order = Object.keys(DIFFICULTIES);
  assert.ok(levels.every((level, i) => i === 0 || order.indexOf(level) >= order.indexOf(levels[i - 1])));
  assert.deepEqual(bookletLevels(MIXED, 2), ['facil', 'dificil']);
});

test('los límites mantienen la espera por debajo de unos 10 segundos incluso en un solo hilo', () => {
  for (const key of [...Object.keys(DIFFICULTIES), MIXED]) {
    const seconds = estimateSeconds(bookletLevels(key, BOOKLET_LIMITS[key]), 1);
    assert.ok(seconds <= 10, `${key}: ${seconds}s`);
  }
});
