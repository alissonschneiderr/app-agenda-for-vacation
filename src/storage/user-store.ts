// Único módulo que lê e escreve os dados do usuário (contracts/user-storage.md).
import { useEffect, useState } from 'preact/hooks';
import type { UserState, UserStateV1 } from './types';

export const STORAGE_KEY = 'ctha:user:v1';

export type SaveError = 'QUOTA' | 'UNKNOWN';
export type UpdateResult = { ok: true } | { ok: false; error: SaveError };

export function emptyState(): UserState {
  return { schemaVersion: 2, seededIds: [], favorites: [], itineraries: [], activityMarks: {} };
}

function hasBaseFields(s: UserState | UserStateV1): boolean {
  return Array.isArray(s.seededIds) && Array.isArray(s.favorites) && Array.isArray(s.itineraries);
}

function isUserState(v: unknown): v is UserState {
  const s = v as UserState;
  return !!s && s.schemaVersion === 2 && hasBaseFields(s) && !!s.activityMarks && typeof s.activityMarks === 'object';
}

function isUserStateV1(v: unknown): v is UserStateV1 {
  const s = v as UserStateV1;
  return !!s && s.schemaVersion === 1 && hasBaseFields(s);
}

/** v1 (feature 001) → v2: acrescenta as marcações do roteiro FULL sem perder nada. */
export function migrateV1(s: UserStateV1): UserState {
  return { ...s, schemaVersion: 2, activityMarks: {} };
}

export function loadState(storage: Storage, now = new Date()): { state: UserState; recovered: boolean } {
  const raw = storage.getItem(STORAGE_KEY);
  if (raw === null) return { state: emptyState(), recovered: false };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isUserState(parsed)) return { state: parsed, recovered: false };
    // A migração é gravada na próxima escrita.
    if (isUserStateV1(parsed)) return { state: migrateV1(parsed), recovered: false };
  } catch {
    // tratado abaixo
  }
  try {
    storage.setItem(`ctha:user:corrupt:${now.getTime()}`, raw);
  } catch {
    // sem espaço para a cópia: segue mesmo assim
  }
  return { state: emptyState(), recovered: true };
}

export function saveState(storage: Storage, state: UserState): UpdateResult {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch (e) {
    const quota = e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22);
    return { ok: false, error: quota ? 'QUOTA' : 'UNKNOWN' };
  }
}

export interface UserStore {
  get(): UserState;
  /** Aplica fn, grava de forma síncrona e só então publica; em falha, mantém o estado anterior. */
  update(fn: (s: UserState) => UserState): UpdateResult;
  subscribe(listener: () => void): () => void;
  /** true se o JSON salvo estava corrompido e o app recomeçou vazio. */
  recovered: boolean;
}

export function createUserStore(storage: Storage): UserStore {
  const loaded = loadState(storage);
  let state = loaded.state;
  const listeners = new Set<() => void>();
  return {
    recovered: loaded.recovered,
    get: () => state,
    update(fn) {
      const next = fn(state);
      if (next === state) return { ok: true };
      const result = saveState(storage, next);
      if (result.ok) {
        state = next;
        listeners.forEach((l) => l());
      }
      return result;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

let defaultStore: UserStore | null = null;

export function getUserStore(): UserStore {
  defaultStore ??= createUserStore(window.localStorage);
  return defaultStore;
}

/** Só para testes: troca o store padrão. */
export function setUserStore(store: UserStore | null): void {
  defaultStore = store;
}

export function useUserState(): [UserState, UserStore['update']] {
  const store = getUserStore();
  const [state, setState] = useState(store.get());
  useEffect(() => {
    setState(store.get());
    return store.subscribe(() => setState(store.get()));
  }, [store]);
  return [state, store.update];
}

export const SAVE_ERROR_MESSAGE = 'Não foi possível salvar: armazenamento cheio.';
