import { Icon, type IconName } from './Icon';

interface Tab {
  path: string;
  label: string;
  icon: IconName;
  match: (p: string) => boolean;
}

/** As quatro abas (feature 006, FR-001), sempre ao alcance do polegar. */
export const TABS: Tab[] = [
  { path: '/', label: 'Agora', icon: 'clock', match: (p) => p === '/' || p.startsWith('/motorista') },
  { path: '/dia', label: 'Dia', icon: 'calendar', match: (p) => p === '/dia' || p.startsWith('/dia/') },
  { path: '/perto', label: 'Por perto', icon: 'food', match: (p) => p.startsWith('/perto') },
  {
    path: '/viagem',
    label: 'Viagem',
    icon: 'compass',
    match: (p) =>
      ['/viagem', '/guia', '/creditos', '/favoritos'].includes(p) ||
      ['/cidade', '/ponto', '/full', '/roteiros'].some((x) => p.startsWith(x)),
  },
];

export function TabBar({ path }: { path: string }) {
  return (
    <nav class="tab-bar" aria-label="Navegação principal">
      {TABS.map((t) => {
        const active = t.match(path);
        return (
          <a key={t.path} href={`#${t.path}`} aria-current={active ? 'page' : undefined}>
            <Icon name={t.icon} size={24} />
            <span>{t.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
