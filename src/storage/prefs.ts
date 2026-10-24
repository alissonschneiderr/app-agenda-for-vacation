// Preferências deste aparelho (feature 006): avisos já lidos e alto contraste.
// Não fazem parte do progresso da viagem; sem armazenamento disponível, o app usa os padrões.
import { useEffect, useState } from 'preact/hooks';

export interface Prefs {
  readAlerts: string[];
  highContrast: boolean;
}

export const PREFS_KEY = 'ctha:prefs';
const DEFAULTS: Prefs = { readAlerts: [], highContrast: false };

export function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULTS };
    const p = JSON.parse(raw) as Partial<Prefs>;
    return {
      readAlerts: Array.isArray(p.readAlerts) ? p.readAlerts.filter((x) => typeof x === 'string') : [],
      highContrast: p.highContrast === true,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

const listeners = new Set<(p: Prefs) => void>();
let current: Prefs | null = null;

export function getPrefs(): Prefs {
  return (current ??= loadPrefs());
}

/** Grava e avisa quem estiver ouvindo. Se o armazenamento falhar, a mudança vale só nesta sessão. */
export function setPrefs(change: (p: Prefs) => Prefs): Prefs {
  current = change(getPrefs());
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(current));
  } catch {
    // sem armazenamento: segue em memória
  }
  for (const l of listeners) l(current);
  return current;
}

export function markAlertRead(id: string): void {
  setPrefs((p) => (p.readAlerts.includes(id) ? p : { ...p, readAlerts: [...p.readAlerts, id] }));
}

export function setHighContrast(on: boolean): void {
  setPrefs((p) => ({ ...p, highContrast: on }));
  applyContrast(on);
}

/** Liga ou desliga o modo sol no documento. */
export function applyContrast(on: boolean): void {
  if (typeof document === 'undefined') return;
  if (on) document.documentElement.dataset.contrast = 'high';
  else delete document.documentElement.dataset.contrast;
}

/** Só para testes: esquece o que está em memória. */
export function resetPrefsCache(): void {
  current = null;
}

export function usePrefs(): Prefs {
  const [p, setP] = useState(getPrefs());
  useEffect(() => {
    listeners.add(setP);
    return () => {
      listeners.delete(setP);
    };
  }, []);
  return p;
}
