// Feature 017: previsão do tempo no Início (hoje + 4) e no dia, nos projetos mobile-360 e mobile-402
// (playwright.config.ts). O Open-Meteo é sempre respondido pelo teste — nunca a rede de verdade.
import { expect, test, type Page } from '@playwright/test';
import { goOffline, openInstalled, routeWeather } from './helpers';

const dates = ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04'];
const city = (base: number) => ({
  daily: {
    time: dates,
    weather_code: [0, 1, 3, 2, 61, 3, 0],
    temperature_2m_max: dates.map((_, i) => base + i),
    temperature_2m_min: dates.map((_, i) => base - 8 + i),
    precipitation_probability_max: [0, 10, 10, 20, 70, 30, 0],
  },
});
const FORECAST = [city(14), city(27), city(28)];

async function noSideScroll(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
}

test.describe('US1 e US2 (017) – previsão do tempo', () => {
  test('Início em 29/10: 5 dias; hoje e amanhã com o tempo de NY; 01/11 abre o dia com o box "Tempo"', async ({ page }) => {
    await routeWeather(page, FORECAST);
    await openInstalled(page, '2026-10-29T19:00:00Z');
    const strip = page.locator('.weather-strip');
    await expect(strip.locator('li')).toHaveCount(5);
    await expect(strip.locator('li.is-out')).toHaveCount(2);
    await expect(strip.locator('li.is-out').first()).toContainText('14°/6°');
    await expect(strip.locator('li.is-out a')).toHaveCount(0);
    await expect(strip.getByRole('link', { name: /^Sábado, 31\/10, Nova York: nublado, máxima 16, mínima 8 graus$/ })).toBeVisible();
    await noSideScroll(page);

    await strip.getByRole('link', { name: /^Domingo, 01\/11/ }).click();
    await expect(page).toHaveURL(/#\/dia\/2026-11-01$/);
    const box = page.getByRole('region', { name: 'Tempo' });
    await expect(box).toContainText('Parcialmente nublado');
    await expect(box).toContainText('17° / 9°');
    await expect(box).toContainText('20%');
    await expect(box).toContainText('atualizada em 29/10');
    await noSideScroll(page);

    await page.goto('/#/dia/2026-11-18');
    await expect(page.getByRole('region', { name: 'Tempo' })).toContainText('Previsão a partir de 12/11');
  });

  test('offline: a previsão salva continua, com "atualizada em"', async ({ page, context }) => {
    await routeWeather(page, FORECAST);
    await openInstalled(page, '2026-10-29T19:00:00Z');
    await expect(page.locator('.weather-strip')).toContainText('atualizada em 29/10');
    await goOffline(context, page);
    await expect(page.locator('.weather-strip')).toContainText('atualizada em 29/10');
    await page.goto('/#/dia/2026-11-01');
    await expect(page.getByRole('region', { name: 'Tempo' })).toContainText('17° / 9°');
  });

  test('nunca buscou (serviço fora): "Previsão disponível com internet" e o app abre', async ({ page }) => {
    await openInstalled(page, '2026-10-29T19:00:00Z');
    await expect(page.locator('.weather-strip')).toContainText('Previsão disponível com internet');
    await expect(page.getByRole('article')).toHaveCount(3);
    await page.goto('/#/dia/2026-11-01');
    await expect(page.getByRole('region', { name: 'Tempo' })).toContainText('Previsão disponível com internet');
  });
});
