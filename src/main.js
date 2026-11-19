import { jsPDF } from 'jspdf';
import { DIFFICULTIES, OBJECTS, cellLabel, generatePuzzle } from './puzzle.js';
import './style.css';

const ROOM_COLORS = ['#e3ede0', '#f4e8d4', '#dfe7f0', '#f2e1e3', '#e9e2f1', '#e0efeb', '#f1eed7', '#e7e5df'];
const RULES = [
  'Coloca a cada persona (los sospechosos y la víctima) en una casilla: en cada fila y en cada columna hay exactamente una persona.',
  'Se puede estar en sillas, sofás y camas, pero no en casillas con plantas, estanterías, televisiones o pianos.',
  '"Junto a" significa en una casilla contigua (arriba, abajo, izquierda o derecha) de la misma habitación.',
  'Todas las pistas son ciertas. La persona culpable es la única que estaba a solas con la víctima en una habitación.',
];
const STORY = 'Esta noche alguien no salió con vida de la casa. Ordena a los implicados en el plano y descubre quién se quedó a solas con la víctima.';

const elements = {
  board: document.querySelector('#board'),
  title: document.querySelector('#case-title'),
  number: document.querySelector('#case-number'),
  level: document.querySelector('#case-level'),
  rules: document.querySelector('#rules'),
  people: document.querySelector('#people'),
  clues: document.querySelector('#clue-list'),
  status: document.querySelector('#status'),
};

const letter = (index) => String.fromCharCode(65 + index);

// Grosor de cada borde de una casilla: grueso si separa habitaciones distintas.
function roomBorders(puzzle, row, col) {
  const room = puzzle.roomGrid[row][col];
  const differs = (r, c) => puzzle.roomGrid[r]?.[c] !== room;
  return { top: differs(row - 1, col), bottom: differs(row + 1, col), left: differs(row, col - 1), right: differs(row, col + 1) };
}

// Casilla donde se rotula el nombre de cada habitación (la primera en orden de lectura).
function labelCells(puzzle) {
  const cells = new Map();
  puzzle.roomGrid.forEach((row, r) => row.forEach((room, c) => { if (!cells.has(room)) cells.set(room, `${r},${c}`); }));
  return new Map([...cells].map(([room, key]) => [key, puzzle.rooms[room].name]));
}

function render(puzzle) {
  elements.title.innerHTML = `${puzzle.title}<br /><em>${puzzle.subtitle}</em>`;
  elements.number.textContent = ` / EXPEDIENTE Nº ${puzzle.caseNumber}`;
  elements.level.textContent = `DIFICULTAD ${DIFFICULTIES[puzzle.difficulty].label.toUpperCase()} · ${puzzle.size} × ${puzzle.size}`;
  elements.rules.replaceChildren(...RULES.map((rule) => Object.assign(document.createElement('li'), { textContent: rule })));
  elements.people.replaceChildren(...puzzle.people.map((person) => {
    const item = document.createElement('div');
    item.className = person.victim ? 'person victim' : 'person';
    item.innerHTML = `<span class="emoji">${person.emoji}</span><span><b></b><small></small></span>`;
    item.querySelector('b').textContent = person.name;
    item.querySelector('small').textContent = person.victim ? `${person.role} · víctima` : person.role;
    return item;
  }));
  elements.clues.replaceChildren(...puzzle.clues.map((clue) => {
    const item = document.createElement('li');
    item.innerHTML = `<span class="emoji">${puzzle.people[clue.subject].emoji}</span><span></span>`;
    item.lastChild.textContent = clue.text;
    return item;
  }));

  const labels = labelCells(puzzle);
  const board = elements.board;
  board.replaceChildren();
  board.style.setProperty('--size', puzzle.size);
  board.setAttribute('aria-label', `Plano de ${puzzle.size} por ${puzzle.size} casillas con ${puzzle.rooms.length} habitaciones.`);
  board.append(Object.assign(document.createElement('span'), { className: 'coordinate' }));
  for (let c = 0; c < puzzle.size; c++) board.append(Object.assign(document.createElement('span'), { className: 'coordinate', textContent: letter(c) }));
  puzzle.roomGrid.forEach((row, r) => {
    board.append(Object.assign(document.createElement('span'), { className: 'coordinate', textContent: r + 1 }));
    row.forEach((room, c) => {
      const cell = document.createElement('span');
      const borders = roomBorders(puzzle, r, c);
      cell.className = 'cell';
      cell.style.background = ROOM_COLORS[room];
      cell.style.borderWidth = ['top', 'right', 'bottom', 'left'].map((side) => (borders[side] ? '2px' : '0.5px')).join(' ');
      const object = puzzle.objects[r][c];
      if (object) cell.append(Object.assign(document.createElement('span'), { className: 'object', textContent: OBJECTS[object].emoji }));
      const label = labels.get(`${r},${c}`);
      if (label) cell.append(Object.assign(document.createElement('span'), { className: 'room-label', textContent: label }));
      board.append(cell);
    });
  });
}

// ---- PDF -------------------------------------------------------------------------

const INK = '#232b28';
const GREEN = '#426b5a';
const MUTED = '#6f7971';
const LINE = '#bfc9bf';

// jsPDF no sabe pintar emojis con sus fuentes estándar: se dibujan en un canvas y se insertan como imagen.
const emojiImages = new Map();
function emojiImage(emoji) {
  if (!emojiImages.has(emoji)) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const context = canvas.getContext('2d');
    context.font = '104px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(emoji, 64, 70);
    emojiImages.set(emoji, canvas.toDataURL('image/png'));
  }
  return emojiImages.get(emoji);
}

function createPdfWriter(pdf) {
  const text = (value, x, y, size, color = INK, style = 'normal', options) => {
    pdf.setFont('helvetica', style);
    pdf.setFontSize(size);
    pdf.setTextColor(color);
    pdf.text(value, x, y, options);
  };
  const emoji = (value, x, y, size) => pdf.addImage(emojiImage(value), 'PNG', x, y, size, size, `emoji-${value}`);
  return { text, emoji };
}

function pageFrame(pdf, write, puzzle, page, heading) {
  write.text(`MURDOKUER  /  EXPEDIENTE Nº ${puzzle.caseNumber}`, 18, 16, 9, INK, 'bold');
  write.text(heading, 279, 16, 8, GREEN, 'bold', { align: 'right' });
  pdf.setDrawColor(LINE);
  pdf.setLineWidth(0.2);
  pdf.line(18, 20, 279, 20);
  pdf.line(18, 193, 279, 193);
  write.text('MURDOKUER · EL ARTE DE DEDUCIR', 18, 199, 8, MUTED, 'bold');
  write.text(`0${page} / 02`, 279, 199, 8, MUTED, 'bold', { align: 'right' });
}

function drawBoard(pdf, write, puzzle, { x, y, width, showSolution }) {
  const { size } = puzzle;
  const cell = width / size;
  const labels = labelCells(puzzle);
  const occupant = new Map(puzzle.solution.map((pos, index) => [`${pos.row},${pos.col}`, index]));
  for (let i = 0; i < size; i++) {
    write.text(letter(i), x + i * cell + cell / 2, y - 2.5, 9, MUTED, 'bold', { align: 'center' });
    write.text(String(i + 1), x - 4, y + i * cell + cell / 2 + 1.2, 9, MUTED, 'bold', { align: 'center' });
  }
  puzzle.roomGrid.forEach((row, r) => row.forEach((room, c) => {
    const cx = x + c * cell;
    const cy = y + r * cell;
    pdf.setFillColor(ROOM_COLORS[room]);
    pdf.rect(cx, cy, cell, cell, 'F');
    const label = labels.get(`${r},${c}`);
    if (label) write.text(label.toUpperCase(), cx + 1.2, cy + 3, size > 5 ? 5 : 5.5, GREEN, 'bold');
    const object = puzzle.objects[r][c];
    const person = showSolution ? occupant.get(`${r},${c}`) : undefined;
    if (person !== undefined) {
      if (object) write.emoji(OBJECTS[object].emoji, cx + cell - cell * 0.32, cy + cell - cell * 0.32, cell * 0.28);
      const highlight = person === puzzle.murderer || person === puzzle.victim;
      if (highlight) {
        pdf.setDrawColor(person === puzzle.victim ? '#8c3b3b' : GREEN);
        pdf.setLineWidth(0.8);
        pdf.rect(cx + 1.2, cy + 1.2, cell - 2.4, cell - 2.4, 'S');
      }
      write.emoji(puzzle.people[person].emoji, cx + cell * 0.2, cy + cell * 0.2, cell * 0.6);
    } else if (object) {
      const emojiSize = cell * 0.5;
      write.emoji(OBJECTS[object].emoji, cx + (cell - emojiSize) / 2, cy + (cell - emojiSize) / 2 + 1, emojiSize);
    }
  }));
  // Rejilla fina y muros entre habitaciones.
  pdf.setDrawColor('#8c978e');
  pdf.setLineWidth(0.15);
  for (let i = 1; i < size; i++) {
    pdf.line(x + i * cell, y, x + i * cell, y + size * cell);
    pdf.line(x, y + i * cell, x + size * cell, y + i * cell);
  }
  pdf.setDrawColor(INK);
  pdf.setLineWidth(0.9);
  pdf.rect(x, y, size * cell, size * cell, 'S');
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const room = puzzle.roomGrid[r][c];
      if (c + 1 < size && puzzle.roomGrid[r][c + 1] !== room) pdf.line(x + (c + 1) * cell, y + r * cell, x + (c + 1) * cell, y + (r + 1) * cell);
      if (r + 1 < size && puzzle.roomGrid[r + 1][c] !== room) pdf.line(x + c * cell, y + (r + 1) * cell, x + (c + 1) * cell, y + (r + 1) * cell);
    }
  }
}

function drawPeople(write, puzzle, { x, y, width }) {
  const columns = 3;
  const column = width / columns;
  puzzle.people.forEach((person, index) => {
    const px = x + (index % columns) * column;
    const py = y + Math.floor(index / columns) * 11;
    write.emoji(person.emoji, px, py, 8);
    write.text(person.name, px + 10, py + 3.6, 9, person.victim ? '#8c3b3b' : INK, 'bold');
    write.text(person.victim ? `${person.role} (víctima)` : person.role, px + 10, py + 7.4, 7, MUTED);
  });
  return y + Math.ceil(puzzle.people.length / columns) * 11;
}

// Escribe un bloque de texto ajustado al ancho; devuelve la nueva coordenada y.
function paragraph(pdf, write, value, x, y, width, size, color = INK, style = 'normal') {
  pdf.setFont('helvetica', style);
  pdf.setFontSize(size);
  const lines = pdf.splitTextToSize(value, width);
  write.text(lines, x, y, size, color, style);
  return y + lines.length * size * 0.42;
}

function downloadPdf(puzzle) {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const write = createPdfWriter(pdf);
  const level = DIFFICULTIES[puzzle.difficulty].label.toUpperCase();

  // Hoja 1: el caso.
  pageFrame(pdf, write, puzzle, 1, `DIFICULTAD ${level} · CONFIDENCIAL`);
  const left = 18;
  const leftWidth = 132;
  write.text('EL CASO', left, 30, 9, GREEN, 'bold');
  write.text(puzzle.title, left, 41, 22, INK, 'bold');
  write.text(puzzle.subtitle, left, 50, 22, GREEN, 'italic');
  let y = paragraph(pdf, write, STORY, left, 58, leftWidth, 9.5, MUTED) + 4;

  // Ajusta el tamaño de letra para que reglas y pistas quepan en la columna.
  let fontSize = 9;
  const measure = (size) => {
    pdf.setFontSize(size);
    const rules = RULES.reduce((sum, rule) => sum + pdf.splitTextToSize(rule, leftWidth - 6).length, 0);
    const clues = puzzle.clues.reduce((sum, clue) => sum + Math.max(1.4, pdf.splitTextToSize(clue.text, leftWidth - 8).length), 0);
    return 20 + (rules + clues) * size * 0.42 + RULES.length * 1.5 + puzzle.clues.length * 2;
  };
  while (fontSize > 6.5 && y + measure(fontSize) > 188) fontSize -= 0.5;

  write.text('01 / LAS REGLAS', left, y, 9, GREEN, 'bold');
  y += 5;
  RULES.forEach((rule, index) => {
    write.text(`${index + 1}.`, left, y, fontSize, GREEN, 'bold');
    y = paragraph(pdf, write, rule, left + 6, y, leftWidth - 6, fontSize) + 1.5;
  });
  y += 3;
  write.text('02 / LAS PISTAS', left, y, 9, GREEN, 'bold');
  y += 5;
  const emojiSize = fontSize * 0.55;
  puzzle.clues.forEach((clue) => {
    write.emoji(puzzle.people[clue.subject].emoji, left, y - emojiSize * 0.7, emojiSize);
    const end = paragraph(pdf, write, clue.text, left + 8, y, leftWidth - 8, fontSize);
    y = Math.max(end, y + emojiSize * 0.6) + 2;
  });

  const boardX = 170;
  const boardWidth = 106;
  write.text('EL PLANO', boardX, 30, 9, GREEN, 'bold');
  write.text('PIENSA CON CALMA', boardX + boardWidth, 30, 8, MUTED, 'normal', { align: 'right' });
  drawBoard(pdf, write, puzzle, { x: boardX, y: 38, width: boardWidth });
  write.text('03 / LOS IMPLICADOS', boardX, 152, 9, GREEN, 'bold');
  const peopleEnd = drawPeople(write, puzzle, { x: boardX, y: 155, width: boardWidth });
  write.text('LA PERSONA CULPABLE ES:', boardX, Math.max(peopleEnd + 5, 185), 8, INK, 'bold');
  pdf.setDrawColor(INK);
  pdf.setLineWidth(0.3);
  pdf.line(boardX + 43, Math.max(peopleEnd + 5, 185) + 0.5, boardX + boardWidth, Math.max(peopleEnd + 5, 185) + 0.5);

  // Hoja 2: el solucionario.
  pdf.addPage();
  pageFrame(pdf, write, puzzle, 2, 'SOLUCIONARIO · NO LEER ANTES DE TIEMPO');
  const murderer = puzzle.people[puzzle.murderer];
  const victim = puzzle.people[puzzle.victim];
  const crimeRoom = puzzle.rooms[puzzle.crimeRoom];
  write.text('LA SOLUCIÓN', left, 30, 9, GREEN, 'bold');
  write.text(`${puzzle.title} ${puzzle.subtitle}`, left, 41, 16, INK, 'bold');
  write.emoji(murderer.emoji, left, 49, 16);
  write.text('CULPABLE', left + 20, 54, 8, GREEN, 'bold');
  write.text(`${murderer.name}, ${murderer.role}`, left + 20, 61, 16, INK, 'bold');
  y = paragraph(pdf, write, `${murderer.name} era la única persona a solas con ${victim.name} en ${crimeRoom.article}.`, left, 74, leftWidth, 10, MUTED) + 6;
  write.text('DÓNDE ESTABA CADA PERSONA', left, y, 9, GREEN, 'bold');
  y += 6;
  puzzle.people.forEach((person, index) => {
    const pos = puzzle.solution[index];
    const room = puzzle.rooms[puzzle.roomGrid[pos.row][pos.col]];
    const object = puzzle.objects[pos.row][pos.col];
    write.emoji(person.emoji, left, y - 4.5, 6);
    write.text(cellLabel(pos), left + 9, y, 10, INK, 'bold');
    const detail = `${person.name}${person.victim ? ' (víctima)' : ''} · ${room.name}${object ? `, en ${OBJECTS[object].name}` : ''}`;
    write.text(detail, left + 20, y, 10, person.victim ? '#8c3b3b' : INK);
    y += 8.5;
  });
  write.text('EL PLANO RESUELTO', boardX, 30, 9, GREEN, 'bold');
  drawBoard(pdf, write, puzzle, { x: boardX, y: 38, width: boardWidth, showSolution: true });
  write.text('Marco verde: culpable · Marco rojo: víctima', boardX, 152, 8, MUTED);

  pdf.save(`murdokuer-${puzzle.difficulty}-${puzzle.caseNumber}.pdf`);
}

render(generatePuzzle('media'));
for (const button of document.querySelectorAll('[data-difficulty]')) {
  button.addEventListener('click', () => {
    try {
      const puzzle = generatePuzzle(button.dataset.difficulty);
      downloadPdf(puzzle);
      render(puzzle);
      elements.status.textContent = `Tu nuevo caso (dificultad ${DIFFICULTIES[puzzle.difficulty].label.toLowerCase()}) está listo.`;
    } catch (error) {
      console.error(error);
      elements.status.textContent = 'No se ha podido generar el PDF. Inténtalo de nuevo.';
    }
  });
}
