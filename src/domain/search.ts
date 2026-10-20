import type { CityId, Point } from '../content/types';

export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export interface PointFilter {
  cityId: CityId;
  categoryId?: string | null;
  query?: string;
}

export function filterPoints(points: Point[], filter: PointFilter): Point[] {
  const q = normalize(filter.query ?? '');
  return points
    .filter(
      (p) =>
        p.cityId === filter.cityId &&
        (!filter.categoryId || p.categoryId === filter.categoryId) &&
        (!q || normalize(p.name).includes(q)),
    )
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}
