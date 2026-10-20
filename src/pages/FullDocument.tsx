import { ActivityCard } from '../components/ActivityCard';
import type { LoadedContent } from '../content/load';
import { commitmentFor, leaveBy } from '../domain/full-itinerary';
import { formatDate, formatDayLabel } from '../domain/trip';
import { useFullItinerary } from './FullDay';

const ALT_LABEL = { rain: 'Se chover', tired: 'Se cansar', closed: 'Se estiver fechado' };

/** Documento completo para ler, imprimir ou salvar em PDF (FR-025), da mesma fonte da agenda. */
export function FullDocument({ content }: { content: LoadedContent }) {
  const it = useFullItinerary(content);
  if (!it) {
    return (
      <main class="page">
        <h1>Roteiro FULL indisponível</h1>
      </main>
    );
  }

  return (
    <main class="page document">
      <a href="#/full/nova-york" class="small no-print">
        ← Roteiro FULL
      </a>
      <header class="doc-cover">
        <h1>{it.title}</h1>
        <p>
          {it.travelers} · {formatDate(it.days[0]!.date)} a {formatDate(it.days[it.days.length - 1]!.date)}
        </p>
        <p>
          Hotel: <strong>{it.base.name}</strong>, {it.base.address}
        </p>
        <p>
          Chegada: {it.arrival.airport}, {formatDate(it.arrival.date)} por volta das {it.arrival.time}
        </p>
        <h2>Compromissos com ingresso comprado</h2>
        <ul>
          {it.commitments.map((c) => (
            <li key={c.id}>
              {formatDayLabel(c.date)}, {c.time} — {c.title}, {c.place.name} ({c.place.address}); chegar até {c.arriveBy}
            </li>
          ))}
        </ul>
        <p class="small muted">Atualizado em {formatDate(it.updatedAt)}. Confirme horários e preços nas fontes indicadas.</p>
        <button type="button" class="btn btn-primary no-print" onClick={() => window.print()}>
          Imprimir / salvar PDF
        </button>
      </header>

      <nav class="doc-index no-print" aria-label="Índice">
        <h2>Dias</h2>
        <ol>
          {it.days.map((d) => (
            <li key={d.date}>
              <a href={`#/full/nova-york/${d.date}`}>
                {formatDayLabel(d.date)} · {d.region}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {it.days.map((d) => {
        const c = commitmentFor(it.commitments, d.date);
        return (
          <section key={d.date} class="doc-day">
            <h2>
              {formatDayLabel(d.date)} · {d.region}
            </h2>
            <p>
              <strong>Objetivo:</strong> {d.goal}
            </p>
            {d.events.map((e) => (
              <p key={e} class="notice">
                {e}
              </p>
            ))}
            <ol class="timeline">
              {d.activities.map((a) => (
                <ActivityCard
                  key={a.id}
                  activity={a}
                  readOnly
                  commitment={a.type === 'commitment' ? c : undefined}
                  leaveBy={a.type === 'commitment' && c ? leaveBy(d, c) : undefined}
                />
              ))}
            </ol>
            <p>
              <strong>Volta ao hotel:</strong> {d.returnToHotel}
            </p>
            <h3>Alternativas</h3>
            <ul>
              {d.alternatives.map((alt, i) => (
                <li key={i}>
                  <strong>{ALT_LABEL[alt.when]}:</strong> {alt.text}
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section class="doc-day">
        <h2>Checklist de ingressos e reservas</h2>
        <ul class="checklist">
          {it.checklist.map((c, i) => (
            <li key={i}>
              ☐ <strong>{c.what}</strong> — para {formatDayLabel(c.forDate)}; resolver até {formatDate(c.deadline)}
              {c.link && (
                <>
                  {' '}
                  ·{' '}
                  <a href={c.link} target="_blank" rel="noopener">
                    {c.link}
                  </a>
                </>
              )}
            </li>
          ))}
        </ul>

        <h2>Endereços por dia</h2>
        {it.days.map((d) => {
          const seen = new Set<string>();
          const places = d.activities.flatMap((a) => (a.place && !seen.has(a.place.address) && seen.add(a.place.address) ? [a.place] : []));
          return (
            <div key={d.date}>
              <h3>{formatDayLabel(d.date)}</h3>
              <ul>
                {places.map((p) => (
                  <li key={p.address}>
                    {p.name} — {p.address}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        <h2>Orientações práticas</h2>
        <ul>
          {it.practicalTips.map((t) => (
            <li key={t.topic}>
              <strong>{t.topic}:</strong> {t.text}
            </li>
          ))}
        </ul>

        <h2>Atrações não incluídas</h2>
        <ul>
          {it.excluded.map((e) => (
            <li key={e.name}>
              <strong>{e.name}:</strong> {e.reason}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
