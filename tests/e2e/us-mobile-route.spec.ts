// Feature 016: "Rota até…" entre dois lugares do roteiro, nos projetos mobile-360 e mobile-402
// (playwright.config.ts). A rota em si é do Google Maps: aqui conferimos o link, sem abri-lo.
import { expect, test, type Page } from '@playwright/test';
import { goOffline, openInstalled } from './helpers';

const MOTT = 'ny3-2026-11-01-08';
const DIR = 'https://www.google.com/maps/dir/?api=1&origin=';

async function noSideScroll(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
}

test.describe('US1 (016) – rota a partir de uma atração', () => {
  test('Mott Street → lista do dia → link da rota; inverter; outros dias; voltar', async ({ page }) => {
    await openInstalled(page, '2026-10-27T15:00:00Z', `/dia/2026-11-01/${MOTT}`);
    await page.getByRole('link', { name: 'Rota até…' }).click();
    await expect(page).toHaveURL(new RegExp(`#/rota/2026-11-01/${MOTT}$`));
    await expect(page.getByRole('region', { name: 'Rota a partir de Mott Street' })).toBeVisible();
    await noSideScroll(page);

    const doyers = page.getByRole('link', { name: 'Doyers Street, 13h55' });
    await expect(doyers).toHaveAttribute('target', '_blank');
    const href = (await doyers.getAttribute('href'))!;
    expect(href.startsWith(DIR)).toBe(true);
    expect(new URL(href).searchParams.get('origin')).toBe('Mott Street and Pell Street New York');
    expect(new URL(href).searchParams.get('destination')).toBe('Doyers Street New York');

    await page.getByRole('link', { name: /Inverter/ }).click();
    await expect(page.getByRole('region', { name: 'Rota até Mott Street' })).toBeVisible();
    const inv = (await page.getByRole('link', { name: 'Doyers Street, 13h55' }).getAttribute('href'))!;
    expect(new URL(inv).searchParams.get('origin')).toBe('Doyers Street New York');

    await page.getByRole('link', { name: 'Ver outros dias' }).click();
    await expect(page.getByRole('heading', { name: 'Sábado, 31/10' })).toBeVisible();
    await noSideScroll(page);

    await page.goBack();
    await page.goBack();
    await page.goBack();
    await expect(page).toHaveURL(new RegExp(`#/dia/2026-11-01/${MOTT}$`));
  });

  test('offline: a lista abre e a escolha avisa com os dois endereços', async ({ page, context }) => {
    await openInstalled(page, '2026-10-27T15:00:00Z');
    await goOffline(context, page);
    await page.goto(`/#/rota/2026-11-01/${MOTT}`);
    await page.getByRole('button', { name: 'Doyers Street, 13h55' }).click();
    await expect(page.getByRole('alert')).toContainText('A rota precisa de internet. De:');
    await expect(page.getByRole('alert')).toContainText('Até:');
  });
});

test.describe('US2 (016) – rota a partir de um restaurante', () => {
  test('card de La Cabra SoHo: "Rota até…" abre a lista sem abrir o card', async ({ page }) => {
    await openInstalled(page, '2026-10-27T15:00:00Z', '/dia/2026-11-01');
    const card = page.locator('#comer .place-row', { hasText: 'La Cabra SoHo' });
    await card.getByRole('link', { name: 'Rota até…' }).click();
    await expect(page).toHaveURL(/#\/rota\/2026-11-01\/food-la-cabra-soho$/);
    await expect(page.getByRole('region', { name: 'Rota a partir de La Cabra SoHo' })).toBeVisible();
    await noSideScroll(page);
  });
});
