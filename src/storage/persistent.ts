// Dados do casal no IndexedDB (feature 014, research R4): um espelho em memória com a mesma interface
// do localStorage — leitura e escrita síncronas para o resto do app — que grava no IndexedDB em seguida.
//
// Gravar no IndexedDB é assíncrono: fechar o app logo depois de marcar pode cortar a gravação. Por isso
// cada mudança vai antes, de forma síncrona, para o localStorage (cópia de segurança) e sai de lá quando
// o IndexedDB confirma. Ao abrir, o que estiver no localStorage é mais novo e é aplicado ao IndexedDB —
// isso cobre a gravação interrompida e a migração da versão antiga (que guardava tudo no localStorage).
// Se o IndexedDB falhar, o app segue com o localStorage, sem perder nada.

export interface KvBackend {
  getAll(): Promise<Record<string, string>>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

const PREFIX = 'ctha:';

/** Marca, na cópia de segurança, uma chave apagada ainda não confirmada no IndexedDB. */
const DELETED = '\u0000apagado';

export class PersistentStorage implements Storage {
  private readonly map: Map<string, string>;

  constructor(
    initial: Record<string, string>,
    private readonly backend: KvBackend,
    private readonly journal: Storage | null = null,
    private readonly onWriteError: (e: unknown) => void = () => undefined,
  ) {
    this.map = new Map(Object.entries(initial));
  }

  get length(): number {
    return this.map.size;
  }

  key(index: number): string | null {
    return [...this.map.keys()][index] ?? null;
  }

  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    const v = String(value);
    this.map.set(key, v);
    this.write(key, v, () => this.backend.set(key, v));
  }

  removeItem(key: string): void {
    this.map.delete(key);
    this.write(key, DELETED, () => this.backend.delete(key));
  }

  clear(): void {
    for (const k of [...this.map.keys()]) this.removeItem(k);
  }

  /** Cópia de segurança síncrona; sai quando o IndexedDB confirma (se ninguém gravou por cima). */
  private write(key: string, journalValue: string, persist: () => Promise<void>): void {
    try {
      this.journal?.setItem(key, journalValue);
    } catch {
      // sem espaço no localStorage: segue só com o IndexedDB
    }
    persist().then(() => {
      try {
        if (this.journal?.getItem(key) === journalValue) this.journal.removeItem(key);
      } catch {
        // nada a limpar
      }
    }, this.onWriteError);
  }
}

/** Banco `ctha`, store `kv`: uma chave por item, valor em texto (o mesmo JSON de antes). */
export function indexedDbBackend(name = 'ctha'): KvBackend {
  const open = () =>
    new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(name, 1);
      req.onupgradeneeded = () => req.result.createObjectStore('kv');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  let db: Promise<IDBDatabase> | null = null;
  const tx = async <T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> => {
    db ??= open();
    const t = (await db).transaction('kv', mode);
    const req = run(t.objectStore('kv'));
    return new Promise<T | undefined>((resolve, reject) => {
      t.oncomplete = () => resolve(req ? req.result : undefined);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    });
  };
  return {
    async getAll() {
      const out: Record<string, string> = {};
      const keys = (await tx('readonly', (s) => s.getAllKeys())) ?? [];
      const values = (await tx('readonly', (s) => s.getAll())) ?? [];
      keys.forEach((k, i) => (out[String(k)] = String(values[i])));
      return out;
    },
    async set(key, value) {
      await tx('readwrite', (s) => s.put(value, key));
    },
    async delete(key) {
      await tx('readwrite', (s) => s.delete(key));
    },
  };
}

/**
 * Abre o armazenamento do app. Sem IndexedDB (ou com erro), devolve o `legacy` (o localStorage).
 */
export async function openPersistentStorage({
  backend,
  legacy,
  onWriteError,
}: {
  backend?: KvBackend;
  legacy: Storage;
  onWriteError?: (e: unknown) => void;
}): Promise<Storage> {
  try {
    const kv = backend ?? (typeof indexedDB !== 'undefined' ? indexedDbBackend() : null);
    if (!kv) return legacy;
    let data = await kv.getAll();
    // O que está no localStorage (`ctha:*`) é mais novo: gravação não confirmada ou dados da versão antiga.
    const pending: Record<string, string> = {};
    for (let i = 0; i < legacy.length; i++) {
      const k = legacy.key(i);
      if (k?.startsWith(PREFIX)) pending[k] = legacy.getItem(k) ?? '';
    }
    if (Object.keys(pending).length) {
      const before = { ...data };
      try {
        for (const [k, v] of Object.entries(pending)) await (v === DELETED ? kv.delete(k) : kv.set(k, v));
        data = await kv.getAll();
        const ok = Object.entries(pending).every(([k, v]) => (v === DELETED ? !(k in data) : data[k] === v));
        if (!ok) throw new Error('cópia diferente');
      } catch {
        // Desfaz o que foi aplicado: o IndexedDB volta ao que era e a cópia continua no localStorage.
        for (const k of Object.keys(pending)) {
          await (k in before ? kv.set(k, before[k]!) : kv.delete(k)).catch(() => undefined);
        }
        return legacy;
      }
      for (const k of Object.keys(pending)) legacy.removeItem(k);
    }
    return new PersistentStorage(data, kv, legacy, onWriteError);
  } catch {
    return legacy;
  }
}
