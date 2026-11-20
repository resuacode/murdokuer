import { jsPDF } from 'jspdf';
import { OBJECTS, cellLabel } from './puzzle.js';
import { ROOM_COLORS, RULES, STORY, clueEmoji, labelCells, letter, levelLabel } from './board.js';

const INK = '#232b28';
const GREEN = '#426b5a';
const MUTED = '#6f7971';
const LINE = '#bfc9bf';
const RED = '#8c3b3b';

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

function createWriter(pdf) {
  const text = (value, x, y, size, color = INK, style = 'normal', options) => {
    pdf.setFont('helvetica', style);
    pdf.setFontSize(size);
    pdf.setTextColor(color);
    pdf.text(value, x, y, options);
  };
  const emoji = (value, x, y, size) => pdf.addImage(emojiImage(value), 'PNG', x, y, size, size, `emoji-${value}`);
  // Bloque de texto ajustado al ancho; devuelve la nueva coordenada y.
  const paragraph = (value, x, y, width, size, color = INK, style = 'normal') => {
    pdf.setFont('helvetica', style);
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(value, width);
    text(lines, x, y, size, color, style);
    return y + lines.length * size * 0.42;
  };
  return { text, emoji, paragraph };
}

function pageFrame(pdf, write, puzzle, pageLabel, heading) {
  write.text(`MURDOKUER  /  EXPEDIENTE Nº ${puzzle.caseNumber}`, 18, 16, 9, INK, 'bold');
  write.text(heading, 279, 16, 8, GREEN, 'bold', { align: 'right' });
  pdf.setDrawColor(LINE);
  pdf.setLineWidth(0.2);
  pdf.line(18, 20, 279, 20);
  pdf.line(18, 193, 279, 193);
  write.text(pageLabel, 279, 199, 8, MUTED, 'bold', { align: 'right' });
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
    pdf.setFillColor(ROOM_COLORS[room % ROOM_COLORS.length]);
    pdf.rect(cx, cy, cell, cell, 'F');
    const label = labels.get(`${r},${c}`);
    if (label) write.text(label.toUpperCase(), cx + 1, cy + 2.8, size > 6 ? 4.2 : size > 5 ? 5 : 5.5, GREEN, 'bold');
    const object = puzzle.objects[r][c];
    const person = showSolution ? occupant.get(`${r},${c}`) : undefined;
    if (person !== undefined) {
      if (object) write.emoji(OBJECTS[object].emoji, cx + cell * 0.68, cy + cell * 0.68, cell * 0.28);
      if (person === puzzle.murderer || person === puzzle.victim) {
        pdf.setDrawColor(person === puzzle.victim ? RED : GREEN);
        pdf.setLineWidth(0.8);
        pdf.rect(cx + 1.2, cy + 1.2, cell - 2.4, cell - 2.4, 'S');
      }
      write.emoji(puzzle.people[person].emoji, cx + cell * 0.2, cy + cell * 0.2, cell * 0.6);
    } else if (object) {
      const emojiSize = cell * 0.5;
      write.emoji(OBJECTS[object].emoji, cx + (cell - emojiSize) / 2, cy + (cell - emojiSize) / 2 + cell * 0.05, emojiSize);
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
  const columns = puzzle.people.length > 6 ? 4 : 3;
  const column = width / columns;
  puzzle.people.forEach((person, index) => {
    const px = x + (index % columns) * column;
    const py = y + Math.floor(index / columns) * 11;
    write.emoji(person.emoji, px, py, 8);
    write.text(person.name, px + 9.5, py + 3.6, 9, person.victim ? RED : INK, 'bold');
    write.text(person.victim ? `${person.role} (víctima)` : person.role, px + 9.5, py + 7.4, columns > 3 ? 6 : 7, MUTED);
  });
  return y + Math.ceil(puzzle.people.length / columns) * 11;
}

// Añade un caso en la página actual y su solución en la siguiente.
function addCase(pdf, write, puzzle, onlineUrl, { index, total } = {}) {
  const booklet = total > 1;
  const number = booklet ? `CASO ${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}` : '';
  const level = levelLabel(puzzle).toUpperCase();
  const left = 18;
  const leftWidth = 132;
  const boardX = 170;
  const boardWidth = 106;

  // Hoja 1: el caso.
  pageFrame(pdf, write, puzzle, booklet ? `${number} · ENUNCIADO` : '01 / 02', `DIFICULTAD ${level} · ${puzzle.size} × ${puzzle.size} · CONFIDENCIAL`);
  if (onlineUrl) {
    write.text('¿PREFIERES JUGAR EN PANTALLA? ', left, 199, 7, MUTED, 'bold');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    const offset = pdf.getTextWidth('¿PREFIERES JUGAR EN PANTALLA? ');
    pdf.setTextColor(GREEN);
    pdf.textWithLink(onlineUrl, left + offset + 1.2, 199, { url: onlineUrl });
  } else {
    write.text('MURDOKUER · EL ARTE DE DEDUCIR', left, 199, 8, MUTED, 'bold');
  }
  write.text('EL CASO', left, 30, 9, GREEN, 'bold');
  write.text(puzzle.title, left, 41, 22, INK, 'bold');
  write.text(puzzle.subtitle, left, 50, 22, GREEN, 'italic');
  let y = write.paragraph(STORY, left, 58, leftWidth, 9.5, MUTED) + 4;

  // Ajusta el tamaño de letra para que reglas y pistas quepan en la columna.
  const measure = (size) => {
    pdf.setFontSize(size);
    const rules = RULES.reduce((sum, rule) => sum + pdf.splitTextToSize(rule, leftWidth - 6).length, 0);
    const clues = puzzle.clues.reduce((sum, clue) => sum + pdf.splitTextToSize(clue.text, leftWidth - 8).length, 0);
    return 18 + (rules + clues) * size * 0.42 + RULES.length * 1.2 + puzzle.clues.length * 1.8;
  };
  let fontSize = 9;
  while (fontSize > 6.5 && y + measure(fontSize) > 189) fontSize -= 0.5;
  const ruleGap = fontSize < 8 ? 0.8 : 1.2;
  const clueGap = fontSize < 8 ? 1.4 : 1.8;

  write.text('01 / LAS REGLAS', left, y, 9, GREEN, 'bold');
  y += 5;
  RULES.forEach((rule, index) => {
    write.text(`${index + 1}.`, left, y, fontSize, GREEN, 'bold');
    y = write.paragraph(rule, left + 6, y, leftWidth - 6, fontSize) + ruleGap;
  });
  y += 3;
  write.text('02 / LAS PISTAS', left, y, 9, GREEN, 'bold');
  y += 5;
  const emojiSize = fontSize * 0.55;
  puzzle.clues.forEach((clue) => {
    write.emoji(clueEmoji(puzzle, clue), left, y - emojiSize * 0.7, emojiSize);
    const end = write.paragraph(clue.text, left + 8, y, leftWidth - 8, fontSize);
    y = Math.max(end, y + emojiSize * 0.6) + clueGap;
  });

  write.text('EL PLANO', boardX, 30, 9, GREEN, 'bold');
  write.text('PIENSA CON CALMA', boardX + boardWidth, 30, 8, MUTED, 'normal', { align: 'right' });
  drawBoard(pdf, write, puzzle, { x: boardX, y: 38, width: boardWidth });
  write.text('03 / LOS IMPLICADOS', boardX, 152, 9, GREEN, 'bold');
  const peopleEnd = drawPeople(write, puzzle, { x: boardX, y: 155, width: boardWidth });
  const answerY = Math.max(peopleEnd + 5, 185);
  write.text('LA PERSONA CULPABLE ES:', boardX, answerY, 8, INK, 'bold');
  pdf.setDrawColor(INK);
  pdf.setLineWidth(0.3);
  pdf.line(boardX + 43, answerY + 0.5, boardX + boardWidth, answerY + 0.5);

  // Hoja 2: el solucionario.
  pdf.addPage();
  pageFrame(pdf, write, puzzle, booklet ? `${number} · SOLUCIÓN` : '02 / 02', 'SOLUCIONARIO · NO LEER ANTES DE TIEMPO');
  write.text('MURDOKUER · EL ARTE DE DEDUCIR', left, 199, 8, MUTED, 'bold');
  const murderer = puzzle.people[puzzle.murderer];
  const victim = puzzle.people[puzzle.victim];
  const crimeRoom = puzzle.rooms[puzzle.crimeRoom];
  write.text('LA SOLUCIÓN', left, 30, 9, GREEN, 'bold');
  write.text(`${puzzle.title} ${puzzle.subtitle}`, left, 41, 16, INK, 'bold');
  write.emoji(murderer.emoji, left, 49, 16);
  write.text('CULPABLE', left + 20, 54, 8, GREEN, 'bold');
  write.text(`${murderer.name}, ${murderer.role}`, left + 20, 61, 16, INK, 'bold');
  y = write.paragraph(`${murderer.name} era la única persona a solas con ${victim.name} en ${crimeRoom.article}.`, left, 74, leftWidth, 10, MUTED) + 6;
  write.text('DÓNDE ESTABA CADA PERSONA', left, y, 9, GREEN, 'bold');
  y += 6;
  const rowHeight = puzzle.people.length > 6 ? 7.5 : 8.5;
  puzzle.people.forEach((person, index) => {
    const pos = puzzle.solution[index];
    const room = puzzle.rooms[puzzle.roomGrid[pos.row][pos.col]];
    const object = puzzle.objects[pos.row][pos.col];
    write.emoji(person.emoji, left, y - 4.5, 6);
    write.text(cellLabel(pos), left + 9, y, 10, INK, 'bold');
    const detail = `${person.name}${person.victim ? ' (víctima)' : ''} · ${room.name}${object ? `, en ${OBJECTS[object].name}` : ''}`;
    write.text(detail, left + 20, y, 10, person.victim ? RED : INK);
    y += rowHeight;
  });
  write.text('EL PLANO RESUELTO', boardX, 30, 9, GREEN, 'bold');
  drawBoard(pdf, write, puzzle, { x: boardX, y: 38, width: boardWidth, showSolution: true });
  write.text('Marco verde: culpable · Marco rojo: víctima', boardX, 152, 8, MUTED);
}

const newDocument = () => new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

export function downloadPdf(puzzle, onlineUrl) {
  const pdf = newDocument();
  addCase(pdf, createWriter(pdf), puzzle, onlineUrl);
  pdf.save(`murdokuer-${puzzle.difficulty}-${puzzle.caseNumber}.pdf`);
}

/**
 * Cuadernillo: cada caso en una página impar y su solución en la siguiente (doble cara).
 * Cede el hilo entre casos para que la página pueda mostrar el avance.
 */
export async function downloadBooklet(puzzles, { urlFor, filename, onProgress, signal } = {}) {
  const pdf = newDocument();
  const write = createWriter(pdf);
  pdf.setProperties({ title: `Murdokuer · ${puzzles.length} casos`, creator: 'Murdokuer' });
  for (const [index, puzzle] of puzzles.entries()) {
    if (signal?.aborted) throw new DOMException('Cancelado', 'AbortError');
    if (index > 0) pdf.addPage();
    addCase(pdf, write, puzzle, urlFor?.(puzzle), { index, total: puzzles.length });
    onProgress?.(index + 1, puzzles.length);
    await new Promise((resolve) => { setTimeout(resolve, 0); });
  }
  if (signal?.aborted) throw new DOMException('Cancelado', 'AbortError');
  pdf.save(filename ?? `murdokuer-cuadernillo-${puzzles.length}-casos.pdf`);
}
