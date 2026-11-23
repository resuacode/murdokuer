// Textos de un caso en un idioma concreto. El caso solo guarda identificadores;
// aquí se convierten en nombres, papeles, habitaciones y pistas con su gramática.
import gl from './locales/gl.js';
import es from './locales/es.js';
import en from './locales/en.js';
import fr from './locales/fr.js';
import pt from './locales/pt.js';

export const LOCALES = { gl, es, en, fr, pt };
export const LOCALE_ORDER = ['gl', 'es', 'en', 'fr', 'pt'];
export const DEFAULT_LOCALE = 'gl';

const BASE_NAMES = {
  alba: 'Alba', bruno: 'Bruno', clara: 'Clara', diego: 'Diego', elena: 'Elena', felix: 'Félix',
  gloria: 'Gloria', hugo: 'Hugo', ines: 'Inés', julia: 'Julia', marcos: 'Marcos', nora: 'Nora',
  victor: 'Víctor', rosalia: 'Rosalía',
};

export const dictionary = (code) => LOCALES[code] ?? LOCALES[DEFAULT_LOCALE];

export function personText(puzzle, index, code) {
  const person = puzzle.people[index];
  const dict = dictionary(code);
  return {
    ...person,
    name: dict.names[person.id] ?? BASE_NAMES[person.id],
    role: dict.roles[person.role],
  };
}

export const roomText = (puzzle, index, code) => dictionary(code).rooms[puzzle.rooms[index]];
export const objectText = (key, code) => ({ key, ...dictionary(code).objects[key] });
export const levelName = (difficulty, code) => dictionary(code).levels[difficulty];

export function caseTitle(puzzle, code) {
  const [title, subtitle] = dictionary(code).titles[puzzle.titleIndex];
  return { title, subtitle };
}

const OPPOSITE = { north: 'south', west: 'east', northBy: 'southBy', westBy: 'eastBy' };

export function clueText(puzzle, clue, code) {
  const dict = dictionary(code);
  let type = clue.type;
  let a = clue.a === undefined ? undefined : personText(puzzle, clue.a, code);
  let b = clue.b === undefined ? undefined : personText(puzzle, clue.b, code);
  // Las pistas «giradas» se dicen desde la otra persona: «B estaba más al sur que A».
  if (clue.flip && OPPOSITE[type]) {
    type = OPPOSITE[type];
    [a, b] = [b, a];
  }
  return dict.clue(type, {
    a,
    b,
    room: clue.room === undefined ? undefined : roomText(puzzle, clue.room, code),
    object: clue.object === undefined ? undefined : objectText(clue.object, code),
    row: clue.row === undefined ? undefined : clue.row + 1,
    col: clue.col === undefined ? undefined : String.fromCharCode(65 + clue.col),
    distance: clue.distance,
    count: clue.count,
  });
}

// Nombre de nivel apto para un nombre de archivo: «Difícil» → «dificil».
export const slug = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
