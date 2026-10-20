import { useState } from 'preact/hooks';
import type { Activity, Commitment, Meal, Shop } from '../content/types';
import { endTime, markActivity, unmarkActivity } from '../domain/full-itinerary';
import { href } from '../lib/router';
import { SAVE_ERROR_MESSAGE, useUserState } from '../storage/user-store';
import { DirectionsButton } from './DirectionsButton';
import { InfoSource } from './InfoSource';

export const PRIORITY_LABEL = { essential: 'Essencial', important: 'Importante', optional: 'Opcional' } as const;
export const MEAL_LABEL: Record<Meal['kind'], string> = {
  breakfast: 'Café da manhã',
  lunch: 'Almoço',
  snack: 'Lanche',
  dinner: 'Jantar',
};
export const SHOP_LABEL: Record<Shop['kind'], string> = {
  thrift: 'Brechó',
  vintage: 'Vintage',
  independent: 'Independente',
  designer: 'Designer local',
  tech: 'Tecnologia',
};
const MODE_LABEL = { walk: '🚶 A pé', subway: '🚇 Metrô', bus: '🚌 Ônibus', taxi: '🚕 Táxi', airtrain: '🚆 AirTrain', ferry: '⛴️ Balsa' };
const SCREEN_KIND = { setting: 'Ambientação', filming: 'Locação de filmagem', both: 'Ambientação e locação' };
const SCREEN_ACCESS = { inside: 'Dá para entrar', outside: 'Só por fora' };

function MarkButtons({ activity }: { activity: Activity }) {
  const [state, update] = useUserState();
  const [error, setError] = useState(false);
  const mark = state.activityMarks[activity.id];
  const apply = (fn: Parameters<typeof update>[0]) => setError(!update(fn).ok);
  return (
    <div class="mark-buttons">
      {mark ? (
        <>
          <span class={`badge ${mark.state === 'done' ? 'badge-open' : 'badge-warn'}`}>
            {mark.state === 'done' ? 'Feita' : 'Pulada'}
          </span>
          <button type="button" class="btn" onClick={() => apply((s) => unmarkActivity(s, activity.id))}>
            Desfazer
          </button>
        </>
      ) : (
        <>
          <button type="button" class="btn" onClick={() => apply((s) => markActivity(s, activity.id, 'done'))}>
            ✓ Feita
          </button>
          <button type="button" class="btn" onClick={() => apply((s) => markActivity(s, activity.id, 'skipped'))}>
            Pular
          </button>
        </>
      )}
      {error && (
        <p class="error" role="alert">
          {SAVE_ERROR_MESSAGE}
        </p>
      )}
    </div>
  );
}

export function TransitRow({ activity }: { activity: Activity }) {
  const t = activity.transit!;
  return (
    <li class="transit-row" id={activity.id}>
      <span class="small">
        {activity.start} · {MODE_LABEL[t.mode]} · {t.minutes} min
        {t.lines ? ` · ${t.lines}` : ''}
        {t.cost ? ` · ${t.cost}` : ''}
      </span>
      <span class="small muted">{activity.title}</span>
      {activity.description !== activity.title && <span class="small muted">{activity.description}</span>}
    </li>
  );
}

export function ActivityCard({
  activity,
  commitment,
  leaveBy,
  isNext = false,
  readOnly = false,
}: {
  activity: Activity;
  commitment?: Commitment;
  leaveBy?: string | null;
  isNext?: boolean;
  readOnly?: boolean;
}) {
  const [state] = useUserState();
  if (activity.type === 'transit') return <TransitRow activity={activity} />;
  const mark = readOnly ? undefined : state.activityMarks[activity.id];
  const cls = ['activity', `activity-${activity.type}`, isNext ? 'activity-next' : '', mark ? `activity-${mark.state}` : '']
    .filter(Boolean)
    .join(' ');

  return (
    <li class={cls} id={activity.id}>
      {isNext && <p class="next-label">Agora / a seguir</p>}
      <div class="activity-head">
        <span class="activity-time">
          {activity.start}–{endTime(activity)}
        </span>
        <span class={`badge priority-${activity.priority}`}>{PRIORITY_LABEL[activity.priority]}</span>
      </div>
      <h3 class="activity-title">{activity.title}</h3>
      {commitment && (
        <p class="commitment-note">
          Ingresso comprado · começa às {commitment.time} · chegar até {commitment.arriveBy}
          {leaveBy ? ` · sair da atividade anterior até ${leaveBy}` : ''}
        </p>
      )}
      {activity.place && (
        <p class="small">
          📍 <strong>{activity.place.name}</strong> — {activity.place.address}
        </p>
      )}
      <p class="small muted">Duração: cerca de {activity.durationMin} min</p>
      <p>{activity.description}</p>

      {activity.meal && (
        <div class="block">
          <p class="block-title">{MEAL_LABEL[activity.meal.kind]}</p>
          <p>
            <strong>O que pedir:</strong> {activity.meal.order}
          </p>
          <p>
            <strong>Por que vale a pena:</strong> {activity.meal.why}
          </p>
          <p class="small muted">Faixa de preço: {activity.meal.priceRange}</p>
        </div>
      )}

      {activity.shop && (
        <div class="block">
          <p class="block-title">{SHOP_LABEL[activity.shop.kind]}</p>
          <p>{activity.shop.why}</p>
          {activity.shop.justification && <p class="small muted">Por que aqui: {activity.shop.justification}</p>}
        </div>
      )}

      {activity.screen?.map((sc) => (
        <div class="block" key={sc.work + sc.address}>
          <p class="block-title">
            🎬 {sc.work} · {SCREEN_KIND[sc.kind]} · {SCREEN_ACCESS[sc.access]}
          </p>
          <p>{sc.association}</p>
          <p class="small muted">{sc.address}</p>
        </div>
      ))}

      {activity.booking.required && (
        <p class="notice">
          Precisa de ingresso/reserva{activity.booking.how ? `: ${activity.booking.how}` : ''}
          {activity.booking.price ? ` · ${activity.booking.price}` : ''}
        </p>
      )}
      {activity.earlyReason && <p class="small muted">Antes das 10h porque: {activity.earlyReason}</p>}

      {activity.facts.length > 0 && <ul class="facts-list">{activity.facts.map((f, i) => <InfoSource key={i} fact={f} />)}</ul>}

      {!readOnly && (
        <div class="row activity-actions">
          {activity.place?.location && <DirectionsButton point={{ location: activity.place.location, address: activity.place.address }} />}
          {activity.pointId && (
            <a class="btn" href={href(`/ponto/${activity.pointId}`)}>
              Ver no guia
            </a>
          )}
        </div>
      )}
      {!readOnly && <MarkButtons activity={activity} />}
    </li>
  );
}
