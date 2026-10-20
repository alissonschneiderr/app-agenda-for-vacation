import type { Activity, FullDay, FullItinerary, Place } from '../../src/content/types';
import { NY_DATES } from '../../scripts/full-itinerary-schema';

export const BASE: Place = {
  name: 'POD 51',
  address: '230 East 51st Street, New York, NY 10022',
  location: { lat: 40.7553, lng: -73.9686 },
};
const place = (name: string, lat = 40.75, lng = -73.98): Place => ({ name, address: `${name}, New York, NY`, location: { lat, lng } });

type Partial = Omit<Activity, 'id' | 'facts' | 'booking' | 'priority' | 'description'> &
  Partial2<Pick<Activity, 'facts' | 'booking' | 'priority' | 'description'>>;
type Partial2<T> = { [K in keyof T]?: T[K] };

function build(date: string, items: Partial[]): Activity[] {
  return items.map((a, i) => ({
    description: `Descrição de ${a.title}`,
    priority: 'important',
    booking: { required: false },
    facts: [],
    ...a,
    id: `ny-${date}-${String(i + 1).padStart(2, '0')}`,
  }));
}

const walk = (start: string, minutes: number, from: string, to: string): Partial => ({
  type: 'transit',
  title: `Caminhar até ${to}`,
  start,
  durationMin: minutes,
  transit: { mode: 'walk', from, to, minutes },
});

/** Manhã e tarde padrão: hotel → café → atração → almoço → série → compras → lanche → hotel. */
function core(date: string, tag: string, restMin = 60): Partial[] {
  return [
    { type: 'meal', title: `Café ${tag}`, start: '09:40', durationMin: 40, place: place(`Café ${tag}`), meal: { kind: 'breakfast', order: 'Bagel', why: 'Clássico', priceRange: 'US$ 10–15' } },
    walk('10:20', 10, `Café ${tag}`, `Atração ${tag}`),
    {
      type: 'attraction',
      title: `Atração ${tag}`,
      start: '10:30',
      durationMin: 90,
      place: place(`Atração ${tag}`),
      priority: 'essential',
      facts: [{ text: 'Abre às 10h', status: 'confirmed', source: 'https://example.org/', checkedAt: '2026-10-21' }],
    },
    walk('12:00', 10, `Atração ${tag}`, `Almoço ${tag}`),
    { type: 'meal', title: `Almoço ${tag}`, start: '12:10', durationMin: 60, place: place(`Almoço ${tag}`), meal: { kind: 'lunch', order: 'Pastrami', why: 'Histórico', priceRange: 'US$ 25–35' } },
    walk('13:10', 15, `Almoço ${tag}`, `Série ${tag}`),
    {
      type: 'screen',
      title: `Prédio da série ${tag}`,
      start: '13:25',
      durationMin: 30,
      place: place(`Série ${tag}`),
      screen: [{ work: 'Friends', kind: 'filming', access: 'outside', association: 'Fachada do prédio', address: '90 Bedford St, New York, NY' }],
    },
    walk('13:55', 10, `Série ${tag}`, `Loja ${tag}`),
    { type: 'shopping', title: `Brechó ${tag}`, start: '14:05', durationMin: 90, place: place(`Loja ${tag}`), shop: { kind: 'thrift', why: 'Peças únicas' }, priority: 'optional' },
    walk('15:35', 10, `Loja ${tag}`, `Lanche ${tag}`),
    {
      type: 'meal',
      title: `Lanche ${tag}`,
      start: '15:45',
      durationMin: 30,
      place: place(`Lanche ${tag}`),
      meal: { kind: 'snack', order: 'Cookie', why: 'Famoso', priceRange: 'US$ 5–8' },
      facts: [{ text: 'Preço não encontrado', status: 'unconfirmed', note: 'site sem preço' }],
    },
    { type: 'transit', title: 'Metrô até o hotel', start: '16:15', durationMin: 15, transit: { mode: 'subway', from: `Lanche ${tag}`, to: 'POD 51', minutes: 15, lines: '6', cost: 'US$ 3,00' } },
    { type: 'rest', title: 'Descanso no hotel', start: '16:30', durationMin: restMin, place: BASE },
  ];
}

function evening(date: string, tag: string, commitment?: { id: string; title: string; place: Place }): Partial[] {
  if (commitment) {
    return [
      walk('17:00', 10, 'POD 51', `Jantar ${tag}`),
      { type: 'meal', title: `Jantar ${tag}`, start: '17:10', durationMin: 40, place: place(`Jantar ${tag}`), meal: { kind: 'dinner', order: 'Pizza', why: 'Perto', priceRange: 'US$ 15–25' } },
      { type: 'transit', title: `Metrô até ${commitment.place.name}`, start: '17:50', durationMin: 15, transit: { mode: 'subway', from: `Jantar ${tag}`, to: commitment.place.name, minutes: 15 } },
      { type: 'commitment', title: commitment.title, start: '18:05', durationMin: 180, place: commitment.place, priority: 'essential', commitmentId: commitment.id },
      { type: 'transit', title: 'Táxi até o hotel', start: '21:05', durationMin: 20, transit: { mode: 'taxi', from: commitment.place.name, to: 'POD 51', minutes: 20 } },
      { type: 'hotel', title: 'Volta ao hotel', start: '21:25', durationMin: 15, place: BASE },
    ];
  }
  return [
    walk('17:30', 15, 'POD 51', `Jantar ${tag}`),
    { type: 'meal', title: `Jantar ${tag}`, start: '17:45', durationMin: 75, place: place(`Jantar ${tag}`), meal: { kind: 'dinner', order: 'Pizza', why: 'Clássico', priceRange: 'US$ 15–25' } },
    walk('19:00', 15, `Jantar ${tag}`, 'POD 51'),
    { type: 'hotel', title: 'Volta ao hotel', start: '19:15', durationMin: 15, place: BASE },
  ];
}

const KNICKS: Place = { name: 'Madison Square Garden', address: '4 Penn Plaza, New York, NY 10001', location: { lat: 40.7505, lng: -73.9934 } };
const NEIL_SIMON: Place = { name: 'Neil Simon Theatre', address: '250 West 52nd Street, New York, NY 10019', location: { lat: 40.7627, lng: -73.9839 } };

export function fixtureDay(date: string): FullDay {
  const tag = date.slice(5);
  const commitment =
    date === '2026-11-02'
      ? { id: 'knicks-nets', title: 'New York Knicks x Brooklyn Nets', place: KNICKS }
      : date === '2026-11-04'
        ? { id: 'mj-musical', title: 'MJ The Musical', place: NEIL_SIMON }
        : undefined;
  const start: Partial[] =
    date === '2026-10-31'
      ? [
          { type: 'rest', title: 'Desembarque, imigração e bagagem', start: '06:30', durationMin: 90, place: { name: 'Aeroporto JFK', address: 'Queens, NY 11430' } },
          { type: 'transit', title: 'Táxi até o hotel', start: '08:00', durationMin: 60, transit: { mode: 'taxi', from: 'JFK', to: 'POD 51', minutes: 60, cost: 'US$ 90–120' } },
          { type: 'hotel', title: 'Guardar malas no POD 51', start: '09:00', durationMin: 20, place: BASE },
          walk('09:20', 20, 'POD 51', `Café ${tag}`),
        ]
      : [{ type: 'hotel', title: 'Saída do hotel', start: '09:20', durationMin: 10, place: BASE }, walk('09:30', 10, 'POD 51', `Café ${tag}`)];
  return {
    date,
    region: `Região ${tag}`,
    goal: `Objetivo ${tag}`,
    events: date === '2026-11-01' ? ['Maratona de Nova York'] : [],
    activities: build(date, [...start, ...core(date, tag, commitment ? 30 : 60), ...evening(date, tag, commitment)]),
    returnToHotel: 'Metrô linha 6 até 51 St.',
    alternatives: [
      { when: 'rain', text: 'Museu coberto perto' },
      { when: 'tired', text: 'Voltar ao hotel mais cedo' },
    ],
  };
}

export function fixtureFullItinerary(): FullItinerary {
  return {
    id: 'nova-york',
    cityId: 'nova-york',
    title: 'Roteiro FULL de Nova York',
    travelers: 'Casal',
    base: BASE,
    arrival: { airport: 'JFK', date: '2026-10-31', time: '06:30' },
    commitments: [
      { id: 'knicks-nets', date: '2026-11-02', time: '19:30', arriveBy: '18:45', title: 'New York Knicks x Brooklyn Nets', place: KNICKS },
      { id: 'mj-musical', date: '2026-11-04', time: '19:00', arriveBy: '18:15', title: 'MJ The Musical', place: NEIL_SIMON },
    ],
    days: NY_DATES.map(fixtureDay),
    checklist: [{ what: 'Seguro-viagem', forDate: '2026-10-31', deadline: '2026-10-29' }],
    practicalTips: [{ topic: 'Transporte', text: 'Use o mesmo cartão no OMNY.' }],
    excluded: [{ name: 'Coney Island (brinquedos)', reason: 'Fora de temporada' }],
    updatedAt: '2026-10-21',
  };
}
