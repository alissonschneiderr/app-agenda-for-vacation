// Feature 016: lugares com local para a rota e o link do Google Maps, com o conteúdo real do app.
import { describe, expect, it } from 'vitest';
import { assembleContent } from '../../scripts/build-content';
import { indexContent } from '../../src/content/load';
import { seedSuggested } from '../../src/domain/itineraries';
import { dayPlaceGroups } from '../../src/domain/notebook';
import { hasRoute, mapsQuery, routeChoices, routeSpot, routeSpots, routeUrl } from '../../src/domain/route';
import { dayView } from '../../src/domain/trip-view';
import { emptyState } from '../../src/storage/user-store';

const raw = assembleContent();
const content = indexContent(raw);
const state = seedSuggested(raw, emptyState(), new Date('2026-10-27T12:00:00Z'));
const MOTT = 'ny3-2026-11-01-08';

describe('rota entre dois lugares (feature 016)', () => {
  it('parada: nome, horário e o mesmo local do "Abrir no mapa"', () => {
    const s = routeSpot(content, state, '2026-11-01', MOTT)!;
    const place = dayView(content, state, '2026-11-01').groups.flatMap((g) => g.activities).find((a) => a.key === MOTT)!.places[0]!;
    expect(s).toMatchObject({ key: MOTT, date: '2026-11-01', group: 'paradas', name: 'Mott Street', time: '13h40' });
    expect(s.target).toBe(mapsQuery(place.mapsUrls[0]!.url));
    expect(s.target).toBe('Mott Street and Pell Street New York');
  });

  it('parada sem lugar do roteiro, com ponto do guia: "lat,lng", como o "Como chegar"', () => {
    const a = dayView(content, state, '2026-11-11').groups.flatMap((g) => g.activities).find((x) => x.trackable && !x.places[0] && x.location)!;
    expect(routeSpot(content, state, '2026-11-11', a.key)!.target).toBe(`${a.location!.lat},${a.location!.lng}`);
  });

  it('sem local no roteiro, sem rota: "Compras no SoHo" e as atrações dos parques sem link de mapa', () => {
    expect(routeSpot(content, state, '2026-11-01', 'ny3-2026-11-01-05')).toBeNull();
    expect(hasRoute(content, state, '2026-11-01', 'ny3-2026-11-01-05')).toBe(false);
    expect(routeSpot(content, state, '2026-11-08', 'orl1-2026-11-08-02')).toBeNull();
  });

  it('restaurantes, lojas e curiosidades com link de mapa; sem link, nada', () => {
    const v = dayView(content, state, '2026-11-01');
    const cabra = routeSpot(content, state, '2026-11-01', 'food-la-cabra-soho')!;
    expect(cabra).toMatchObject({ group: 'comer', name: 'La Cabra SoHo', address: '284 Lafayette St' });
    expect(cabra.time).toBeUndefined();
    const shop = v.places.find((p) => p.kind === 'shop' && p.mapsUrls.length)!;
    expect(routeSpot(content, state, '2026-11-01', shop.id)!.group).toBe('lojas');
    const screen = dayView(content, state, '2026-11-18').places.find((p) => p.kind === 'screen' && p.mapsUrls.length)!;
    expect(routeSpot(content, state, '2026-11-18', screen.id)!.group).toBe('curiosidades');
    const noMap = v.places.find((p) => p.kind !== 'attraction' && !p.mapsUrls.length)!;
    expect(routeSpot(content, state, '2026-11-01', noMap.id)).toBeNull();
  });

  it('Nova York: dias em ordem; paradas na ordem do roteiro, depois comer, lojas e curiosidades; sem repetidos', () => {
    const days = routeSpots(content, state, 'nova-york');
    expect(days.map((d) => d.date)).toEqual(['2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06']);
    const d1 = days[1]!.spots;
    const order = ['paradas', 'comer', 'lojas', 'curiosidades'];
    expect(d1.map((s) => order.indexOf(s.group))).toEqual([...d1.map((s) => order.indexOf(s.group))].sort((a, b) => a - b));
    expect(d1.filter((s) => s.group === 'paradas').map((s) => s.key)[0]).toBe('ny3-2026-11-01-03');
    const firstFood = dayPlaceGroups(dayView(content, state, '2026-11-01'), 'food').flatMap((g) => g.items).find((p) => p.mapUrl)!;
    expect(d1.find((s) => s.group === 'comer')!.key).toBe(firstFood.id);
    for (const d of days) expect(new Set(d.spots.map((s) => s.target)).size).toBe(d.spots.length);
    const attractionIds = new Set(dayView(content, state, '2026-11-01').places.filter((p) => p.kind === 'attraction').map((p) => p.id));
    expect(d1.some((s) => attractionIds.has(s.key))).toBe(false);
  });

  it('dia de troca de cidade: cada dia numa cidade só; 18/11 é de Miami (dona do roteiro do dia)', () => {
    expect(routeSpots(content, state, 'orlando').map((d) => d.date)).not.toContain('2026-11-18');
    expect(routeSpots(content, state, 'miami').map((d) => d.date)).toContain('2026-11-18');
    const all = (['nova-york', 'orlando', 'miami'] as const).flatMap((c) => routeSpots(content, state, c).map((d) => d.date));
    expect(new Set(all).size).toBe(all.length);
  });

  it('escolhas: só o dia, sem a origem; com outros dias, o dia da origem primeiro', () => {
    const origin = routeSpot(content, state, '2026-11-01', MOTT)!;
    const day = routeChoices(content, state, origin, false);
    expect(day.map((d) => d.date)).toEqual(['2026-11-01']);
    expect(day[0]!.spots.some((s) => s.key === MOTT || s.target === origin.target)).toBe(false);
    const all = routeChoices(content, state, origin, true);
    expect(all.map((d) => d.date)).toEqual(['2026-11-01', '2026-10-31', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06']);
  });

  it('Miami 19/11: só lugares de Miami', () => {
    const s = routeSpots(content, state, 'miami').find((d) => d.date === '2026-11-19')!.spots[0]!;
    const all = routeChoices(content, state, s, true);
    const miamiDates = new Set(routeSpots(content, state, 'miami').map((d) => d.date));
    for (const d of all) expect(miamiDates.has(d.date)).toBe(true);
    expect(hasRoute(content, state, s.date, s.key)).toBe(true);
  });

  it('link da rota: origem e destino, sem meio de transporte', () => {
    const a = routeSpot(content, state, '2026-11-01', MOTT)!;
    const b = routeSpot(content, state, '2026-11-01', 'food-la-cabra-soho')!;
    expect(routeUrl(a, b)).toBe(
      `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(a.target)}&destination=${encodeURIComponent(b.target)}`,
    );
    expect(routeUrl(a, b)).not.toContain('travelmode');
  });
});
