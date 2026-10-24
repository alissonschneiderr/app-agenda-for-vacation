import { Icon } from '../components/Icon';
import { ProgressBar } from '../components/ProgressBar';
import type { LoadedContent } from '../content/load';
import type { DayKind } from '../content/types';
import { dayKind, tripNow, tripPhase } from '../domain/now';
import { cityForDate, formatDayLabel, tripRange } from '../domain/trip';
import { destinationView, shortDate, tripProgress } from '../domain/trip-view';
import { useClock } from '../lib/clock';
import { setHighContrast, usePrefs } from '../storage/prefs';
import { useUserState } from '../storage/user-store';
import { stepHref } from './Now';

const KIND_LABEL: Record<DayKind, string> = { walk: 'a pé', beach: 'praia', park: 'parque', transit: 'viagem' };

/** "Viagem" (feature 006, FR-018): cidades, progresso, ingressos, consulta e exibição. */
export function TripOverview({ content }: { content: LoadedContent }) {
  const [state] = useUserState();
  const prefs = usePrefs();
  const { date: today } = tripNow(useClock());
  const during = tripPhase(content, today) === 'during';
  const { start, end } = tripRange(content.trip);
  // Feature 007: reservas e consulta de cada cidade com roteiro do casal, na ordem da viagem.
  const docs = content.cities.flatMap((c) => (content.fullItineraries ?? []).filter((f) => f.cityId === c.id));
  const toBuy = docs.map((f) => ({ f, items: f.checklist.filter((c) => c.forDate) })).filter((g) => g.items.length);
  const commitments = (content.fullItineraries ?? []).flatMap((f) => f.commitments);
  const tipsOf = (f: (typeof docs)[number]) => f.docHtml?.find((h) => h.title.includes('Dicas práticas') || h.title.includes('dicas práticas'));
  const reserveSection = (f: (typeof docs)[number]) => f.docHtml?.find((h) => h.title.includes('O que reservar'));
  const here = during ? cityForDate(content.trip, today) : undefined;

  return (
    <main class="page trip-overview">
      <header class="now-head">
        <p class="eyebrow">
          {shortDate(start)} a {shortDate(end)}
        </p>
        <h1 class="now-theme">A viagem</h1>
        <ProgressBar progress={tripProgress(content, state)} scope="Viagem" />
      </header>

      <ol class="city-line" aria-label="Cidades">
        {content.cities.map((c) => {
          const d = destinationView(content, state, c.id);
          const own = d.days.filter((x) => cityForDate(content.trip, x.date) === c.id);
          return (
            <li key={c.id} class={`city-stop ${here === c.id ? 'is-here' : ''}`}>
              <div class="city-stop-head">
                <h2>{c.name}</h2>
                <p class="small muted">
                  {shortDate(d.period.start)} a {shortDate(d.period.end)} · {own.length} {own.length === 1 ? 'dia' : 'dias'}
                </p>
                {here === c.id && (
                  <p class="here-tag">
                    <Icon name="pin" size={16} /> Vocês estão aqui · dia {d.days.findIndex((x) => x.date === today) + 1} de {d.days.length}
                  </p>
                )}
                <ProgressBar progress={d.progress} scope={c.name} inline />
              </div>
              <ol class="day-dots" aria-label={`Dias em ${c.name}`}>
                {d.days.map((x) => {
                  const kind = dayKind(content, x.date);
                  const pct = x.progress.total ? x.progress.done / x.progress.total : 0;
                  return (
                    <li key={x.date}>
                      <a
                        href={`#/dia/${x.date}`}
                        class={`day-dot kind-${kind} ${x.date === today ? 'is-today' : ''} ${pct === 1 ? 'is-complete' : pct > 0 ? 'is-started' : ''}`}
                        aria-label={`${formatDayLabel(x.date)}, ${KIND_LABEL[kind]}, ${x.progress.done} de ${x.progress.total}`}
                      >
                        {x.date.slice(8)}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </li>
          );
        })}
      </ol>

      {toBuy.length > 0 && (
        <section class="card-section" aria-label="Ingressos para comprar antes">
          <h2 class="section-title">Para comprar antes</h2>
          {toBuy.map(({ f, items }) => {
            const rules = reserveSection(f);
            return (
              <section key={f.id} class="buy-group" aria-label={`Reservas de ${content.cityName(f.cityId)}`}>
                <h3 class="small-title">{content.cityName(f.cityId)}</h3>
                <ul class="plain list-lines">
                  {items.map((c) => (
                    <li key={c.id ?? c.what}>
                      <a href={c.activityId ? stepHref(c.forDate!, c.activityId) : `#/dia/${c.forDate}`}>
                        <Icon name="ticket" size={18} /> {c.when} · <strong>{c.what}</strong>
                      </a>
                      {c.note && <span class="small muted"> · {c.note}</span>}
                      {c.deadline && <span class="small muted"> · uso em {shortDate(c.forDate!)}</span>}
                    </li>
                  ))}
                </ul>
                {rules && (
                  <p>
                    <a href={`#/full/${f.cityId}/documento/${rules.id}`}>Regra dos ingressos e checklist</a>
                  </p>
                )}
              </section>
            );
          })}
        </section>
      )}

      {commitments.length > 0 && (
        <section class="card-section" aria-label="Ingressos comprados">
          <h2 class="section-title">Ingressos comprados</h2>
          <ul class="plain list-lines">
            {commitments.map((c) => (
              <li key={c.id}>
                <a href={`#/dia/${c.date}`}>
                  <Icon name="ticket" size={18} /> <strong>{c.title}</strong> — {formatDayLabel(c.date)}, {c.time} · chegar até {c.arriveBy}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section class="card-section" aria-label="Consulta">
        <h2 class="section-title">Consulta</h2>
        <ul class="quick-links">
          {docs.map((f) => {
            const tips = tipsOf(f);
            const city = content.cityName(f.cityId);
            return [
              tips && (
                <li key={`tips-${f.id}`}>
                  <a class="btn btn-big" href={`#/full/${f.cityId}/documento/${tips.id}`}>
                    <Icon name="info" /> Dicas práticas de {city}
                  </a>
                </li>
              ),
              <li key={`doc-${f.id}`}>
                <a class="btn btn-big" href={`#/full/${f.cityId}/documento`}>
                  <Icon name="calendar" /> Documento de {city} / PDF
                </a>
              </li>,
            ];
          })}
          <li>
            <a class="btn btn-big" href="#/guia">
              <Icon name="compass" /> Guia de pontos turísticos
            </a>
          </li>
          <li>
            <a class="btn btn-big" href="#/creditos">
              <Icon name="camera" /> Créditos das fotos
            </a>
          </li>
        </ul>
      </section>

      <section class="card-section" aria-label="Exibição">
        <h2 class="section-title">Exibição</h2>
        <label class="switch">
          <input type="checkbox" checked={prefs.highContrast} onChange={(e) => setHighContrast((e.target as HTMLInputElement).checked)} />
          <span>Alto contraste (modo sol)</span>
        </label>
      </section>
    </main>
  );
}
