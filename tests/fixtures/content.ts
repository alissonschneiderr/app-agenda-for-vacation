import type { Content, Point, WeeklyHours } from '../../src/content/types';

const nine2five: WeeklyHours = {
  mon: [{ open: '10:00', close: '17:00' }],
  tue: [{ open: '10:00', close: '17:00' }],
  wed: [],
  thu: [{ open: '10:00', close: '17:00' }],
  fri: [{ open: '10:00', close: '21:00' }],
  sat: [{ open: '10:00', close: '17:00' }],
  sun: [{ open: '10:00', close: '17:00' }],
};

function point(p: Partial<Point> & Pick<Point, 'id' | 'cityId' | 'name'>): Point {
  return {
    categoryId: 'museu',
    summary: `Resumo de ${p.name}`,
    description: `Descrição de ${p.name}.\n\nSegundo parágrafo.`,
    address: `Endereço de ${p.name}`,
    location: { lat: 40.7794, lng: -73.9632 },
    openingHours: nine2five,
    price: 'US$ 30 adulto',
    officialUrl: 'https://example.org/',
    photos: [
      {
        src: `photos/${p.id}-1.webp`,
        alt: `Foto de ${p.name}`,
        author: 'Fulano',
        license: 'CC BY-SA 4.0',
        licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:X.jpg',
      },
    ],
    status: 'active',
    verifiedAt: '2026-10-20',
    ...p,
  };
}

export function fixtureContent(): Content {
  return {
    version: '2026-10-20T00:00:00Z',
    cities: [
      { id: 'nova-york', name: 'Nova York', timeZone: 'America/New_York', center: { lat: 40.75, lng: -73.98 } },
      { id: 'orlando', name: 'Orlando', timeZone: 'America/New_York', center: { lat: 28.41, lng: -81.48 } },
      { id: 'miami', name: 'Miami', timeZone: 'America/New_York', center: { lat: 25.79, lng: -80.15 } },
    ],
    trip: [
      { cityId: 'nova-york', arrive: '2026-10-31', depart: '2026-11-07' },
      { cityId: 'orlando', arrive: '2026-11-07', depart: '2026-11-18' },
      { cityId: 'miami', arrive: '2026-11-18', depart: '2026-11-21' },
    ],
    categories: [
      { id: 'museu', name: 'Museu' },
      { id: 'parque', name: 'Parque' },
      { id: 'parque-tematico', name: 'Parque temático' },
      { id: 'praia', name: 'Praia' },
    ],
    points: [
      point({ id: 'ny-met', cityId: 'nova-york', name: 'The Metropolitan Museum of Art' }),
      point({ id: 'ny-moma', cityId: 'nova-york', name: 'Museum of Modern Art (MoMA)', location: { lat: 40.7614, lng: -73.9776 } }),
      point({
        id: 'ny-central-park',
        cityId: 'nova-york',
        name: 'Central Park',
        categoryId: 'parque',
        openingHours: '24h',
        price: 'Gratuito',
        location: { lat: 40.7812, lng: -73.9665 },
      }),
      point({
        id: 'ny-sao-pedro',
        cityId: 'nova-york',
        name: 'Igreja São Pedro',
        categoryId: 'parque',
        status: 'temporarily-closed',
        location: { lat: 40.7578, lng: -73.9719 },
      }),
      point({
        id: 'orl-magic-kingdom',
        cityId: 'orlando',
        name: 'Magic Kingdom Park',
        categoryId: 'parque-tematico',
        openingHours: 'see-official',
        location: { lat: 28.4177, lng: -81.5812 },
      }),
      point({
        id: 'mia-south-beach',
        cityId: 'miami',
        name: 'South Beach',
        categoryId: 'praia',
        openingHours: '24h',
        price: 'Gratuito',
        location: { lat: 25.7826, lng: -80.1341 },
      }),
    ],
    suggestedItineraries: [
      { id: 'sug-2026-11-01', date: '2026-11-01', title: 'Museus e Central Park', notes: 'Comece cedo.', pointIds: ['ny-met', 'ny-central-park'] },
      { id: 'sug-2026-11-08', date: '2026-11-08', title: 'Magic Kingdom', pointIds: ['orl-magic-kingdom'] },
    ],
    fullItineraries: [],
  };
}

/** Storage em memória que pode simular quota cheia. */
export class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  failWrites = false;
  get length() {
    return this.data.size;
  }
  clear() {
    this.data.clear();
  }
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  key(i: number) {
    return [...this.data.keys()][i] ?? null;
  }
  removeItem(k: string) {
    this.data.delete(k);
  }
  setItem(k: string, v: string) {
    if (this.failWrites) throw new DOMException('cheio', 'QuotaExceededError');
    this.data.set(k, v);
  }
  keys() {
    return [...this.data.keys()];
  }
}
