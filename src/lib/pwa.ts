// Estado da rede e do Service Worker, compartilhado pelas telas.
import { useEffect, useState } from 'preact/hooks';

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
    return typeof localStorage !== 'undefined' && localStorage.getItem(OFFLINE_READY_KEY) ? 'ready' : 'pending';
  } catch {
    return 'pending';
  }
}

export function setOfflineState(s: OfflineState): void {
  offlineState = s;
  if (s === 'ready') {
    try {
      localStorage.setItem(OFFLINE_READY_KEY, new Date().toISOString());
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
