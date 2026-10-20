import type { LoadedContent } from '../content/load';
import { commitmentFor, dayProgress } from '../domain/full-itinerary';
import { formatDate, formatDayLabel, todayInTripZone } from '../domain/trip';
import { href } from '../lib/router';
import { useUserState } from '../storage/user-store';
import { useFullItinerary } from './FullDay';

export function FullOverview({ content }: { content: LoadedContent }) {
  const it = useFullItinerary(content);
  const [state] = useUserState();
  if (!it) {
    return (
      <main class="page">
        <h1>Roteiro FULL indisponível</h1>
      </main>
    );
  }
  const today = todayInTripZone(new Date());
  const hasToday = it.days.some((d) => d.date === today);

  return (
    <main class="page">
      <h1>{it.title}</h1>
      <p class="muted">
        {it.travelers} · {formatDate(it.days[0]!.date)} a {formatDate(it.days[it.days.length - 1]!.date)} · Hotel{' '}
        {it.base.name}, {it.base.address}
      </p>
      <div class="row" style={{ margin: '8px 0 16px' }}>
        {hasToday && (
          <a class="btn btn-primary" href={href(`/full/nova-york/${today}`)}>
            Roteiro de hoje
          </a>
        )}
        <a class="btn" href="#/full/nova-york/documento">
          Documento completo / PDF
        </a>
      </div>

      <section class="panel">
        <h2>Compromissos com ingresso comprado</h2>
        <ul class="plain">
          {it.commitments.map((c) => (
            <li key={c.id}>
              <strong>{formatDayLabel(c.date)}, {c.time}</strong> — {c.title} · {c.place.name} ({c.place.address}) · chegar até{' '}
              {c.arriveBy}
            </li>
          ))}
        </ul>
      </section>

      <ul class="list">
        {it.days.map((d) => {
          const p = dayProgress(d, state.activityMarks);
          const c = commitmentFor(it.commitments, d.date);
          return (
            <li key={d.date}>
              <a class="card" style={{ gridTemplateColumns: '1fr' }} href={href(`/full/nova-york/${d.date}`)}>
                <div>
                  <p class="title">
                    {formatDayLabel(d.date)} · {d.region}
                    {d.date === today && <span class="badge badge-open"> Hoje</span>}
                  </p>
                  <p class="meta">{d.goal}</p>
                  {c && (
                    <p class="meta">
                      🎟️ {c.title}, {c.time}
                    </p>
                  )}
                  <p class="meta">
                    {p.done} de {p.total} feitas
                  </p>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
