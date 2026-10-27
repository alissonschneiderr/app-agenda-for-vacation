import { expect, test, type Page } from '@playwright/test';
import { goOffline, openInstalled } from './helpers';

test.describe('US3 – Roteiros', () => {
  // Feature 012 (Q2 = B): os sugeridos de Miami foram apagados; não há mais nenhum sugerido no app.
  test('primeira abertura: nenhum sugerido + 7 dias do roteiro FULL de NY, nada nos dias de locomoção', async ({ page }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z', '/roteiros');
    await expect(page.getByText('Sugerido', { exact: true })).toHaveCount(0);
    await expect(page.getByText('South Beach e Art Deco')).toHaveCount(0);
    await expect(page.locator('.card-full')).toHaveCount(7);
    const headings = await page.getByRole('heading', { level: 2 }).allTextContents();
    expect(headings.some((h) => /07\/11|18\/11|21\/11/.test(h))).toBe(false);
    expect(headings[0]).toBe('sábado, 31/10 · Nova York');
  });

  /** Cria um roteiro do casal com dia e pontos (feature 012: substitui o sugerido nos testes de edição). */
  async function createItinerary(page: Page, name: string, date: string, pointIds: string[]) {
    await page.goto('/#/roteiros');
    await page.getByRole('button', { name: '+ Novo roteiro' }).click();
    await page.getByLabel('Nome').fill(name);
    await page.getByLabel('Dia da viagem').selectOption(date);
    await page.getByRole('button', { name: 'Criar' }).click();
    for (const id of pointIds) {
      await page.goto(`/#/ponto/${id}`);
      await page.getByRole('button', { name: '+ Adicionar ao roteiro' }).click();
      const select = page.getByLabel('Escolha um roteiro');
      const value = await select.locator('option', { hasText: name }).getAttribute('value');
      await select.selectOption(value!);
      await expect(page.getByText(`Adicionado a "${name}".`)).toBeVisible();
    }
  }

  test('offline: editar um roteiro e recarregar mantém a edição', async ({ page, context }) => {
    await openInstalled(page, '2026-11-02T15:00:00Z');
    await createItinerary(page, 'Meu dia em Miami', '2026-11-19', ['mia-south-beach', 'mia-south-pointe', 'mia-lincoln-road']);
    await page.goto('/#/roteiros');
    await goOffline(context, page);
    await page.getByRole('link', { name: /Meu dia em Miami/ }).click();
    const titles = page.locator('ol .title');
    await expect(titles).toHaveText(['South Beach', 'South Pointe Park', 'Lincoln Road']);
    await page.getByRole('button', { name: 'Mover Lincoln Road para o topo' }).click();
    await page.getByRole('button', { name: 'Remover South Beach do roteiro' }).click();
    await page.reload();
    await expect(titles).toHaveText(['Lincoln Road', 'South Pointe Park']);
  });

  test('ponto de outra cidade pede confirmação e duplicata é recusada', async ({ page }) => {
    await openInstalled(page, '2026-11-02T15:00:00Z');
    await createItinerary(page, 'Meu dia em Miami', '2026-11-19', []);
    await page.goto('/#/ponto/orl-epcot');
    await page.getByRole('button', { name: '+ Adicionar ao roteiro' }).click();
    const select = page.getByLabel('Escolha um roteiro');
    const miaOption = await select.locator('option', { hasText: 'Meu dia em Miami' }).getAttribute('value');

    page.once('dialog', async (d) => {
      expect(d.message()).toBe('Este ponto fica em Orlando, e este roteiro é de Miami. Adicionar mesmo assim?');
      await d.dismiss();
    });
    await select.selectOption(miaOption!);
    page.once('dialog', (d) => d.accept());
    await select.selectOption(miaOption!);
    await expect(page.getByText('Adicionado a "Meu dia em Miami".')).toBeVisible();
    await select.selectOption(miaOption!);
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
