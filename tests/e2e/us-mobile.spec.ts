// Feature 009: navegação mobile first, rodada nos projetos mobile-360 (Galaxy S24) e mobile-402
// (iPhone 17) — ver playwright.config.ts. Toques no centro dos cards, não nos links.
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

test.describe('US1 – do Início ao dia, cards inteiros clicáveis', () => {
  test('Início só com 3 cidades; tocar na foto abre a cidade; tocar no card abre o dia; voltar refaz', async ({ page }) => {
    await openInstalled(page, '2026-10-27T15:00:00Z');
    await expect(page.locator('main.start article')).toHaveCount(3);
    await expect(page.getByRole('navigation', { name: 'Navegação principal' })).toHaveCount(0);
    await noSideScroll(page);

    await tapCenter(page, page.locator('article.city-card', { hasText: 'Orlando' }).locator('.cover'));
    await expect(page).toHaveURL(/#\/cidade\/orlando$/);
    await expect(page.locator('.city-tags')).toHaveCount(0);
    await expect(page.getByRole('tablist')).toHaveCount(0);
    await noSideScroll(page);

    await tapCenter(page, page.locator('article.day-card').nth(1).locator('.nb-card-body'));
    await expect(page).toHaveURL(/#\/dia\/2026-11-08$/);
    await noSideScroll(page);

    await page.getByRole('link', { name: 'Voltar' }).click();
    await expect(page).toHaveURL(/#\/cidade\/orlando$/);
    await page.getByRole('link', { name: 'Voltar' }).click();
    await expect(page).toHaveURL(/#\/$/);
  });

  test('cabeçalho fixo continua no topo depois de rolar; offline', async ({ page, context }) => {
    await openInstalled(page, '2026-10-27T15:00:00Z');
    await goOffline(context, page);
    await page.goto('/#/cidade/nova-york');
    await page.mouse.wheel(0, 1000);
    await page.waitForTimeout(300);
    const top = await page.locator('.page-head').evaluate((e) => e.getBoundingClientRect().top);
    expect(top).toBeLessThanOrEqual(1);
    await expect(page.locator('.page-head')).toBeInViewport();
  });
});

test.describe('US2 – o dia com menu de seções', () => {
  test('01/11: 6 chips; "Brechós e Lojas" rola até a seção, menu preso e marcado; card de restaurante abre o detalhe', async ({ page }) => {
    await openInstalled(page, '2026-10-27T15:00:00Z', '/dia/2026-11-01');
    const menu = page.getByRole('navigation', { name: 'Seções do dia' });
    await expect(menu.getByRole('link')).toHaveText(['Paradas', 'Restaurantes e Cafés', 'Brechós e Lojas', 'Bairros', 'Transporte', 'Dicas']);
    await menu.getByRole('link', { name: 'Brechós e Lojas' }).click();
    await expect(page.locator('#lojas')).toBeInViewport();
    await expect(menu).toBeInViewport();
    await expect(menu.getByRole('link', { name: 'Brechós e Lojas' })).toHaveAttribute('aria-current', 'true');
    await expect(page).toHaveURL(/#\/dia\/2026-11-01$/);
    await noSideScroll(page);
    const card = page.locator('#comer article').first();
    await tapCenter(page, card.locator('.place-row-summary'));
    await expect(page).toHaveURL(/#\/perto\/2026-11-01\/[a-z-]+\/food-/);
  });

  test('09/11 sem "Brechós e Lojas"; offline, 07/11 com Transporte e os três blocos', async ({ page, context }) => {
    await openInstalled(page, '2026-10-27T15:00:00Z', '/dia/2026-11-09');
    await expect(page.getByRole('navigation', { name: 'Seções do dia' }).getByRole('link', { name: 'Brechós e Lojas' })).toHaveCount(0);
    await noSideScroll(page);
    await goOffline(context, page);
    await page.goto('/#/dia/2026-11-07');
    await expect(page.locator('#transporte')).toBeVisible();
    await expect(page.getByRole('heading', { name: '1. Antes de sair' })).toBeVisible();
    await noSideScroll(page);
  });
});

test.describe('US3 – atração com o descritivo à vista', () => {
  test('Grand Central: título, descritivo completo visível sem rolar, depois "Abrir no mapa"; sem "Ler mais"', async ({ page }) => {
    await openInstalled(page, '2026-10-27T15:00:00Z', '/dia/2026-10-31/ny3-2026-10-31-04');
    await expect(page.getByRole('heading', { level: 1, name: 'Grand Central Terminal' })).toBeVisible();
    await expect(page.locator('.step-description p').first()).toBeInViewport();
    await expect(page.getByText('Ler mais')).toHaveCount(0);
    const descY = await page.locator('.step-description').evaluate((e) => e.getBoundingClientRect().top);
    const mapY = await page.getByRole('link', { name: 'Abrir no mapa' }).evaluate((e) => e.getBoundingClientRect().top);
    expect(mapY).toBeGreaterThan(descY);
    await noSideScroll(page);
  });
});

test.describe('leitura no celular (feature 009, FR-002/FR-003)', () => {
  const PAGES = [
    '/',
    '/cidade/nova-york',
    '/cidade/orlando',
    '/cidade/miami',
    '/dia/2026-11-01',
    '/dia/2026-11-07',
    '/dia/2026-11-09',
    '/dia/2026-11-19',
    '/dia/2026-10-31/ny3-2026-10-31-04',
    '/perto/2026-11-01/chinatown',
    '/exibicao',
  ];

  test('alvos ≥ 44 px, corpo ≥ 16 px e sem rolagem lateral em todas as telas', async ({ page }) => {
    test.setTimeout(90_000);
    await openInstalled(page, '2026-10-27T15:00:00Z');
    for (const p of PAGES) {
      await page.goto(`/#${p}`);
      await expect(page.locator('main').first()).toBeVisible();
      const small = await page.evaluate(() =>
        [...document.querySelectorAll('main a, main button, main [role="checkbox"]')]
          .filter((e) => !e.closest('.doc-html, p, li.fact, dd, figcaption') || e.matches('.btn, .chip, .section-menu a'))
          .map((e) => ({ e, r: e.getBoundingClientRect() }))
          .filter(({ e, r }) => r.width > 0 && r.height > 0 && r.height < 44 && !e.classList.contains('card-link'))
          .map(({ e, r }) => `${e.tagName}.${e.className} "${e.textContent?.trim().slice(0, 20)}" ${Math.round(r.height)}`),
      );
      expect(small, p).toEqual([]);
      const body = await page.evaluate(() => parseFloat(getComputedStyle(document.body).fontSize));
      expect(body, p).toBeGreaterThanOrEqual(16);
      await noSideScroll(page);
    }
  });
});
