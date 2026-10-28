// Feature 015: sem acompanhamento de progresso nem contagens de itens, nos projetos mobile-360 e
// mobile-402 (playwright.config.ts). O check de feito continua e fica salvo.
// Só a "moldura" do app é varrida (cabeçalho, capas, cards, atalhos, abas), sem as frases do roteiro:
// elas citam números de verdade, como "(2 paradas)" de metrô ou "(56%)" de lotação do parque.
import { expect, test, type Page } from '@playwright/test';
import { openInstalled } from './helpers';

const CHROME = ['.page-head', '.cover', 'article.city-card', 'article.day-card', 'article.hood-card', '.tl-area-options', '.segmented', '.alert-list > summary'].join(', ');
// "(N)" de contagem tem 1 ou 2 dígitos; anos do texto, como "(2012)", não contam.
const COUNTS = /\d+\s?%|feitas|\d+ paradas?|\(\d{1,2}\)|\d+ avisos?/;

async function noProgressNorCounts(page: Page) {
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('[role="progressbar"]')).toHaveCount(0);
  const texts = await page.locator(CHROME).evaluateAll((els) =>
    els.map((el) => {
      const copy = el.cloneNode(true) as HTMLElement;
      copy.querySelectorAll('.nb-phrase, .day-summary').forEach((p) => p.remove());
      return copy.textContent ?? '';
    }),
  );
  expect(texts.length).toBeGreaterThan(0);
  for (const text of texts) expect(text).not.toMatch(COUNTS);
}

test.describe('US1 e US2 (015) – sem progresso nem contagens', () => {
  test('Início, cidades, dia, opções e atração; noites, dias de roteiro e destinos continuam', async ({ page }) => {
    await openInstalled(page, '2026-10-27T15:00:00Z');
    await noProgressNorCounts(page);
    await expect(page.getByText('3 destinos')).toBeVisible();
    await expect(page.locator('article.city-card').first()).toContainText(/\d+ noites/);
    await expect(page.locator('article.city-card').first()).toContainText(/\d+ dias? de roteiro/);

    for (const city of ['nova-york', 'orlando', 'miami']) {
      await page.goto(`/#/cidade/${city}`);
      await expect(page.locator('article.day-card').first()).toBeVisible();
      await noProgressNorCounts(page);
    }

    await page.goto('/#/dia/2026-11-01');
    await expect(page.locator('#paradas')).toBeVisible();
    await noProgressNorCounts(page);
    await expect(page.locator('.tl-area-options').first()).toHaveText('Opções');

    await page.goto('/#/perto/2026-11-01/soho?g=comer');
    await expect(page.locator('.segmented a')).toHaveText(['Comer', 'Lojas', 'Curiosidades']);
    await noProgressNorCounts(page);

    await page.goto('/#/dia/2026-11-01');
    const detail = await page.locator('#paradas a[href^="#/dia/2026-11-01/"]').first().getAttribute('href');
    await page.goto(`/${detail}`);
    await expect(page.locator('.step-actions').getByRole('checkbox', { name: /como feito/ })).toBeVisible();
    await expect(page.locator('.step-actions').getByRole('button', { name: 'Pular' })).toBeVisible();
    await noProgressNorCounts(page);
  });

  test('marcar uma parada, reabrir o app e continuar marcada; desmarcar volta', async ({ page }) => {
    await openInstalled(page, '2026-10-27T15:00:00Z', '/dia/2026-11-01');
    const check = page.locator('#paradas .stop-card').first().getByRole('checkbox');
    await expect(check).toHaveAttribute('aria-checked', 'false');
    await check.click();
    await expect(check).toHaveAttribute('aria-checked', 'true');
    await page.reload();
    await expect(check).toHaveAttribute('aria-checked', 'true');
    await check.click();
    await expect(check).toHaveAttribute('aria-checked', 'false');
    await page.reload();
    await expect(check).toHaveAttribute('aria-checked', 'false');
    await noProgressNorCounts(page);
  });
});
