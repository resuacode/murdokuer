import { generatePuzzle, randomSeed } from './puzzle.js';

let worker;
let nextId = 0;
const pending = new Map();

function getWorker() {
  if (worker === undefined) {
    try {
      worker = new Worker(new URL('./puzzle.worker.js', import.meta.url), { type: 'module' });
      worker.addEventListener('message', ({ data }) => {
        const request = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) request?.reject(new Error(data.error));
        else request?.resolve(data.puzzle);
      });
    } catch {
      worker = null;
    }
  }
  return worker;
}

// Genera un caso sin bloquear la página (y en el hilo principal si no hay Web Workers).
export function createPuzzle(difficulty, seed = randomSeed()) {
  const target = getWorker();
  if (!target) return Promise.resolve().then(() => generatePuzzle(difficulty, seed));
  return new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    target.postMessage({ id, difficulty, seed });
  });
}
