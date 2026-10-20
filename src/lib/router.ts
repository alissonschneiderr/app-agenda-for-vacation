// Roteamento por hash (#/…), para hospedagem estática e offline (contracts/routes.md).
import { useEffect, useState } from 'preact/hooks';

export function currentPath(): string {
  const hash = window.location.hash.replace(/^#/, '');
  return hash.startsWith('/') ? hash : '/';
}

export function useRoute(): string {
  const [path, setPath] = useState(currentPath());
  useEffect(() => {
    const onChange = () => {
      setPath(currentPath());
      window.scrollTo?.(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    // O hash pode ter mudado entre o primeiro render e o registro do listener.
    setPath(currentPath());
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return path;
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
