import { useEffect, useMemo, useState } from 'preact/hooks';
import { ActivityCard, MEAL_LABEL, SHOP_LABEL } from '../components/ActivityCard';
import { PointMap } from '../components/PointMap';
import type { LoadedContent } from '../content/load';
import type { Point } from '../content/types';
import { commitmentFor, dayProgress, leaveBy, nextActivity } from '../domain/full-itinerary';
import { formatDayLabel } from '../domain/trip';
import { href } from '../lib/router';
import { useUserState } from '../storage/user-store';

export const FULL_ID = 'nova-york';

export function useFullItinerary(content: LoadedContent) {
  return content.fullItineraries?.find((f) => f.id === FULL_ID);
}

const ALT_LABEL = { rain: 'Se chover', tired: 'Se cansar', closed: 'Se estiver fechado' };

export function FullDay({ content, date }: { content: LoadedContent; date: string }) {
  const it = useFullItinerary(content);
  const [state] = useUserState();
  const [view, setView] = useState<'list' | 'map'>('list');
  const index = it?.days.findIndex((d) => d.date === date) ?? -1;
  const day = it?.days[index];
  const now = new Date();
  const next = day ? nextActivity(day, state.activityMarks, now) : null;

  const markers = useMemo(() => {
    let n = 0;
    return (day?.activities ?? []).flatMap((a) => {
      if (a.type === 'transit' || !a.place?.location) return [];
      n++;
      // PointMap usa o formato de Point; só os campos usados no marcador importam.
      const point = { id: a.id, name: a.title, location: a.place.location } as unknown as Point;
      return [{ point, number: n }];
    });
  }, [day]);

  useEffect(() => {
    if (next) document.getElementById(next.id)?.scrollIntoView?.({ block: 'center' });
  }, [date]);

  if (!it || !day) {
    return (
      <main class="page">
        <h1>Dia não encontrado</h1>
        <a href="#/full/nova-york">Voltar ao roteiro FULL</a>
      </main>
    );
  }

  const commitment = commitmentFor(it.commitments, day.date);
  const progress = dayProgress(day, state.activityMarks);
  const meals = day.activities.filter((a) => a.meal);
  const shops = day.activities.filter((a) => a.shop);
  const prev = it.days[index - 1];
  const nextDay = it.days[index + 1];

  return (
    <main class="page full-day">
      <a href="#/full/nova-york" class="small">
        ← Roteiro FULL de Nova York
      </a>
      <h1>{formatDayLabel(day.date)}</h1>
      <p class="muted">{day.region}</p>
      <p>
        <strong>Objetivo do dia:</strong> {day.goal}
      </p>
      {day.events.map((e) => (
        <p key={e} class="notice">
          {e}
        </p>
      ))}
      <p class="small muted">
        Progresso: {progress.done} feitas · {progress.skipped} puladas · {progress.total} no total
      </p>

      <div class="row" style={{ margin: '8px 0' }}>
        <div class="segmented" role="group" aria-label="Visualização">
          <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>
            Agenda
          </button>
          <button type="button" aria-pressed={view === 'map'} onClick={() => setView('map')}>
            Mapa
          </button>
        </div>
      </div>

      {view === 'map' ? (
        <PointMap markers={markers} center={it.base.location ?? content.cities[0]!.center} zoom={13} showRoute />
      ) : (
        <ol class="timeline">
          {day.activities.map((a) => (
            <ActivityCard
              key={a.id}
              activity={a}
              isNext={next?.id === a.id}
              commitment={a.type === 'commitment' ? commitment : undefined}
              leaveBy={a.type === 'commitment' && commitment ? leaveBy(day, commitment) : undefined}
            />
          ))}
        </ol>
      )}

      <section class="panel">
        <h2>Volta ao hotel</h2>
        <p>{day.returnToHotel}</p>
      </section>

      <section class="panel">
        <h2>Onde comer hoje</h2>
        <ul class="plain">
          {meals.map((a) => (
            <li key={a.id}>
              <button type="button" class="link-button" onClick={() => document.getElementById(a.id)?.scrollIntoView?.({ block: 'center' })}>
                {a.start} · {MEAL_LABEL[a.meal!.kind]}: {a.place?.name}
              </button>{' '}
              <span class="small muted">— {a.meal!.order}</span>
            </li>
          ))}
        </ul>
        {shops.length > 0 && (
          <>
            <h2>Compras no caminho</h2>
            <ul class="plain">
              {shops.map((a) => (
                <li key={a.id}>
                  {a.place?.name} <span class="badge">{SHOP_LABEL[a.shop!.kind]}</span>{' '}
                  <span class="small muted">— {a.place?.address}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section class="panel">
        <h2>Se chover / se cansar / se estiver fechado</h2>
        <ul class="plain">
          {day.alternatives.map((alt, i) => (
            <li key={i}>
              <strong>{ALT_LABEL[alt.when]}:</strong> {alt.text}
            </li>
          ))}
        </ul>
      </section>

      <nav class="row day-nav" aria-label="Outros dias">
        {prev && (
          <a class="btn" href={href(`/full/nova-york/${prev.date}`)}>
            ← {formatDayLabel(prev.date)}
          </a>
        )}
        {nextDay && (
          <a class="btn" href={href(`/full/nova-york/${nextDay.date}`)}>
            {formatDayLabel(nextDay.date)} →
          </a>
        )}
      </nav>
    </main>
  );
}
