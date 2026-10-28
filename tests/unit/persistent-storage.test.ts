// Feature 014 (US3, R4): dados do casal no IndexedDB, com espelho em memória e migração do localStorage.
// O jsdom não tem IndexedDB: a lógica é testada com um backend em memória; o caminho real fica no e2e.
import { describe, expect, it } from 'vitest';
import { openPersistentStorage, PersistentStorage, type KvBackend } from '../../src/storage/persistent';

function memoryBackend(initial: Record<string, string> = {}, failOn?: string): KvBackend & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getAll: async () => ({ ...data }),
    set: async (k, v) => {
      if (k === failOn) throw new Error('cheio');
      data[k] = v;
    },
    delete: async (k) => {
      delete data[k];
    },
  };
}

function fakeLegacy(initial: Record<string, string>): Storage {
  const m = new Map(Object.entries(initial));
  return {
    get length() {
      return m.size;
    },
    key: (i) => [...m.keys()][i] ?? null,
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, String(v)),
    removeItem: (k) => void m.delete(k),
    clear: () => m.clear(),
  };
}

const flush = () => new Promise((r) => setTimeout(r, 0));

describe('PersistentStorage', () => {
  it('lê e grava na hora (síncrono) e espelha no backend', async () => {
    const backend = memoryBackend({ 'ctha:prefs': '{"highContrast":true}' });
    const s = new PersistentStorage(await backend.getAll(), backend);
    expect(s.getItem('ctha:prefs')).toBe('{"highContrast":true}');
    s.setItem('ctha:user:v1', '{"x":1}');
    expect(s.getItem('ctha:user:v1')).toBe('{"x":1}');
    s.removeItem('ctha:prefs');
    expect(s.getItem('ctha:prefs')).toBeNull();
    await flush();
    expect(backend.data).toEqual({ 'ctha:user:v1': '{"x":1}' });
  });
});

describe('migração do localStorage (uma vez, sem perda)', () => {
  it('IndexedDB vazio: copia as chaves ctha:*, confere e só então limpa o localStorage', async () => {
    const backend = memoryBackend();
    const legacy = fakeLegacy({ 'ctha:user:v1': '{"marks":1}', 'ctha:prefs': '{}', 'outra-chave': 'fica' });
    const s = await openPersistentStorage({ backend, legacy });
    expect(s.getItem('ctha:user:v1')).toBe('{"marks":1}');
    expect(backend.data).toEqual({ 'ctha:user:v1': '{"marks":1}', 'ctha:prefs': '{}' });
    expect(legacy.getItem('ctha:user:v1')).toBeNull();
    expect(legacy.getItem('ctha:prefs')).toBeNull();
    expect(legacy.getItem('outra-chave')).toBe('fica');
  });

  it('falha no meio: nada sai do localStorage e o app segue com ele', async () => {
    const backend = memoryBackend({}, 'ctha:prefs');
    const legacy = fakeLegacy({ 'ctha:user:v1': '{"marks":1}', 'ctha:prefs': '{}' });
    const s = await openPersistentStorage({ backend, legacy });
    expect(s).toBe(legacy);
    expect(legacy.getItem('ctha:user:v1')).toBe('{"marks":1}');
    expect(legacy.getItem('ctha:prefs')).toBe('{}');
    expect(backend.data).toEqual({}); // cópia parcial desfeita: a próxima abertura tenta de novo
  });

  it('o que ficou no localStorage é gravação ainda não confirmada: é mais nova e vence o IndexedDB', async () => {
    const backend = memoryBackend({ 'ctha:user:v1': '{"antigo":1}', 'ctha:prefs': '{"p":1}' });
    const legacy = fakeLegacy({ 'ctha:user:v1': '{"novo":1}' });
    const s = await openPersistentStorage({ backend, legacy });
    expect(s.getItem('ctha:user:v1')).toBe('{"novo":1}');
    expect(s.getItem('ctha:prefs')).toBe('{"p":1}');
    expect(backend.data['ctha:user:v1']).toBe('{"novo":1}');
    expect(legacy.getItem('ctha:user:v1')).toBeNull();
  });

  it('sem IndexedDB (backend indisponível): segue com o localStorage', async () => {
    const legacy = fakeLegacy({ 'ctha:user:v1': '{"marks":1}' });
    const broken: KvBackend = { getAll: async () => Promise.reject(new Error('sem idb')), set: async () => undefined, delete: async () => undefined };
    expect(await openPersistentStorage({ backend: broken, legacy })).toBe(legacy);
  });
});

describe('gravação interrompida (fechar o app logo depois de marcar)', () => {
  it('a mudança fica no localStorage até o IndexedDB confirmar; reabrir recupera', async () => {
    const legacy = fakeLegacy({});
    const stuck: KvBackend = { getAll: async () => ({ 'ctha:user:v1': '{"v":1}' }), set: () => new Promise(() => undefined), delete: () => new Promise(() => undefined) };
    const s = await openPersistentStorage({ backend: stuck, legacy });
    s.setItem('ctha:user:v1', '{"v":2}');
    expect(legacy.getItem('ctha:user:v1')).toBe('{"v":2}'); // cópia de segurança síncrona
    // "Reabre" o app: o IndexedDB ainda tem a versão velha, mas a cópia vence.
    const backend = memoryBackend({ 'ctha:user:v1': '{"v":1}' });
    const again = await openPersistentStorage({ backend, legacy });
    expect(again.getItem('ctha:user:v1')).toBe('{"v":2}');
    expect(backend.data['ctha:user:v1']).toBe('{"v":2}');
  });

  it('com o IndexedDB confirmado, a cópia de segurança é apagada', async () => {
    const legacy = fakeLegacy({});
    const backend = memoryBackend();
    const s = await openPersistentStorage({ backend, legacy });
    s.setItem('ctha:prefs', '{"a":1}');
    await flush();
    expect(backend.data['ctha:prefs']).toBe('{"a":1}');
    expect(legacy.getItem('ctha:prefs')).toBeNull();
  });
});
