// Feature 014 (US1): o app instalado nos dois sistemas — manifest, metas do iPhone e tela de abertura.
// Confere a fonte (o CI roda os testes antes do build).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { pwaManifest } from '../../pwa-manifest';

const root = join(import.meta.dirname, '../..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

describe('manifest (Android e iPhone)', () => {
  it('tela cheia, nome curto, cores do visual atual e ícones 192, 512 e maskable', () => {
    const m = pwaManifest('/');
    expect(m).toMatchObject({ display: 'standalone', short_name: 'Guia Viagem', theme_color: '#8a3214', background_color: '#faf8f5', start_url: '/', scope: '/' });
    expect(m.icons.map((i) => `${i.sizes}${i.purpose ? ` ${i.purpose}` : ''}`)).toEqual(['192x192', '512x512', '512x512 maskable']);
    expect(pwaManifest('/app-agenda-for-vacation/').start_url).toBe('/app-agenda-for-vacation/');
  });
});

describe('index.html (iPhone)', () => {
  it('tela cheia, barra de status translúcida, título e cor de tema clara e escura', () => {
    expect(html).toMatch(/<meta name="apple-mobile-web-app-capable" content="yes"/);
    expect(html).toMatch(/<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/);
    expect(html).toMatch(/<meta name="apple-mobile-web-app-title" content="Guia Viagem"/);
    expect(html).toMatch(/<meta name="theme-color" content="#faf8f5" media="\(prefers-color-scheme: light\)"/);
    expect(html).toMatch(/<meta name="theme-color" content="#1a1512" media="\(prefers-color-scheme: dark\)"/);
    expect(html).not.toMatch(/#0f4c81/);
  });

  it('tela de abertura do iPhone 17 (402 × 874 @3) e do Pro Max/Air (440 × 956 @3), com os PNGs', () => {
    const links = [...html.matchAll(/<link rel="apple-touch-startup-image"[^>]*href="([^"]+)"[^>]*media="([^"]+)"/g)];
    expect(links.map((l) => l[2])).toEqual([
      '(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      '(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
    ]);
    for (const [, href] of links) expect(existsSync(join(root, 'public', href!)), href).toBe(true);
  });
});
