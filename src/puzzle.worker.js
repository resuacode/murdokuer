import { generatePuzzle } from './puzzle.js';

// Genera los casos fuera del hilo principal: los planos grandes pueden tardar alrededor de un segundo.
self.addEventListener('message', ({ data }) => {
  try {
    self.postMessage({ id: data.id, puzzle: generatePuzzle(data.difficulty, data.seed) });
  } catch (error) {
    self.postMessage({ id: data.id, error: error.message });
  }
});
