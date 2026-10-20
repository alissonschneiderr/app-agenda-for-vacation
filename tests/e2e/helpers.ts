import { expect, type BrowserContext, type Page } from '@playwright/test';

/** Abre o app com o relógio fixado e espera o Service Worker controlar a página (conteúdo pré-cacheado). */
export async function openInstalled(page: Page, isoNow: string, path = '/'): Promise<void> {
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
