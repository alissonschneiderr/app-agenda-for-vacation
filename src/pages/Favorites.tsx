import { PageHeader } from '../components/PageHeader';
import { PointCard } from '../components/PointCard';
import type { LoadedContent } from '../content/load';
import { removeFavorite, resolveFavorites } from '../domain/favorites';
import { useUserState } from '../storage/user-store';

export function Favorites({ content }: { content: LoadedContent }) {
  const [state, update] = useUserState();
  const favorites = resolveFavorites(state, content.pointsById);
  const now = new Date();

  return (
    <main class="page">
      <PageHeader back="#/" label="Guia de pontos turísticos" title="Favoritos" />
      {favorites.length === 0 ? (
        <div class="empty">
          <p>Você ainda não tem favoritos.</p>
          <p>Toque em ☆ em um ponto do guia para salvá-lo aqui. Os favoritos funcionam sem internet.</p>
        </div>
      ) : (
        <ul class="list">
          {favorites.map((f) => (
            <li key={f.pointId}>
              {f.point ? (
                <PointCard point={f.point} content={content} now={now} />
              ) : (
                <div class="card-row">
                  <div class="card" style={{ gridTemplateColumns: '1fr' }}>
                    <p class="title">{f.pointName}</p>
                    <span class="badge badge-warn">Indisponível</span>
                  </div>
                  <button
                    type="button"
                    class="btn btn-danger"
                    aria-label={`Remover ${f.pointName} dos favoritos`}
                    onClick={() => update((s) => removeFavorite(s, f.pointId))}
                  >
                    Remover
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
