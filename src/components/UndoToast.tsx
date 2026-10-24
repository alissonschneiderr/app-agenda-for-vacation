import { useEffect, useState } from 'preact/hooks';
import { markActivity, unmarkActivity } from '../domain/full-itinerary';
import type { ActivityMark } from '../storage/types';
import { SAVE_ERROR_MESSAGE, useUserState } from '../storage/user-store';

interface Last {
  key: string;
  title: string;
  state: ActivityMark['state'];
  previous?: ActivityMark;
}

const SHOW_MS = 6000;

/**
 * Marcar como feito ou pulado com "Desfazer" (feature 006, FR-020). `mark` aplica a marca e mostra o
 * aviso por 6 s; desfazer volta exatamente ao estado anterior.
 */
export function useMarkWithUndo() {
  const [state, update] = useUserState();
  const [last, setLast] = useState<Last | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!last) return;
    const t = setTimeout(() => setLast(null), SHOW_MS);
    return () => clearTimeout(t);
  }, [last]);

  function mark(key: string, title: string, s: ActivityMark['state']) {
    const previous = state.activityMarks[key];
    const ok = update((st) => markActivity(st, key, s)).ok;
    setError(!ok);
    if (ok) setLast({ key, title, state: s, previous });
  }

  function undo() {
    if (!last) return;
    update((st) => (last.previous ? markActivity(st, last.key, last.previous.state) : unmarkActivity(st, last.key)));
    setLast(null);
  }

  const toast = (
    <div class="undo-toast-slot" aria-live="polite">
      {last && (
        <div class="undo-toast" role="status">
          <span>
            {last.state === 'done' ? 'Feito' : 'Pulado'}: {last.title}
          </span>
          <button type="button" class="btn btn-quiet" onClick={undo}>
            Desfazer
          </button>
        </div>
      )}
      {error && (
        <p class="error" role="alert">
          {SAVE_ERROR_MESSAGE}
        </p>
      )}
    </div>
  );
  return { mark, toast, state };
}
