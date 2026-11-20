import { generatePuzzle, randomSeed } from './puzzle.js';

// Generación de casos fuera del hilo principal, con un pequeño grupo de Web Workers.
const POOL_SIZE = Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 2) - 1));
const workers = [];
const queue = [];
let workersAvailable = typeof Worker !== 'undefined';
let nextId = 0;

function spawn() {
  const worker = new Worker(new URL('./puzzle.worker.js', import.meta.url), { type: 'module' });
  const slot = { worker, job: null };
  worker.addEventListener('message', ({ data }) => {
    const { job } = slot;
    slot.job = null;
    if (job && job.id === data.id) {
      if (data.error) job.reject(new Error(data.error));
      else job.resolve(data.puzzle);
    }
    pump();
  });
  worker.addEventListener('error', (event) => {
    event.preventDefault();
    const { job } = slot;
    slot.job = null;
    // Si el worker falla, el caso se genera en el hilo principal.
    if (job) runInline(job);
    pump();
  });
  workers.push(slot);
  return slot;
}

function runInline(job) {
  setTimeout(() => {
    try { job.resolve(generatePuzzle(job.difficulty, job.seed)); } catch (error) { job.reject(error); }
  }, 0);
}

function pump() {
  while (queue.length) {
    let slot = workers.find((item) => !item.job);
    if (!slot && workers.length < POOL_SIZE && workersAvailable) {
      try { slot = spawn(); } catch { workersAvailable = false; }
    }
    if (!slot) {
      if (!workersAvailable && !workers.length) runInline(queue.shift());
      else return;
      continue;
    }
    const job = queue.shift();
    slot.job = job;
    slot.worker.postMessage({ id: job.id, difficulty: job.difficulty, seed: job.seed });
  }
}

export const parallelism = () => (workersAvailable ? POOL_SIZE : 1);

function enqueue(difficulty, seed, batch) {
  return new Promise((resolve, reject) => {
    queue.push({ id: nextId++, difficulty, seed, batch, resolve, reject });
    pump();
  });
}

export function createPuzzle(difficulty, seed = randomSeed()) {
  return enqueue(difficulty, seed, null);
}

/**
 * Genera varios casos en paralelo, en el orden pedido.
 * `onProgress(hechos, total)` informa del avance; `signal` (AbortSignal) permite cancelar.
 */
export async function createPuzzles(difficulties, { onProgress, signal } = {}) {
  const seeds = new Set();
  while (seeds.size < difficulties.length) seeds.add(randomSeed());
  const seedList = [...seeds];
  const batch = Symbol('lote');
  let done = 0;
  const jobs = difficulties.map((difficulty, index) => {
    const promise = enqueue(difficulty, seedList[index], batch);
    promise.then(() => onProgress?.(++done, difficulties.length), () => {});
    return promise;
  });
  const aborted = new Promise((_, reject) => {
    signal?.addEventListener('abort', () => {
      // Descarta lo que aún no ha empezado; lo que está en marcha termina y se ignora.
      for (let i = queue.length - 1; i >= 0; i--) {
        if (queue[i].batch !== batch) continue;
        queue[i].reject(new DOMException('Cancelado', 'AbortError'));
        queue.splice(i, 1);
      }
      reject(new DOMException('Cancelado', 'AbortError'));
    }, { once: true });
  });
  return Promise.race([Promise.all(jobs), aborted]);
}
