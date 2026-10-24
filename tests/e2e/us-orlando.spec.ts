// Feature 007: roteiro de Orlando lido do doc do casal (specs/007-orlando-itinerary-doc/quickstart.md).
// O momento é simulado com ?agora= (hora local de Orlando, mesmo fuso de Nova York).
import { expect, test, type Page } from '@playwright/test';
import { goOffline, openInstalled } from './helpers';

async function at(page: Page, agora: string, hash: string) {
  await page.goto(`/?agora=${agora}#${hash}`);
  await expect(page.locator('main').first()).toBeVisible();
}

test.describe('US1 – dia de parque', () => {
  test('08/11 às 8h: Jungle Cruise com fila, área e foto', async ({ page }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await at(page, '2026-11-08T08:00', '/');
    const card = page.getByRole('article', { name: 'Próximo passo: Jungle Cruise' });
    await expect(card.locator('.next-time')).toHaveText('8h10');
    await expect(card).toContainText('fila ~5 min');
    await expect(card).toContainText('Magic Kingdom · Adventureland');
  });

  test('09/11 às 12h30: Runaway Railway 13h00 · Multi Pass; Feito e Desfazer', async ({ page }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await at(page, '2026-11-09T12:30', '/');
    const card = page.getByRole('article', { name: "Próximo passo: Mickey & Minnie's Runaway Railway" });
    await expect(card.locator('.next-time')).toHaveText('13h00');
    await expect(card).toContainText('~5 min · Multi Pass');
    await page.getByRole('button', { name: /Feito/ }).click();
    await expect(page.getByRole('article', { name: 'Próximo passo: Millennium Falcon: Smugglers Run' })).toBeVisible();
    await page.getByRole('button', { name: 'Desfazer' }).click();
    await expect(page.getByRole('article', { name: "Próximo passo: Mickey & Minnie's Runaway Railway" })).toBeVisible();
  });

  test('offline: os 10 itens do Epic Universe na ordem do doc (9 atrações e o almoço)', async ({ page, context }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await goOffline(context, page);
    await at(page, '2026-11-14T09:00', '/dia/2026-11-14');
    await expect(page.locator('.tl-step')).toHaveCount(9);
    const names = await page.locator('.tl-step .tl-name').allTextContents();
    expect(names.map((n) => n.trim())).toEqual([
      'Curse of the Werewolf',
      'Monsters Unchained: The Frankenstein Experiment',
      'Harry Potter and the Battle at the Ministry',
      'Stardust Racers',
      "Dragon Racer's Rally",
      "Hiccup's Wing Gliders",
      "Mario Kart: Bowser's Challenge",
      "Yoshi's Adventure",
      'Mine-Cart Madness',
    ]);
    await expect(page.locator('.tl-free')).toContainText('Almoço (cedo)');
  });
});

test.describe('US2 – folgas e "Por perto"', () => {
  test('13/11, também offline: KSC → deslocamento → Cocoa Beach → volta → Disney Springs', async ({ page, context }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await goOffline(context, page);
    await at(page, '2026-11-13T09:00', '/dia/2026-11-13');
    await expect(page.locator('.tl-area-name')).toHaveText(['Kennedy Space Center Visitor Complex', 'Cocoa Beach', 'Noite: Disney Springs']);
    await expect(page.locator('.tl-move').filter({ hasText: 'Deslocamento para Cocoa Beach' })).toBeVisible();
    await expect(page.locator('.tl-move').filter({ hasText: 'volta ao hotel' })).toBeVisible();
  });

  test('Por perto em 08/11 ao meio-dia: Magic Kingdom com 5 opções; detalhe de Casey\'s Corner', async ({ page }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await at(page, '2026-11-08T12:00', '/perto');
    await expect(page.getByRole('link', { name: 'Comer (5)' })).toBeVisible();
    await page.locator('.place-short', { hasText: "Casey's Corner" }).click();
    await expect(page.locator('.place-card')).toContainText('Main Street, cachorro-quente');
  });
});

test.describe('US3 – reservas, chegada, partida e documento (offline)', () => {
  test('06/11: "Reservar hoje" com o Multi Pass do Hollywood Studios', async ({ page, context }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await goOffline(context, page);
    await at(page, '2026-11-06T09:00', '/');
    await expect(page.getByRole('region', { name: 'Reservar hoje' })).toContainText('Multi Pass Hollywood Studios');
  });

  test('07/11: "Reservar hoje" com o EPCOT; "A chegada" com 2 itens marcáveis', async ({ page, context }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await goOffline(context, page);
    await at(page, '2026-11-07T09:00', '/');
    await expect(page.getByRole('region', { name: 'Reservar hoje' })).toContainText('Multi Pass EPCOT');
    const arrival = page.getByRole('region', { name: 'A chegada' });
    await expect(arrival.getByRole('checkbox')).toHaveCount(2);
    await arrival.getByRole('checkbox').first().click();
    await expect(arrival.getByRole('checkbox').first()).toHaveAttribute('aria-checked', 'true');
  });

  test('18/11: "De trem para Miami" e nada sobre voo internacional', async ({ page, context }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await goOffline(context, page);
    await at(page, '2026-11-18T09:00', '/');
    await expect(page.getByRole('region', { name: 'A viagem' })).toContainText('De trem para Miami');
    await expect(page.getByRole('region', { name: 'Antes de sair' })).toContainText('devolva o carro no aeroporto (MCO)');
    await expect(page.locator('main')).not.toContainText(/voo internacional/i);
  });

  test('documento de Orlando com as 17 seções; Viagem liga para ele', async ({ page, context }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await goOffline(context, page);
    await at(page, '2026-11-10T10:00', '/viagem');
    await page.getByRole('link', { name: /Documento de Orlando/ }).click();
    await expect(page).toHaveURL(/#\/full\/orlando\/documento$/);
    await expect(page.locator('section.doc-html > h2')).toHaveCount(17);
  });
});
