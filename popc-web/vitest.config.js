import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest-setup.js',
    outputFile: './test-results/unit.json',
    reporters: ['json', 'default'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/tests/**']
  },
});
