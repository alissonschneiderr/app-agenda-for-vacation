import { describe, expect, it } from 'vitest';
import { isFavorite, removeFavorite, resolveFavorites, toggleFavorite } from '../../src/domain/favorites';
import { indexContent } from '../../src/content/load';
import { emptyState } from '../../src/storage/user-store';
import { fixtureContent } from '../fixtures/content';

const content = indexContent(fixtureContent());
const met = content.pointsById.get('ny-met')!;
const park = content.pointsById.get('ny-central-park')!;

describe('favorites', () => {
  it('adiciona com snapshot do nome e data', () => {
    const s = toggleFavorite(emptyState(), met, new Date('2026-11-01T10:00:00Z'));
    expect(s.favorites).toEqual([
      { pointId: 'ny-met', pointName: 'The Metropolitan Museum of Art', savedAt: '2026-11-01T10:00:00.000Z' },
    ]);
    expect(isFavorite(s, 'ny-met')).toBe(true);
  });

  it('remove se já é favorito (pointId único na lista)', () => {
    const s = toggleFavorite(toggleFavorite(emptyState(), met), met);
    expect(s.favorites).toEqual([]);
    expect(removeFavorite(toggleFavorite(emptyState(), met), 'ny-met').favorites).toEqual([]);
  });

  it('resolve mais recentes primeiro e marca indisponíveis', () => {
    let s = toggleFavorite(emptyState(), met, new Date('2026-11-01T10:00:00Z'));
    s = toggleFavorite(s, park, new Date('2026-11-02T10:00:00Z'));
    s = toggleFavorite(s, { id: 'ny-removido', name: 'Ponto removido' }, new Date('2026-11-03T10:00:00Z'));
    const resolved = resolveFavorites(s, content.pointsById);
    expect(resolved.map((f) => [f.pointId, f.available])).toEqual([
      ['ny-removido', false],
      ['ny-central-park', true],
      ['ny-met', true],
    ]);
    expect(resolved[0]!.pointName).toBe('Ponto removido');
  });
});
