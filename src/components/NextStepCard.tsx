import type { DocPlace, Photo } from '../content/types';
import type { HowToGet } from '../domain/now';
import type { DayActivityView } from '../domain/trip-view';
import { Icon, type IconName } from './Icon';
import { PointPhoto } from './PointPhoto';

export const MODE_ICON: Record<HowToGet['mode'], IconName> = { walk: 'walk', subway: 'subway', taxi: 'taxi', ferry: 'ferry' };
export const MODE_LABEL: Record<HowToGet['mode'], string> = { walk: 'A pé', subway: 'Metrô', taxi: 'Táxi', ferry: 'Barco' };

/**
 * Foto offline do passo: a do próprio lugar (roteiro ou guia); para compras e ruas do bairro, a foto da
 * região onde acontecem. Nunca a de outro lugar.
 */
export function stepPhoto(a: Pick<DayActivityView, 'places' | 'photos' | 'category'>, area?: { photo?: Photo }): Photo | undefined {
  return a.places.find((p) => p.photo)?.photo ?? a.photos[0] ?? (a.category === 'shopping' ? area?.photo : undefined);
}

/** Lugar principal do passo (o do item do roteiro). */
export function stepPlace(a: Pick<DayActivityView, 'places'>): DocPlace | undefined {
  return a.places[0];
}

/** Texto da busca de um link do Google Maps do doc ("query=Top+of+the+Rock+New+York"). */
export function mapsQuery(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).searchParams.get('query')?.replace(/\+/g, ' ') ?? undefined;
  } catch {
    return undefined;
  }
}

/**
 * Endereço para "Mostrar ao motorista": o do lugar no doc; senão, o do ponto do guia; senão, o texto
 * de busca do link de mapa do doc. Nada é inventado.
 */
export function stepAddress(a: Pick<DayActivityView, 'address' | 'places' | 'point'>): string | undefined {
  return a.address ?? a.places.find((p) => p.address)?.address ?? a.point?.address ?? mapsQuery(a.places[0]?.mapsUrls[0]?.url);
}

/** Aviso pontual do passo: ingresso com horário. */
export function stepTicket(a: DayActivityView): string | undefined {
  if (a.category === 'commitment') return 'Ingresso comprado';
  if (a.full?.booking.required) return a.full.booking.how ?? 'Precisa de ingresso';
  return undefined;
}

/** Orientações rotuladas de eventos (Como chegar, Antecedência, Volta…). */
export function eventFields(a: DayActivityView): { label: string; text: string }[] {
  return (stepPlace(a)?.fields ?? []).filter((f) => f.label);
}

export function photoSrc(p: Photo): string {
  return `${import.meta.env.BASE_URL}${p.src}`;
}

/** Cartão do próximo passo (feature 006, contracts/ui-screens.md "Agora", item 3). */
export function NextStepCard({
  step,
  how,
  areaName,
  areaPhoto,
  detailHref,
  driverHref,
  onDone,
  onSkip,
}: {
  step: DayActivityView;
  how: HowToGet | null;
  areaName?: string;
  areaPhoto?: Photo;
  detailHref: string;
  driverHref?: string;
  onDone: () => void;
  onSkip: () => void;
}) {
  const photo = stepPhoto(step, { photo: areaPhoto });
  const ticket = stepTicket(step);
  const event = eventFields(step);
  return (
    <article class="next-card" aria-label={`Próximo passo: ${step.title}`}>
      <a class="next-media" href={detailHref} aria-hidden="true" tabIndex={-1}>
        {photo ? <PointPhoto photo={photo} class="next-photo" /> : <span class="next-photo next-photo-empty"><Icon name="star" size={40} /></span>}
      </a>
      <div class="next-body">
        <p class="next-time">{step.timeLabel ?? step.start ?? 'Hoje'}</p>
        <h2 class="next-title">
          <a href={detailHref}>{step.title}</a>
        </h2>
        {(areaName || step.land) && (
          <p class="next-area">
            <Icon name="pin" size={16} /> {[areaName, step.land].filter(Boolean).join(' · ')}
          </p>
        )}
        {(step.queue || step.access || step.optional) && (
          <p class="next-queue">
            <Icon name="clock" size={16} /> {[step.queue, step.access, step.optional ? 'opcional' : ''].filter(Boolean).join(' · ')}
          </p>
        )}
        {ticket && (
          <p class="next-ticket">
            <Icon name="ticket" size={18} /> {ticket}
          </p>
        )}
        {how && (
          <details class="next-how">
            <summary>
              <Icon name={MODE_ICON[how.mode]} size={20} />
              <span>
                <strong>{MODE_LABEL[how.mode]}</strong>
                {how.timeLabel && ` · ${how.timeLabel}`} · <span class="clamp-2">{how.text}</span>
              </span>
            </summary>
            <p>
              {how.title && <strong>{how.title}: </strong>}
              {how.text}
            </p>
          </details>
        )}
        {event.length > 0 && (
          <dl class="next-event">
            {event.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.text}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <div class="next-actions">
        <button type="button" class="btn btn-primary btn-big" onClick={onDone}>
          <Icon name="check" size={22} /> Feito
        </button>
        <button type="button" class="btn btn-big" onClick={onSkip}>
          <Icon name="skip" size={22} /> Pular
        </button>
        {driverHref && (
          <a class="btn btn-big" href={driverHref}>
            <Icon name="taxi" size={22} /> Motorista
          </a>
        )}
        <a class="btn btn-big" href={detailHref}>
          <Icon name="info" size={22} /> Detalhes
        </a>
      </div>
    </article>
  );
}
