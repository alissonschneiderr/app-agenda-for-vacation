import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
const out = 'specs/014-installable-phone-app/screens';
const PORT = 4332, URL0 = `http://localhost:${PORT}`;
const SAFE = ':root { --safe-top: 59px !important; --safe-bottom: 34px !important; }';
const serve = async (dir) => { const p = spawn('npx', ['vite', 'preview', '--outDir', dir, '--port', String(PORT), '--strictPort'], { stdio: 'ignore' }); for (let i = 0; i < 60; i++) { try { if ((await fetch(URL0)).ok) return p; } catch {} await new Promise((r) => setTimeout(r, 250)); } };
const stop = async (p) => { p.kill(); for (let i = 0; i < 40; i++) { try { await fetch(URL0); await new Promise((r) => setTimeout(r, 250)); } catch { return; } } };
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
const shot = async (name) => { await p.addStyleTag({ content: SAFE }); await p.waitForTimeout(500); await p.screenshot({ path: `${out}/${name}.png` }); };
let srv = await serve('.tmp-update/a');
try {
  await p.goto(`${URL0}/?agora=2026-11-01T10:00#/dia/2026-11-01`); await p.evaluate(async () => { await navigator.serviceWorker.ready; }); await p.reload();
  await p.waitForFunction(() => !!navigator.serviceWorker.controller);
  await stop(srv); srv = await serve('.tmp-update/b');
  await p.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.update());
  await p.getByRole('status').filter({ hasText: 'Nova versão' }).waitFor({ timeout: 60000 });
  await shot('03-aviso-nova-versao');
  await p.getByRole('button', { name: 'Fechar aviso' }).click();
  await ctx.setOffline(true);
  const link = p.locator('#comer').getByRole('link', { name: /Abrir no mapa/ }).first();
  await link.scrollIntoViewIfNeeded();
  await link.click();
  await p.getByRole('status').filter({ hasText: 'Sem internet' }).waitFor();
  await shot('04-sem-internet-ao-abrir-mapa');
  console.log('ok');
} catch (e) { console.log('ERRO', e.message.split('\n')[0]); }
await b.close(); await stop(srv);
