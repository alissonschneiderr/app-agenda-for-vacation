import { useMemo, useState } from 'preact/hooks';
import { dayHeadline } from '../components/DayLabel';
import { PointCard } from '../components/PointCard';
import { PointMap } from '../components/PointMap';
import type { LoadedContent } from '../content/load';
import type { Point } from '../content/types';
import {
  deleteItinerary,
  ERROR_MESSAGES,
  moveDown,
  moveToTop,
  moveUp,
  removePoint,
  renameItinerary,
  setItineraryDate,
  type Result,
} from '../domain/itineraries';
import { dayInfo, formatDayLabel } from '../domain/trip';
import { navigate } from '../lib/router';
import { SAVE_ERROR_MESSAGE, useUserState } from '../storage/user-store';
import type { UserState } from '../storage/types';
import { DateSelect } from './Itineraries';

export function ItineraryDetail({ content, id }: { content: LoadedContent; id: string }) {
  const [state, update] = useUserState();
  const [view, setView] = useState<'list' | 'map'>('list');
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const it = state.itineraries.find((i) => i.id === id);
  const now = new Date();

  const markers = useMemo(
    () =>
      (it?.items ?? []).flatMap((item, i) => {
        const point = content.pointsById.get(item.pointId);
        return point ? [{ point, number: i + 1 }] : [];
      }),
    [it?.items, content],
  );

  if (!it) {
    return (
      <main class="page">
        <h1>Roteiro não encontrado</h1>
        <a href="#/roteiros">Voltar aos roteiros</a>
      </main>
    );
  }

  const apply = (fn: (s: UserState) => Result) => {
    let failure: string | null = null;
    const saved = update((s) => {
      const r = fn(s);
      if (!r.ok) {
        failure = ERROR_MESSAGES[r.error];
        return s;
      }
      return r.state;
    });
    setError(failure ?? (saved.ok ? null : SAVE_ERROR_MESSAGE));
    return !failure && saved.ok;
  };

  const day = it.date ? dayInfo(content.trip, it.date) : null;
  const sourceNotes = it.sourceId ? content.suggestedItineraries.find((s) => s.id === it.sourceId)?.notes : undefined;
  const firstPoint: Point | undefined = markers[0]?.point;
  const center = firstPoint?.location ?? content.cities[0]!.center;

  return (
    <main class="page">
      <a href="#/roteiros" class="small">
        ← Roteiros
      </a>
      {editing ? (
        <form
          class="panel"
          onSubmit={(e) => {
            e.preventDefault();
            if (apply((s) => renameItinerary(s, it.id, name))) setEditing(false);
          }}
        >
          <div class="field">
            <label for="rename">Nome do roteiro</label>
            <input id="rename" value={name} maxLength={60} onInput={(e) => setName((e.target as HTMLInputElement).value)} />
          </div>
          <div class="row">
            <button type="submit" class="btn btn-primary">
              Salvar
            </button>
            <button type="button" class="btn" onClick={() => setEditing(false)}>
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <h1>{it.name}</h1>
      )}

      {it.date && day && (
        <p class="today">
          {formatDayLabel(it.date)} · {dayHeadline(day, content)}
        </p>
      )}
      {sourceNotes && <p class="notice">{sourceNotes}</p>}
      {error && (
        <p class="error" role="alert">
          {error}
        </p>
      )}

      <div class="row" style={{ margin: '8px 0' }}>
        <div class="segmented" role="group" aria-label="Visualização">
          <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>
            Lista
          </button>
          <button type="button" aria-pressed={view === 'map'} onClick={() => setView('map')}>
            Mapa
          </button>
        </div>
      </div>

      {it.items.length === 0 && (
        <p class="empty">Roteiro vazio. Abra um ponto no guia e toque em "Adicionar ao roteiro".</p>
      )}

      {view === 'list' ? (
        <ol class="list">
          {it.items.map((item, i) => {
            const point = content.pointsById.get(item.pointId);
            return (
              <li key={item.pointId} class="stop">
                <span class="num" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  {point ? (
                    <PointCard point={point} content={content} now={now} showFavorite={false} />
                  ) : (
                    <div class="card" style={{ gridTemplateColumns: '1fr' }}>
                      <p class="title">{item.pointName}</p>
                      <span class="badge badge-warn">Indisponível</span>
                    </div>
                  )}
                  <div class="stop-actions">
                    <button
                      type="button"
                      class="btn btn-icon"
                      aria-label={`Mover ${item.pointName} para o topo`}
                      disabled={i === 0}
                      onClick={() => apply((s) => moveToTop(s, it.id, i))}
                    >
                      ⤒
                    </button>
                    <button
                      type="button"
                      class="btn btn-icon"
                      aria-label={`Subir ${item.pointName}`}
                      disabled={i === 0}
                      onClick={() => apply((s) => moveUp(s, it.id, i))}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      class="btn btn-icon"
                      aria-label={`Descer ${item.pointName}`}
                      disabled={i === it.items.length - 1}
                      onClick={() => apply((s) => moveDown(s, it.id, i))}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      class="btn btn-icon btn-danger"
                      aria-label={`Remover ${item.pointName} do roteiro`}
                      onClick={() => apply((s) => removePoint(s, it.id, item.pointId))}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <PointMap markers={markers} center={center} zoom={13} showRoute />
      )}

      <section class="panel" aria-label="Opções do roteiro">
        <div class="field">
          <label for="it-day">Dia da viagem</label>
          <DateSelect id="it-day" value={it.date} content={content} onChange={(d) => apply((s) => setItineraryDate(s, it.id, d))} />
        </div>
        <div class="row">
          <button
            type="button"
            class="btn"
            onClick={() => {
              setName(it.name);
              setEditing(true);
            }}
          >
            Renomear
          </button>
          <button
            type="button"
            class="btn btn-danger"
            onClick={() => {
              if (window.confirm(`Excluir o roteiro "${it.name}"? Esta ação não pode ser desfeita.`)) {
                if (apply((s) => deleteItinerary(s, it.id))) navigate('/roteiros');
              }
            }}
          >
            Excluir roteiro
          </button>
        </div>
      </section>
    </main>
  );
}
