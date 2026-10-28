import { describe, expect, it } from 'vitest';
import { assembleContent } from '../../scripts/build-content';
import { indexContent } from '../../src/content/load';
import { markActivity } from '../../src/domain/full-itinerary';
import { createItinerary, addPoint, seedSuggested } from '../../src/domain/itineraries';
import {
  activityKeyForItem,
  adjacentDay,
  dayView,
  destinationDates,
  destinationView,
  findActivity,
  nextPendingActivity,
} from '../../src/domain/trip-view';
import { emptyState } from '../../src/storage/user-store';
import type { UserState } from '../../src/storage/types';
import { fixtureContent } from '../fixtures/content';
import { fixtureFullItinerary } from '../fixtures/full-itinerary';

function setup() {
  const c = fixtureContent();
  c.fullItineraries = [fixtureFullItinerary()];
  const content = indexContent(c);
  const state = seedSuggested(c, emptyState(), new Date('2026-10-30T10:00:00Z'));
  return { content, state };
}

describe('trip-view', () => {
  it('destino: período do trecho, foto de destaque e dias com locomoção', () => {
    const { content, state } = setup();
    const ny = destinationView(content, state, 'nova-york');
    expect(ny.period).toEqual({ start: '2026-10-31', end: '2026-11-07' });
    expect(ny.hero?.point.id).toBe('ny-central-park');
    expect(ny.days.map((d) => d.date)).toEqual(destinationDates(content, 'nova-york'));
    expect(ny.days.at(-1)!.info.kind).toBe('travel');
    expect(ny.days[2]).toMatchObject({ index: 3, count: 8 });
    expect(ny.commitments.map((c) => c.id)).toEqual(['knicks-nets', 'mj-musical']);
    const orl = destinationView(content, state, 'orlando');
    expect(orl.period).toEqual({ start: '2026-11-07', end: '2026-11-18' });
  });

  it('dia com roteiro FULL: o FULL primeiro; sugerido some (feature 007, R9); roteiro do casal continua', () => {
    const { content, state } = setup();
    expect(dayView(content, state, '2026-11-01').groups.map((g) => g.source)).toEqual(['full']);
    const created = createItinerary(state, 'Nosso domingo', '2026-11-01', new Date('2026-10-30T10:00:00Z'));
    if (!created.ok) throw new Error(created.error);
    const id = created.state.itineraries.at(-1)!.id;
    const added = addPoint(created.state, id, { id: 'ny-met', name: 'MET' });
    if (!added.ok) throw new Error(added.error);
    const day = dayView(content, added.state, '2026-11-01');
    expect(day.groups.map((g) => g.source)).toEqual(['full', 'itinerary']);
    expect(day.groups[1]!.title).toBe('Nosso domingo');
    expect(day.hasTimes).toBe(true);
    const full = day.groups[0]!.activities;
    expect(full.find((a) => a.category === 'transit')!.trackable).toBe(false);
    expect(full.find((a) => a.category === 'restaurant')).toBeTruthy();
  });

  it('feature 005: pausa livre é intervalo, sem check e fora da "próxima pendente"', () => {
    const c = fixtureContent();
    const full = fixtureFullItinerary();
    const d = full.days.find((x) => x.date === '2026-11-02')!;
    const first = d.activities.find((a) => a.type === 'attraction')!;
    first.type = 'free';
    first.title = 'pausa livre';
    c.fullItineraries = [full];
    const content = indexContent(c);
    const state = seedSuggested(c, emptyState(), new Date('2026-10-30T10:00:00Z'));
    const before = dayView(content, state, '2026-11-02');
    const free = before.groups[0]!.activities.find((a) => a.key === first.id)!;
    expect(free).toMatchObject({ free: true, trackable: false });
    const { content: c0, state: s0 } = setup();
    const checks = (v: ReturnType<typeof dayView>) => v.groups.flatMap((g) => g.activities).filter((a) => a.trackable).length;
    expect(checks(before)).toBe(checks(dayView(c0, s0, '2026-11-02')) - 1);
    const next = nextPendingActivity(content, state, new Date(`2026-11-02T${String(Number(first.start.slice(0, 2)) + 5).padStart(2, '0')}:${first.start.slice(3)}:00Z`));
    expect(next?.activity?.key).not.toBe(first.id);
  });

  it('itens de roteiro: chave it:, sem horário, foto do ponto, indisponível quando o ponto sumiu', () => {
    const { content, state } = setup();
    const day = dayView(content, state, '2026-11-08');
    const [mk] = day.groups[0]!.activities;
    expect(mk!.key).toBe(activityKeyForItem(day.groups[0]!.itineraryId!, 'orl-magic-kingdom'));
    expect(mk!.start).toBeUndefined();
    expect(mk!.photos).toHaveLength(1);
    expect(mk!.categoryLabel).toBe('Parque temático');
    expect(day.hasTimes).toBe(false);

    const r = createItinerary(state, 'Antigo', '2026-11-08', new Date('2026-10-31T00:00:00Z'));
    if (!r.ok) throw new Error();
    const a = addPoint(r.state, r.id!, { id: 'ponto-removido', name: 'Ponto antigo' });
    if (!a.ok) throw new Error();
    const withGone = dayView(content, a.state, '2026-11-08');
    expect(withGone.groups[1]!.activities[0]).toMatchObject({ title: 'Ponto antigo', unavailable: true, trackable: true });
  });

  it('marcas aparecem na própria parada: feita e pulada, em NY e em Orlando (feature 015: sem contagem)', () => {
    const { content, state } = setup();
    const day = dayView(content, state, '2026-11-02');
    const [a, b] = day.groups[0]!.activities.filter((x) => x.trackable);
    let s: UserState = markActivity(state, a!.key, 'done');
    s = markActivity(s, b!.key, 'skipped');
    const after = dayView(content, s, '2026-11-02').groups[0]!.activities;
    expect(after.find((x) => x.key === a!.key)!.mark?.state).toBe('done');
    expect(after.find((x) => x.key === b!.key)!.mark?.state).toBe('skipped');
    const mkKey = dayView(content, s, '2026-11-08').groups[0]!.activities[0]!.key;
    s = markActivity(s, mkKey, 'done');
    expect(dayView(content, s, '2026-11-08').groups[0]!.activities[0]!.mark?.state).toBe('done');
  });

  it('dia anterior/seguinte atravessa destinos', () => {
    const { content } = setup();
    expect(adjacentDay(content, '2026-11-06', 1)).toEqual({ date: '2026-11-07', cityId: 'orlando' });
    expect(adjacentDay(content, '2026-11-08', -1)).toEqual({ date: '2026-11-07', cityId: 'orlando' });
    expect(adjacentDay(content, '2026-10-31', -1)).toBeNull();
    expect(adjacentDay(content, '2026-11-21', 1)).toBeNull();
  });

  it('encontra atividade com vizinhas e o deslocamento seguinte', () => {
    const { content, state } = setup();
    const day = dayView(content, state, '2026-11-03');
    const lunch = day.groups[0]!.activities.find((a) => a.title.startsWith('Almoço'))!;
    const found = findActivity(content, state, '2026-11-03', lunch.key)!;
    expect(found.nextTransit?.category).toBe('transit');
    expect(found.prev?.title).toMatch(/Atração/);
    expect(found.next?.title).toMatch(/série/);
    expect(findActivity(content, state, '2026-11-03', 'nao-existe')).toBeNull();
  });

  it('próxima pendente: hoje em NY, ignora feitas e puladas', () => {
    const { content, state } = setup();
    const now = new Date('2026-11-02T20:00:00Z'); // 15:00 em NY
    const r = nextPendingActivity(content, state, now)!;
    expect(r.date).toBe('2026-11-02');
    expect(r.activity!.title).toMatch(/Brechó/);
    const s = markActivity(state, r.activity!.key, 'done');
    expect(nextPendingActivity(content, s, now)!.activity!.title).toMatch(/Lanche/);
    expect(nextPendingActivity(content, state, new Date('2026-12-01T15:00:00Z'))).toBeNull();
  });
});

// ---------- feature 007: roteiro de Orlando (conteúdo real) ----------

describe('trip-view com o roteiro de Orlando (feature 007)', () => {
  const real = assembleContent();
  const content = indexContent(real);
  // Estado de quem já tinha os sugeridos de Orlando no aparelho (antes da 007).
  const legacy = { ...emptyState(), seededIds: ['sug-2026-11-10', 'sug-2026-11-19'] };
  legacy.itineraries = [
    { id: 'old', name: 'EPCOT', date: '2026-11-10', origin: 'suggested', sourceId: 'sug-2026-11-10', items: [{ pointId: 'orl-epcot', pointName: 'EPCOT' }], createdAt: 'x', updatedAt: 'x' },
    { id: 'mia', name: 'Wynwood', date: '2026-11-19', origin: 'suggested', sourceId: 'sug-2026-11-19', items: [{ pointId: 'mia-wynwood', pointName: 'Wynwood' }], createdAt: 'x', updatedAt: 'x' },
  ];

  it('dia com roteiro FULL não mostra os sugeridos guardados (FR-001, SC-005); Miami também (feature 012)', () => {
    const orl = dayView(content, legacy, '2026-11-10');
    expect(orl.groups.map((g) => g.source)).toEqual(['full']);
    // Feature 012: Miami ganhou o roteiro do casal; o sugerido guardado não aparece mais.
    const mia = dayView(content, legacy, '2026-11-19');
    expect(mia.groups.map((g) => g.source)).toEqual(['full']);
  });

  it('marcas antigas não marcam nenhum passo; só os passos orl1- têm o check', () => {
    const marked = { ...legacy, activityMarks: { [activityKeyForItem('old', 'orl-epcot')]: { state: 'done' as const, at: 'x' } } };
    const acts = dayView(content, marked, '2026-11-10').groups.flatMap((g) => g.activities);
    expect(acts.filter((a) => a.mark?.state === 'done')).toHaveLength(0);
    expect(acts.filter((a) => a.trackable).length).toBe(dayView(content, emptyState(), '2026-11-10').groups[0]!.activities.filter((a) => a.trackable).length);
  });

  it('fila, forma de entrar e área do parque no passo; ponto do parque herdado', () => {
    const day = dayView(content, emptyState(), '2026-11-09');
    const tower = day.groups[0]!.activities.find((a) => a.title === 'Tower of Terror')!;
    expect(tower).toMatchObject({ queue: '~5 min', access: 'Multi Pass' });
    expect(tower.point?.id).toBe('orl-hollywood-studios');
    const mk = dayView(content, emptyState(), '2026-11-08').groups[0]!.activities.find((a) => a.title === 'Jungle Cruise')!;
    expect(mk).toMatchObject({ queue: 'fila ~5 min', land: 'Adventureland' });
  });
});
