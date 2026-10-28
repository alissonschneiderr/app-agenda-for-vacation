// Feature 014: o app instalado nos celulares — áreas seguras, aviso de versão nova, dados e offline.
// Roda nos projetos mobile-360 e mobile-402 (playwright.config.ts).
import { execSync, spawn, type ChildProcess } from 'node:child_process';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { goOffline, openInstalled } from './helpers';

/** Áreas seguras do iPhone 17 (Dynamic Island e indicador de início), simuladas. */
const SAFE = ':root { --safe-top: 59px !important; --safe-bottom: 34px !important; }';

async function noControlUnderSystemBars(page: Page, path: string) {
  await page.goto(`/#${path}`);
  await page.addStyleTag({ content: SAFE });
  await expect(page.locator('main').first()).toBeVisible();
  await page.evaluate(() => scrollTo(0, 0));
  const top = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('a, button, [role="checkbox"]')]
      .filter((e) => e.offsetParent && getComputedStyle(e).position !== 'fixed')
      .map((e) => ({ t: e.getBoundingClientRect().top, n: e.textContent?.trim().slice(0, 20) ?? e.className }))
      .filter((x) => x.t < 59),
  );
  expect(top, `${path} topo`).toEqual([]);
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(150);
  const bottom = await page.evaluate(() => {
    const els = [...document.querySelectorAll<HTMLElement>('main a, main button, main [role="checkbox"]')].filter((e) => e.offsetParent);
    const last = els.at(-1);
    return last ? innerHeight - last.getBoundingClientRect().bottom : 99;
  });
  expect(bottom, `${path} rodapé`).toBeGreaterThanOrEqual(34);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
}

test.describe('US1 (014) – áreas seguras do iPhone 17', () => {
  test('Início, cidade, dia e Exibição: nada sob a Dynamic Island nem sob o indicador de início', async ({ page }) => {
    await openInstalled(page, '2026-10-27T15:00:00Z');
    for (const p of ['/', '/cidade/nova-york', '/dia/2026-11-01', '/exibicao']) await noControlUnderSystemBars(page, p);
  });
});

// ---------- US2 (014): versão nova avisada, sem recarregar sozinha e sem perder dados ----------

const ROOT = join(import.meta.dirname, '../..');
const PORT = 4331;
const URL0 = `http://localhost:${PORT}`;
const VITE = join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');

function build(dir: string, sha: string) {
  execSync(`${process.execPath} ${VITE} build --outDir ${dir} --emptyOutDir`, { cwd: ROOT, env: { ...process.env, GITHUB_SHA: sha, BASE_PATH: '/' }, stdio: 'ignore' });
}

async function serve(dir: string): Promise<ChildProcess> {
  // O vite direto (sem npx): no Linux, matar o npx deixava o servidor de baixo rodando (o A nunca saía).
  const p = spawn(process.execPath, [VITE, 'preview', '--outDir', dir, '--port', String(PORT), '--strictPort'], { cwd: ROOT, stdio: 'ignore' });
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(`${URL0}/`)).ok) return p;
    } catch {
      // ainda subindo
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('preview não subiu');
}

async function stop(p: ChildProcess) {
  p.kill();
  for (let i = 0; i < 40; i++) {
    try {
      await fetch(`${URL0}/`);
      await new Promise((r) => setTimeout(r, 250));
    } catch {
      return;
    }
  }
}

test.describe('US2 (014) – versão nova', () => {
  test('aviso aparece sem recarregar; "atualizar" troca a versão e a marca continua', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile-402', 'um build duplo basta; roda num projeto só');
    test.setTimeout(240_000);
    build('.tmp-update/a', 'aaaaaaa0000000');
    build('.tmp-update/b', 'bbbbbbb0000000');
    let server = await serve('.tmp-update/a');
    try {
      await page.goto(`${URL0}/?agora=2026-11-01T09:00#/dia/2026-11-01`);
      await page.evaluate(async () => {
        await navigator.serviceWorker.ready;
      });
      await page.reload();
      await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
      await page.locator('.stop-card').first().getByRole('checkbox').click();
      await expect(page.locator('.stop-card').first().getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
      await page.goto(`${URL0}/#/exibicao`);
      await expect(page.getByText(/Versão \d{4}-\d{2}-\d{2} · aaaaaaa/)).toBeVisible();
      await page.evaluate(() => ((window as unknown as { __marker: number }).__marker = 1));

      await stop(server);
      server = await serve('.tmp-update/b');
      // A busca de hora em hora / ao voltar para o app, antecipada.
      await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.update());
      await expect(page.getByRole('status').filter({ hasText: 'Nova versão disponível' })).toBeVisible({ timeout: 60_000 });
      expect(await page.evaluate(() => (window as unknown as { __marker?: number }).__marker)).toBe(1); // não recarregou

      await page.getByRole('button', { name: 'atualizar' }).click();
      await expect(page.getByText(/Versão \d{4}-\d{2}-\d{2} · bbbbbbb/)).toBeVisible({ timeout: 30_000 });
      await page.goto(`${URL0}/?agora=2026-11-01T09:00#/dia/2026-11-01`);
      await expect(page.locator('.stop-card').first().getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
    } finally {
      await stop(server);
    }
  });
});

// ---------- US3 (014): dados no IndexedDB (migrados do localStorage) e offline ----------

test.describe('US3 (014) – dados persistentes e offline', () => {
  test('marca antiga no localStorage vai para o IndexedDB; offline tudo abre; mapa avisa', async ({ page, context }) => {
    // Estado de uma versão anterior: a 1ª parada de 01/11 marcada, no localStorage, antes da 1ª carga.
    const content = await (await page.request.get('/data/content.json')).json();
    const ny = content.fullItineraries.find((f: { id: string }) => f.id === 'nova-york');
    const key = ny.days.find((d: { date: string }) => d.date === '2026-11-01').activities.find((a: { type: string }) => a.type !== 'transit' && a.type !== 'free')
      .id as string;
    await page.addInitScript((k) => {
      if (sessionStorage.getItem('seeded')) return;
      sessionStorage.setItem('seeded', '1');
      localStorage.setItem(
        'ctha:user:v1',
        JSON.stringify({ schemaVersion: 2, seededIds: [], favorites: [], itineraries: [], activityMarks: { [k]: { state: 'done', at: '2026-11-01T14:00:00Z' } } }),
      );
    }, key);

    await openInstalled(page, '2026-10-27T15:00:00Z', '/dia/2026-11-01');
    await expect(page.locator(`#row-${key}`).getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
    const where = await page.evaluate(
      () =>
        new Promise<{ idb: boolean; ls: boolean }>((resolve) => {
          const req = indexedDB.open('ctha');
          req.onsuccess = () => {
            const get = req.result.transaction('kv').objectStore('kv').get('ctha:user:v1');
            get.onsuccess = () => resolve({ idb: typeof get.result === 'string' && get.result.includes('done'), ls: localStorage.getItem('ctha:user:v1') !== null });
          };
        }),
    );
    expect(where).toEqual({ idb: true, ls: false });

    await goOffline(context, page);
    for (const p of ['/cidade/miami', '/dia/2026-11-19', '/dia/2026-11-01']) {
      await page.goto(`/#${p}`);
      await expect(page.locator('main').first()).toBeVisible();
      await expect(page.locator('img.cover-img').first()).toHaveJSProperty('complete', true);
    }
    await expect(page.locator(`#row-${key}`).getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');

    const url = page.url();
    await page.locator('#comer').getByRole('link', { name: /Abrir no mapa/ }).first().click();
    await expect(page.getByRole('status').filter({ hasText: 'Sem internet agora — tente de novo quando tiver conexão' })).toBeVisible();
    expect(page.url()).toBe(url);
  });
});
