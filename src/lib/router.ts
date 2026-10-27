// Roteamento por hash (#/…), para hospedagem estática e offline (contracts/routes.md).
import { useEffect, useState } from 'preact/hooks';

/** Caminho do hash, sem a query (`#/perto/x?g=comer` → `/perto/x`). */
export function currentPath(): string {
  const hash = window.location.hash.replace(/^#/, '').split('?')[0]!;
  return hash.startsWith('/') ? hash : '/';
}

export function useRoute(): string {
  const [path, setPath] = useState(currentPath());
  useEffect(() => {
    const onChange = () => {
      const next = currentPath();
      setPath((prev) => {
        // Só filtros na query (mesma tela): mantém a rolagem.
        if (prev !== next) window.scrollTo?.(0, 0);
        return next;
      });
    };
    window.addEventListener('hashchange', onChange);
    // O hash pode ter mudado entre o primeiro render e o registro do listener.
    setPath(currentPath());
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return path;
}

/** Query do hash (`#/perto/x?g=comer` → g=comer), atualizada a cada troca de hash (só filtros mudam). */
export function useQuery(): URLSearchParams {
  const read = () => {
    const h = location.hash;
    return h.includes('?') ? h.slice(h.indexOf('?') + 1) : '';
  };
  const [q, setQ] = useState(read());
  useEffect(() => {
    const onChange = () => setQ(read());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return new URLSearchParams(q);
}

export function navigate(path: string): void {
  window.location.hash = path;
}

export function href(path: string): string {
  return `#${path}`;
}

/** Casa "/ponto/:pointId" com "/ponto/ny-met" → { pointId: "ny-met" }. */
export function matchRoute(pattern: string, path: string): Record<string, string> | null {
  const p = pattern.split('/');
  const a = path.split('/');
  if (p.length !== a.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < p.length; i++) {
    const seg = p[i]!;
    if (seg.startsWith(':')) params[seg.slice(1)] = decodeURIComponent(a[i]!);
    else if (seg !== a[i]) return null;
  }
  return params;
}
