import { expect, test } from '@playwright/test';
import { goOffline, openInstalled } from './helpers';

test.describe('US1 – Guia de pontos turísticos', () => {
  test('em 03/11 abre em Nova York com lista e mapa', async ({ page }) => {
    await openInstalled(page, '2026-11-03T15:00:00Z', '/guia');
    await expect(page.getByRole('heading', { name: 'Guia de Nova York' })).toBeVisible();
    await expect(page.getByText('Central Park', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Mapa' }).click();
    await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible();
  });

  test('em 07/11 abre em Orlando com aviso de locomoção', async ({ page }) => {
    await openInstalled(page, '2026-11-07T15:00:00Z', '/guia');
    await expect(page.getByRole('heading', { name: 'Guia de Orlando' })).toBeVisible();
    await expect(page.getByText('Dia de locomoção: Nova York → Orlando')).toBeVisible();
  });

  test('filtra por categoria e busca sem acento/caixa', async ({ page }) => {
    await openInstalled(page, '2026-11-03T15:00:00Z', '/guia');
    await page.getByRole('group', { name: 'Categoria' }).getByRole('button', { name: 'Museu' }).click();
    await page.getByPlaceholder('Buscar pelo nome').fill('METROPOLITAN');
    const titles = page.locator('.list .title');
    await expect(titles).toHaveCount(1);
    await expect(titles.first()).toHaveText('The Metropolitan Museum of Art');
  });

  test('offline: lista, busca, detalhe e foto continuam funcionando', async ({ page, context }) => {
    await openInstalled(page, '2026-11-02T16:00:00Z', '/guia');
    await goOffline(context, page);
    await expect(page.getByRole('status').filter({ hasText: 'Sem internet' })).toBeVisible();
    await page.getByPlaceholder('Buscar pelo nome').fill('guggenheim');
    await page.getByText('Solomon R. Guggenheim Museum').click();
    await expect(page.getByRole('heading', { name: 'Solomon R. Guggenheim Museum' })).toBeVisible();
    await expect(page.getByText(/Você está offline\. Informações verificadas em/)).toBeVisible();
    const photo = page.locator('.gallery img').first();
    await expect(photo).toBeVisible();
    expect(await photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    // Outra cidade, nunca aberta antes, também está disponível offline.
    await page.goto('/#/guia/miami');
    await page.getByText('Vizcaya Museum and Gardens').click();
    await expect(page.locator('.gallery img').first()).toBeVisible();
  });

  test('offline: mapa avisa que só mostra áreas já vistas', async ({ page, context }) => {
    await openInstalled(page, '2026-11-03T15:00:00Z', '/guia');
    await goOffline(context, page);
    await page.getByRole('button', { name: 'Mapa' }).click();
    await expect(page.getByText('Mapa disponível offline só nas áreas já vistas com internet.', { exact: false })).toBeVisible();
  });

  test('offline: "Como chegar" mostra o endereço', async ({ page, context }) => {
    await openInstalled(page, '2026-11-03T15:00:00Z', '/ponto/ny-met');
    await goOffline(context, page);
    await page.getByRole('button', { name: 'Como chegar' }).click();
    await expect(page.getByText('A navegação precisa de internet. Endereço: 1000 5th Ave')).toBeVisible();
  });
});

test.describe('primeira abertura sem conteúdo', () => {
  test.use({ serviceWorkers: 'block' });

  test('sem conseguir baixar o guia mostra a mensagem para conectar', async ({ page }) => {
    await page.route('**/data/content.json', (route) => route.abort('internetdisconnected'));
    await page.goto('/');
    await expect(page.getByText('Conecte-se à internet uma vez para baixar o guia.')).toBeVisible();
  });
});
