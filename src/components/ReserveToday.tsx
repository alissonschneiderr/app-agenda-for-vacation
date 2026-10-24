import type { LoadedContent } from '../content/load';
import type { DateStr } from '../content/types';
import type { UserState } from '../storage/types';
import { DoneToggle } from './DoneToggle';
import { Icon } from './Icon';

/**
 * "Reservar hoje" (feature 007, FR-016): itens a reservar cujo prazo é hoje, como os Multi Pass que só
 * abrem 3 dias antes. A marca usa o id do item (ck:<cidade>:<n>) e não entra no progresso da viagem.
 */
export function ReserveToday({ content, state, date }: { content: LoadedContent; state: UserState; date: DateStr }) {
  const items = (content.fullItineraries ?? []).flatMap((f) => f.checklist).filter((c) => c.id && c.deadline === date);
  if (!items.length) return null;
  return (
    <section class="card-section reserve-today" aria-label="Reservar hoje">
      <h2 class="section-title">
        <Icon name="ticket" size={20} /> Reservar hoje
      </h2>
      <ul class="tr-items">
        {items.map((c) => (
          <li key={c.id} class={`tr-item ${state.activityMarks[c.id!] ? 'is-done' : ''}`}>
            <div>
              <p class="tr-label">{c.what}</p>
              <p class="tr-text">
                {c.when}
                {c.note && ` · ${c.note}`}
              </p>
            </div>
            <DoneToggle activityKey={c.id!} title={c.what} compact />
          </li>
        ))}
      </ul>
    </section>
  );
}
