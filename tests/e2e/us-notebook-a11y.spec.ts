// Feature 008 (T041): leitura na rua nas telas do caderno de viagem, nos temas claro, escuro e alto
// contraste — contraste ≥ 7:1 no essencial (≥ 4,5:1 no resto), inclusive texto sobre foto (medido
// contra os pixels reais da foto + véu), alvos ≥ 48 px (44 nos chips) e sem rolagem lateral a 390 px.
import { expect, test, type Page } from '@playwright/test';
import { openInstalled } from './helpers';

// Feature 009: Início só com as cidades; Dicas/Transporte/Bairros dentro do dia.
const PAGES = [
  '/?agora=2026-10-27T10:00#/',
  '/?agora=2026-11-01T13:30#/cidade/nova-york',
  '/?agora=2026-11-01T13:30#/cidade/orlando',
  '/?agora=2026-11-01T13:30#/dia/2026-11-01',
  '/?agora=2026-11-09T12:30#/dia/2026-11-09',
  '/?agora=2026-11-07T09:00#/dia/2026-11-07',
  '/?agora=2026-11-01T13:30#/perto/2026-11-01/soho',
  '/?agora=2026-11-01T09:00#/dia/2026-11-01/ny3-2026-11-01-04',
  '/?agora=2026-11-01T13:30#/exibicao',
];

/** Contraste de cada texto: sobre foto, contra o pixel mais claro (p90) atrás dele com o véu; senão, contra o fundo sólido. */
async function contrasts(page: Page, selector: string): Promise<{ text: string; ratio: number }[]> {
  return page.evaluate(async (sel) => {
    // Fotos com carregamento preguiçoso fora da tela: carrega antes de medir.
    await Promise.all(
      [...document.querySelectorAll('img.cover-img')].map(async (i) => {
        const img = i as HTMLImageElement;
        img.loading = 'eager';
        await img.decode().catch(() => undefined);
      }),
    );
    const parse = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number);
    const lin = (v: number) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    const lum = ([r, g, b]: number[]) => 0.2126 * lin(r!) + 0.7152 * lin(g!) + 0.0722 * lin(b!);
    const ratio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    const bgOf = (el: Element | null): number[] => {
      for (let e = el; e; e = e.parentElement) {
        const c = parse(getComputedStyle(e).backgroundColor);
        if (c.length >= 3 && (c[3] ?? 1) > 0.9) return c;
      }
      return parse(getComputedStyle(document.body).backgroundColor);
    };
    /** Alfa do véu numa altura relativa (0 = topo, 1 = base), lido do gradiente aplicado. */
    const veilAlpha = (cover: Element, y: number): { color: number[]; alpha: number } => {
      const veil = cover.querySelector('.cover-veil')!;
      const stops = [...getComputedStyle(veil).backgroundImage.matchAll(/rgba?\(([^)]+)\)\s*([\d.]+)%/g)].map((m) => {
        const v = m[1]!.split(/[ ,/]+/).filter(Boolean).map(Number);
        return { color: v.slice(0, 3), alpha: v[3] ?? 1, at: Number(m[2]) / 100 };
      });
      if (!stops.length) return { color: [0, 0, 0], alpha: 0 };
      let a = stops[0]!;
      for (const s of stops) if (s.at <= y) a = s;
      const b = stops.find((s) => s.at >= y) ?? stops.at(-1)!;
      const t = b.at === a.at ? 0 : (y - a.at) / (b.at - a.at);
      return { color: a.color, alpha: a.alpha + (b.alpha - a.alpha) * t };
    };
    const out: { text: string; ratio: number }[] = [];
    for (const el of [...document.querySelectorAll(sel)].slice(0, 30)) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const fg = lum(parse(getComputedStyle(el).color));
      const cover = el.closest('.cover');
      const img = cover?.querySelector('img.cover-img') as HTMLImageElement | null;
      if (cover && img && img.complete && img.naturalWidth) {
        const cr = cover.getBoundingClientRect();
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(cr.width);
        canvas.height = Math.ceil(cr.height);
        const ctx = canvas.getContext('2d')!;
        const scale = Math.max(cr.width / img.naturalWidth, cr.height / img.naturalHeight);
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        ctx.drawImage(img, (cr.width - w) / 2, (cr.height - h) / 2, w, h);
        const x0 = Math.max(0, r.left - cr.left);
        const y0 = Math.max(0, r.top - cr.top);
        const data = ctx.getImageData(x0, y0, Math.max(1, Math.min(r.width, cr.width - x0)), Math.max(1, Math.min(r.height, cr.height - y0))).data;
        const lums: number[] = [];
        const { color, alpha } = veilAlpha(cover, (r.top + r.height / 2 - cr.top) / cr.height);
        for (let i = 0; i < data.length; i += 16) {
          const px = [0, 1, 2].map((k) => data[i + k]! * (1 - alpha) + color[k]! * alpha);
          lums.push(lum(px));
        }
        lums.sort((a, b) => a - b);
        out.push({ text: (el.textContent ?? '').trim().slice(0, 40), ratio: ratio(fg, lums[Math.floor(lums.length * 0.9)] ?? 0) });
      } else if (cover) {
        // Sem foto: o degradê da cidade, medido na sua cor mais clara.
        const colors = [...getComputedStyle(cover).backgroundImage.matchAll(/rgba?\(([^)]+)\)/g)].map((m) => m[1]!.split(/[ ,/]+/).filter(Boolean).map(Number));
        const lightest = Math.max(...colors.map((c) => lum(c)));
        out.push({ text: (el.textContent ?? '').trim().slice(0, 40), ratio: ratio(fg, lightest) });
      } else {
        out.push({ text: (el.textContent ?? '').trim().slice(0, 40), ratio: ratio(fg, lum(bgOf(el))) });
      }
    }
    return out;
  }, selector);
}

const ESSENTIAL = '.cover h1, .cover h2, .cover h3, .page-head-title, .next-time, .next-title a, .stop-card .tl-time, .stop-card .tl-name, .tl-name, .day-card h3, .section-head h2, .place-row-name a, .step-title';
const OTHER = '.cover .eyebrow, .cover p, .cover .chip2, .nb-meta, .tl-sub, .nb-link, .section-sub, .chip2-accent, .chip2-type, .section-menu a, .step-description p';

for (const scheme of ['light', 'dark'] as const) {
  test(`contraste nas telas do caderno de viagem (${scheme})`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.emulateMedia({ colorScheme: scheme });
    await page.setViewportSize({ width: 390, height: 844 });
    await openInstalled(page, '2026-10-27T15:00:00Z');
    const fails: string[] = [];
    for (const p of PAGES) {
      await page.goto(p);
      await expect(page.locator('main').first()).toBeVisible();
      for (const { text, ratio } of await contrasts(page, ESSENTIAL)) if (ratio < 7) fails.push(`${p} essencial "${text}" ${ratio.toFixed(2)}`);
      for (const { text, ratio } of await contrasts(page, OTHER)) if (ratio < 4.5) fails.push(`${p} "${text}" ${ratio.toFixed(2)}`);
    }
    expect(fails).toEqual([]);
  });
}

test('alto contraste (modo sol): essencial ≥ 7:1 no Início e no Dia', async ({ page }) => {
  await openInstalled(page, '2026-10-27T15:00:00Z', '/exibicao');
  await page.getByRole('checkbox', { name: /Alto contraste/ }).check();
  await expect(page.locator('html')).toHaveAttribute('data-contrast', 'high');
  for (const p of ['/?agora=2026-11-01T13:30#/', '/?agora=2026-11-01T13:30#/dia/2026-11-01']) {
    await page.goto(p);
    await expect(page.locator('main').first()).toBeVisible();
    for (const { text, ratio } of await contrasts(page, ESSENTIAL)) expect(ratio, `${p} ${text}`).toBeGreaterThanOrEqual(7);
  }
});

test('alvos ≥ 48 px (44 nos chips e abas) e sem rolagem lateral a 390 px', async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await openInstalled(page, '2026-10-27T15:00:00Z');
  for (const p of [...PAGES, '/?agora=2026-11-01T13:30#/motorista/2026-11-01/ny3-2026-11-01-05']) {
    await page.goto(p);
    await expect(page.locator('main, .driver').first()).toBeVisible();
    const small = await page.evaluate(() =>
      [...document.querySelectorAll('.tab-bar a, .btn, .round-btn, .round-glass, .stop-check, .stop-expand, .nb-link, .section-menu a, .chip2-link, .done-toggle, .place-short, .tl-area-options')]
        .map((e) => ({ e, r: e.getBoundingClientRect() }))
        .filter(({ r }) => r.width > 0 && r.height < 44)
        .map(({ e, r }) => `${e.className} ${Math.round(r.height)}`),
    );
    expect(small, p).toEqual([]);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, p).toBeLessThanOrEqual(0);
  }
});
