const ITEMS = [
  { path: '/', label: 'Guia', icon: '🗺️', match: (p: string) => p === '/' || p.startsWith('/cidade') || p.startsWith('/ponto') },
  { path: '/favoritos', label: 'Favoritos', icon: '★', match: (p: string) => p === '/favoritos' },
  { path: '/roteiros', label: 'Roteiros', icon: '📅', match: (p: string) => p.startsWith('/roteiros') },
];

export function BottomNav({ path }: { path: string }) {
  return (
    <nav class="bottom-nav" aria-label="Navegação principal">
      {ITEMS.map((item) => (
        <a key={item.path} href={`#${item.path}`} aria-current={item.match(path) ? 'page' : undefined}>
          <span class="icon" aria-hidden="true">
            {item.icon}
          </span>
          {item.label}
        </a>
      ))}
    </nav>
  );
}
