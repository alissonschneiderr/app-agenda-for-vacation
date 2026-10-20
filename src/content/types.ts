// Tipos do conteúdo do guia, conforme specs/001-tourist-guide-itineraries/data-model.md.

export type DateStr = string; // YYYY-MM-DD
export type CityId = 'nova-york' | 'orlando' | 'miami';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface City {
  id: CityId;
  name: string;
  timeZone: string;
  center: LatLng;
}

export interface TripLeg {
  cityId: CityId;
  arrive: DateStr;
  depart: DateStr;
}

export interface Category {
  id: string;
  name: string;
}

export interface Interval {
  open: string; // HH:MM
  close: string; // HH:MM; menor que open = passa da meia-noite
}

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type WeeklyHours = Record<Weekday, Interval[]> & {
  exceptions?: Record<DateStr, Interval[] | 'closed'>;
};

export type OpeningHours = WeeklyHours | '24h' | 'see-official';

export interface Photo {
  src: string;
  alt: string;
  author: string;
  license: string;
  licenseUrl: string | null;
  sourceUrl: string;
}

export interface Point {
  id: string;
  cityId: CityId;
  categoryId: string;
  name: string;
  summary: string;
  description: string;
  address: string;
  location: LatLng;
  openingHours: OpeningHours;
  price: string;
  officialUrl: string | null;
  photos: Photo[];
  status: 'active' | 'temporarily-closed';
  verifiedAt: DateStr;
}

export interface SuggestedItinerary {
  id: string;
  date: DateStr;
  title: string;
  notes?: string;
  pointIds: string[];
}

export interface Content {
  version: string;
  cities: City[];
  trip: TripLeg[];
  categories: Category[];
  points: Point[];
  suggestedItineraries: SuggestedItinerary[];
}
