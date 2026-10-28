// Onde o app guarda os dados do casal (feature 014): o armazenamento persistente aberto no boot
// (IndexedDB com espelho em memória, R4) ou, sem ele (testes, navegador sem IndexedDB), o localStorage.
let current: Storage | null = null;

export function setAppStorage(storage: Storage | null): void {
  current = storage;
}

export function getAppStorage(): Storage {
  return current ?? window.localStorage;
}
