// Feature 012: o roteiro de Miami do casal, nos projetos mobile-360 e mobile-402 (playwright.config.ts).
import { expect, test, type Locator, type Page } from '@playwright/test';
import { goOffline, openInstalled } from './helpers';

async function tapCenter(page: Page, el: Locator) {
  await el.scrollIntoViewIfNeeded();
  const box = (await el.boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

async function noSideScroll(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
}

test.describe('US1 (012) – Miami', () => {
  test('cidade com 4 dias; 19/11 na Sawgrass com as 5 categorias; roteiros sem os sugeridos antigos', async ({ page }) => {
    await openInstalled(page, '2026-10-27T15:00:00Z', '/cidade/miami');
    await expect(page.locator('article.day-card')).toHaveCount(4);
    await noSideScroll(page);
    await tapCenter(page, page.locator('article.day-card', { hasText: 'Compras na Sawgrass Mills' }).locator('.nb-card-body'));
    await expect(page).toHaveURL(/#\/dia\/2026-11-19$/);
    await expect(page.locator('#lojas article')).toHaveCount(5);
    await expect(page.locator('#paradas .stop-card')).toHaveCount(3);
    await noSideScroll(page);
    await page.goto('/#/roteiros');
    await expect(page.getByText('South Beach e Art Deco')).toHaveCount(0);
    await expect(page.getByText('Vizcaya, Little Havana e Wynwood')).toHaveCount(0);
  });

  test('offline, 20/11: praia, South Pointe e Joe\'s Stone Crab; sem Transporte', async ({ page, context }) => {
    await openInstalled(page, '2026-10-27T15:00:00Z');
    await goOffline(context, page);
    await page.goto('/#/dia/2026-11-20');
    await expect(page.locator('#paradas .stop-card', { hasText: 'South Pointe Park e o píer' })).toBeVisible();
    await expect(page.locator('#comer article', { hasText: "Joe's Stone Crab" })).toBeVisible();
    await expect(page.locator('#transporte')).toHaveCount(0);
    await noSideScroll(page);
  });
});

test.describe('US2 (012) – chegada em Miami no 18/11', () => {
  test('offline: "A chegada" em Transporte e a tarde em South Beach nas Paradas', async ({ page, context }) => {
    await openInstalled(page, '2026-10-27T15:00:00Z');
    await goOffline(context, page);
    await page.goto('/#/dia/2026-11-18');
    const menu = page.getByRole('navigation', { name: 'Seções do dia' });
    await expect(menu.getByRole('link', { name: 'Paradas' })).toBeVisible();
    await expect(page.locator('#transporte')).toContainText('3. A chegada');
    await expect(page.locator('#transporte')).toContainText('MiamiCentral');
    await expect(page.locator('#paradas .stop-card', { hasText: 'Lummus Park' })).toBeVisible();
    await noSideScroll(page);
  });
});
