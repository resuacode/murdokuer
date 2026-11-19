// Generador de casos al estilo "sudoku de asesinatos":
// - El tablero N×N es el plano de una casa dividido en habitaciones.
// - Hay N personas (N − 1 sospechosos y la víctima): una por fila y una por columna.
// - Nadie puede estar en una casilla con un mueble bloqueante (planta, estantería...).
// - La persona culpable es la única que está a solas con la víctima en su habitación.

export const DIFFICULTIES = {
  facil: {
    label: 'Fácil',
    size: 4,
    rooms: 3,
    types: { inRoom: 4, onObject: 3, row: 1, col: 1, besideObject: 1 },
    everyoneSpeaks: true,
  },
  media: {
    label: 'Media',
    size: 5,
    rooms: 4,
    types: { inRoom: 3, notInRoom: 1, onObject: 3, besideObject: 2, row: 1, col: 1, sameRoom: 1 },
    everyoneSpeaks: true,
  },
  dificil: {
    label: 'Difícil',
    size: 6,
    rooms: 5,
    types: { inRoom: 3, notInRoom: 2, onObject: 2, besideObject: 2, north: 1, west: 1, sameRoom: 1, diagonal: 1 },
    everyoneSpeaks: false,
  },
};

export const OBJECTS = {
  silla: { emoji: '🪑', name: 'una silla', occupiable: true },
  sofa: { emoji: '🛋️', name: 'un sofá', occupiable: true },
  cama: { emoji: '🛏️', name: 'una cama', occupiable: true },
  planta: { emoji: '🪴', name: 'una planta', occupiable: false },
  estanteria: { emoji: '📚', name: 'una estantería', occupiable: false },
  tele: { emoji: '📺', name: 'una televisión', occupiable: false },
  piano: { emoji: '🎹', name: 'un piano', occupiable: false },
};
const OCCUPIABLE = Object.keys(OBJECTS).filter((key) => OBJECTS[key].occupiable);
const BLOCKING = Object.keys(OBJECTS).filter((key) => !OBJECTS[key].occupiable);

const ROOMS = [
  { name: 'Cocina', article: 'la cocina' },
  { name: 'Salón', article: 'el salón' },
  { name: 'Biblioteca', article: 'la biblioteca' },
  { name: 'Dormitorio', article: 'el dormitorio' },
  { name: 'Comedor', article: 'el comedor' },
  { name: 'Estudio', article: 'el estudio' },
  { name: 'Vestíbulo', article: 'el vestíbulo' },
  { name: 'Invernadero', article: 'el invernadero' },
];

const SUSPECTS = [
  { name: 'Alba', emoji: '👩‍🍳', gender: 'f', role: 'la cocinera' },
  { name: 'Bruno', emoji: '👨‍🌾', gender: 'm', role: 'el jardinero' },
  { name: 'Clara', emoji: '👩‍⚕️', gender: 'f', role: 'la doctora' },
  { name: 'Diego', emoji: '👨‍🔧', gender: 'm', role: 'el mecánico' },
  { name: 'Elena', emoji: '👩‍🎨', gender: 'f', role: 'la pintora' },
  { name: 'Félix', emoji: '🤵', gender: 'm', role: 'el mayordomo' },
  { name: 'Gloria', emoji: '👵', gender: 'f', role: 'la abuela' },
  { name: 'Hugo', emoji: '👨‍🏫', gender: 'm', role: 'el profesor' },
  { name: 'Inés', emoji: '👩‍🔬', gender: 'f', role: 'la científica' },
];
const VICTIMS = [
  { name: 'Víctor', emoji: '👴', gender: 'm', role: 'el millonario' },
  { name: 'Rosalía', emoji: '👸', gender: 'f', role: 'la condesa' },
];

const TITLES = [
  ['El misterio', 'de la última cena'],
  ['Muerte', 'en la casa de campo'],
  ['El secreto', 'del salón cerrado'],
  ['Un crimen', 'a la hora del té'],
  ['La noche', 'de la tormenta'],
  ['El caso', 'del reloj parado'],
];

const random = Math.random;
const pick = (values) => values[Math.floor(random() * values.length)];

function shuffle(values) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const NEIGHBOURS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function generateRooms(size, count) {
  const grid = Array.from({ length: size }, () => Array(size).fill(-1));
  const cells = shuffle(Array.from({ length: size * size }, (_, index) => index));
  cells.slice(0, count).forEach((cell, room) => { grid[Math.floor(cell / size)][cell % size] = room; });
  let remaining = size * size - count;
  while (remaining > 0) {
    const frontier = [];
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (grid[row][col] !== -1) continue;
        for (const [dr, dc] of NEIGHBOURS) {
          const room = grid[row + dr]?.[col + dc];
          if (room !== undefined && room !== -1) frontier.push({ row, col, room });
        }
      }
    }
    const { row, col, room } = pick(frontier);
    grid[row][col] = room;
    remaining--;
  }
  const sizes = Array(count).fill(0);
  grid.flat().forEach((room) => sizes[room]++);
  const average = (size * size) / count;
  if (Math.min(...sizes) < 3 || Math.max(...sizes) > average * 1.8) return null;
  return grid;
}

// ---- Evaluación de pistas ---------------------------------------------------

function besideObject(puzzle, cell, object) {
  return NEIGHBOURS.some(([dr, dc]) => {
    const row = cell.row + dr;
    const col = cell.col + dc;
    return puzzle.objects[row]?.[col] === object && puzzle.roomGrid[row][col] === puzzle.roomGrid[cell.row][cell.col];
  });
}

export function clueHolds(puzzle, clue, positions) {
  const a = positions[clue.a];
  const b = positions[clue.b];
  switch (clue.type) {
    case 'inRoom': return puzzle.roomGrid[a.row][a.col] === clue.room;
    case 'notInRoom': return puzzle.roomGrid[a.row][a.col] !== clue.room;
    case 'onObject': return puzzle.objects[a.row][a.col] === clue.object;
    case 'besideObject': return besideObject(puzzle, a, clue.object);
    case 'row': return a.row === clue.row;
    case 'col': return a.col === clue.col;
    case 'north': return a.row < b.row;
    case 'west': return a.col < b.col;
    case 'sameRoom': return puzzle.roomGrid[a.row][a.col] === puzzle.roomGrid[b.row][b.col];
    case 'diagonal': return Math.abs(a.row - b.row) === 1 && Math.abs(a.col - b.col) === 1;
    default: throw new Error(`Pista desconocida: ${clue.type}`);
  }
}

const UNARY = new Set(['inRoom', 'notInRoom', 'onObject', 'besideObject', 'row', 'col']);

// Cuenta las colocaciones que cumplen las reglas y las pistas (se detiene en `limit`).
export function countSolutions(puzzle, clues = puzzle.clues, limit = 2) {
  const { size, people, objects, roomGrid } = puzzle;
  const free = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const object = objects[row][col];
      if (!object || OBJECTS[object].occupiable) free.push({ row, col });
    }
  }
  const domains = people.map((_, person) => free.filter((cell) => clues.every((clue) => {
    if (!UNARY.has(clue.type) || clue.a !== person) return true;
    return clueHolds(puzzle, clue, { [person]: cell });
  })));
  const binary = clues.filter((clue) => !UNARY.has(clue.type));
  const order = people.map((_, index) => index).sort((x, y) => domains[x].length - domains[y].length);
  const positions = [];
  const victim = people.findIndex((person) => person.victim);
  let count = 0;

  function search(depth, usedRows, usedCols) {
    if (depth === order.length) {
      const room = roomGrid[positions[victim].row][positions[victim].col];
      const together = positions.filter((cell) => roomGrid[cell.row][cell.col] === room).length;
      if (together === 2) count++;
      return;
    }
    const person = order[depth];
    for (const cell of domains[person]) {
      if (usedRows & (1 << cell.row) || usedCols & (1 << cell.col)) continue;
      positions[person] = cell;
      const ok = binary.every((clue) => positions[clue.a] === undefined || positions[clue.b] === undefined || clueHolds(puzzle, clue, positions));
      if (ok) search(depth + 1, usedRows | (1 << cell.row), usedCols | (1 << cell.col));
      positions[person] = undefined;
      if (count >= limit) return;
    }
  }
  search(0, 0, 0);
  return count;
}

// ---- Textos -------------------------------------------------------------------

const ending = (person) => (person.gender === 'f' ? 'a' : 'o');

export function clueText(puzzle, clue) {
  const a = puzzle.people[clue.a];
  const b = puzzle.people[clue.b];
  const room = puzzle.rooms[clue.room];
  switch (clue.type) {
    case 'inRoom': return `${a.name} estaba en ${room.article}.`;
    case 'notInRoom': return `${a.name} no estuvo en ${room.article}.`;
    case 'onObject':
      if (clue.object === 'cama') return `${a.name} estaba tumbad${ending(a)} en una cama.`;
      return `${a.name} estaba sentad${ending(a)} en ${OBJECTS[clue.object].name}.`;
    case 'besideObject': return `${a.name} estaba junto a ${OBJECTS[clue.object].name}.`;
    case 'row': return `${a.name} estaba en la fila ${clue.row + 1}.`;
    case 'col': return `${a.name} estaba en la columna ${String.fromCharCode(65 + clue.col)}.`;
    case 'north': return clue.flip ? `${b.name} estaba más al sur que ${a.name}.` : `${a.name} estaba más al norte que ${b.name}.`;
    case 'west': return clue.flip ? `${b.name} estaba más al este que ${a.name}.` : `${a.name} estaba más al oeste que ${b.name}.`;
    case 'sameRoom': return `${a.name} y ${b.name} estaban en la misma habitación.`;
    case 'diagonal': return `${a.name} y ${b.name} estaban en casillas que se tocan en diagonal.`;
    default: return '';
  }
}

// ---- Generación ------------------------------------------------------------------

function candidateClues(puzzle, types) {
  const { people, solution, roomGrid, objects, rooms } = puzzle;
  const pool = [];
  const add = (clue) => { if (types[clue.type]) pool.push({ ...clue, weight: types[clue.type] }); };
  people.forEach((person, a) => {
    const cell = solution[a];
    const room = roomGrid[cell.row][cell.col];
    add({ type: 'inRoom', a, room });
    const others = shuffle(rooms.map((_, index) => index).filter((index) => index !== room));
    others.slice(0, 2).forEach((other) => add({ type: 'notInRoom', a, room: other }));
    if (objects[cell.row][cell.col]) add({ type: 'onObject', a, object: objects[cell.row][cell.col] });
    for (const object of Object.keys(OBJECTS)) {
      if (besideObject(puzzle, cell, object)) add({ type: 'besideObject', a, object });
    }
    add({ type: 'row', a, row: cell.row });
    add({ type: 'col', a, col: cell.col });
    people.forEach((other, b) => {
      if (a === b) return;
      const target = solution[b];
      if (cell.row < target.row) add({ type: 'north', a, b, flip: random() < 0.5 });
      if (cell.col < target.col) add({ type: 'west', a, b, flip: random() < 0.5 });
      // Las pistas de relación con la víctima delatarían al culpable.
      if (a < b && !person.victim && !other.victim) {
        if (roomGrid[cell.row][cell.col] === roomGrid[target.row][target.col]) add({ type: 'sameRoom', a, b });
        if (Math.abs(cell.row - target.row) === 1 && Math.abs(cell.col - target.col) === 1) add({ type: 'diagonal', a, b });
      }
    });
  });
  // Orden aleatorio ponderado por tipo.
  return pool
    .map((clue) => ({ clue, key: random() ** (1 / clue.weight) }))
    .sort((x, y) => y.key - x.key)
    .map(({ clue }) => clue);
}

function chooseClues(puzzle, settings) {
  const pool = candidateClues(puzzle, settings.types);
  const chosen = [];
  // Primero, una pista por persona (como la declaración de cada implicado).
  for (const person of shuffle(puzzle.people.map((_, index) => index))) {
    const clue = pool.find((item) => item.a === person && !chosen.includes(item));
    if (clue) chosen.push(clue);
  }
  for (const clue of pool) {
    if (countSolutions(puzzle, chosen) === 1) break;
    if (!chosen.includes(clue)) chosen.push(clue);
  }
  if (countSolutions(puzzle, chosen) !== 1) return null;
  // Quita las pistas sobrantes (en fácil y media, cada persona conserva al menos una).
  for (const clue of shuffle(chosen)) {
    const rest = chosen.filter((item) => item !== clue);
    const keepsVoice = !settings.everyoneSpeaks || rest.some((item) => item.a === clue.a);
    if (keepsVoice && countSolutions(puzzle, rest) === 1) chosen.splice(chosen.indexOf(clue), 1);
  }
  return chosen;
}

function buildCase(settings) {
  const { size } = settings;
  const roomGrid = generateRooms(size, settings.rooms);
  if (!roomGrid) return null;
  const victimIndex = size - 1;
  const people = [
    ...shuffle(SUSPECTS).slice(0, size - 1),
    { ...pick(VICTIMS), victim: true },
  ];
  const columns = shuffle(Array.from({ length: size }, (_, index) => index));
  const rows = shuffle(Array.from({ length: size }, (_, index) => index));
  const solution = people.map((_, index) => ({ row: rows[index], col: columns[index] }));
  const victimCell = solution[victimIndex];
  const crimeRoom = roomGrid[victimCell.row][victimCell.col];
  const inCrimeRoom = solution.map((cell, index) => ({ cell, index })).filter(({ cell }) => roomGrid[cell.row][cell.col] === crimeRoom);
  if (inCrimeRoom.length !== 2) return null;
  const murderer = inCrimeRoom.find(({ index }) => index !== victimIndex).index;

  const occupied = new Set(solution.map(({ row, col }) => row * size + col));
  const objects = Array.from({ length: size }, () => Array(size).fill(null));
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const roll = random();
      if (occupied.has(row * size + col)) {
        if (roll < 0.55) objects[row][col] = pick(OCCUPIABLE);
      } else if (roll < 0.3) {
        objects[row][col] = pick(BLOCKING);
      } else if (roll < 0.45) {
        objects[row][col] = pick(OCCUPIABLE);
      }
    }
  }
  const rooms = shuffle(ROOMS).slice(0, settings.rooms);
  const [title, subtitle] = pick(TITLES);
  const puzzle = { size, roomGrid, rooms, objects, people, solution, murderer, victim: victimIndex, crimeRoom, title, subtitle };
  const clues = chooseClues(puzzle, settings);
  if (!clues) return null;
  return {
    ...puzzle,
    clues: clues
      .map(({ weight, ...clue }) => ({ ...clue, subject: clue.flip ? clue.b : clue.a, text: clueText(puzzle, clue) }))
      .sort((x, y) => x.subject - y.subject),
  };
}

export function generatePuzzle(difficulty = 'media') {
  const settings = DIFFICULTIES[difficulty];
  if (!settings) throw new Error(`Dificultad desconocida: ${difficulty}`);
  for (let attempt = 0; attempt < 500; attempt++) {
    const puzzle = buildCase(settings);
    if (puzzle) {
      return { ...puzzle, difficulty, caseNumber: String(Math.floor(random() * 9000) + 1000) };
    }
  }
  throw new Error('No se ha podido generar un caso.');
}

export function cellLabel({ row, col }) {
  return `${String.fromCharCode(65 + col)}${row + 1}`;
}
