const SIZE = 6;

function shuffle(values) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function candidates(board, row, col) {
  const used = new Set();
  for (let i = 0; i < SIZE; i++) {
    used.add(board[row][i]);
    used.add(board[i][col]);
  }
  const startRow = Math.floor(row / 2) * 2;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = startRow; r < startRow + 2; r++) {
    for (let c = startCol; c < startCol + 3; c++) used.add(board[r][c]);
  }
  return [1, 2, 3, 4, 5, 6].filter((value) => !used.has(value));
}

export function countSolutions(board) {
  const grid = board.map((row) => [...row]);
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const value = grid[row][col];
      if (value === 0) continue;
      grid[row][col] = 0;
      const valid = candidates(grid, row, col).includes(value);
      grid[row][col] = value;
      if (!valid) return 0;
    }
  }
  function search() {
    let best;
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        if (grid[row][col] !== 0) continue;
        const options = candidates(grid, row, col);
        if (options.length === 0) return 0;
        if (!best || options.length < best.options.length) best = { row, col, options };
      }
    }
    if (!best) return 1;
    let count = 0;
    for (const value of best.options) {
      grid[best.row][best.col] = value;
      count += search();
      if (count >= 2) break;
    }
    grid[best.row][best.col] = 0;
    return count;
  }
  return search();
}

export function generatePuzzle() {
  const numbers = shuffle([1, 2, 3, 4, 5, 6]);
  const rows = shuffle([0, 1, 2]).flatMap((band) => shuffle([0, 1]).map((row) => band * 2 + row));
  const cols = shuffle([0, 1]).flatMap((stack) => shuffle([0, 1, 2]).map((col) => stack * 3 + col));
  const board = rows.map((row) => cols.map((col) => numbers[(row * 3 + Math.floor(row / 2) + col) % SIZE]));
  const solution = board.map((row) => [...row]);

  for (const cell of shuffle(Array.from({ length: SIZE * SIZE }, (_, index) => index))) {
    const row = Math.floor(cell / SIZE);
    const col = cell % SIZE;
    const value = board[row][col];
    board[row][col] = 0;
    if (countSolutions(board) !== 1) board[row][col] = value;
  }
  const empty = board.flatMap((row, r) => row.flatMap((value, c) => value === 0 ? [{ row: r, col: c }] : []));
  const scene = empty[Math.floor(Math.random() * empty.length)];
  const parity = solution[scene.row][scene.col] % 2 === 0 ? 'par' : 'impar';
  return { board, scene, parity };
}

export function sceneLabel({ row, col }) {
  return `${String.fromCharCode(65 + col)}${row + 1}`;
}
