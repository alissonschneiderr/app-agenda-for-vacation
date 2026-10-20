import { useState } from 'preact/hooks';
import type { Point } from '../content/types';
import { isFavorite, toggleFavorite } from '../domain/favorites';
import { SAVE_ERROR_MESSAGE, useUserState } from '../storage/user-store';

export function FavoriteButton({ point, compact = false }: { point: Pick<Point, 'id' | 'name'>; compact?: boolean }) {
  const [state, update] = useUserState();
  const [error, setError] = useState(false);
  const active = isFavorite(state, point.id);
  const label = active ? 'Remover dos favoritos' : 'Favoritar';

  const onClick = () => {
    const result = update((s) => toggleFavorite(s, point));
    setError(!result.ok);
  };

  return (
    <div>
      <button
        type="button"
        class={compact ? 'btn btn-icon' : 'btn'}
        aria-pressed={active}
        aria-label={compact ? `${label}: ${point.name}` : undefined}
        title={label}
        onClick={onClick}
      >
        <span aria-hidden="true">{active ? '★' : '☆'}</span>
        {!compact && (active ? 'Favorito' : 'Favoritar')}
      </button>
      {error && (
        <p class="error" role="alert">
          {SAVE_ERROR_MESSAGE}
        </p>
      )}
    </div>
  );
}
