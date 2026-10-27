import { describe, expect, it } from 'vitest';
import { addPoint, deleteItinerary, removePoint, seedSuggested } from '../../src/domain/itineraries';
import { emptyState } from '../../src/storage/user-store';
import { fixtureContent } from '../fixtures/content';

const content = fixtureContent();

describe('seedSuggested', () => {
  it('cria os sugeridos na primeira execução', () => {
    const s = seedSuggested(content, emptyState());
    expect(s.seededIds).toEqual(['sug-2026-11-01', 'sug-2026-11-08']);
    expect(s.itineraries.map((i) => [i.origin, i.sourceId, i.date, i.name])).toEqual([
      ['suggested', 'sug-2026-11-01', '2026-11-01', 'Museus e Central Park'],
      ['suggested', 'sug-2026-11-08', '2026-11-08', 'Magic Kingdom'],
    ]);
    expect(s.itineraries[0]!.items).toEqual([
      { pointId: 'ny-met', pointName: 'The Metropolitan Museum of Art' },
      { pointId: 'ny-central-park', pointName: 'Central Park' },
    ]);
  });

  it('é idempotente', () => {
    const once = seedSuggested(content, emptyState());
    expect(seedSuggested(content, once)).toBe(once);
  });

  it('não sobrescreve nem recria roteiros editados ou excluídos', () => {
    let s = seedSuggested(content, emptyState());
    const [first, second] = s.itineraries;
    let r = removePoint(s, first!.id, 'ny-met');
    if (!r.ok) throw new Error();
    r = addPoint(r.state, first!.id, { id: 'ny-moma', name: 'MoMA' });
    if (!r.ok) throw new Error();
    const d = deleteItinerary(r.state, second!.id);
    if (!d.ok) throw new Error();
    s = d.state;

    // Nova versão do conteúdo muda o sugerido e adiciona outro.
    const newer = fixtureContent();
    newer.suggestedItineraries[0]!.pointIds = ['ny-moma'];
    newer.suggestedItineraries.push({ id: 'sug-2026-11-19', date: '2026-11-19', title: 'Praia', pointIds: ['mia-south-beach'] });
    const after = seedSuggested(newer, s);

    expect(after.itineraries.find((i) => i.id === first!.id)!.items.map((i) => i.pointId)).toEqual(['ny-central-park', 'ny-moma']);
    expect(after.itineraries.some((i) => i.sourceId === 'sug-2026-11-08')).toBe(false);
    expect(after.itineraries.filter((i) => i.sourceId === 'sug-2026-11-19')).toHaveLength(1);
    expect(after.seededIds).toEqual(['sug-2026-11-01', 'sug-2026-11-08', 'sug-2026-11-19']);
  });
});

describe('sugeridos que saíram do conteúdo (feature 012, Q2 = B)', () => {
  it('somem do aparelho; os roteiros do casal e os seededIds ficam', () => {
    const seeded = seedSuggested(content, emptyState());
    const mine = { ...seeded.itineraries[0]!, id: 'meu', origin: 'user' as const, sourceId: null, name: 'Meu roteiro' };
    const state = { ...seeded, itineraries: [...seeded.itineraries, mine] };
    const without = { ...content, suggestedItineraries: content.suggestedItineraries.filter((s) => s.id !== 'sug-2026-11-08') };
    const after = seedSuggested(without, state);
    expect(after.itineraries.map((i) => i.sourceId ?? i.id)).toEqual(['sug-2026-11-01', 'meu']);
    expect(after.seededIds).toEqual(state.seededIds);
  });

  it('sem sugerido nenhum no conteúdo: só o roteiro do casal fica', () => {
    const seeded = seedSuggested(content, emptyState());
    const mine = { ...seeded.itineraries[0]!, id: 'meu', origin: 'user' as const, sourceId: null };
    const after = seedSuggested({ ...content, suggestedItineraries: [] }, { ...seeded, itineraries: [...seeded.itineraries, mine] });
    expect(after.itineraries.map((i) => i.id)).toEqual(['meu']);
  });
});
