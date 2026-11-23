// Generador de casos al estilo "sudoku de asesinatos":
// - El tablero N×N es el plano de una casa dividido en habitaciones.
// - Hay N personas (N − 1 sospechosos y la víctima): una por fila y una por columna.
// - Nadie puede estar en una casilla con un mueble bloqueante (planta, estantería...).
// - La persona culpable es la única que está a solas con la víctima en su habitación.
// Cada caso sale de una semilla numérica: la misma semilla y el mismo nivel dan el mismo caso.

export const DIFFICULTIES = {
  facil: {
    size: 4,
    rooms: 3,
    types: { inRoom: 4, onObject: 3, row: 1, col: 1, besideObject: 1, onFloor: 1, corner: 1 },
    everyoneSpeaks: true,
  },
  media: {
    size: 5,
    rooms: 4,
    types: { inRoom: 3, notInRoom: 1, onObject: 3, besideObject: 2, row: 1, col: 1, sameRoom: 1, edge: 1, corner: 1, roomCount: 1, onFloor: 1 },
    everyoneSpeaks: true,
  },
  dificil: {
    size: 6,
    rooms: 5,
    types: { inRoom: 3, notInRoom: 2, onObject: 2, besideObject: 2, north: 1, west: 1, sameRoom: 1, differentRoom: 1, diagonal: 1, edge: 1, notEdge: 1, roomCount: 1, aloneInRoom: 1 },
    everyoneSpeaks: false,
  },
  experto: {
    size: 7,
    rooms: 6,
    types: { inRoom: 2, notInRoom: 2, onObject: 2, besideObject: 2, onFloor: 1, north: 1, west: 1, northBy: 1, westBy: 1, sameRoom: 1, differentRoom: 1, diagonal: 1, edge: 1, notEdge: 1, corner: 1, roomCount: 1, aloneInRoom: 1, emptyRooms: 1 },
    everyoneSpeaks: false,
  },
  maestro: {
    size: 8,
    rooms: 7,
    types: { inRoom: 2, notInRoom: 2, onObject: 2, besideObject: 2, onFloor: 1, north: 1, west: 1, northBy: 1, westBy: 1, sameRoom: 2, differentRoom: 2, diagonal: 1, edge: 1, notEdge: 1, corner: 1, roomCount: 2, aloneInRoom: 2, emptyRooms: 1 },
    everyoneSpeaks: false,
  },
};

export const OBJECTS = {
  silla: { emoji: '🪑', occupiable: true },
  sofa: { emoji: '🛋️', occupiable: true },
  cama: { emoji: '🛏️', occupiable: true },
  planta: { emoji: '🪴', occupiable: false },
  estanteria: { emoji: '📚', occupiable: false },
  tele: { emoji: '📺', occupiable: false },
  piano: { emoji: '🎹', occupiable: false },
};
const OCCUPIABLE = Object.keys(OBJECTS).filter((key) => OBJECTS[key].occupiable);
const BLOCKING = Object.keys(OBJECTS).filter((key) => !OBJECTS[key].occupiable);

// Identificadores internos: los textos de cada idioma están en src/i18n/locales.
const ROOMS = ['cocina', 'salon', 'biblioteca', 'dormitorio', 'comedor', 'estudio', 'vestibulo', 'invernadero', 'despacho', 'desvan', 'bodega', 'galeria'];

const SUSPECTS = [
  { id: 'alba', emoji: '👩‍🍳', gender: 'f', role: 'cook' },
  { id: 'bruno', emoji: '👨‍🌾', gender: 'm', role: 'gardener' },
  { id: 'clara', emoji: '👩‍⚕️', gender: 'f', role: 'doctor' },
  { id: 'diego', emoji: '👨‍🔧', gender: 'm', role: 'mechanic' },
  { id: 'elena', emoji: '👩‍🎨', gender: 'f', role: 'painter' },
  { id: 'felix', emoji: '🤵', gender: 'm', role: 'butler' },
  { id: 'gloria', emoji: '👵', gender: 'f', role: 'grandmother' },
  { id: 'hugo', emoji: '👨‍🏫', gender: 'm', role: 'teacher' },
  { id: 'ines', emoji: '👩‍🔬', gender: 'f', role: 'scientist' },
  { id: 'julia', emoji: '👩‍✈️', gender: 'f', role: 'pilot' },
  { id: 'marcos', emoji: '👨‍🚒', gender: 'm', role: 'firefighter' },
  { id: 'nora', emoji: '👩‍💼', gender: 'f', role: 'lawyer' },
];
const VICTIMS = [
  { id: 'victor', emoji: '👴', gender: 'm', role: 'millionaire' },
  { id: 'rosalia', emoji: '👸', gender: 'f', role: 'countess' },
];

// Número de títulos de caso disponibles en cada idioma.
export const TITLE_COUNT = 10;

// Generador pseudoaleatorio con semilla (mulberry32).
function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let random = Math.random;
const pick = (values) => values[Math.floor(random() * values.length)];

function shuffle(values) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function randomSeed() {
  return 100000 + Math.floor(Math.random() * 900000);
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

export function canOccupy(puzzle, { row, col }) {
  const object = puzzle.objects[row][col];
  return !object || OBJECTS[object].occupiable;
}

function besideObject(puzzle, cell, object) {
  return NEIGHBOURS.some(([dr, dc]) => {
    const row = cell.row + dr;
    const col = cell.col + dc;
    return puzzle.objects[row]?.[col] === object && puzzle.roomGrid[row][col] === puzzle.roomGrid[cell.row][cell.col];
  });
}

const isEdge = (puzzle, { row, col }) => row === 0 || col === 0 || row === puzzle.size - 1 || col === puzzle.size - 1;
const isCorner = (puzzle, { row, col }) => (row === 0 || row === puzzle.size - 1) && (col === 0 || col === puzzle.size - 1);
const roomOf = (puzzle, cell) => puzzle.roomGrid[cell.row][cell.col];

function roomCounts(puzzle, positions) {
  const counts = Array(puzzle.rooms.length).fill(0);
  positions.forEach((cell) => { if (cell) counts[roomOf(puzzle, cell)]++; });
  return counts;
}

// Pistas que dependen de una sola persona, de dos o de todo el plano.
const UNARY = new Set(['inRoom', 'notInRoom', 'onObject', 'besideObject', 'row', 'col', 'onFloor', 'edge', 'notEdge', 'corner']);
const GLOBAL = new Set(['roomCount', 'aloneInRoom', 'emptyRooms']);

// Personas que hace falta colocar para poder evaluar una pista (null = todas).
export function clueParticipants(clue) {
  if (GLOBAL.has(clue.type)) return null;
  return UNARY.has(clue.type) ? [clue.a] : [clue.a, clue.b];
}

export function clueHolds(puzzle, clue, positions) {
  const a = positions[clue.a];
  const b = positions[clue.b];
  switch (clue.type) {
    case 'inRoom': return roomOf(puzzle, a) === clue.room;
    case 'notInRoom': return roomOf(puzzle, a) !== clue.room;
    case 'onObject': return puzzle.objects[a.row][a.col] === clue.object;
    case 'besideObject': return besideObject(puzzle, a, clue.object);
    case 'onFloor': return !puzzle.objects[a.row][a.col];
    case 'row': return a.row === clue.row;
    case 'col': return a.col === clue.col;
    case 'edge': return isEdge(puzzle, a);
    case 'notEdge': return !isEdge(puzzle, a);
    case 'corner': return isCorner(puzzle, a);
    case 'north': return a.row < b.row;
    case 'west': return a.col < b.col;
    case 'northBy': return b.row - a.row === clue.distance;
    case 'westBy': return b.col - a.col === clue.distance;
    case 'sameRoom': return roomOf(puzzle, a) === roomOf(puzzle, b);
    case 'differentRoom': return roomOf(puzzle, a) !== roomOf(puzzle, b);
    case 'diagonal': return Math.abs(a.row - b.row) === 1 && Math.abs(a.col - b.col) === 1;
    case 'roomCount': return roomCounts(puzzle, positions)[clue.room] === clue.count;
    case 'aloneInRoom': return roomCounts(puzzle, positions)[roomOf(puzzle, a)] === 1;
    case 'emptyRooms': return roomCounts(puzzle, positions).filter((count) => count === 0).length === clue.count;
    default: throw new Error(`Pista desconocida: ${clue.type}`);
  }
}

// Cuenta las colocaciones que cumplen las reglas y las pistas (se detiene en `limit`).
// Si la búsqueda supera `budget` pasos, devuelve `limit`: «no se puede asegurar que sea única».
export function countSolutions(puzzle, clues = puzzle.clues, limit = 2, budget = Infinity) {
  const { size, people, roomGrid } = puzzle;
  const free = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) if (canOccupy(puzzle, { row, col })) free.push({ row, col });
  }
  const domains = people.map((_, person) => free.filter((cell) => clues.every((clue) => {
    if (!UNARY.has(clue.type) || clue.a !== person) return true;
    return clueHolds(puzzle, clue, { [person]: cell });
  })));
  const binary = clues.filter((clue) => !UNARY.has(clue.type) && !GLOBAL.has(clue.type));
  const global = clues.filter((clue) => GLOBAL.has(clue.type));
  // Máximo de personas por habitación según las pistas de recuento.
  const maxInRoom = puzzle.rooms.map(() => people.length);
  for (const clue of global) if (clue.type === 'roomCount') maxInRoom[clue.room] = Math.min(maxInRoom[clue.room], clue.count);
  const alone = global.filter((clue) => clue.type === 'aloneInRoom').map((clue) => clue.a);
  const emptyRooms = global.find((clue) => clue.type === 'emptyRooms');
  const maxOccupiedRooms = emptyRooms ? puzzle.rooms.length - emptyRooms.count : puzzle.rooms.length;
  const order = people.map((_, index) => index).sort((x, y) => domains[x].length - domains[y].length);
  const victim = people.findIndex((person) => person.victim);
  const counts = Array(puzzle.rooms.length).fill(0);
  const positions = [];
  let count = 0;
  let steps = 0;
  let occupiedRooms = 0;

  function search(depth, usedRows, usedCols) {
    if (++steps > budget) { count = limit; return; }
    if (depth === order.length) {
      if (counts[roomGrid[positions[victim].row][positions[victim].col]] !== 2) return;
      if (global.every((clue) => clueHolds(puzzle, clue, positions))) count++;
      return;
    }
    const person = order[depth];
    for (const cell of domains[person]) {
      if (usedRows & (1 << cell.row) || usedCols & (1 << cell.col)) continue;
      const room = roomGrid[cell.row][cell.col];
      if (counts[room] >= maxInRoom[room]) continue;
      positions[person] = cell;
      if (counts[room]++ === 0) occupiedRooms++;
      const victimCell = positions[victim];
      // Podas: las habitaciones solo pueden ganar gente al seguir colocando.
      const ok = (!victimCell || counts[roomGrid[victimCell.row][victimCell.col]] <= 2)
        && occupiedRooms <= maxOccupiedRooms
        && alone.every((a) => !positions[a] || counts[roomGrid[positions[a].row][positions[a].col]] === 1)
        && binary.every((clue) => positions[clue.a] === undefined || positions[clue.b] === undefined || clueHolds(puzzle, clue, positions));
      if (ok) search(depth + 1, usedRows | (1 << cell.row), usedCols | (1 << cell.col));
      if (--counts[room] === 0) occupiedRooms--;
      positions[person] = undefined;
      if (count >= limit) return;
    }
  }
  search(0, 0, 0);
  return count;
}

// ---- Generación ------------------------------------------------------------------

function candidateClues(puzzle, types) {
  const { people, solution, objects, rooms } = puzzle;
  const pool = [];
  const add = (clue) => { if (types[clue.type]) pool.push({ ...clue, weight: types[clue.type] }); };
  const counts = roomCounts(puzzle, solution);
  people.forEach((person, a) => {
    const cell = solution[a];
    const room = roomOf(puzzle, cell);
    add({ type: 'inRoom', a, room });
    const others = shuffle(rooms.map((_, index) => index).filter((index) => index !== room));
    others.slice(0, 2).forEach((other) => add({ type: 'notInRoom', a, room: other }));
    if (objects[cell.row][cell.col]) add({ type: 'onObject', a, object: objects[cell.row][cell.col] });
    else add({ type: 'onFloor', a });
    for (const object of Object.keys(OBJECTS)) {
      if (besideObject(puzzle, cell, object)) add({ type: 'besideObject', a, object });
    }
    add({ type: 'row', a, row: cell.row });
    add({ type: 'col', a, col: cell.col });
    if (isCorner(puzzle, cell)) add({ type: 'corner', a });
    else if (isEdge(puzzle, cell)) add({ type: 'edge', a });
    else add({ type: 'notEdge', a });
    if (!person.victim && counts[room] === 1) add({ type: 'aloneInRoom', a });
    people.forEach((other, b) => {
      if (a === b) return;
      const target = solution[b];
      if (cell.row < target.row) {
        add({ type: 'north', a, b, flip: random() < 0.5 });
        if (target.row - cell.row <= 3) add({ type: 'northBy', a, b, distance: target.row - cell.row, flip: random() < 0.5 });
      }
      if (cell.col < target.col) {
        add({ type: 'west', a, b, flip: random() < 0.5 });
        if (target.col - cell.col <= 3) add({ type: 'westBy', a, b, distance: target.col - cell.col, flip: random() < 0.5 });
      }
      if (a < b) {
        const same = room === roomOf(puzzle, target);
        // Que alguien comparta habitación con la víctima delataría al culpable.
        if (same && !person.victim && !other.victim) add({ type: 'sameRoom', a, b });
        if (!same) add({ type: 'differentRoom', a, b });
        if (!person.victim && !other.victim && Math.abs(cell.row - target.row) === 1 && Math.abs(cell.col - target.col) === 1) add({ type: 'diagonal', a, b });
      }
    });
  });
  rooms.forEach((_, room) => add({ type: 'roomCount', room, count: counts[room] }));
  add({ type: 'emptyRooms', count: counts.filter((count) => count === 0).length });
  // Orden aleatorio ponderado por tipo.
  return pool
    .map((clue) => ({ clue, key: random() ** (1 / clue.weight) }))
    .sort((x, y) => y.key - x.key)
    .map(({ clue }) => clue);
}

// Pasos máximos del solucionador al generar: si un caso cuesta más de verificar, se descarta.
const GENERATION_BUDGET = 10000;
const isUnique = (puzzle, clues) => countSolutions(puzzle, clues, 2, GENERATION_BUDGET) === 1;

function chooseClues(puzzle, settings) {
  const pool = candidateClues(puzzle, settings.types);
  const chosen = [];
  // Primero, una pista por persona (como la declaración de cada implicado).
  for (const person of shuffle(puzzle.people.map((_, index) => index))) {
    const clue = pool.find((item) => item.a === person && !chosen.includes(item));
    if (clue) chosen.push(clue);
  }
  for (const clue of pool) {
    if (isUnique(puzzle, chosen)) break;
    if (!chosen.includes(clue)) chosen.push(clue);
  }
  if (!isUnique(puzzle, chosen)) return null;
  // Quita las pistas sobrantes (en fácil y media, cada persona conserva al menos una).
  for (const clue of shuffle(chosen)) {
    const rest = chosen.filter((item) => item !== clue);
    const keepsVoice = !settings.everyoneSpeaks || clue.a === undefined || rest.some((item) => item.a === clue.a);
    if (keepsVoice && isUnique(puzzle, rest)) chosen.splice(chosen.indexOf(clue), 1);
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
  const titleIndex = Math.floor(random() * TITLE_COUNT);
  const puzzle = { size, roomGrid, rooms, objects, people, solution, murderer, victim: victimIndex, crimeRoom, titleIndex };
  const clues = chooseClues(puzzle, settings);
  if (!clues) return null;
  const order = (clue) => (clue.subject === undefined ? people.length : clue.subject);
  return {
    ...puzzle,
    clues: clues
      .map(({ weight, ...clue }) => ({ ...clue, subject: clue.flip ? clue.b : clue.a }))
      .sort((x, y) => order(x) - order(y)),
  };
}

export function generatePuzzle(difficulty = 'media', seed = randomSeed()) {
  const settings = DIFFICULTIES[difficulty];
  if (!settings) throw new Error(`Dificultad desconocida: ${difficulty}`);
  random = seededRandom(seed * 31 + Object.keys(DIFFICULTIES).indexOf(difficulty));
  try {
    for (let attempt = 0; attempt < 1000; attempt++) {
      const puzzle = buildCase(settings);
      if (puzzle) return { ...puzzle, difficulty, seed, caseNumber: String(seed) };
    }
  } finally {
    random = Math.random;
  }
  throw new Error('No se ha podido generar un caso.');
}

export function cellLabel({ row, col }) {
  return `${String.fromCharCode(65 + col)}${row + 1}`;
}
