// Cuadernillos: varios casos en un PDF (cada caso en una página y su solución en la siguiente).
import { DIFFICULTIES } from './puzzle.js';

export const MIXED = 'mezcla';

// Máximo de casos por cuadernillo: los planos grandes tardan más en generarse.
export const BOOKLET_LIMITS = { facil: 30, media: 30, dificil: 25, experto: 15, maestro: 10, [MIXED]: 20 };
export const BOOKLET_MIN = 2;
export const BOOKLET_DEFAULT = 6;

// Tiempo aproximado de generación por caso en un hilo (ms), con margen sobre lo medido.
const COST = { facil: 10, media: 10, dificil: 30, experto: 80, maestro: 400 };
const PDF_COST = 40;

export const bookletLimit = (choice) => BOOKLET_LIMITS[choice] ?? BOOKLET_MIN;

export function clampCount(choice, count) {
  const value = Math.round(Number(count));
  if (!Number.isFinite(value)) return BOOKLET_DEFAULT;
  return Math.min(bookletLimit(choice), Math.max(BOOKLET_MIN, value));
}

// Niveles de cada caso; la mezcla va de fácil a maestro repartiendo los casos por igual.
export function bookletLevels(choice, count) {
  const total = clampCount(choice, count);
  if (choice !== MIXED) return Array(total).fill(choice);
  const levels = Object.keys(DIFFICULTIES);
  return Array.from({ length: total }, (_, index) => levels[Math.floor((index * levels.length) / total)]);
}

export function estimateSeconds(levels, workers = 1) {
  const generation = levels.reduce((sum, level) => sum + COST[level], 0) / Math.max(1, workers);
  return (generation + levels.length * PDF_COST) / 1000;
}

export function describeEstimate(seconds) {
  if (seconds < 3) return 'unos segundos';
  if (seconds < 60) return `unos ${Math.ceil(seconds / 5) * 5} s`;
  return `más de un minuto`;
}
