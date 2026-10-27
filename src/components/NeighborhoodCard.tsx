import type { CityId } from '../content/types';
import type { NeighborhoodCard as Model } from '../domain/notebook';
import { shortLabel } from '../domain/notebook';
import { CardChevron, CardLink } from './CardLink';
import { Chip } from './Chip';
import { Cover } from './Cover';
import { Icon } from './Icon';

/** Cartão de bairro (features 008 e 009): inteiramente clicável; abre a região. */
export function NeighborhoodCard({ n, cityId }: { n: Model; cityId: CityId }) {
  const tags: [string, number][] = [
    ['Comer', n.counts.food],
    ['Doces', n.counts.sweets],
    ['Lojas', n.counts.shops],
    ['Locações', n.counts.screen],
  ];
  return (
    <article class="nb-card hood-card click-card" aria-label={n.name}>
      <Cover photo={n.photo} cityId={cityId} icon="pin" size="card" lazy>
        <span class="cover-tag">
          <Chip variant="glass" icon="calendar">
            {shortLabel(n.date)}
          </Chip>
        </span>
        <p class="eyebrow">
          <Icon name="pin" size={14} /> Bairro
        </p>
        <h3 class="clamp-2">
          <CardLink href={`#/perto/${n.date}/${n.areaId}`}>{n.name}</CardLink>
        </h3>
      </Cover>
      <div class="nb-card-body">
        {n.intro && <p class="clamp-3 nb-phrase">{n.intro}</p>}
        <div class="cover-row">
          {tags
            .filter(([, c]) => c > 0)
            .map(([label, c]) => (
              <Chip key={label} variant="tag">
                {label} ({c})
              </Chip>
            ))}
        </div>
      </div>
      <CardChevron />
    </article>
  );
}
