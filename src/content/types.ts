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
  fullItineraries: FullItinerary[];
}

// Roteiro FULL (feature 002), conforme specs/002-nyc-full-itinerary/data-model.md.

export interface Place {
  name: string;
  address: string;
  location?: LatLng;
}

export interface Commitment {
  id: string;
  date: DateStr;
  time: string; // HH:MM
  arriveBy: string; // HH:MM, ≤ time − 30 min
  title: string;
  place: Place;
}

export type Fact =
  | { text: string; status: 'confirmed'; source: string; checkedAt: DateStr }
  | { text: string; status: 'unconfirmed'; note: string };

export interface Meal {
  kind: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  order: string;
  why: string;
  priceRange: string;
}

export interface Shop {
  kind: 'thrift' | 'vintage' | 'independent' | 'designer' | 'tech';
  why: string;
  justification?: string;
}

export interface ScreenLocation {
  work: string;
  kind: 'setting' | 'filming' | 'both';
  access: 'inside' | 'outside';
  association: string;
  address: string;
}

export interface Transit {
  mode: 'walk' | 'subway' | 'bus' | 'taxi' | 'airtrain' | 'ferry';
  from: string;
  to: string;
  minutes: number;
  lines?: string;
  cost?: string;
}

export type ActivityType = 'attraction' | 'meal' | 'shopping' | 'screen' | 'transit' | 'rest' | 'commitment' | 'hotel';
export type Priority = 'essential' | 'important' | 'optional';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  start: string; // HH:MM
  durationMin: number;
  place?: Place;
  description: string;
  priority: Priority;
  booking: { required: boolean; how?: string; price?: string };
  facts: Fact[];
  pointId?: string;
  meal?: Meal;
  shop?: Shop;
  screen?: ScreenLocation[];
  transit?: Transit;
  earlyReason?: string;
  commitmentId?: string;
}

export interface Alternative {
  when: 'rain' | 'tired' | 'closed';
  text: string;
}

export interface FullDay {
  date: DateStr;
  region: string;
  goal: string;
  events: string[];
  activities: Activity[];
  returnToHotel: string;
  alternatives: Alternative[];
}

export interface ChecklistItem {
  what: string;
  forDate: DateStr;
  deadline: DateStr;
  link?: string;
  activityId?: string;
}

export interface FullItinerary {
  id: string;
  cityId: CityId;
  title: string;
  travelers: string;
  base: Place;
  arrival: { airport: string; date: DateStr; time: string };
  commitments: Commitment[];
  days: FullDay[];
  checklist: ChecklistItem[];
  practicalTips: { topic: string; text: string }[];
  excluded: { name: string; reason: string }[];
  updatedAt: DateStr;
}
