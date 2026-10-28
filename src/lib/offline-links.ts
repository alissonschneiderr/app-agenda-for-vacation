// Funções de internet sem conexão (feature 014, R9): rotas e mapas no Google Maps, "Ver fotos", sites
// oficiais. Sem internet, o toque mostra um aviso simples em vez da página de erro do navegador.
const listeners = new Set<(on: boolean) => void>();
let timer: ReturnType<typeof setTimeout> | undefined;

export const OFFLINE_MESSAGE = 'Sem internet agora — tente de novo quando tiver conexão';

export function onOfflineNotice(listener: (on: boolean) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((l) => l(true));
  clearTimeout(timer);
  timer = setTimeout(() => listeners.forEach((l) => l(false)), 4000);
}

/** Delegação de clique em links para fora do app; instalada uma vez (como a dos cards, feature 009). */
export function installOfflineLinks(root: Document = document): () => void {
  const onClick = (e: MouseEvent) => {
    if (navigator.onLine !== false) return;
    const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!a || !/^https?:/i.test(a.href) || new URL(a.href).origin === location.origin) return;
    e.preventDefault();
    notify();
  };
  root.addEventListener('click', onClick, true);
  return () => root.removeEventListener('click', onClick, true);
}
