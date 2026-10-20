import { useState } from 'preact/hooks';
import type { LoadedContent } from '../content/load';
import type { Point } from '../content/types';
import { addPoint, createItinerary, ERROR_MESSAGES, groupByDate, otherCityWarning } from '../domain/itineraries';
import { SAVE_ERROR_MESSAGE, useUserState } from '../storage/user-store';
import { dayGroupLabel } from './DayLabel';

export function otherCityMessage(content: LoadedContent, w: NonNullable<ReturnType<typeof otherCityWarning>>): string {
  const day = w.dayCities.map((c) => content.cityName(c)).join(' / ');
  return `Este ponto fica em ${content.cityName(w.pointCity)}, e este roteiro é de ${day}. Adicionar mesmo assim?`;
}

export function AddToItinerary({ point, content }: { point: Point; content: LoadedContent }) {
  const [state, update] = useUserState();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const addTo = (itineraryId: string) => {
    const it = state.itineraries.find((i) => i.id === itineraryId);
    if (!it) return;
    if (it.items.some((i) => i.pointId === point.id)) {
      setMessage({ kind: 'error', text: ERROR_MESSAGES.DUPLICATE });
      return;
    }
    const warning = otherCityWarning(it, point, content.trip);
    if (warning && !window.confirm(otherCityMessage(content, warning))) return;
    let failure: string | null = null;
    const saved = update((s) => {
      const r = addPoint(s, itineraryId, point);
      if (!r.ok) {
        failure = ERROR_MESSAGES[r.error];
        return s;
      }
      return r.state;
    });
    if (failure) setMessage({ kind: 'error', text: failure });
    else if (!saved.ok) setMessage({ kind: 'error', text: SAVE_ERROR_MESSAGE });
    else setMessage({ kind: 'ok', text: `Adicionado a "${it.name}".` });
  };

  const createAndAdd = (e: Event) => {
    e.preventDefault();
    let failure: string | null = null;
    const saved = update((s) => {
      const created = createItinerary(s, newName, null);
      if (!created.ok) {
        failure = ERROR_MESSAGES[created.error];
        return s;
      }
      const added = addPoint(created.state, created.id!, point);
      return added.ok ? added.state : created.state;
    });
    if (failure) setMessage({ kind: 'error', text: failure });
    else if (!saved.ok) setMessage({ kind: 'error', text: SAVE_ERROR_MESSAGE });
    else {
      setMessage({ kind: 'ok', text: `Roteiro "${newName.trim()}" criado com este ponto.` });
      setNewName('');
    }
  };

  if (!open) {
    return (
      <button type="button" class="btn" onClick={() => setOpen(true)}>
        + Adicionar ao roteiro
      </button>
    );
  }

  const groups = groupByDate(state.itineraries, content.trip);
  return (
    <section class="panel" aria-label="Adicionar ao roteiro">
      <div class="row" style={{ justifyContent: 'space-between' }}>
        <strong>Adicionar ao roteiro</strong>
        <button type="button" class="btn" onClick={() => setOpen(false)}>
          Fechar
        </button>
      </div>
      {message && (
        <p class={message.kind === 'ok' ? 'ok-msg' : 'error'} role={message.kind === 'ok' ? 'status' : 'alert'}>
          {message.text}
        </p>
      )}
      <div class="field">
        <label for="add-it">Escolha um roteiro</label>
        <select
          id="add-it"
          value=""
          onChange={(e) => {
            const v = (e.target as HTMLSelectElement).value;
            if (v) addTo(v);
          }}
        >
          <option value="">Selecione…</option>
          {groups.map((g) => (
            <optgroup key={g.date ?? 'none'} label={dayGroupLabel(g, content)}>
              {g.itineraries.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <form onSubmit={createAndAdd} class="field">
        <label for="new-it">Ou crie um novo roteiro</label>
        <div class="row">
          <input
            id="new-it"
            value={newName}
            maxLength={60}
            placeholder="Nome do roteiro"
            onInput={(e) => setNewName((e.target as HTMLInputElement).value)}
            style={{ flex: 1 }}
          />
          <button type="submit" class="btn btn-primary">
            Criar
          </button>
        </div>
      </form>
    </section>
  );
}
