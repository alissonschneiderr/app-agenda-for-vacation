import type { Point } from '../content/types';
import type { Favorite, UserState } from '../storage/types';

export function isFavorite(state: UserState, pointId: string): boolean {
  return state.favorites.some((f) => f.pointId === pointId);
}

export function toggleFavorite(state: UserState, point: Pick<Point, 'id' | 'name'>, now = new Date()): UserState {
  if (isFavorite(state, point.id)) {
    return { ...state, favorites: state.favorites.filter((f) => f.pointId !== point.id) };
  }
  const favorite: Favorite = { pointId: point.id, pointName: point.name, savedAt: now.toISOString() };
  return { ...state, favorites: [...state.favorites, favorite] };
}

export function removeFavorite(state: UserState, pointId: string): UserState {
  return { ...state, favorites: state.favorites.filter((f) => f.pointId !== pointId) };
}

export interface ResolvedFavorite extends Favorite {
  point: Point | null;
  available: boolean;
}

/** Favoritos mais recentes primeiro; ponto ausente do conteúdo atual = indisponível. */
export function resolveFavorites(state: UserState, pointsById: Map<string, Point>): ResolvedFavorite[] {
  return [...state.favorites]
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
    .map((f) => {
      const point = pointsById.get(f.pointId) ?? null;
      return { ...f, point, available: point !== null };
    });
}
