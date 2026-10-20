import { expect, test } from '@playwright/test';
import { goOffline, openInstalled } from './helpers';

test.describe('US3 – Roteiros', () => {
  test('primeira abertura: 12 sugeridos + 7 dias do roteiro FULL de NY, nada nos dias de locomoção', async ({ page }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z', '/roteiros');
    await expect(page.getByText('Sugerido', { exact: true })).toHaveCount(12);
    await expect(page.locator('.card-full')).toHaveCount(7);
    const headings = await page.getByRole('heading', { level: 2 }).allTextContents();
    expect(headings).toHaveLength(19);
    expect(headings.some((h) => /07\/11|18\/11|21\/11/.test(h))).toBe(false);
    expect(headings[0]).toBe('sábado, 31/10 · Nova York');
    expect(headings.at(-1)).toBe('sexta, 20/11 · Miami');
  });

  test('offline: editar um sugerido e recarregar mantém a edição', async ({ page, context }) => {
    await openInstalled(page, '2026-11-02T15:00:00Z', '/roteiros');
    await goOffline(context, page);
    await page.getByRole('link', { name: /Winter Park e Mall at Millenia/ }).click();
    const titles = page.locator('ol .title');
    await expect(titles).toHaveText(['Winter Park (Park Avenue)', 'Scenic Boat Tour (Winter Park)', 'The Mall at Millenia']);
    await page.getByRole('button', { name: 'Mover The Mall at Millenia para o topo' }).click();
    await page.getByRole('button', { name: 'Remover Winter Park (Park Avenue) do roteiro' }).click();
    await page.reload();
    await expect(titles).toHaveText(['The Mall at Millenia', 'Scenic Boat Tour (Winter Park)']);
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
    const orlOption = await select.locator('option', { hasText: 'Magic Kingdom' }).getAttribute('value');

    page.once('dialog', async (d) => {
      expect(d.message()).toBe('Este ponto fica em Miami, e este roteiro é de Orlando. Adicionar mesmo assim?');
      await d.dismiss();
    });
    await select.selectOption(orlOption!);
    page.once('dialog', (d) => d.accept());
    await select.selectOption(orlOption!);
    await expect(page.getByText('Adicionado a "Magic Kingdom".')).toBeVisible();
    await select.selectOption(orlOption!);
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
