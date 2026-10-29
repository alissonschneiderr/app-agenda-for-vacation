import { expect, type BrowserContext, type Page } from '@playwright/test';

const weatherRouted = new WeakSet<Page>();

/** Feature 017: responde a previsão do Open-Meteo com `body` (nunca a rede de verdade nos testes). */
export async function routeWeather(page: Page, body: unknown): Promise<void> {
  weatherRouted.add(page);
  await page.route('https://api.open-meteo.com/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) }));
}

/** Abre o app com o relógio fixado e espera o Service Worker controlar a página (conteúdo pré-cacheado). */
export async function openInstalled(page: Page, isoNow: string, path = '/'): Promise<void> {
  // Feature 017: sem previsão combinada pelo teste, o Open-Meteo fica bloqueado (sem rede de verdade).
  if (!weatherRouted.has(page)) await page.route('https://api.open-meteo.com/**', (route) => route.abort());
  await page.clock.setFixedTime(new Date(isoNow));
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  // Na primeira visita o SW ainda não controla a página; recarregar garante o controle.
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  if (path !== '/') await page.goto(`/#${path}`);
  await expect(page.locator('main')).toBeVisible();
}

export async function goOffline(context: BrowserContext, page: Page): Promise<void> {
  await context.setOffline(true);
  await page.reload();
}
