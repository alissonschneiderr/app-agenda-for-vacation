import { describe, expect, it } from 'vitest';
import { toggleFavorite } from '../../src/domain/favorites';
import { createUserStore, emptyState, STORAGE_KEY } from '../../src/storage/user-store';
import { MemoryStorage } from '../fixtures/content';

const met = { id: 'ny-met', name: 'Met' };

describe('user-store', () => {
  it('começa vazio quando a chave não existe', () => {
    const store = createUserStore(new MemoryStorage());
    expect(store.get()).toEqual(emptyState());
    expect(store.recovered).toBe(false);
  });

  it('grava de forma síncrona a cada atualização', () => {
    const storage = new MemoryStorage();
    const store = createUserStore(storage);
    expect(store.update((s) => toggleFavorite(s, met))).toEqual({ ok: true });
    expect(JSON.parse(storage.getItem(STORAGE_KEY)!).favorites[0].pointId).toBe('ny-met');
    // Um novo store (app reaberto) lê o mesmo estado.
    expect(createUserStore(storage).get().favorites).toHaveLength(1);
  });

  it('guarda cópia do JSON corrompido e recomeça vazio com aviso', () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEY, '{quebrado');
    const store = createUserStore(storage);
    expect(store.get()).toEqual(emptyState());
    expect(store.recovered).toBe(true);
    const copy = storage.keys().find((k) => k.startsWith('ctha:user:corrupt:'));
    expect(copy && storage.getItem(copy)).toBe('{quebrado');
  });

  it('formato desconhecido também é tratado como corrompido', () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 99 }));
    expect(createUserStore(storage).recovered).toBe(true);
  });

  it('com quota cheia mantém o estado anterior e retorna erro', () => {
    const storage = new MemoryStorage();
    const store = createUserStore(storage);
    store.update((s) => toggleFavorite(s, met));
    const before = store.get();
    storage.failWrites = true;
    let notified = 0;
    store.subscribe(() => notified++);
    expect(store.update((s) => toggleFavorite(s, { id: 'ny-moma', name: 'MoMA' }))).toEqual({ ok: false, error: 'QUOTA' });
    expect(store.get()).toBe(before);
    expect(notified).toBe(0);
    expect(JSON.parse(storage.getItem(STORAGE_KEY)!).favorites).toHaveLength(1);
  });

  it('não grava quando nada muda', () => {
    const storage = new MemoryStorage();
    const store = createUserStore(storage);
    store.update((s) => s);
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
  });
});
