import { useState } from 'preact/hooks';
import { toggleDone } from '../domain/full-itinerary';
import type { ActivityMark } from '../storage/types';
import { SAVE_ERROR_MESSAGE, useUserState } from '../storage/user-store';
import { Icon } from './Icon';

/** Controle Feito/Pendente (contracts/ui-components.md): não depende só de cor, toque ≥ 44 px. */
export function DoneToggle({ activityKey, title, compact = false }: { activityKey: string; title: string; compact?: boolean }) {
  const [state, update] = useUserState();
  const [error, setError] = useState(false);
  const mark: ActivityMark | undefined = state.activityMarks[activityKey];
  const done = mark?.state === 'done';
  const label = done ? 'Feito' : mark?.state === 'skipped' ? 'Pulada' : 'Pendente';

  return (
    <div class="done-toggle-wrap">
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={`Marcar ${title} como ${done ? 'pendente' : 'feito'}`}
        class={`done-toggle ${done ? 'is-done' : ''} ${compact ? 'is-compact' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setError(!update((s) => toggleDone(s, activityKey)).ok);
        }}
      >
        <span class="done-box" aria-hidden="true">
          {done && <Icon name="check" size={18} />}
        </span>
        <span class="done-text">{label}</span>
      </button>
      {error && (
        <p class="error" role="alert">
          {SAVE_ERROR_MESSAGE}
        </p>
      )}
    </div>
  );
}
