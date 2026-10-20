import { useState } from 'preact/hooks';
import { dayCityLabel, dayGroupLabel } from '../components/DayLabel';
import type { LoadedContent } from '../content/load';
import { createItinerary, ERROR_MESSAGES, groupByDate } from '../domain/itineraries';
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
  const groups = groupByDate(state.itineraries, content.trip);

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
      <div class="row" style={{ justifyContent: 'space-between' }}>
        <h1>Roteiros</h1>
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

      {groups.length === 0 && <p class="empty">Nenhum roteiro ainda.</p>}
      {groups.map((g) => (
        <section key={g.date ?? 'none'} class="day-group">
          <h2>{dayGroupLabel(g, content)}</h2>
          <ul class="list">
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
