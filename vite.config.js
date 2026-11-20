import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/murdokuer/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        jugar: resolve(import.meta.dirname, 'jugar.html'),
      },
    },
  },
  worker: { format: 'es' },
});
