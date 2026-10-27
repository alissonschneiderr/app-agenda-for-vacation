import { PageHeader } from '../components/PageHeader';
import { useState } from 'preact/hooks';
import { dayCityLabel, dayGroupLabel } from '../components/DayLabel';
import type { LoadedContent } from '../content/load';
import { createItinerary, ERROR_MESSAGES, groupByDate, type DayGroup } from '../domain/itineraries';
import { dayInfo as dayInfoOf } from '../domain/trip';
import { fullItineraryOf } from '../content/load';
import { dayInfo, formatDayLabel, tripDates } from '../domain/trip';
import { href, navigate } from '../lib/router';
import { SAVE_ERROR_MESSAGE, useUserState } from '../storage/user-store';

export function DateSelect({
  id,
  value,
  content,
  onChange,
}: {
  id: string;
  value: string | null;
  content: LoadedContent;
  onChange: (date: string | null) => void;
}) {
  return (
    <select id={id} value={value ?? ''} onChange={(e) => onChange((e.target as HTMLSelectElement).value || null)}>
      <option value="">Sem dia</option>
      {tripDates(content.trip).map((d) => (
        <option key={d} value={d}>
          {formatDayLabel(d)} · {dayCityLabel(dayInfo(content.trip, d), content)}
        </option>
      ))}
    </select>
  );
}

export function Itineraries({ content }: { content: LoadedContent }) {
  const [state, update] = useUserState();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const full = fullItineraryOf(content);
  const userGroups = groupByDate(state.itineraries, content.trip);
  // Dias do roteiro FULL aparecem mesmo sem roteiros do usuário, em ordem cronológica.
  const fullDates = new Set(full?.days.map((d) => d.date) ?? []);
  const groups: DayGroup[] = [
    ...[...new Set([...fullDates, ...userGroups.flatMap((g) => (g.date ? [g.date] : []))])]
      .sort()
      .map((date) => userGroups.find((g) => g.date === date) ?? { date, day: dayInfoOf(content.trip, date), itineraries: [] }),
    ...userGroups.filter((g) => g.date === null),
  ];

  const submit = (e: Event) => {
    e.preventDefault();
    let createdId: string | undefined;
    let failure: string | null = null;
    const saved = update((s) => {
      const r = createItinerary(s, name, date);
      if (!r.ok) {
        failure = ERROR_MESSAGES[r.error];
        return s;
      }
      createdId = r.id;
      return r.state;
    });
    if (failure) return setError(failure);
    if (!saved.ok) return setError(SAVE_ERROR_MESSAGE);
    setCreating(false);
    setName('');
    setDate(null);
    setError(null);
    if (createdId) navigate(`/roteiros/${createdId}`);
  };

  return (
    <main class="page">
      <PageHeader back="#/" label="Guia de pontos turísticos" title="Roteiros" />
      <div class="row" style={{ justifyContent: 'flex-end' }}>
        {!creating && (
          <button type="button" class="btn btn-primary" onClick={() => setCreating(true)}>
            + Novo roteiro
          </button>
        )}
      </div>

      {creating && (
        <form class="panel" onSubmit={submit} aria-label="Novo roteiro">
          <div class="field">
            <label for="it-name">Nome</label>
            <input
              id="it-name"
              value={name}
              maxLength={60}
              onInput={(e) => setName((e.target as HTMLInputElement).value)}
              placeholder="Ex.: Sábado em Midtown"
            />
          </div>
          <div class="field">
            <label for="it-date">Dia da viagem</label>
            <DateSelect id="it-date" value={date} content={content} onChange={setDate} />
          </div>
          {error && (
            <p class="error" role="alert">
              {error}
            </p>
          )}
          <div class="row">
            <button type="submit" class="btn btn-primary">
              Criar
            </button>
            <button type="button" class="btn" onClick={() => setCreating(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {full && (
        <p>
          <a class="btn" href="#/destino/nova-york">
            Roteiro FULL de Nova York
          </a>
        </p>
      )}
      {groups.length === 0 && <p class="empty">Nenhum roteiro ainda.</p>}
      {groups.map((g) => (
        <section key={g.date ?? 'none'} class="day-group">
          <h2>{dayGroupLabel(g, content)}</h2>
          <ul class="list">
            {g.date && fullDates.has(g.date) && (
              <li>
                <a class="card card-full" style={{ gridTemplateColumns: '1fr' }} href={href(`/destino/nova-york/${g.date}`)}>
                  <div>
                    <p class="title">Roteiro FULL · {full!.days.find((d) => d.date === g.date)!.region}</p>
                    <p class="meta">Agenda completa do dia, com refeições, compras e séries</p>
                  </div>
                </a>
              </li>
            )}
            {g.itineraries.map((it) => (
              <li key={it.id}>
                <a class="card" style={{ gridTemplateColumns: '1fr' }} href={href(`/roteiros/${it.id}`)}>
                  <div>
                    <p class="title">{it.name}</p>
                    <p class="meta">
                      {it.items.length} {it.items.length === 1 ? 'ponto' : 'pontos'}
                      {it.origin === 'suggested' && (
                        <>
                          {' '}
                          · <span class="badge">Sugerido</span>
                        </>
                      )}
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
