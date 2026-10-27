import { defineConfig, devices } from '@playwright/test';

// Cenários offline dependem de Service Worker, que o Playwright só controla de forma confiável no
// Chromium; o iPhone é coberto pela validação manual (quickstart.md, "Validação manual final").
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://localhost:4173/',
    serviceWorkers: 'allow',
    locale: 'pt-BR',
    timezoneId: 'America/New_York',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Pixel 7'] }, testIgnore: /us-mobile.*\.spec\.ts/ },
    // Feature 009: as duas larguras de referência (Galaxy S24 e iPhone 17), em Chromium com toque.
    {
      name: 'mobile-360',
      testMatch: /us-mobile.*\.spec\.ts/,
      use: { ...devices['Pixel 7'], viewport: { width: 360, height: 780 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
    },
    {
      name: 'mobile-402',
      testMatch: /us-mobile.*\.spec\.ts/,
      use: { ...devices['Pixel 7'], viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
