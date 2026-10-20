import { describe, expect, it } from 'vitest';
import { filterPoints, normalize } from '../../src/domain/search';
import { fixtureContent } from '../fixtures/content';

const { points } = fixtureContent();
const ids = (ps: { id: string }[]) => ps.map((p) => p.id);

describe('search', () => {
  it('normaliza acentos e caixa', () => {
    expect(normalize('  São PAULO ')).toBe('sao paulo');
  });

  it('filtra por cidade e ordena por nome', () => {
    expect(ids(filterPoints(points, { cityId: 'nova-york' }))).toEqual([
      'ny-central-park', 'ny-sao-pedro', 'ny-moma', 'ny-met',
    ]);
  });

  it('busca por substring ignorando caixa e acentos', () => {
    expect(ids(filterPoints(points, { cityId: 'nova-york', query: 'METROPOLITAN' }))).toEqual(['ny-met']);
    expect(ids(filterPoints(points, { cityId: 'nova-york', query: 'sao' }))).toEqual(['ny-sao-pedro']);
    expect(ids(filterPoints(points, { cityId: 'nova-york', query: 'mus' }))).toEqual(['ny-moma', 'ny-met']);
  });

  it('filtra por categoria e combina com a busca', () => {
    expect(ids(filterPoints(points, { cityId: 'nova-york', categoryId: 'parque' }))).toEqual(['ny-central-park', 'ny-sao-pedro']);
    expect(ids(filterPoints(points, { cityId: 'nova-york', categoryId: 'museu', query: 'modern' }))).toEqual(['ny-moma']);
  });

  it('retorna lista vazia sem correspondência', () => {
    expect(filterPoints(points, { cityId: 'miami', query: 'xyz' })).toEqual([]);
  });
});
