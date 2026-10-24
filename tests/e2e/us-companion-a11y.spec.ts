// Feature 006 (T038): leitura na rua — contraste do essencial, alvos de toque, sem rolagem lateral.
import { expect, test, type Page } from '@playwright/test';
import { openInstalled } from './helpers';

const PAGES = ['/', '/dia/2026-11-01', '/perto', '/viagem'];
// Feature 007: um dia de parque e um de folga em Orlando.
const ORLANDO_PAGES = ['/?agora=2026-11-09T12:30#/', '/?agora=2026-11-09T12:30#/dia/2026-11-09', '/?agora=2026-11-13T09:00#/dia/2026-11-13', '/?agora=2026-11-07T09:00#/'];

/** Contraste WCAG entre a cor do texto e o fundo efetivo (primeiro ancestral com fundo opaco). */
async function contrasts(page: Page, selector: string): Promise<number[]> {
  return page.evaluate((sel) => {
    const parse = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number);
    const lum = ([r, g, b]: number[]) => {
      const f = (v: number) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r!) + 0.7152 * f(g!) + 0.0722 * f(b!);
    };
    const bgOf = (el: Element | null): number[] => {
      for (let e = el; e; e = e.parentElement) {
        const c = parse(getComputedStyle(e).backgroundColor);
        if (c.length >= 3 && (c[3] ?? 1) > 0.9) return c;
      }
      return parse(getComputedStyle(document.body).backgroundColor);
    };
    return [...document.querySelectorAll(sel)].slice(0, 12).map((el) => {
      const a = lum(parse(getComputedStyle(el).color));
      const b = lum(bgOf(el));
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    });
  }, selector);
}

for (const scheme of ['light', 'dark'] as const) {
  test(`essencial com contraste ≥ 7:1 (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await page.goto('/?agora=2026-11-01T13:30#/');
    for (const r of await contrasts(page, '.next-time, .next-title a')) expect(r).toBeGreaterThanOrEqual(7);
    await page.goto('/?agora=2026-11-01T13:30#/dia/2026-11-01');
    for (const r of await contrasts(page, '.tl-time, .tl-name')) expect(r).toBeGreaterThanOrEqual(7);
    await page.goto('/?agora=2026-10-31T14:30#/motorista/2026-10-31/ny3-2026-10-31-11');
    for (const r of await contrasts(page, '.driver-name, .driver-address')) expect(r).toBeGreaterThanOrEqual(7);
    // Feature 007: Orlando, com fila, área do parque e forma de entrar.
    await page.goto('/?agora=2026-11-09T12:30#/');
    await expect(page.locator('.next-time')).toBeVisible();
    for (const r of await contrasts(page, '.next-time, .next-title a, .next-queue')) expect(r).toBeGreaterThanOrEqual(7);
    await page.goto('/?agora=2026-11-09T12:30#/dia/2026-11-09');
    await expect(page.locator('.tl-sub').first()).toBeVisible();
    for (const r of await contrasts(page, '.tl-time, .tl-name, .tl-sub')) expect(r).toBeGreaterThanOrEqual(7);
  });
}

test('modo sol (alto contraste): essencial ≥ 7:1', async ({ page }) => {
  await openInstalled(page, '2026-10-30T15:00:00Z');
  await page.goto('/?agora=2026-11-03T10:00#/viagem');
  await page.getByRole('checkbox', { name: /Alto contraste/ }).check();
  await page.goto('/?agora=2026-11-01T13:30#/dia/2026-11-01');
  await expect(page.locator('html')).toHaveAttribute('data-contrast', 'high');
  for (const r of await contrasts(page, '.tl-time, .tl-name')) expect(r).toBeGreaterThanOrEqual(7);
});

test('alvos ≥ 48 px (44 nos chips) e sem rolagem lateral a 390 px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openInstalled(page, '2026-10-30T15:00:00Z');
  for (const p of [...PAGES.map((x) => `/?agora=2026-11-01T13:30#${x}`), ...ORLANDO_PAGES]) {
    await page.goto(p);
    await expect(page.locator('main').first()).toBeVisible();
    const small = await page.evaluate(() =>
      [...document.querySelectorAll('.tab-bar a, .next-actions .btn, .tl-main, .done-toggle, .segmented a, .place-short, .btn')]
        .map((e) => ({ e, r: e.getBoundingClientRect() }))
        .filter(({ r }) => r.width > 0 && r.height < 44)
        .map(({ e, r }) => `${e.className} ${Math.round(r.height)}`),
    );
    expect(small, p).toEqual([]);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, p).toBeLessThanOrEqual(0);
  }
});

test('qualquer informação de 01/11 a ≤ 2 toques de "Dia" (SC-002)', async ({ page }) => {
  await openInstalled(page, '2026-10-30T15:00:00Z');
  await page.goto('/?agora=2026-11-01T13:30#/dia/2026-11-01');
  // 1 toque: detalhe de um passo (contexto em "Ler mais" = 2º toque)
  await page.locator('.tl-step .tl-main').first().click();
  await expect(page.locator('.step-head')).toBeVisible();
  await page.locator('details.read-more summary').click();
  await expect(page.locator('details.read-more')).toHaveAttribute('open', '');
  // 1 toque: opções da região; 2º toque: detalhe de uma opção
  await page.goto('/?agora=2026-11-01T13:30#/dia/2026-11-01');
  await page.getByRole('link', { name: /Opções/ }).first().click();
  await page.locator('.place-short').first().click();
  await expect(page.locator('.place-card')).toBeVisible();
});
