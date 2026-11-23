import test from 'node:test';
import assert from 'node:assert/strict';
import { DIFFICULTIES, OBJECTS, TITLE_COUNT, generatePuzzle } from '../src/puzzle.js';
import { LOCALES, LOCALE_ORDER, DEFAULT_LOCALE, caseTitle, clueText, personText, roomText } from '../src/i18n/content.js';

const reference = LOCALES[DEFAULT_LOCALE];
const keys = (object) => Object.keys(object).sort();

test('el gallego es el idioma por defecto y hay cinco idiomas', () => {
  assert.equal(DEFAULT_LOCALE, 'gl');
  assert.deepEqual(LOCALE_ORDER, ['gl', 'es', 'en', 'fr', 'pt']);
});

for (const code of LOCALE_ORDER) {
  const dict = LOCALES[code];

  test(`[${code}] tiene todos los textos que tiene el gallego`, () => {
    assert.deepEqual(keys(dict.ui), keys(reference.ui));
    assert.deepEqual(keys(dict.levels), keys(DIFFICULTIES));
    assert.deepEqual(keys(dict.rooms), keys(reference.rooms));
    assert.deepEqual(keys(dict.objects), keys(OBJECTS));
    assert.deepEqual(keys(dict.roles), keys(reference.roles));
    assert.equal(dict.titles.length, TITLE_COUNT);
    assert.equal(dict.rules.length, reference.rules.length);
    for (const [key, value] of Object.entries(dict.ui)) {
      assert.equal(typeof value, typeof reference.ui[key], `${code}.${key}`);
    }
  });

  test(`[${code}] las pistas generadas son frases completas`, () => {
    for (const difficulty of Object.keys(DIFFICULTIES)) {
      for (let seed = 1; seed <= 6; seed++) {
        const puzzle = generatePuzzle(difficulty, 7000 + seed);
        const { title, subtitle } = caseTitle(puzzle, code);
        assert.ok(title && subtitle);
        for (let i = 0; i < puzzle.people.length; i++) {
          const person = personText(puzzle, i, code);
          assert.ok(person.name && person.role, `${code} persona ${i}`);
        }
        for (const clue of puzzle.clues) {
          const text = clueText(puzzle, clue, code);
          assert.match(text, /^[A-ZÁÉÍÓÚÀÂÊÔÕÇÑÈ][^]*\.$/u, `${code}: ${text}`);
          assert.doesNotMatch(text, /undefined|NaN|\$\{|\s{2}/, `${code}: ${text}`);
        }
      }
    }
  });
}

// Cada tipo de pista, con personas de los dos géneros y recuentos de 0, 1 y varios.
function syntheticTexts(code) {
  const puzzle = generatePuzzle('maestro', 4242);
  const female = puzzle.people.findIndex((p) => p.gender === 'f');
  const male = puzzle.people.findIndex((p) => p.gender === 'm');
  const texts = [];
  const types = ['inRoom', 'notInRoom', 'onFloor', 'row', 'col', 'edge', 'notEdge', 'corner', 'aloneInRoom'];
  for (const a of [female, male]) {
    for (const type of types) texts.push(clueText(puzzle, { type, a, room: 0, row: 2, col: 3 }, code));
    for (const object of Object.keys(OBJECTS)) {
      texts.push(clueText(puzzle, { type: 'besideObject', a, object }, code));
      if (OBJECTS[object].occupiable) texts.push(clueText(puzzle, { type: 'onObject', a, object }, code));
    }
    const b = a === female ? male : female;
    for (const type of ['north', 'west', 'sameRoom', 'differentRoom', 'diagonal']) {
      texts.push(clueText(puzzle, { type, a, b }, code), clueText(puzzle, { type, a, b, flip: true }, code));
    }
    for (const type of ['northBy', 'westBy']) {
      for (const distance of [1, 2, 3]) {
        texts.push(clueText(puzzle, { type, a, b, distance }, code), clueText(puzzle, { type, a, b, distance, flip: true }, code));
      }
    }
  }
  for (const count of [0, 1, 2, 3]) {
    texts.push(clueText(puzzle, { type: 'roomCount', room: 1, count }, code), clueText(puzzle, { type: 'emptyRooms', count }, code));
  }
  for (let room = 0; room < puzzle.rooms.length; room++) texts.push(roomText(puzzle, room, code).in);
  return texts;
}

test('todos los tipos de pista producen texto en todos los idiomas', () => {
  for (const code of LOCALE_ORDER) {
    for (const text of syntheticTexts(code)) {
      assert.ok(text && !/undefined|\$\{/.test(text), `${code}: ${text}`);
    }
  }
});

const allStrings = (code) => {
  const dict = LOCALES[code];
  const ui = Object.values(dict.ui).map((value) => (typeof value === 'function'
    ? String(value(1, 2, 3)) + String(value({ murderer: 'M', role: 'r', victim: 'V', roomIn: 'x', time: 't', extras: 'e', cell: 'A1', room: 'R', object: 'o', person: 'p', name: 'N', on: 'o' }))
    : value));
  return [...ui, ...dict.rules, dict.story, ...dict.titles.flat(), ...Object.values(dict.roles), ...syntheticTexts(code)].join('\n').replace(/<[^>]+>/g, ' ');
};

test('el gallego no mezcla formas castellanas ni portuguesas', () => {
  const text = allStrings('gl');
  // Castellano: artículos y conjunciones que no existen en gallego.
  assert.doesNotMatch(text, /\b(el|los|las|y|hay|muy|está en la|ningún mueble|también|ayuda|casilla)\b/i);
  // Portugués: grafías y palabras que no son gallegas.
  assert.doesNotMatch(text, /ção|ções|ã|õ|\b(não|em|uma|um|você|ninguém|também|lh)\b/i);
  // Nada de preposición «a» ante complemento directo de persoa («Colocando a Alba»).
  assert.doesNotMatch(text, /Colocando a N|colocando a N/);
});

test('el portugués no mezcla formas gallegas ni castellanas', () => {
  const text = allStrings('pt');
  assert.doesNotMatch(text, /\b(unha|non|quen|ningún|ningunha|xa|aínda|xogar|cela|ligazón|habitación|y|el|los|las|hay)\b/i);
  assert.doesNotMatch(text, /ción\b|ñ/);
});

test('el francés usa espacio de no separación antes de los dos puntos', () => {
  assert.doesNotMatch(allStrings('fr'), / [:?!]/);
});
