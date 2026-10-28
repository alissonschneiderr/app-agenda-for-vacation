// Feature 014: estados do PWA (versão nova pronta e armazenamento persistente).
import { describe, expect, it, vi } from 'vitest';
import { appVersion } from '../../scripts/app-version';
import { applyUpdate, checkPersisted, getUpdateReady, onUpdateReady, setUpdateReady } from '../../src/lib/pwa';

describe('versão do app (R3)', () => {
  it('"AAAA-MM-DD · sha7"; no CI vem do GITHUB_SHA', () => {
    const prev = process.env.GITHUB_SHA;
    process.env.GITHUB_SHA = 'abcdef1234567';
    expect(appVersion(new Date('2026-11-02T10:00:00Z'))).toBe('2026-11-02 · abcdef1');
    process.env.GITHUB_SHA = prev;
    expect(__APP_VERSION__).toMatch(/^\d{4}-\d{2}-\d{2} · (\w{7}|dev)$/);
  });
});

describe('versão nova pronta (R2)', () => {
  it('avisa quem ouve e applyUpdate chama a atualização com recarga', () => {
    const update = vi.fn(async () => undefined);
    const seen: boolean[] = [];
    const off = onUpdateReady((r) => seen.push(r));
    expect(getUpdateReady()).toBe(false);
    setUpdateReady(update);
    expect(getUpdateReady()).toBe(true);
    expect(seen).toEqual([true]);
    applyUpdate();
    expect(update).toHaveBeenCalledWith(true);
    off();
  });
});

describe('armazenamento persistente (R5)', () => {
  it('lê navigator.storage.persisted(); sem suporte, false', async () => {
    Object.defineProperty(navigator, 'storage', { value: { persisted: async () => true }, configurable: true });
    expect(await checkPersisted()).toBe(true);
    Object.defineProperty(navigator, 'storage', { value: undefined, configurable: true });
    expect(await checkPersisted()).toBe(false);
  });
});
