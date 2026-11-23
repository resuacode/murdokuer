import { jsPDF } from 'jspdf';
import { OBJECTS, cellLabel } from './puzzle.js';
import { ROOM_COLORS, clueEmoji, labelCells, letter } from './board.js';
import { caseTitle, clueText, dictionary, levelName, objectText, personText, roomText, slug } from './i18n/content.js';
import { locale } from './i18n/index.js';

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

function pageFrame(pdf, write, puzzle, pageLabel, heading, code) {
  write.text(`MURDOKUER  /  ${dictionary(code).ui.caseNumber(puzzle.caseNumber)}`, 18, 16, 9, INK, 'bold');
  write.text(heading, 279, 16, 8, GREEN, 'bold', { align: 'right' });
  pdf.setDrawColor(LINE);
  pdf.setLineWidth(0.2);
  pdf.line(18, 20, 279, 20);
  pdf.line(18, 193, 279, 193);
  write.text(pageLabel, 279, 199, 8, MUTED, 'bold', { align: 'right' });
}

function drawBoard(pdf, write, puzzle, { x, y, width, showSolution, code }) {
  const { size } = puzzle;
  const cell = width / size;
  const labels = labelCells(puzzle, code);
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
    if (label) {
      // El nombre de la habitación se reduce si no cabe en la casilla (p. ej. «SALLE À MANGER»).
      const text = label.toUpperCase();
      let fontSize = size > 6 ? 4.2 : size > 5 ? 5 : 5.5;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(fontSize);
      const width = pdf.getTextWidth(text);
      if (width > cell - 2) fontSize *= (cell - 2) / width;
      write.text(text, cx + 1, cy + 2.8, fontSize, GREEN, 'bold');
    }
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

function drawPeople(write, puzzle, { x, y, width, code }) {
  const columns = puzzle.people.length > 6 ? 4 : 3;
  const column = width / columns;
  const victimTag = dictionary(code).ui.victimTag;
  puzzle.people.forEach((_, index) => {
    const person = personText(puzzle, index, code);
    const px = x + (index % columns) * column;
    const py = y + Math.floor(index / columns) * 11;
    write.emoji(person.emoji, px, py, 8);
    write.text(person.name, px + 9.5, py + 3.6, 9, person.victim ? RED : INK, 'bold');
    write.text(person.victim ? `${person.role} (${victimTag})` : person.role, px + 9.5, py + 7.4, columns > 3 ? 6 : 7, MUTED);
  });
  return y + Math.ceil(puzzle.people.length / columns) * 11;
}

// Añade un caso en la página actual y su solución en la siguiente, en el idioma `code`.
function addCase(pdf, write, puzzle, onlineUrl, { index, total, code = locale() } = {}) {
  const ui = dictionary(code).ui;
  const { rules, story } = dictionary(code);
  const { title, subtitle } = caseTitle(puzzle, code);
  const clues = puzzle.clues.map((clue) => clueText(puzzle, clue, code));
  const booklet = total > 1;
  const pad = (n) => String(n).padStart(2, '0');
  const level = levelName(puzzle.difficulty, code).toUpperCase();
  const left = 18;
  const leftWidth = 132;
  const boardX = 170;
  const boardWidth = 106;

  // Hoja 1: el caso.
  pageFrame(pdf, write, puzzle, booklet ? ui.pdfStatement(pad(index + 1), pad(total)) : '01 / 02', ui.pdfCaseHeading(level, puzzle.size), code);
  if (onlineUrl) {
    const lead = `${ui.pdfPlayOnline} `;
    write.text(lead, left, 199, 7, MUTED, 'bold');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    const offset = pdf.getTextWidth(lead);
    pdf.setTextColor(GREEN);
    pdf.textWithLink(onlineUrl, left + offset + 1.2, 199, { url: onlineUrl });
  } else {
    write.text(ui.paperFooter, left, 199, 8, MUTED, 'bold');
  }
  write.text(ui.caseLabel, left, 30, 9, GREEN, 'bold');
  write.text(title, left, 41, 22, INK, 'bold');
  write.text(subtitle, left, 50, 22, GREEN, 'italic');
  let y = write.paragraph(story, left, 58, leftWidth, 9.5, MUTED) + 4;

  // Ajusta el tamaño de letra para que reglas y pistas quepan en la columna.
  const measure = (size) => {
    pdf.setFontSize(size);
    const ruleLines = rules.reduce((sum, rule) => sum + pdf.splitTextToSize(rule, leftWidth - 6).length, 0);
    const clueLines = clues.reduce((sum, clue) => sum + pdf.splitTextToSize(clue, leftWidth - 8).length, 0);
    return 18 + (ruleLines + clueLines) * size * 0.42 + rules.length * 1.2 + clues.length * 1.8;
  };
  let fontSize = 9;
  while (fontSize > 6.5 && y + measure(fontSize) > 189) fontSize -= 0.5;
  const ruleGap = fontSize < 8 ? 0.8 : 1.2;
  const clueGap = fontSize < 8 ? 1.4 : 1.8;

  write.text(ui.rulesHeading, left, y, 9, GREEN, 'bold');
  y += 5;
  rules.forEach((rule, ruleIndex) => {
    write.text(`${ruleIndex + 1}.`, left, y, fontSize, GREEN, 'bold');
    y = write.paragraph(rule, left + 6, y, leftWidth - 6, fontSize) + ruleGap;
  });
  y += 3;
  write.text(ui.cluesHeading, left, y, 9, GREEN, 'bold');
  y += 5;
  const emojiSize = fontSize * 0.55;
  puzzle.clues.forEach((clue, clueIndex) => {
    write.emoji(clueEmoji(puzzle, clue), left, y - emojiSize * 0.7, emojiSize);
    const end = write.paragraph(clues[clueIndex], left + 8, y, leftWidth - 8, fontSize);
    y = Math.max(end, y + emojiSize * 0.6) + clueGap;
  });

  write.text(ui.boardHeading, boardX, 30, 9, GREEN, 'bold');
  write.text(ui.thinkCalm, boardX + boardWidth, 30, 8, MUTED, 'normal', { align: 'right' });
  drawBoard(pdf, write, puzzle, { x: boardX, y: 38, width: boardWidth, code });
  write.text(ui.peopleHeading, boardX, 152, 9, GREEN, 'bold');
  const peopleEnd = drawPeople(write, puzzle, { x: boardX, y: 155, width: boardWidth, code });
  const answerY = Math.max(peopleEnd + 5, 185);
  write.text(ui.pdfCulpritLine, boardX, answerY, 8, INK, 'bold');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  const lineStart = boardX + pdf.getTextWidth(ui.pdfCulpritLine) + 3;
  pdf.setDrawColor(INK);
  pdf.setLineWidth(0.3);
  pdf.line(lineStart, answerY + 0.5, boardX + boardWidth, answerY + 0.5);

  // Hoja 2: la solución.
  pdf.addPage();
  pageFrame(pdf, write, puzzle, booklet ? ui.pdfAnswer(pad(index + 1), pad(total)) : '02 / 02', ui.pdfSolutionHeading, code);
  write.text(ui.paperFooter, left, 199, 8, MUTED, 'bold');
  const murderer = personText(puzzle, puzzle.murderer, code);
  const victim = personText(puzzle, puzzle.victim, code);
  const crimeRoom = roomText(puzzle, puzzle.crimeRoom, code);
  write.text(ui.pdfSolution, left, 30, 9, GREEN, 'bold');
  write.text(`${title} ${subtitle}`, left, 41, 16, INK, 'bold');
  write.emoji(murderer.emoji, left, 49, 16);
  write.text(ui.pdfCulprit(murderer.gender), left + 20, 54, 8, GREEN, 'bold');
  write.text(`${murderer.name}, ${murderer.role}`, left + 20, 61, 16, INK, 'bold');
  y = write.paragraph(ui.pdfExplanation(murderer.name, victim.name, crimeRoom.in), left, 74, leftWidth, 10, MUTED) + 6;
  write.text(ui.pdfWhere, left, y, 9, GREEN, 'bold');
  y += 6;
  const rowHeight = puzzle.people.length > 6 ? 7.5 : 8.5;
  puzzle.people.forEach((_, personIndex) => {
    const person = personText(puzzle, personIndex, code);
    const pos = puzzle.solution[personIndex];
    const room = roomText(puzzle, puzzle.roomGrid[pos.row][pos.col], code);
    const object = puzzle.objects[pos.row][pos.col];
    write.emoji(person.emoji, left, y - 4.5, 6);
    write.text(cellLabel(pos), left + 9, y, 10, INK, 'bold');
    const detail = ui.pdfWhereDetail({ name: person.name, victim: person.victim, room: room.name, on: object ? objectText(object, code).on : '' });
    write.text(detail, left + 20, y, 10, person.victim ? RED : INK);
    y += rowHeight;
  });
  write.text(ui.pdfSolvedBoard, boardX, 30, 9, GREEN, 'bold');
  drawBoard(pdf, write, puzzle, { x: boardX, y: 38, width: boardWidth, showSolution: true, code });
  write.text(ui.pdfLegend, boardX, 152, 8, MUTED);
}

const newDocument = () => new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

function setMetadata(pdf, code, title) {
  pdf.setProperties({ title, creator: 'Murdokuer' });
  pdf.setLanguage?.(dictionary(code).htmlLang);
}

export function downloadPdf(puzzle, onlineUrl, code = locale()) {
  const pdf = newDocument();
  const { title, subtitle } = caseTitle(puzzle, code);
  setMetadata(pdf, code, `Murdokuer · ${title} ${subtitle}`);
  addCase(pdf, createWriter(pdf), puzzle, onlineUrl, { code });
  pdf.save(dictionary(code).ui.fileCase(slug(levelName(puzzle.difficulty, code)), puzzle.caseNumber));
}

/**
 * Cuadernillo: cada caso en una página impar y su solución en la siguiente (doble cara).
 * Cede el hilo entre casos para que la página pueda mostrar el avance.
 */
export async function downloadBooklet(puzzles, { urlFor, filename, onProgress, signal, code = locale() } = {}) {
  const pdf = newDocument();
  const write = createWriter(pdf);
  setMetadata(pdf, code, dictionary(code).ui.pdfDocTitle(puzzles.length));
  for (const [index, puzzle] of puzzles.entries()) {
    if (signal?.aborted) throw new DOMException('Cancelado', 'AbortError');
    if (index > 0) pdf.addPage();
    addCase(pdf, write, puzzle, urlFor?.(puzzle), { index, total: puzzles.length, code });
    onProgress?.(index + 1, puzzles.length);
    await new Promise((resolve) => { setTimeout(resolve, 0); });
  }
  if (signal?.aborted) throw new DOMException('Cancelado', 'AbortError');
  pdf.save(filename);
}
