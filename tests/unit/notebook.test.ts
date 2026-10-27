// Feature 008 (T008): modelos das telas do caderno de viagem, com o conteúdo real do app.
import { describe, expect, it } from 'vitest';
import { assembleContent } from '../../scripts/build-content';
import { indexContent } from '../../src/content/load';
import { seedSuggested } from '../../src/domain/itineraries';
import { cityCard, dataReview, dayCard, dayPlaces, daySections, neighborhoods, peopleOf, stopThumb, tripCover } from '../../src/domain/notebook';
import { dayView as view009, destinationDates } from '../../src/domain/trip-view';
import { emptyState } from '../../src/storage/user-store';

const raw = assembleContent();
const content = indexContent(raw);
const state = seedSuggested(raw, emptyState(), new Date('2026-10-27T12:00:00Z'));
const central = content.pointsById.get('ny-central-park')!;

describe('caderno de viagem — modelos (feature 008)', () => {
  it('capa da viagem antes do embarque: faltam 4 dias, 2 pessoas, 31/10 a 21/11, 3 cidades', () => {
    const c = tripCover(content, state, '2026-10-27');
    expect(c).toMatchObject({ phase: 'before', daysLeft: 4, people: 2, start: '2026-10-31', end: '2026-11-21', cities: 3, totalDays: 22 });
    expect(c.photo?.src).toBe(central.photos[0]!.src);
    expect(c.dayNumber).toBeUndefined();
  });

  it('capa da viagem durante: dia n de 22', () => {
    expect(tripCover(content, state, '2026-11-01')).toMatchObject({ phase: 'during', dayNumber: 2 });
    expect(peopleOf('Casal')).toBe(2);
    expect(peopleOf('Família')).toBe(0);
  });

  it('cidade: Nova York (7 noites, 7 dias de roteiro, foto e frase do ponto de destaque)', () => {
    const ny = cityCard(content, state, 'nova-york');
    expect(ny).toMatchObject({ country: 'Estados Unidos', nights: 7, roadmapDays: 7, start: '2026-10-31', end: '2026-11-07' });
    expect(ny.photo?.src).toBe(central.photos[0]!.src);
    expect(ny.phrase).toBe(central.summary);
    expect(ny.tags.slice(0, 2)).toEqual(['Knicks x Nets', 'MJ The Musical']);
    expect(ny.tags.length).toBeLessThanOrEqual(6);
    expect(ny.arrival).toBeUndefined();
    expect(ny.departure).toEqual({ date: '2026-11-07', to: 'orlando' });
    const orl = cityCard(content, state, 'orlando');
    expect(orl).toMatchObject({ nights: 11, roadmapDays: 10, arrival: { date: '2026-11-07', from: 'nova-york' }, departure: { date: '2026-11-18', to: 'miami' } });
    expect(cityCard(content, state, 'miami').departure).toEqual({ date: '2026-11-21', to: null });
  });

  it('dia: 01/11 com a foto de SoHo e "dia 2"; 07/11 com a rota', () => {
    const d = dayCard(content, state, '2026-11-01');
    const soho = d.view.areas.find((a) => a.name === 'SoHo')!;
    expect(d).toMatchObject({ dayNumber: 2, kind: 'walk', cityId: 'nova-york' });
    expect(d.photo?.src).toBe(soho.photo!.src);
    expect(d.stops).toBe(d.view.progress.total);
    const t = dayCard(content, state, '2026-11-07');
    expect(t.title).toBe('Nova York → Orlando');
    expect(t.route).toEqual({ from: 'nova-york', to: 'orlando' });
    expect(dayCard(content, state, '2026-11-21').title).toBe('Miami → casa');
    expect(dayCard(content, state, '2026-11-19').title).toBe('South Beach e Art Deco');
  });

  it('miniatura: nunca a foto da cidade nem a do parque herdado (atração sem foto própria)', () => {
    const epcot = dayCard(content, state, '2026-11-10').view;
    const luminous = epcot.groups[0]!.activities.find((a) => a.title === 'Luminous: The Symphony of Us')!;
    expect(luminous.point?.id).toBe('orl-epcot');
    expect(stopThumb(luminous)).toBeUndefined();
    const tower = dayCard(content, state, '2026-11-09').view.groups[0]!.activities.find((a) => a.title === 'Tower of Terror')!;
    expect(stopThumb(tower)?.src).toMatch(/photos\/doc\/orlando\//);
  });

  it('bairros de Orlando: regiões na ordem dos dias, com contagens', () => {
    const n = neighborhoods(content, state, 'orlando');
    expect(n[0]).toMatchObject({ date: '2026-11-08', areaId: 'magic-kingdom', name: 'Magic Kingdom', counts: { food: 5 } });
    expect(n.map((x) => x.date)).toEqual([...n.map((x) => x.date)].sort());
    expect(n.every((x) => x.name)).toBe(true);
  });

});

// ---------- feature 009: seções do dia, lugares e dados a revisar ----------

describe('seções do dia (feature 009)', () => {
  const ids = (d: string) => daySections(view009(content, state, d), content).map((s) => s.id);

  it('01/11: as 6 seções, na ordem; 24 restaurantes e cafés e 17 lojas', () => {
    expect(ids('2026-11-01')).toEqual(['paradas', 'comer', 'lojas', 'bairros', 'transporte', 'dicas']);
    const v = view009(content, state, '2026-11-01');
    expect(dayPlaces(v, 'food')).toHaveLength(24);
    expect(dayPlaces(v, 'shop')).toHaveLength(17);
    const first = dayPlaces(v, 'food')[0]!;
    expect(first.href).toMatch(/^#\/perto\/2026-11-01\/[a-z-]+\/food-/);
    expect(first.where).toBeTruthy();
  });

  it('09/11 sem lojas; 19/11 só paradas; 07/11 só transporte; 21/11 sem seções vazias', () => {
    expect(ids('2026-11-09')).toEqual(['paradas', 'comer', 'bairros', 'transporte', 'dicas']);
    expect(ids('2026-11-19')).toEqual(['paradas']);
    expect(ids('2026-11-07')).toEqual(['transporte']);
    expect(ids('2026-11-21')).toEqual([]);
  });

  it('nenhuma seção com contagem 0 em nenhum dia', () => {
    for (const d of destinationDates(content, 'nova-york').concat(destinationDates(content, 'orlando'), destinationDates(content, 'miami'))) {
      for (const s of daySections(view009(content, state, d), content)) expect(s.count, `${d} ${s.id}`).toBeGreaterThan(0);
    }
  });

  it('dados a revisar: 29 restaurantes de Orlando sem endereço nem mapa e os 3 mercados de 07/11', () => {
    const r = dataReview(content, state);
    expect(r.filter((x) => x.kind === 'Restaurante/café' && x.date >= '2026-11-08' && x.date <= '2026-11-17')).toHaveLength(29);
    expect(r.filter((x) => x.kind === 'Texto sem estrutura').map((x) => x.name)).toEqual(['Walmart Supercenter', 'Target', 'Publix']);
    expect(r.filter((x) => x.date < '2026-11-07')).toEqual([]);
  });
});
