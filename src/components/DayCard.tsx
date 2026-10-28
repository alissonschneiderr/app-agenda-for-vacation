import type { DayCard as DayCardModel } from '../domain/notebook';
import { formatDayMonth, formatWeekday } from '../domain/trip';
import { CardChevron, CardLink } from './CardLink';
import { Chip } from './Chip';
import { Cover } from './Cover';
import { KIND_ICON, KIND_LABEL } from './day-kind';

/** Cartão de dia (features 008 e 009): inteiramente clicável, com foto, tipo e resumo. */
export function DayCard({ d }: { d: DayCardModel }) {
  return (
    <article class="nb-card day-card click-card" aria-label={`${d.label}: ${d.title}`} data-date={d.date}>
      <Cover photo={d.photo} cityId={d.cityId} icon={KIND_ICON[d.kind]} size="card" lazy>
        <span class="cover-tag">
          <Chip variant="glass">{formatDayMonth(d.date)}</Chip>
        </span>
        <p class="eyebrow">{formatWeekday(d.date)}</p>
        <h3 class="clamp-2">
          <CardLink href={`#/dia/${d.date}`} label={`${d.label}: ${d.title}`}>
            {d.title}
          </CardLink>
        </h3>
      </Cover>
      <div class="nb-card-body">
        <p class="nb-meta">
          <Chip variant="pace" icon={KIND_ICON[d.kind]}>
            {KIND_LABEL[d.kind]}
          </Chip>
        </p>
        {d.summary && <p class="clamp-2 nb-phrase">{d.summary}</p>}
      </div>
      <CardChevron />
    </article>
  );
}
