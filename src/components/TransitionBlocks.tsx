import type { LoadedContent } from '../content/load';
import type { DateStr, DepartureItem } from '../content/types';
import { addDays, formatDayLabel } from '../domain/trip';
import { dayView } from '../domain/trip-view';
import type { UserState } from '../storage/types';
import { DoneToggle } from './DoneToggle';
import { Icon } from './Icon';

const EMPTY = 'Sem orientações no roteiro.';

export function Items({ items, state }: { items: DepartureItem[]; state: UserState }) {
  const next = items.find((i) => !state.activityMarks[i.id]);
  return (
    <ul class="tr-items">
      {items.map((i) => (
        <li key={i.id} class={`tr-item ${i === next ? 'is-next' : ''} ${state.activityMarks[i.id] ? 'is-done' : ''}`}>
          <div>
            <p class="tr-label">{i.label}</p>
            {i.text && <p class="tr-text">{i.text}</p>}
          </div>
          <DoneToggle activityKey={i.id} title={i.label} compact />
        </li>
      ))}
    </ul>
  );
}

/**
 * Dia de transição entre cidades (feature 006, FR-019): "Antes de sair", "A viagem", "A chegada".
 * Só mostra o que existe no roteiro; bloco vazio diz isso.
 */
export function TransitionBlocks({
  content,
  state,
  date,
  hideEmpty = false,
}: {
  content: LoadedContent;
  state: UserState;
  date: DateStr;
  /** Feature 009: bloco sem conteúdo do roteiro não aparece (nada de "sem orientações"). */
  hideEmpty?: boolean;
}) {
  const items = (content.fullItineraries ?? []).flatMap((f) => f.departures?.[date] ?? []);
  const leaving = content.trip.find((l) => l.depart === date);
  const arriving = content.trip.find((l) => l.arrive === date);
  const notes = (content.fullItineraries ?? []).map((f) => f.dayNotes?.[date]).find(Boolean);
  // Feature 007: chegada descrita no doc da cidade de destino (itens marcáveis + o resto da seção).
  const arrival = (content.fullItineraries ?? []).map((f) => f.arrivals?.[date]).find(Boolean);
  const nextDay = arriving ? dayView(content, state, addDays(date, 1)) : undefined;
  const firstSteps = nextDay?.groups.flatMap((g) => g.activities).slice(0, 3) ?? [];
  const before = items.filter((i) => i.block === 'before');
  const trip = items.filter((i) => i.block === 'trip');

  return (
    <section class="transition" aria-label="Dia de viagem entre cidades">
      <p class="transition-route">
        <Icon name="plane" size={22} /> {leaving ? content.cityName(leaving.cityId) : 'Partida'}
        {arriving && ` → ${content.cityName(arriving.cityId)}`}
      </p>

      {!(hideEmpty && !before.length) && (
        <section class="tr-block" aria-label="Antes de sair">
          <h2 class="tr-title">1. Antes de sair</h2>
          {before.length ? <Items items={before} state={state} /> : <p class="muted">{EMPTY}</p>}
        </section>
      )}

      {!(hideEmpty && !trip.length) && (
        <section class="tr-block" aria-label="A viagem">
          <h2 class="tr-title">2. A viagem</h2>
          {trip.length ? <Items items={trip} state={state} /> : <p class="muted">{EMPTY}</p>}
        </section>
      )}

      {!(hideEmpty && !arrival?.items.length && !arrival?.html) && (
      <section class="tr-block" aria-label="A chegada">
        <h2 class="tr-title">3. A chegada</h2>
        {arriving ? (
          <>
            {arrival?.items.length ? <Items items={arrival.items} state={state} /> : !arrival?.html && <p class="muted">{EMPTY}</p>}
            {arrival?.html && (
              // HTML gerado no build a partir do roteiro.md do próprio app.
              <div class="doc-html tr-arrival" dangerouslySetInnerHTML={{ __html: arrival.html }} />
            )}
            {firstSteps.length > 0 && (
              <p>
                Primeiro dia em {content.cityName(arriving.cityId)} ({formatDayLabel(nextDay!.date)}):{' '}
                {firstSteps.map((a) => a.title).join(', ')}.{' '}
                <a href={`#/dia/${nextDay!.date}`}>Ver o dia</a>
              </p>
            )}
          </>
        ) : (
          <p>Fim da viagem. Boa volta para casa!</p>
        )}
      </section>
      )}

      {notes && (
        <details class="tr-notes">
          <summary>Orientações completas do roteiro</summary>
          {/* HTML gerado no build a partir do roteiro.md do próprio app. */}
          <div class="doc-html" dangerouslySetInnerHTML={{ __html: notes }} />
        </details>
      )}
    </section>
  );
}
