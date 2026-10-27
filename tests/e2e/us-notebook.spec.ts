// Feature 008: estrutura e visual do caderno de viagem (specs/008-travel-notebook-ui/quickstart.md).
// O momento é simulado com ?agora= (hora local da viagem).
import { expect, test, type Page } from '@playwright/test';
import { goOffline, openInstalled } from './helpers';

async function at(page: Page, agora: string, hash: string) {
  await page.goto(`/?agora=${agora}#${hash}`);
  await expect(page.locator('main').first()).toBeVisible();
}

test.describe('US1 – Dia', () => {
  test('01/11 offline: capa com foto, paradas com miniaturas e a marca "agora"', async ({ page, context }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await goOffline(context, page);
    await at(page, '2026-11-01T13:30', '/dia/2026-11-01');
    await expect(page.locator('.cover img.cover-img').first()).toBeVisible();
    await expect(page.locator('.stop-card').first()).toBeVisible();
    expect(await page.locator('.stop-card .stop-thumb img').count()).toBeGreaterThan(3);
    await expect(page.locator('.tl-now')).toHaveText('agora · 13h30');
  });

  test('marcar Mott Street no círculo sobe o contador da capa; Desfazer volta', async ({ page }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await at(page, '2026-11-01T13:30', '/dia/2026-11-01');
    const ring = page.locator('.page-head [role="progressbar"]');
    const before = Number(await ring.getAttribute('aria-valuenow'));
    const card = page.locator('.stop-card', { has: page.locator('.tl-name', { hasText: /^Mott Street$/ }) });
    await card.getByRole('checkbox').click();
    await expect(card.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
    await expect(ring).toHaveAttribute('aria-valuenow', String(before + 1));
    await page.getByRole('button', { name: 'Desfazer' }).click();
    await expect(card.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
  });

  test('09/11: Tower of Terror com Multi Pass; 07/11: três blocos; deslizar troca o dia', async ({ page }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await at(page, '2026-11-09T08:00', '/dia/2026-11-09');
    await expect(page.locator('.stop-card', { hasText: 'Tower of Terror' }).locator('.tl-sub')).toHaveText('~5 min · Multi Pass');
    await at(page, '2026-11-07T09:00', '/dia/2026-11-07');
    await expect(page.getByRole('heading', { name: '1. Antes de sair' })).toBeVisible();
    await at(page, '2026-11-01T13:30', '/dia/2026-11-01');
    const box = (await page.locator('main.day').boundingBox())!;
    await page.mouse.move(box.x + box.width - 30, box.y + 300);
    await page.mouse.down();
    await page.mouse.move(box.x + 30, box.y + 310, { steps: 8 });
    await page.mouse.up();
    await expect(page).toHaveURL(/#\/dia\/2026-11-02$/);
  });

});

test.describe('US3 – Cidade e Bairro', () => {
  test('offline: Início → Orlando → 08/11 → Bairros → Magic Kingdom → Comer (5) → Casey\'s Corner', async ({ page, context }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await goOffline(context, page);
    await at(page, '2026-10-30T10:00', '/');
    await page.getByRole('link', { name: 'Orlando' }).click();
    await expect(page).toHaveURL(/#\/cidade\/orlando$/);
    await page.getByRole('link', { name: /domingo, 08\/11/ }).click();
    await page.getByRole('navigation', { name: 'Seções do dia' }).getByRole('link', { name: 'Bairros' }).click();
    await page.locator('#bairros').getByRole('link', { name: 'Magic Kingdom' }).click();
    await expect(page.getByRole('link', { name: 'Comer (5)' })).toBeVisible();
    await page.locator('.place-short', { hasText: "Casey's Corner" }).click();
    await expect(page.locator('.place-card')).toContainText('Main Street, cachorro-quente');
  });

  test('Nova York → card do dia 01/11', async ({ page }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z', '/cidade/nova-york');
    await expect(page.locator('.city .day-card')).toHaveCount(8);
    await page.getByRole('link', { name: /^domingo, 01\/11: / }).click();
    await expect(page).toHaveURL(/#\/dia\/2026-11-01$/);
    await expect(page.locator('#paradas')).toBeVisible();
  });
});
