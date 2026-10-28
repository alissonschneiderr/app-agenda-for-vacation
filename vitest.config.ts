import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';
import { appVersion } from './scripts/app-version';

export default defineConfig({
  plugins: [preact()],
  define: { __APP_VERSION__: JSON.stringify(appVersion()) },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts', 'tests/components/**/*.test.tsx', 'tests/content/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
  },
});
