import type { DayPlace } from '../domain/notebook';
import { CardChevron, CardLink } from './CardLink';
import { Icon } from './Icon';
import { FOOD_LEVEL } from './PlaceCard';

/**
 * Restaurante, café, brechó ou loja do dia (feature 009, FR-012/FR-013): nome, região/endereço,
 * descrição curta e mapa — tudo do roteiro. O card inteiro abre o detalhe do lugar.
 */
export function DayPlaceCard({ p }: { p: DayPlace }) {
  return (
    <article class="nb-card place-row click-card" aria-label={p.name}>
      {p.photo && <img class="place-thumb" src={`${import.meta.env.BASE_URL}${p.photo.src}`} alt="" loading="lazy" decoding="async" width={64} height={64} />}
      <div class="place-row-body">
        {(p.level || p.price) && (
          <p class="eyebrow place-row-level">
            {p.level && `${p.level} ${FOOD_LEVEL[p.level] ?? ''}`}
            {p.price && ` · ${p.price}`}
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
          <a class="nb-link above-link" href={p.mapUrl} target="_blank" rel="noopener">
            <Icon name="map" size={16} /> Abrir no mapa
          </a>
        )}
      </div>
      <CardChevron />
    </article>
  );
}
