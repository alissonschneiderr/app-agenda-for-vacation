import { describe, expect, it } from 'vitest';
import {
  addPoint,
  createItinerary,
  deleteItinerary,
  groupByDate,
  moveDown,
  moveToTop,
  moveUp,
  otherCityWarning,
  removePoint,
  renameItinerary,
  setItineraryDate,
  type Result,
} from '../../src/domain/itineraries';
import { indexContent } from '../../src/content/load';
import { emptyState } from '../../src/storage/user-store';
import type { UserState } from '../../src/storage/types';
import { fixtureContent } from '../fixtures/content';

const content = indexContent(fixtureContent());
const p = (id: string) => content.pointsById.get(id)!;
const T0 = new Date('2026-10-30T10:00:00Z');
const T1 = new Date('2026-10-30T11:00:00Z');

function ok(r: Result): UserState {
  if (!r.ok) throw new Error(r.error);
  return r.state;
}

function withItinerary(date: string | null = '2026-11-01'): { s: UserState; id: string } {
  const r = createItinerary(emptyState(), 'Meu dia', date, T0);
  if (!r.ok) throw new Error(r.error);
  return { s: r.state, id: r.id! };
}

const order = (s: UserState, id: string) => s.itineraries.find((i) => i.id === id)!.items.map((i) => i.pointId);

describe('itineraries', () => {
  it('cria com nome aparado, origem user e datas', () => {
    const { s, id } = withItinerary();
    expect(s.itineraries).toEqual([
      { id, name: 'Meu dia', date: '2026-11-01', origin: 'user', sourceId: null, items: [], createdAt: T0.toISOString(), updatedAt: T0.toISOString() },
    ]);
    expect(ok(createItinerary(emptyState(), '  Com espaço  ', null)).itineraries[0]!.name).toBe('Com espaço');
  });

  it('valida nome: 1–60 caracteres, não vazio após trim', () => {
    expect(createItinerary(emptyState(), '   ', null)).toEqual({ ok: false, error: 'NAME_EMPTY' });
    expect(createItinerary(emptyState(), 'x'.repeat(61), null)).toEqual({ ok: false, error: 'NAME_TOO_LONG' });
    expect(createItinerary(emptyState(), 'x'.repeat(60), null).ok).toBe(true);
  });

  it('valida data: entre 2026-10-31 e 2026-11-21', () => {
    expect(createItinerary(emptyState(), 'a', '2026-10-30')).toEqual({ ok: false, error: 'DATE_OUT_OF_RANGE' });
    expect(createItinerary(emptyState(), 'a', '2026-11-22')).toEqual({ ok: false, error: 'DATE_OUT_OF_RANGE' });
    expect(createItinerary(emptyState(), 'a', '2026-10-31').ok).toBe(true);
    expect(createItinerary(emptyState(), 'a', '2026-11-21').ok).toBe(true);
  });

  it('renomeia, muda o dia e atualiza updatedAt', () => {
    const { s, id } = withItinerary();
    const renamed = ok(renameItinerary(s, id, 'Novo', T1));
    expect(renamed.itineraries[0]).toMatchObject({ name: 'Novo', updatedAt: T1.toISOString(), createdAt: T0.toISOString() });
    expect(renameItinerary(s, id, '')).toEqual({ ok: false, error: 'NAME_EMPTY' });
    expect(ok(setItineraryDate(s, id, null)).itineraries[0]!.date).toBeNull();
    expect(setItineraryDate(s, id, '2027-01-01')).toEqual({ ok: false, error: 'DATE_OUT_OF_RANGE' });
    expect(renameItinerary(s, 'nao-existe', 'x')).toEqual({ ok: false, error: 'NOT_FOUND' });
  });

  it('exclui', () => {
    const { s, id } = withItinerary();
    expect(ok(deleteItinerary(s, id)).itineraries).toEqual([]);
    expect(deleteItinerary(s, 'x')).toEqual({ ok: false, error: 'NOT_FOUND' });
  });

  it('adiciona ao final e recusa duplicata', () => {
    let { s, id } = withItinerary();
    s = ok(addPoint(s, id, p('ny-met')));
    s = ok(addPoint(s, id, p('ny-central-park')));
    expect(order(s, id)).toEqual(['ny-met', 'ny-central-park']);
    expect(s.itineraries[0]!.items[0]!.pointName).toBe('The Metropolitan Museum of Art');
    expect(addPoint(s, id, p('ny-met'))).toEqual({ ok: false, error: 'DUPLICATE' });
  });

  it('reordena e remove, respeitando as bordas', () => {
    let { s, id } = withItinerary();
    for (const pid of ['ny-met', 'ny-moma', 'ny-central-park']) s = ok(addPoint(s, id, p(pid)));
    expect(order(ok(moveUp(s, id, 1)), id)).toEqual(['ny-moma', 'ny-met', 'ny-central-park']);
    expect(order(ok(moveDown(s, id, 1)), id)).toEqual(['ny-met', 'ny-central-park', 'ny-moma']);
    expect(order(ok(moveToTop(s, id, 2)), id)).toEqual(['ny-central-park', 'ny-met', 'ny-moma']);
    expect(order(ok(moveUp(s, id, 0)), id)).toEqual(['ny-met', 'ny-moma', 'ny-central-park']);
    expect(order(ok(moveDown(s, id, 2)), id)).toEqual(['ny-met', 'ny-moma', 'ny-central-park']);
    expect(order(ok(removePoint(s, id, 'ny-moma')), id)).toEqual(['ny-met', 'ny-central-park']);
  });

  it('avisa sobre ponto de outra cidade (FR-022)', () => {
    const trip = content.trip;
    expect(otherCityWarning({ date: '2026-11-01' }, p('mia-south-beach'), trip)).toEqual({ pointCity: 'miami', dayCities: ['nova-york'] });
    expect(otherCityWarning({ date: '2026-11-01' }, p('ny-met'), trip)).toBeNull();
    // Locomoção NY → Orlando aceita as duas cidades.
    expect(otherCityWarning({ date: '2026-11-07' }, p('ny-met'), trip)).toBeNull();
    expect(otherCityWarning({ date: '2026-11-07' }, p('orl-magic-kingdom'), trip)).toBeNull();
    expect(otherCityWarning({ date: '2026-11-07' }, p('mia-south-beach'), trip)).not.toBeNull();
    // Sem dia não avisa.
    expect(otherCityWarning({ date: null }, p('mia-south-beach'), trip)).toBeNull();
  });

  it('agrupa por dia em ordem cronológica, "Sem dia" por último', () => {
    let s = emptyState();
    s = ok(createItinerary(s, 'Sem data', null, T0));
    s = ok(createItinerary(s, 'Dia 8', '2026-11-08', T0));
    s = ok(createItinerary(s, 'Locomoção', '2026-11-07', T0));
    s = ok(createItinerary(s, 'Dia 8 b', '2026-11-08', T1));
    const groups = groupByDate(s.itineraries, content.trip);
    expect(groups.map((g) => [g.date, g.itineraries.map((i) => i.name)])).toEqual([
      ['2026-11-07', ['Locomoção']],
      ['2026-11-08', ['Dia 8', 'Dia 8 b']],
      [null, ['Sem data']],
    ]);
    expect(groups[0]!.day).toEqual({ kind: 'travel', date: '2026-11-07', origin: 'nova-york', destination: 'orlando' });
  });
});
