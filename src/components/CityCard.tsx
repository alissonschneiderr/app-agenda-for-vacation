import type { CityCard as CityCardModel } from '../domain/notebook';
import { shortLabel } from '../domain/notebook';
import { CardChevron, CardLink } from './CardLink';
import { Chip } from './Chip';
import { Cover } from './Cover';
import { Icon } from './Icon';

/** Cartão de destino (features 008 e 009): grande, vertical e inteiramente clicável. */
export function CityCard({ c }: { c: CityCardModel }) {
  const pct = c.progress.total ? Math.round((c.progress.done / c.progress.total) * 100) : 0;
  return (
    <article class="nb-card city-card click-card" aria-label={c.name}>
      <Cover photo={c.photo} cityId={c.cityId} icon="compass" size="card" lazy>
        <span class="cover-tag">
          <Chip variant="glass">{c.nights === 1 ? '1 noite' : `${c.nights} noites`}</Chip>
        </span>
        <p class="eyebrow">{c.country}</p>
        <h2 class="city-card-title">
          <CardLink href={`#/cidade/${c.cityId}`}>{c.name}</CardLink>
        </h2>
      </Cover>
      <div class="nb-card-body">
        <p class="nb-meta">
          <Icon name="calendar" size={16} /> {shortLabel(c.start)} a {shortLabel(c.end)} · {c.roadmapDays === 1 ? '1 dia de roteiro' : `${c.roadmapDays} dias de roteiro`}
        </p>
        {c.phrase && <p class="clamp-2 nb-phrase">{c.phrase}</p>}
        <span class="nb-count">
          {c.progress.done} de {c.progress.total} feitas
        </span>
        <div class="nb-bar" aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>
      <CardChevron />
    </article>
  );
}
