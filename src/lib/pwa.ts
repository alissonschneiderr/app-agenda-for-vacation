// Estado da rede e do Service Worker, compartilhado pelas telas.
import { useEffect, useState } from 'preact/hooks';
import { getAppStorage } from '../storage/app-storage';

export function useOnline(): boolean {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

export type OfflineState = 'pending' | 'ready' | 'failed';

const OFFLINE_READY_KEY = 'ctha:offline-ready';
let offlineState: OfflineState = readFlag();
const listeners = new Set<(s: OfflineState) => void>();

function readFlag(): OfflineState {
  try {
    return typeof window !== 'undefined' && getAppStorage().getItem(OFFLINE_READY_KEY) ? 'ready' : 'pending';
  } catch {
    return 'pending';
  }
}

export function setOfflineState(s: OfflineState): void {
  offlineState = s;
  if (s === 'ready') {
    try {
      getAppStorage().setItem(OFFLINE_READY_KEY, new Date().toISOString());
    } catch {
      // sem espaço: só não lembra o aviso
    }
  }
  listeners.forEach((l) => l(s));
}

export function useOfflineState(): OfflineState {
  const [s, setS] = useState(offlineState);
  useEffect(() => {
    listeners.add(setS);
    return () => listeners.delete(setS);
  }, []);
  return s;
}

// ---------- feature 014: versão nova com aviso e armazenamento persistente ----------

type UpdateFn = (reload?: boolean) => Promise<void>;
let updateFn: UpdateFn | null = null;
const updateListeners = new Set<(ready: boolean) => void>();

/** O Service Worker novo está pronto (R2): guarda como trocar de versão e avisa as telas. */
export function setUpdateReady(fn: UpdateFn): void {
  updateFn = fn;
  updateListeners.forEach((l) => l(true));
}

export function getUpdateReady(): boolean {
  return updateFn !== null;
}

export function onUpdateReady(listener: (ready: boolean) => void): () => void {
  updateListeners.add(listener);
  return () => updateListeners.delete(listener);
}

/** "atualizar": o SW novo assume e a página recarrega na mesma rota (ela fica no hash). */
export function applyUpdate(): void {
  void updateFn?.(true);
}

export function useUpdateReady(): boolean {
  const [ready, setReady] = useState(getUpdateReady());
  useEffect(() => onUpdateReady(setReady), []);
  return ready;
}

/** O navegador garante não apagar os dados deste app? (R5) Sem suporte: false. */
export async function checkPersisted(): Promise<boolean> {
  try {
    return (await navigator.storage?.persisted?.()) === true;
  } catch {
    return false;
  }
}

export function usePersisted(): boolean | null {
  const [p, setP] = useState<boolean | null>(null);
  useEffect(() => {
    void checkPersisted().then(setP);
  }, []);
  return p;
}
