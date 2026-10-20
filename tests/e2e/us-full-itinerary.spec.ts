import { expect, test } from '@playwright/test';
import { goOffline, openInstalled } from './helpers';

test.describe('Roteiro FULL de Nova York', () => {
  test('US1: 02/11 mostra o jogo às 19h30 com chegada e a próxima atividade', async ({ page }) => {
    await openInstalled(page, '2026-11-02T20:30:00Z', '/full/nova-york/2026-11-02'); // 15:30 em NY (museu termina 15:24)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('segunda, 02/11');
    await expect(page.getByText(/Ingresso comprado · começa às 19:30 · chegar até 18:45/)).toBeVisible();
    await expect(page.locator('.activity-next .activity-title')).toHaveText('Lanche na Levain Bakery');
  });

  test('US1: 31/10 começa no JFK e leva ao POD 51', async ({ page }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z', '/full/nova-york/2026-10-31');
    const titles = page.locator('.activity-title');
    await expect(titles.first()).toHaveText('Desembarque no JFK: imigração e bagagem');
    await expect(page.getByText('Táxi oficial do JFK até o POD 51')).toBeVisible();
  });

  test('US1: offline, marcações persistem e "a seguir" avança; desfazer', async ({ page, context }) => {
    await openInstalled(page, '2026-11-02T20:30:00Z', '/full/nova-york/2026-11-02');
    await goOffline(context, page);
    const next = page.locator('.activity-next');
    await expect(next.locator('.activity-title')).toHaveText('Lanche na Levain Bakery');
    await next.getByRole('button', { name: '✓ Feita' }).click();
    await expect(page.locator('.activity-next .activity-title')).toHaveText("Tom's Restaurant");
    await page.locator('.activity-next').getByRole('button', { name: 'Pular' }).click();
    await page.reload();
    await expect(page.locator('.activity-done')).toHaveCount(1);
    await expect(page.locator('.activity-skipped')).toHaveCount(1);
    await expect(page.locator('.activity-next .activity-title')).toHaveText("Jantar cedo no Sylvia's (Harlem)");
    await page.locator('.activity-skipped').getByRole('button', { name: 'Desfazer' }).click();
    await expect(page.locator('.activity-skipped')).toHaveCount(0);
  });

  test('Roteiros: dias de NY levam ao roteiro FULL; Orlando e Miami inalterados', async ({ page }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z', '/roteiros');
    await page.locator('.card-full').first().click();
    await expect(page).toHaveURL(/#\/full\/nova-york\/2026-10-31$/);
    await page.goto('/#/roteiros');
    await expect(page.getByRole('link', { name: /Magic Kingdom/ })).toBeVisible();
  });

  test('US4: documento completo offline e versão de impressão', async ({ page, context }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z', '/full/nova-york/documento');
    await goOffline(context, page);
    await expect(page.locator('.doc-day > h2').filter({ hasText: /\d{2}\/\d{2} ·/ })).toHaveCount(7);
    await expect(page.getByRole('heading', { name: 'Checklist de ingressos e reservas' })).toBeVisible();
    await expect(page.getByText(/Balsa da Estátua da Liberdade/)).toBeVisible();
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.bottom-nav')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Imprimir / salvar PDF' })).toBeHidden();
  });
});
