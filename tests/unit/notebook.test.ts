// Feature 008 (T008): modelos das telas do caderno de viagem, com o conteúdo real do app.
import { describe, expect, it } from 'vitest';
import { assembleContent } from '../../scripts/build-content';
import { indexContent } from '../../src/content/load';
import { seedSuggested } from '../../src/domain/itineraries';
import { cityCard, dataReview, dayCard, dayMoves, dayPlaceGroups, dayPlaces, daySections, dayTips, isGenericTip, isRelevantMove, sectionReview, shoppingSlice, neighborhoods, peopleOf, stopThumb, tripCover } from '../../src/domain/notebook';
import { dayView as view009, destinationDates } from '../../src/domain/trip-view';
import { emptyState } from '../../src/storage/user-store';

const raw = assembleContent();
const content = indexContent(raw);
const state = seedSuggested(raw, emptyState(), new Date('2026-10-27T12:00:00Z'));
const central = content.pointsById.get('ny-central-park')!;

describe('caderno de viagem — modelos (feature 008)', () => {
  it('capa da viagem antes do embarque: faltam 4 dias, 2 pessoas, 31/10 a 21/11, 3 cidades', () => {
    const c = tripCover(content, '2026-10-27');
    expect(c).toMatchObject({ phase: 'before', daysLeft: 4, people: 2, start: '2026-10-31', end: '2026-11-21', cities: 3, totalDays: 22 });
    expect(c.photo?.src).toBe(central.photos[0]!.src);
    expect(c.dayNumber).toBeUndefined();
  });

  it('capa da viagem durante: dia n de 22', () => {
    expect(tripCover(content, '2026-11-01')).toMatchObject({ phase: 'during', dayNumber: 2 });
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
    expect(d).toMatchObject({ kind: 'walk', cityId: 'nova-york' }); // feature 013: sem dayNumber no card
    expect(d.photo?.src).toBe(soho.photo!.src);
    const t = dayCard(content, state, '2026-11-07');
    expect(t.title).toBe('Nova York → Orlando');
    expect(t.route).toEqual({ from: 'nova-york', to: 'orlando' });
    expect(dayCard(content, state, '2026-11-21').title).toBe('Miami → casa');
    // Feature 012: o dia de viagem com dia do roteiro (18/11) usa o título do documento; a rota fica em `route`.
    expect(dayCard(content, state, '2026-11-18')).toMatchObject({ title: 'Chegada · South Beach · Ocean Drive', kind: 'transit', route: { from: 'orlando', to: 'miami' } });
    expect(dayCard(content, state, '2026-11-19').title).toBe('Compras na Sawgrass Mills'); // feature 012
  });

  it('miniatura: nunca a foto da cidade nem a do parque herdado (atração sem foto própria)', () => {
    const epcot = dayCard(content, state, '2026-11-10').view;
    const luminous = epcot.groups[0]!.activities.find((a) => a.title === 'Luminous: The Symphony of Us')!;
    expect(luminous.point?.id).toBe('orl-epcot');
    expect(stopThumb(luminous)).toBeUndefined();
    const tower = dayCard(content, state, '2026-11-09').view.groups[0]!.activities.find((a) => a.title === 'Tower of Terror')!;
    expect(stopThumb(tower)?.src).toMatch(/photos\/doc\/orlando\//);
  });

  it('bairros de Orlando: só Cocoa Beach (feature 013: parques, outlets e "Manhã livre" não são bairro)', () => {
    const n = neighborhoods(content, state, 'orlando');
    for (const card of n) expect(card).not.toHaveProperty('counts'); // feature 015
    expect(n.map((x) => x.name)).toEqual(['Cocoa Beach']);
    expect(n[0]).toMatchObject({ date: '2026-11-13', areaId: 'cocoa-beach' });
  });

});

// ---------- feature 009: seções do dia, lugares e dados a revisar ----------

describe('seções do dia (feature 009)', () => {
  const ids = (d: string) => daySections(view009(content, state, d), content).map((s) => s.id);

  it('01/11: as 6 seções, na ordem; 24 restaurantes e cafés e 17 lojas', () => {
    expect(ids('2026-11-01')).toEqual(['paradas', 'comer', 'lojas', 'curiosidades', 'bairros', 'transporte', 'dicas']);
    const v = view009(content, state, '2026-11-01');
    expect(dayPlaces(v, 'food')).toHaveLength(24);
    expect(dayPlaces(v, 'shop')).toHaveLength(17);
    const first = dayPlaces(v, 'food')[0]!;
    expect(first.href).toMatch(/^#\/perto\/2026-11-01\/[a-z-]+\/food-/);
    expect(first.where).toBeTruthy();
  });

  it('09/11 sem lojas; 19/11 com o roteiro de Miami; 07/11 só transporte; 21/11 sem seções vazias', () => {
    expect(ids('2026-11-09')).toEqual(['paradas', 'comer', 'dicas']); // feature 013: Hollywood Studios não é bairro
    expect(ids('2026-11-19')).toEqual(['paradas', 'comer', 'lojas', 'transporte']); // feature 012; 013: Sawgrass não é bairro
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

// ---------- feature 010: grupos por bairro ----------

const allDates = () => destinationDates(content, 'nova-york').concat(destinationDates(content, 'orlando'), destinationDates(content, 'miami'));

describe('grupos por bairro (feature 010, R1/R2)', () => {
  const v01 = view009(content, state, '2026-11-01');

  it('01/11: comer em 6 grupos na ordem do roteiro; lojas em 4; curiosidades 5 em 4', () => {
    const food = dayPlaceGroups(v01, 'food');
    expect(food.map((g) => g.name)).toEqual(['SoHo', 'Nolita', 'Chinatown', 'Little Italy', 'Lower East Side', 'East Village']);
    expect(food.map((g) => g.items.length)).toEqual([2, 4, 6, 3, 4, 5]);
    const shop = dayPlaceGroups(v01, 'shop');
    expect(shop.map((g) => g.name)).toEqual(['SoHo', 'Nolita', 'Lower East Side', 'East Village']);
    expect(shop.flatMap((g) => g.items)).toHaveLength(17);
    const screen = dayPlaceGroups(v01, 'screen');
    expect(screen).toHaveLength(4);
    expect(screen.flatMap((g) => g.items)).toHaveLength(5);
  });

  it('06/11: cabeçalho = nome do grupo do roteiro; bloco da noite não é bairro (Q2 = A)', () => {
    const g = dayPlaceGroups(view009(content, state, '2026-11-06'), 'food');
    expect(g.map((x) => x.name)).toEqual(['Empire State e arredores (Midtown South)', 'Noite: jantar no Harlem']);
    expect(g.map((x) => x.isNeighborhood)).toEqual([true, false]);
  });

  it('nenhum grupo repetido, vazio ou "Outros" em nenhum dia; dayPlaces = grupos achatados', () => {
    for (const d of allDates()) {
      const v = view009(content, state, d);
      for (const k of ['food', 'shop', 'screen'] as const) {
        const gs = dayPlaceGroups(v, k);
        expect(new Set(gs.map((g) => g.name)).size, `${d} ${k}`).toBe(gs.length);
        expect(gs.every((g) => g.items.length > 0 && g.areaId !== null), `${d} ${k}`).toBe(true);
        expect(dayPlaces(v, k)).toEqual(gs.flatMap((g) => g.items));
      }
    }
  });

  it('lugar fora de qualquer grupo vai para "Outros", no fim; lugar em dois grupos fica no primeiro', () => {
    const v = structuredClone(v01);
    const soho = v.areas.find((a) => a.name === 'SoHo')!;
    const nolita = v.areas.find((a) => a.name === 'Nolita')!;
    const sohoFood = v.places.find((p) => p.kind === 'food' && soho.placeIds.includes(p.id))!;
    nolita.placeIds = [sohoFood.id, ...nolita.placeIds];
    v.places.push({ ...sohoFood, id: 'food-solto', name: 'Lugar solto' });
    const g = dayPlaceGroups(v, 'food');
    expect(g.at(-1)).toMatchObject({ areaId: null, name: 'Outros', isNeighborhood: false });
    expect(g.at(-1)!.items.map((i) => i.name)).toEqual(['Lugar solto']);
    expect(g.find((x) => x.name === 'Nolita')!.items.map((i) => i.name)).not.toContain(sohoFood.name);
  });
});

describe('Transporte só com o que não é a pé (feature 010, R3, Q1 = A)', () => {
  it('isRelevantMove: metrô, ferry, carro, monotrilho, táxi sim; horário de parque e a pé não', () => {
    for (const t of [
      'metrô 6 na estação 51 St até Bleecker St (~15 min)',
      'NYC Ferry, rota East River, do píer Dumbo/Fulton Ferry até North Williamsburg',
      '~1h de carro até o Kennedy Space Center.',
      'do estacionamento até a entrada é preciso pegar monotrilho ou barca (~20 a 30 min)',
      'táxi (~15 min) ou 10 minutos a pé até Times Square e metrô 7',
    ])
      expect(isRelevantMove(t), t).toBe(true);
    for (const t of [
      'o parque abre às 9h (hóspedes Disney às 8h30) e fecha às 21h.',
      '5 minutos a pé pela Prince Street, para o leste.',
      'até o MoMA, na rua 53 entre a 5th e a 6th Avenue (~15 min).',
      'Contem com 45 a 90 minutos entre imigração e malas',
      '15 minutos a pé pela Avenue A, para o norte (ou táxi de 5 minutos).',
    ])
      expect(isRelevantMove(t), t).toBe(false);
  });

  it('dayMoves: 01/11 só o metrô 6; 04/11 metrô e ferry; 13/11 carro; 31/10 e 09/11 nada', () => {
    const n = (d: string) => dayMoves(view009(content, state, d));
    expect(n('2026-11-01').map((m) => m.text)).toEqual([expect.stringContaining('metrô 6')]);
    // 02/11: a caminhada por Tribeca (título "a pé") cita o metrô 1 só como plano B — fica fora.
    expect(n('2026-11-02').map((m) => m.text)).toEqual([expect.stringContaining('metrô E')]);
    expect(n('2026-11-04')).toHaveLength(2);
    expect(n('2026-11-04')[1]!.text).toContain('NYC Ferry');
    // 13/11 (feature 011): só o carro até Cocoa Beach.
    expect(n('2026-11-13').map((m) => m.text)).toEqual([expect.stringMatching(/Cocoa Beach.*carro/)]);
    expect(n('2026-10-31')).toEqual([]);
    expect(n('2026-11-09')).toEqual([]);
  });

  it('seção Transporte: sai em 31/10 e nos dias de parque só com horário; fica nos outros', () => {
    const has = (d: string) => daySections(view009(content, state, d), content).some((s) => s.id === 'transporte');
    for (const d of ['2026-10-31', '2026-11-09', '2026-11-10', '2026-11-12', '2026-11-14', '2026-11-15', '2026-11-17']) expect(has(d), d).toBe(false);
    for (const d of ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-13', '2026-11-18']) expect(has(d), d).toBe(true);
  });
});

describe('atração de compras com as lojas do bairro (feature 010, R7)', () => {
  const act = (d: string, title: string) => {
    const v = view009(content, state, d);
    return { v, a: v.groups.flatMap((g) => g.activities).find((x) => x.title === title)! };
  };

  it('SoHo 5, Nolita 4, Williamsburg 5 — os mesmos itens da seção do dia', () => {
    for (const [d, t, name, n] of [
      ['2026-11-01', 'Compras no SoHo', 'SoHo', 5],
      ['2026-11-01', 'Compras na Elizabeth e na Mott Street', 'Nolita', 4],
      ['2026-11-04', 'Compras na Bedford Avenue', 'Williamsburg', 5],
    ] as const) {
      const { v, a } = act(d, t);
      const slice = shoppingSlice(v, a)!;
      expect(slice.name, t).toBe(name);
      expect(slice.items, t).toHaveLength(n);
      expect(slice).toEqual(dayPlaceGroups(v, 'shop').find((g) => g.areaId === a.areaId));
    }
  });

  it('sem lojas no roteiro (outlets de Orlando): nada', () => {
    const o = act('2026-11-11', 'Compras (tarde)');
    expect(shoppingSlice(o.v, o.a)).toBeUndefined();
  });

  it('Sawgrass (feature 012): as compras da Colonnade e da ala principal mostram as 5 categorias do dia', () => {
    for (const t of ['The Colonnade Outlets', 'Ala principal']) {
      const { v, a } = act('2026-11-19', t);
      const slice = shoppingSlice(v, a)!;
      expect(slice.name, t).toBe('Sawgrass Mills');
      expect(slice.items.map((i) => i.name), t).toEqual(['Esporte', 'Roupas e jeans', 'Lojas de departamento com desconto', 'Garimpo barato', 'Beleza e casa']);
    }
  });
});

describe('Dicas só com o que muda o planejamento (feature 010, R4)', () => {
  it('as 10 dicas reais ficam; genéricas saem; com hora, fica', () => {
    const real = raw.fullItineraries!.flatMap((f) => f.days.flatMap((d) => d.alerts ?? []));
    expect(real).toHaveLength(10);
    for (const a of real) expect(isGenericTip(a.html), a.html).toBe(false);
    for (const h of ['<p>Usem sapatos confortáveis e aproveitem o passeio.</p>', '<p>Caminhem a pé e aproveitem.</p>', '<p>Levem água.</p>']) expect(isGenericTip(h), h).toBe(true);
    expect(isGenericTip('<p>Levem água: o parque não vende garrafa depois das 18h.</p>')).toBe(false);
  });

  it('dia só com dicas genéricas: dayTips vazio e sem a seção Dicas', () => {
    const v = structuredClone(view009(content, state, '2026-11-01'));
    v.fullDay!.alerts = [{ id: 'g1', html: '<p>Usem sapatos confortáveis.</p>' }];
    expect(dayTips(v)).toEqual([]);
    expect(daySections(v, content).map((s) => s.id)).not.toContain('dicas');
    expect(dayTips(view009(content, state, '2026-11-01'))).toHaveLength(1);
  });
});

describe('relatório da feature 010 (R6)', () => {
  const r = sectionReview(content, state);
  const by = (d: string) => r.find((x) => x.date === d);

  it('Transporte sai em 31/10, nos dias de parque só com horário e nos dias de outlet só com o mapa', () => {
    expect(r.filter((x) => x.removed.includes('transporte')).map((x) => x.date)).toEqual([
      '2026-10-31', '2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-14', '2026-11-15', '2026-11-16', '2026-11-17',
      '2026-11-20', // feature 012: o dia de praia em Miami é todo a pé
    ]);
    expect(r.some((x) => x.removed.includes('dicas'))).toBe(false);
  });

  it('nenhuma dica cortada; trechos descartados com o texto do roteiro', () => {
    expect(r.flatMap((x) => x.cutTips)).toEqual([]);
    expect(by('2026-11-01')!.droppedMoves).toContain('Deslocamento para Nolita: 5 minutos a pé pela Prince Street, para o leste.');
    expect(by('2026-11-09')!.droppedMoves[0]).toMatch(/^chegada ao estacionamento: o parque abre às 9h/);
  });

  it('cabeçalhos que não são bairros: os blocos da noite de 02/11, 05/11 e 06/11; nada incerto', () => {
    expect(r.flatMap((x) => x.nonNeighborhoodGroups.map((g) => `${x.date} ${g.name}`))).toEqual([
      '2026-11-02 Noite: Knicks x Nets no Madison Square Garden (19h30)',
      '2026-11-05 Noite: MJ The Musical (19h00, Neil Simon Theatre)',
      '2026-11-06 Noite: jantar no Harlem',
    ]);
    expect(r.flatMap((x) => x.uncertain)).toEqual([]);
  });
});

describe('Paradas num dia sem nada a marcar (feature 011)', () => {
  it('13/11: a seção Paradas existe mesmo sem parada marcável', () => {
    const v = view009(content, state, '2026-11-13');
    expect(v.groups.flatMap((g) => g.activities).filter((a) => a.trackable)).toHaveLength(0);
    expect(daySections(v, content).map((s) => s.id)).toEqual(['paradas', 'bairros', 'transporte']);
  });
});

describe('só bairros de verdade (feature 013, US3, Q1 = A)', () => {
  const names = (c: 'nova-york' | 'orlando' | 'miami') => neighborhoods(content, state, c).map((n) => n.name);

  it('Nova York: sem parques, museus nem a ponte, na ordem dos dias', () => {
    expect(names('nova-york')).toEqual([
      'Midtown',
      'SoHo', 'Nolita', 'Chinatown', 'Little Italy', 'Lower East Side', 'East Village',
      'Financial District', 'Greenwich Village', 'West Village',
      'Upper West Side', 'Upper East Side',
      'Brooklyn Heights', 'DUMBO', 'Williamsburg',
      'Hudson Yards', 'Chelsea', 'Meatpacking District',
      'Empire State e arredores (Midtown South)',
    ]);
  });

  it('Miami: South Beach (Art Deco District), do 18/11 — que antes ficava de fora (bug da 012)', () => {
    expect(neighborhoods(content, state, 'miami').map((n) => [n.date, n.name])).toEqual([['2026-11-18', 'South Beach (Art Deco District)']]);
  });

  it('o item "Bairros" do menu só aparece com bairro; a contagem bate com a lista em todos os dias', () => {
    const has = (d: string) => daySections(view009(content, state, d), content).some((s) => s.id === 'bairros');
    for (const d of ['2026-11-08', '2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-14', '2026-11-15', '2026-11-16', '2026-11-17', '2026-11-19', '2026-11-20']) expect(has(d), d).toBe(false);
    for (const d of ['2026-11-03', '2026-11-13', '2026-11-18']) expect(has(d), d).toBe(true);
    // Cada dia é comparado com a lista da cidade dona do roteiro daquele dia (o 18/11 é de Miami).
    const all = (['nova-york', 'orlando', 'miami'] as const).flatMap((c) => neighborhoods(content, state, c));
    for (const city of ['nova-york', 'orlando', 'miami'] as const) {
      for (const d of destinationDates(content, city)) {
        const count = daySections(view009(content, state, d), content).find((s) => s.id === 'bairros')?.count ?? 0;
        expect(count, `${city} ${d}`).toBe(all.filter((n) => n.date === d).length);
      }
    }
  });
});
