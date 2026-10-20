import { expect, test } from '@playwright/test';
import { goOffline, openInstalled } from './helpers';

test('US2 – favoritos offline persistem e mostram o detalhe completo', async ({ page, context }) => {
  await openInstalled(page, '2026-11-03T15:00:00Z');
  await goOffline(context, page);

  for (const name of ['Central Park', 'The Metropolitan Museum of Art', 'Times Square']) {
    await page.getByRole('button', { name: `Favoritar: ${name}` }).click();
  }
  await page.reload();
  await page.getByRole('link', { name: /Favoritos/ }).click();
  const titles = page.locator('.list .title');
  await expect(titles).toHaveCount(3);

  await page.getByText('The Metropolitan Museum of Art').click();
  await expect(page.getByText('1000 5th Ave, New York, NY 10028')).toBeVisible();
  await expect(page.locator('.gallery img').first()).toBeVisible();

  // Desfavoritar remove da lista.
  await page.getByRole('button', { name: 'Favorito' }).click();
  await page.goto('/#/favoritos');
  await expect(titles).toHaveCount(2);

  // Ao voltar a conexão, nada se perde.
  await context.setOffline(false);
  await page.reload();
  await expect(titles).toHaveCount(2);
});

test('US2 – nova versão do conteúdo não apaga favoritos', async ({ page }) => {
  await openInstalled(page, '2026-11-03T15:00:00Z');
  await page.getByRole('button', { name: 'Favoritar: Central Park' }).click();
  // Simula uma publicação nova do conteúdo (versão diferente) sendo carregada.
  await page.route('**/data/content.json', async (route) => {
    const response = await route.fetch();
    const json = await response.json();
    json.version = 'nova-versao';
    await route.fulfill({ response, json });
  });
  await page.evaluate(async () => {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
  });
  await page.reload();
  await page.goto('/#/favoritos');
  await expect(page.locator('.list .title')).toHaveText(['Central Park']);
});
