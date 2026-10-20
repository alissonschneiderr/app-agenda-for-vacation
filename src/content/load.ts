import { useEffect, useState } from 'preact/hooks';
import type { CityId, Content, Point } from './types';

export interface LoadedContent extends Content {
  pointsById: Map<string, Point>;
  pointsByCity: Map<CityId, Point[]>;
  categoryName: (id: string) => string;
  cityName: (id: CityId) => string;
}

export type ContentState =
  | { status: 'loading' }
  | { status: 'ready'; content: LoadedContent }
  | { status: 'unavailable' };

export function indexContent(content: Content): LoadedContent {
  const pointsById = new Map(content.points.map((p) => [p.id, p]));
  const pointsByCity = new Map<CityId, Point[]>();
  for (const p of content.points) {
    const list = pointsByCity.get(p.cityId) ?? [];
    list.push(p);
    pointsByCity.set(p.cityId, list);
  }
  const categories = new Map(content.categories.map((c) => [c.id, c.name]));
  const cities = new Map(content.cities.map((c) => [c.id, c.name]));
  return {
    ...content,
    pointsById,
    pointsByCity,
    categoryName: (id) => categories.get(id) ?? id,
    cityName: (id) => cities.get(id) ?? id,
  };
}

let current: ContentState = { status: 'loading' };
let pending: Promise<ContentState> | null = null;
const listeners = new Set<(s: ContentState) => void>();

export function loadContent(fetchFn: typeof fetch = fetch): Promise<ContentState> {
  pending ??= fetchFn(`${import.meta.env.BASE_URL}data/content.json`)
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<Content>;
    })
    .then((c): ContentState => ({ status: 'ready', content: indexContent(c) }))
    .catch((): ContentState => ({ status: 'unavailable' }))
    .then((s) => {
      current = s;
      listeners.forEach((l) => l(s));
      return s;
    });
  return pending;
}

/** Só para testes: define o conteúdo já carregado. */
export function setContentForTests(content: Content | null): void {
  pending = null;
  current = content ? { status: 'ready', content: indexContent(content) } : { status: 'loading' };
  if (content) pending = Promise.resolve(current);
}

export function useContent(): ContentState {
  const [state, setState] = useState(current);
  useEffect(() => {
    listeners.add(setState);
    if (current.status === 'loading') void loadContent();
    else setState(current);
    return () => listeners.delete(setState);
  }, []);
  return state;
}
