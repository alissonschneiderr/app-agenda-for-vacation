import type { CityId } from '../content/types';
import { modeOf } from '../domain/now';
import type { DayActivityView } from '../domain/trip-view';
import { DoneToggle } from './DoneToggle';
import { Icon } from './Icon';
import { MODE_ICON, stepTicket } from './NextStepCard';

/** Horário na coluna estreita: início em destaque; o fim ("às 12h30") embaixo, menor. */
export function TimeCell({ label }: { label: string }) {
  const [start, end] = label.split(/\s*(?:às|–)\s*/);
  return (
    <span class="tl-time">
      {start}
      {end && <span class="tl-time-end">até {end}</span>}
    </span>
  );
}

/** Linha curta sob o nome (feature 007): área do parque · fila · Multi/Single Pass · opcional. */
export function stepSub(a: Pick<DayActivityView, 'land' | 'queue' | 'access' | 'optional'>): string {
  const pass = /\b(Multi Pass|Single Pass)\b/.exec(a.access ?? '')?.[1];
  return [a.land, a.queue, pass, a.optional ? 'opcional' : ''].filter(Boolean).join(' · ');
}

/** Uma linha da linha do tempo do dia (feature 006, contracts/ui-screens.md "Dia", item 3). */
export function TimelineRow({ a, href, night = false }: { a: DayActivityView; cityId: CityId; href: string; night?: boolean }) {
  if (a.category === 'transit') {
    const text = a.how ?? a.full?.transit?.lines ?? '';
    const mode = modeOf(`${a.title} ${text}`);
    // Conector fino, sem toque: a instrução completa fica em "Agora" e no detalhe do passo seguinte.
    return (
      <li class="tl-move" title={text}>
        <Icon name={MODE_ICON[mode]} size={16} />
        <span class="tl-move-text">
          {a.timeLabel && <span class="tl-move-time">{a.timeLabel}</span>} {a.title}
          {text && <span class="muted"> · {text}</span>}
        </span>
      </li>
    );
  }
  if (a.free) {
    return (
      <li class="tl-free">
        <Icon name="clock" size={18} />
        <span>
          <strong>{a.title}</strong> {a.timeLabel && `· ${a.timeLabel}`}
        </span>
      </li>
    );
  }
  const done = a.mark?.state === 'done';
  const skipped = a.mark?.state === 'skipped';
  const ticket = stepTicket(a);
  return (
    <li class={`tl-step ${done ? 'is-done' : ''} ${skipped ? 'is-skipped' : ''} ${night ? 'is-night' : ''}`} id={`row-${a.key}`}>
      <a class="tl-main" href={href}>
        <TimeCell label={a.timeLabel ?? a.start ?? ''} />
        <span class="tl-name">
          {a.title}
          {ticket && <Icon name="ticket" size={16} label={ticket} class="tl-ticket" />}
          {skipped && <span class="tl-tag">pulado</span>}
        </span>
        {stepSub(a) && <span class="tl-sub">{stepSub(a)}</span>}
      </a>
      <DoneToggle activityKey={a.key} title={a.title} compact />
    </li>
  );
}

/** Marca "agora" (só no dia de hoje). */
export function NowMarker({ time }: { time: string }) {
  return (
    <li class="tl-now" aria-label={`Agora, ${time}`}>
      <span>agora · {time}</span>
    </li>
  );
}
