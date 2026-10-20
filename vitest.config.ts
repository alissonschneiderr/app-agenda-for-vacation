import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts', 'tests/components/**/*.test.tsx', 'tests/content/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
  },
});
