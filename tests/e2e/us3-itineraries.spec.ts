import { expect, test } from '@playwright/test';
import { goOffline, openInstalled } from './helpers';

test.describe('US3 – Roteiros', () => {
  test('primeira abertura tem 19 sugeridos e nenhum nos dias de locomoção', async ({ page }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z', '/roteiros');
    await expect(page.getByText('Sugerido')).toHaveCount(19);
    const headings = await page.getByRole('heading', { level: 2 }).allTextContents();
    expect(headings).toHaveLength(19);
    expect(headings.some((h) => /07\/11|18\/11|21\/11/.test(h))).toBe(false);
    expect(headings[0]).toBe('sábado, 31/10 · Nova York');
    expect(headings.at(-1)).toBe('sexta, 20/11 · Miami');
  });

  test('offline: editar um sugerido e recarregar mantém a edição', async ({ page, context }) => {
    await openInstalled(page, '2026-11-02T15:00:00Z', '/roteiros');
    await goOffline(context, page);
    await page.getByRole('link', { name: /Central Park e Museum Mile/ }).click();
    const titles = page.locator('ol .title');
    await expect(titles).toHaveText(['Central Park', 'The Metropolitan Museum of Art', 'Solomon R. Guggenheim Museum']);
    await page.getByRole('button', { name: 'Mover Solomon R. Guggenheim Museum para o topo' }).click();
    await page.getByRole('button', { name: 'Remover Central Park do roteiro' }).click();
    await page.reload();
    await expect(titles).toHaveText(['Solomon R. Guggenheim Museum', 'The Metropolitan Museum of Art']);
  });

  test('nova versão do conteúdo não altera roteiro editado', async ({ page }) => {
    await openInstalled(page, '2026-11-02T15:00:00Z', '/roteiros');
    await page.getByRole('link', { name: /Magic Kingdom/ }).click();
    await page.getByRole('button', { name: 'Remover Magic Kingdom do roteiro' }).click();
    const url = page.url();
    await page.route('**/data/content.json', async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      json.version = 'nova-versao';
      json.suggestedItineraries.find((s: { id: string }) => s.id === 'sug-2026-11-09').pointIds = ['orl-epcot'];
      await route.fulfill({ response, json });
    });
    await page.evaluate(async () => {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    });
    await page.goto(url);
    await page.reload();
    await expect(page.locator('ol .title')).toHaveCount(0);
    await expect(page.getByText('Roteiro vazio.', { exact: false })).toBeVisible();
  });

  test('ponto de outra cidade pede confirmação e duplicata é recusada', async ({ page }) => {
    await openInstalled(page, '2026-11-02T15:00:00Z', '/ponto/mia-south-beach');
    await page.getByRole('button', { name: '+ Adicionar ao roteiro' }).click();
    const select = page.getByLabel('Escolha um roteiro');
    const nyOption = await select.locator('option', { hasText: 'Central Park e Museum Mile' }).getAttribute('value');

    page.once('dialog', async (d) => {
      expect(d.message()).toBe('Este ponto fica em Miami, e este roteiro é de Nova York. Adicionar mesmo assim?');
      await d.dismiss();
    });
    await select.selectOption(nyOption!);
    page.once('dialog', (d) => d.accept());
    await select.selectOption(nyOption!);
    await expect(page.getByText('Adicionado a "Central Park e Museum Mile".')).toBeVisible();
    await select.selectOption(nyOption!);
    await expect(page.getByText('Este ponto já está neste roteiro.')).toBeVisible();
  });

  test('cria roteiro com dia, adiciona ponto e consulta offline em ordem', async ({ page, context }) => {
    await openInstalled(page, '2026-11-02T15:00:00Z', '/roteiros');
    await page.getByRole('button', { name: '+ Novo roteiro' }).click();
    await page.getByLabel('Nome').fill('Meu roteiro');
    await page.getByLabel('Dia da viagem').selectOption('2026-11-07');
    await page.getByRole('button', { name: 'Criar' }).click();
    await expect(page.getByText('sábado, 07/11 · Dia de locomoção: Nova York → Orlando')).toBeVisible();
    for (const id of ['ny-moma', 'orl-disney-springs']) {
      await page.goto(`/#/ponto/${id}`);
      await page.getByRole('button', { name: '+ Adicionar ao roteiro' }).click();
      const select = page.getByLabel('Escolha um roteiro');
      const value = await select.locator('option', { hasText: 'Meu roteiro' }).getAttribute('value');
      await select.selectOption(value!);
      await expect(page.getByText('Adicionado a "Meu roteiro".')).toBeVisible();
    }
    await goOffline(context, page);
    await page.goto('/#/roteiros');
    await page.getByRole('link', { name: /Meu roteiro/ }).click();
    await expect(page.locator('ol .title')).toHaveText(['Museum of Modern Art (MoMA)', 'Disney Springs']);
  });
});
