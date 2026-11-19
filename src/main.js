import { jsPDF } from 'jspdf';
import { generatePuzzle, sceneLabel } from './puzzle.js';
import './style.css';

const boardElement = document.querySelector('#board');
const sceneElement = document.querySelector('#scene');
const parityElement = document.querySelector('#parity');
const status = document.querySelector('#status');

function render(puzzle) {
  const label = sceneLabel(puzzle.scene);
  sceneElement.textContent = label;
  parityElement.textContent = puzzle.parity;
  boardElement.replaceChildren();
  boardElement.setAttribute('aria-label', `Tablero de sudoku de 6 por 6. Casilla marcada: ${label}.`);
  const corner = document.createElement('span');
  corner.className = 'coordinate';
  boardElement.append(corner);
  for (const letter of 'ABCDEF') {
    const coordinate = document.createElement('span');
    coordinate.className = 'coordinate';
    coordinate.textContent = letter;
    boardElement.append(coordinate);
  }
  puzzle.board.forEach((row, r) => {
    const coordinate = document.createElement('span');
    coordinate.className = 'coordinate';
    coordinate.textContent = r + 1;
    boardElement.append(coordinate);
    row.forEach((value, c) => {
      const cell = document.createElement('span');
      cell.className = 'cell';
      if (r === puzzle.scene.row && c === puzzle.scene.col) cell.classList.add('marked');
      if (c === 2) cell.classList.add('block-right');
      if (r === 1 || r === 3) cell.classList.add('block-bottom');
      cell.textContent = value || '';
      boardElement.append(cell);
    });
  });
}

function downloadPdf(puzzle) {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const ink = '#232b28';
  const green = '#426b5a';
  const muted = '#6f7971';
  const text = (value, x, y, size, color = ink, style = 'normal') => {
    pdf.setFont('helvetica', style);
    pdf.setFontSize(size);
    pdf.setTextColor(color);
    pdf.text(value, x, y);
  };
  text('MURDOKUER  /  EXPEDIENTE Nº 01', 18, 18, 9, ink, 'bold');
  text('CONFIDENCIAL', 252, 18, 8, green, 'bold');
  pdf.setDrawColor('#bfc9bf');
  pdf.line(18, 22, 279, 22);
  text('EL CASO', 18, 35, 9, green, 'bold');
  text('El misterio', 18, 49, 25, ink, 'bold');
  text('de la última cena', 18, 60, 25, green, 'italic');
  text(['Seis personas compartieron mesa. Una de ellas es', 'culpable. La respuesta se esconde en el tablero.'], 18, 72, 10, muted);
  text('01 / LAS PISTAS', 18, 91, 9, green, 'bold');
  text(['Completa el tablero con números del 1 al 6, sin repetir', 'ninguno en cada fila, columna o región de 2 × 3.'], 18, 100, 10);
  text([`El número de la casilla marcada ${sceneLabel(puzzle.scene)} revela`, 'quién es la persona culpable.'], 18, 114, 10);
  text(['Un testigo recuerda que su credencial tenía', `un número ${puzzle.parity}.`], 18, 128, 10);
  text('02 / SOSPECHOSOS', 18, 147, 9, green, 'bold');
  text('1  Alba', 18, 158, 10);
  text('2  Bruno', 58, 158, 10);
  text('3  Clara', 98, 158, 10);
  text('4  Diego', 18, 167, 10);
  text('5  Elena', 58, 167, 10);
  text('6  Félix', 98, 167, 10);

  const x = 164;
  const y = 52;
  const size = 17;
  text('EL TABLERO', x, 35, 9, green, 'bold');
  text('PIENSA CON CALMA', 239, 35, 8, muted);
  for (let i = 0; i < 6; i++) {
    text(String.fromCharCode(65 + i), x + i * size + 7, y - 4, 9, muted, 'bold');
    text(String(i + 1), x - 7, y + i * size + 10, 9, muted, 'bold');
  }
  pdf.setFillColor('#dce9df');
  pdf.rect(x + puzzle.scene.col * size, y + puzzle.scene.row * size, size, size, 'F');
  for (let i = 0; i <= 6; i++) {
    pdf.setDrawColor(ink);
    pdf.setLineWidth(i % 3 === 0 ? 0.6 : 0.2);
    pdf.line(x + i * size, y, x + i * size, y + 6 * size);
    pdf.setLineWidth(i % 2 === 0 ? 0.6 : 0.2);
    pdf.line(x, y + i * size, x + 6 * size, y + i * size);
  }
  puzzle.board.forEach((row, r) => row.forEach((value, c) => {
    if (value) text(String(value), x + c * size + 7, y + r * size + 11, 14, ink, 'bold');
  }));
  text('UNA SOLA SOLUCIÓN', x, 164, 8, muted, 'bold');
  pdf.setDrawColor('#bfc9bf');
  pdf.setLineWidth(0.2);
  pdf.line(18, 191, 279, 191);
  text('MURDOKUER · EL ARTE DE DEDUCIR', 18, 198, 8, muted, 'bold');
  text('01 / 01', 267, 198, 8, muted, 'bold');
  pdf.save('murdokuer.pdf');
}

render(generatePuzzle());
document.querySelector('#download').addEventListener('click', () => {
  try {
    const puzzle = generatePuzzle();
    downloadPdf(puzzle);
    render(puzzle);
    status.textContent = 'Tu nuevo caso está listo.';
  } catch {
    status.textContent = 'No se ha podido generar el PDF. Inténtalo de nuevo.';
  }
});
