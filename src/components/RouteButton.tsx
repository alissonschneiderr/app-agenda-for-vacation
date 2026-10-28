import type { LoadedContent } from '../content/load';
import { hasRoute } from '../domain/route';
import { routeHref } from '../lib/links';
import { useUserState } from '../storage/user-store';
import { Icon } from './Icon';

/**
 * "Rota até…" (feature 016, FR-001/FR-009): ao lado de "Abrir no mapa". Só aparece quando o lugar tem
 * local no roteiro e há outro lugar na cidade para onde ir. `link` é a variante dos cards do dia.
 */
export function RouteButton({ content, date, spotKey, variant = 'button' }: { content: LoadedContent; date: string; spotKey: string; variant?: 'button' | 'link' }) {
  const [state] = useUserState();
  if (!hasRoute(content, state, date, spotKey)) return null;
  return (
    <a class={variant === 'link' ? 'nb-link above-link' : 'btn'} href={routeHref(date, spotKey)}>
      <Icon name="route" size={variant === 'link' ? 16 : 18} /> Rota até…
    </a>
  );
}
