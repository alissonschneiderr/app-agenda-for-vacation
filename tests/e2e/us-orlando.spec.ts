// Feature 007: roteiro de Orlando lido do doc do casal (specs/007-orlando-itinerary-doc/quickstart.md).
// O momento é simulado com ?agora= (hora local de Orlando, mesmo fuso de Nova York).
import { expect, test, type Page } from '@playwright/test';
import { goOffline, openInstalled } from './helpers';

async function at(page: Page, agora: string, hash: string) {
  await page.goto(`/?agora=${agora}#${hash}`);
  await expect(page.locator('main').first()).toBeVisible();
}

test.describe('US1 – dia de parque', () => {


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
    await at(page, '2026-11-08T12:00', '/perto/2026-11-08/magic-kingdom');
    await expect(page.getByRole('link', { name: 'Comer (5)' })).toBeVisible();
    await page.locator('.place-short', { hasText: "Casey's Corner" }).click();
    await expect(page.locator('.place-card')).toContainText('Main Street, cachorro-quente');
  });
});

test.describe('US3 – reservas, chegada, partida e documento (offline)', () => {

  test('07/11: "A chegada" com 2 itens marcáveis', async ({ page, context }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await goOffline(context, page);
    await at(page, '2026-11-07T09:00', '/dia/2026-11-07');
    const arrival = page.getByRole('region', { name: 'A chegada' });
    await expect(arrival.getByRole('checkbox')).toHaveCount(2);
    await arrival.getByRole('checkbox').first().click();
    await expect(arrival.getByRole('checkbox').first()).toHaveAttribute('aria-checked', 'true');
  });

  test('18/11: "De trem para Miami" e nada sobre voo internacional', async ({ page, context }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await goOffline(context, page);
    await at(page, '2026-11-18T09:00', '/dia/2026-11-18');
    await expect(page.getByRole('region', { name: 'A viagem' })).toContainText('De trem para Miami');
    await expect(page.getByRole('region', { name: 'Antes de sair' })).toContainText('devolva o carro no aeroporto (MCO)');
    await expect(page.locator('main')).not.toContainText(/voo internacional/i);
  });

  test('documento de Orlando com as 17 seções, por endereço direto', async ({ page, context }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await goOffline(context, page);
    await at(page, '2026-11-10T10:00', '/full/orlando/documento');
    await expect(page.locator('section.doc-html > h2')).toHaveCount(17);
  });
});
