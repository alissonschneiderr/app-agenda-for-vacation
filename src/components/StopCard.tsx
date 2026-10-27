import { useState } from 'preact/hooks';
import type { DayArea, Photo } from '../content/types';
import { stopThumb } from '../domain/notebook';
import { formatDuration, type DayActivityView } from '../domain/trip-view';
import { Chip } from './Chip';
import { Icon, type IconName } from './Icon';
import { stepAddress, stepTicket } from './step-helpers';
import { stepSub, TimeCell } from './TimelineRow';

const TYPE_ICON: Record<DayActivityView['category'], IconName> = {
  attraction: 'star',
  restaurant: 'food',
  shopping: 'bag',
  screen: 'film',
  transit: 'route',
  commitment: 'ticket',
  rest: 'bed',
};

/** Resumo do passo, do próprio doc: o texto do lugar ou a instrução da linha. */
function summaryOf(a: DayActivityView): string | undefined {
  return a.places[0]?.fields.find((f) => !f.label)?.text ?? a.how;
}

/**
 * Cartão de parada do design (feature 008, contracts/screens.md "Paradas do dia"): miniatura com a
 * foto do próprio lugar, horário, nome serifado, chip de tipo, duração, fila/área, círculo de marcar e
 * seta para expandir (resumo + Detalhes, Motorista, Ver onde comer perto).
 */
export function StopCard({
  a,
  area,
  done,
  skipped,
  night,
  detailHref,
  driverHref,
  nearbyHref,
  onToggle,
}: {
  a: DayActivityView;
  area?: DayArea;
  done: boolean;
  skipped: boolean;
  night?: boolean;
  detailHref: string;
  driverHref: string;
  nearbyHref?: string;
  onToggle: () => void;
}) {
  const [open, setOpen] = useState(false);
  const thumb: Photo | undefined = stopThumb(a, area);
  const ticket = stepTicket(a);
  const sub = stepSub(a);
  const summary = summaryOf(a);
  const duration = a.durationMin && !a.inferredDuration && !(a.timeLabel ?? '').match(/às|–/) ? formatDuration(a.durationMin) : undefined;
  return (
    <li class={`tl-step stop-card click-card ${done ? 'is-done' : ''} ${skipped ? 'is-skipped' : ''} ${night ? 'is-night' : ''} ${open ? 'is-open' : ''}`} id={`row-${a.key}`}>
      <div class="stop-row">
        <span class="stop-thumb" aria-hidden="true">
          {thumb ? (
            <img src={`${import.meta.env.BASE_URL}${thumb.src}`} alt="" loading="lazy" decoding="async" width={72} height={72} />
          ) : (
            <span class="stop-thumb-empty">
              <Icon name={TYPE_ICON[a.category]} size={26} />
            </span>
          )}
        </span>
        <a class="tl-main stop-main card-link" href={detailHref}>
          {(a.timeLabel ?? a.start) && <TimeCell label={a.timeLabel ?? a.start ?? ''} />}
          <span class="tl-name">
            {a.title}
            {ticket && <Icon name="ticket" size={16} label={ticket} class="tl-ticket" />}
            {skipped && <span class="tl-tag">pulado</span>}
          </span>
          <span class="stop-meta">
            <Chip variant="type">{a.categoryLabel}</Chip>
            {duration && (
              <span class="stop-dur">
                <Icon name="clock" size={14} /> {duration}
              </span>
            )}
          </span>
          {sub && <span class="tl-sub">{sub}</span>}
        </a>
        <div class="stop-side">
          <button
            type="button"
            role="checkbox"
            aria-checked={done}
            aria-label={`Marcar ${a.title} como ${done ? 'pendente' : 'feito'}`}
            class={`stop-check ${done ? 'is-done' : ''}`}
            onClick={onToggle}
          >
            {done && <Icon name="check-small" size={20} />}
          </button>
          <button type="button" class="stop-expand" aria-expanded={open} aria-label={`${open ? 'Fechar' : 'Abrir'} ${a.title}`} onClick={() => setOpen(!open)}>
            <Icon name="chevron-right" size={18} />
          </button>
        </div>
      </div>
      {open && (
        <div class="stop-more">
          {summary && <p class="stop-summary">{summary}</p>}
          <div class="row">
            <a class="btn" href={detailHref}>
              <Icon name="info" size={18} /> Detalhes
            </a>
            {stepAddress(a) && (
              <a class="btn" href={driverHref}>
                <Icon name="taxi" size={18} /> Motorista
              </a>
            )}
            {nearbyHref && (
              <a
                class="btn"
                href={nearbyHref}
                onClick={(e) => {
                  // Feature 009: "#comer" é a seção do próprio dia — rola sem trocar a rota.
                  if (nearbyHref.startsWith('#') && !nearbyHref.startsWith('#/')) {
                    e.preventDefault();
                    document.getElementById(nearbyHref.slice(1))?.scrollIntoView({ block: 'start' });
                  }
                }}
              >
                <Icon name="food" size={18} /> Ver onde comer perto
              </a>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
