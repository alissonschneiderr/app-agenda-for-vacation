import type { LoadedContent } from '../content/load';
import type { DayPlace } from '../domain/notebook';
import { CardChevron, CardLink } from './CardLink';
import { Icon } from './Icon';
import { FOOD_LEVEL } from './PlaceCard';
import { RouteButton } from './RouteButton';

/**
 * Restaurante, café, brechó ou loja do dia (feature 009, FR-012/FR-013): nome, região/endereço,
 * descrição curta, mapa e rota (feature 016) — tudo do roteiro. O card inteiro abre o detalhe do lugar.
 */
export function DayPlaceCard({ p, content }: { p: DayPlace; content: LoadedContent }) {
  return (
    <article class="nb-card place-row click-card" aria-label={p.name}>
      {p.photo && <img class="place-thumb" src={`${import.meta.env.BASE_URL}${p.photo.src}`} alt="" loading="lazy" decoding="async" width={64} height={64} />}
      <div class="place-row-body">
        {(p.level || p.price) && (
          <p class="eyebrow place-row-level">
            {[p.level && `${p.level} ${FOOD_LEVEL[p.level] ?? ''}`.trim(), p.price].filter(Boolean).join(' · ')}
          </p>
        )}
        <h3 class="place-row-name">
          <CardLink href={p.href}>{p.name}</CardLink>
        </h3>
        <p class="nb-meta">
          <Icon name="pin" size={14} /> {p.where}
        </p>
        {p.summary && <p class="clamp-2 place-row-summary">{p.summary}</p>}
        {p.mapUrl && (
          <div class="place-row-links">
            <a class="nb-link above-link" href={p.mapUrl} target="_blank" rel="noopener">
              <Icon name="map" size={16} /> Abrir no mapa
            </a>
            <RouteButton content={content} date={p.date} spotKey={p.id} variant="link" />
          </div>
        )}
      </div>
      <CardChevron />
    </article>
  );
}
