import { describe, expect, it } from 'vitest';
import { createUserStore, STORAGE_KEY } from '../../src/storage/user-store';
import { MemoryStorage } from '../fixtures/content';

const v1 = {
  schemaVersion: 1,
  seededIds: ['sug-2026-11-08'],
  favorites: [{ pointId: 'ny-met', pointName: 'Met', savedAt: '2026-10-25T10:00:00.000Z' }],
  itineraries: [
    { id: 'a', name: 'Meu', date: null, origin: 'user', sourceId: null, items: [], createdAt: 'x', updatedAt: 'x' },
  ],
};

describe('migração v1 → v2', () => {
  it('carrega v1 como v2 sem perder favoritos e roteiros', () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify(v1));
    const store = createUserStore(storage);
    expect(store.recovered).toBe(false);
    expect(store.get()).toEqual({ ...v1, schemaVersion: 2, activityMarks: {} });
  });

  it('grava a migração na próxima escrita', () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify(v1));
    const store = createUserStore(storage);
    store.update((s) => ({ ...s, activityMarks: { 'ny-2026-11-02-01': { state: 'done', at: 't' } } }));
    const saved = JSON.parse(storage.getItem(STORAGE_KEY)!);
    expect(saved.schemaVersion).toBe(2);
    expect(saved.favorites).toHaveLength(1);
  });

  it('v2 carrega igual', () => {
    const storage = new MemoryStorage();
    const v2 = { ...v1, schemaVersion: 2, activityMarks: { x: { state: 'skipped', at: 't' } } };
    storage.setItem(STORAGE_KEY, JSON.stringify(v2));
    expect(createUserStore(storage).get()).toEqual(v2);
  });

  it('versão desconhecida é tratada como corrompida', () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify({ ...v1, schemaVersion: 3 }));
    expect(createUserStore(storage).recovered).toBe(true);
  });
});
