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
  /** Ponto do guia cuja foto é o destaque do destino (feature 003). */
  heroPointId: string;
  /** País, para as capas do caderno de viagem (feature 008). */
  country: string;
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

/** Tipo de dia (feature 006): muda o jeito de mostrar a linha do tempo. */
export type DayKind = 'walk' | 'beach' | 'park' | 'transit';

export interface Content {
  version: string;
  cities: City[];
  trip: TripLeg[];
  /** Tipo de cada dia da viagem (feature 006, declarado em content/trip.json). */
  dayKinds: Record<DateStr, DayKind>;
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

// 'free' (feature 005): pausa, tempo, tarde ou jantar livre — sem Feito/Pendente.
export type ActivityType = 'attraction' | 'meal' | 'shopping' | 'screen' | 'transit' | 'rest' | 'commitment' | 'hotel' | 'free';
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
  // Roteiro escrito pelo casal (feature 004): texto da tabela do documento.
  /** Horário como está no documento (ex.: "19h30–~22h00"). */
  timeLabel?: string;
  /** Coluna "Como ir". */
  how?: string;
  optional?: boolean;
  /** Duração deduzida até a próxima linha; não é exibida. */
  inferredDuration?: boolean;
  /** Ids dos lugares do dia ligados a esta linha. */
  placeIds?: string[];
  /** Bairro do doc (feature 005); null = antes do primeiro bairro (saída do hotel). */
  areaId?: string | null;
}

/** Lugar descrito no documento (feature 004): comida, loja, locação ou atração. */
export interface DocPlace {
  id: string;
  kind: 'food' | 'shop' | 'screen' | 'attraction';
  name: string;
  address?: string;
  mapsUrls: { label: string; url: string }[];
  /** Links "📷 fotos" do doc (feature 005). */
  photoUrls?: { label: string; url: string }[];
  /** 🏆 / ⭐ (feature 004) ou ☕ / 🏆 / 🍰 (feature 005). */
  level?: string;
  /** Faixa de preço em 💵 (feature 005). */
  price?: string;
  /** Foto offline do próprio lugar (feature 006). */
  photo?: Photo;
  /** Observação de fila (feature 005). */
  queue?: string;
  fields: { label: string; text: string }[];
  works?: string;
  photoTip?: string;
  access?: string;
  /** Área do parque, entre parênteses no doc (feature 007): "Adventureland". */
  land?: string;
  pointId?: string;
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
  /** Lugares do dia descritos no documento (feature 004). */
  places?: DocPlace[];
  /** Link "Mapa do dia" (feature 005). */
  mapUrl?: string;
  /** Bairros do dia, na ordem do doc (feature 005). */
  areas?: DayArea[];
  /** Avisos que valem para o dia inteiro (feature 006), um por bloco do doc. */
  alerts?: DayAlert[];
}

export interface DayAlert {
  /** "al:<data>:<n>" */
  id: string;
  html: string;
}

/** Item da partida ou da chegada, marcável no dia de transição (features 006 e 007). */
export interface DepartureItem {
  /** "tr:<data>:<n>" (partida) ou "tr:<data>:c<n>" (chegada) */
  id: string;
  label: string;
  text: string;
  block: 'before' | 'trip' | 'arrival';
}

/** Item de partida declarado no meta.json (feature 007, Q1): trecho literal do doc ou dado do casal. */
export interface DeclaredDepartureItem {
  label: string;
  /** Trecho literal da seção Partida do doc. */
  quote?: string;
  /** De onde veio a informação quando não está no doc. */
  source?: string;
}

/** Uma seção "###" de um dia do doc (feature 005). */
export interface DayArea {
  id: string;
  kind: 'bairro' | 'chegada' | 'noite' | 'ideias';
  name: string;
  photoUrls: { label: string; url: string }[];
  /** Mapa da região, quando o doc o põe ao lado das fotos (feature 012, Miami). */
  mapsUrls?: { label: string; url: string }[];
  intro?: string;
  activityIds: string[];
  placeIds: string[];
  /** Avisos e itens sem estrutura, em HTML gerado no build. */
  notesHtml?: string;
  /** Deslocamento até o próximo bairro, sem horário. */
  transfer?: string;
  /** O doc dá ao deslocamento uma seção própria ("### 🚗", feature 007): aparece na linha do tempo. */
  transferInTimeline?: boolean;
  /** Foto offline da região (feature 006). */
  photo?: Photo;
}

export interface ChecklistItem {
  /** "ck:<cidade>:<n>" (feature 007): marca de "reservado". */
  id?: string;
  what: string;
  forDate?: DateStr;
  deadline?: DateStr;
  /** Dia e horário como estão no documento. */
  when?: string;
  note?: string;
  link?: string;
  activityId?: string;
}

export interface FullItinerary {
  id: string;
  cityId: CityId;
  title: string;
  travelers: string;
  /** Hotel; ausente quando o doc não diz (Orlando, feature 007). */
  base?: Place;
  arrival: { airport: string; date: DateStr; time?: string };
  /** Prefixo dos ids das atividades (feature 007); padrão "ny3". */
  idPrefix?: string;
  /** Data cuja seção "Dia N" é a chegada num dia de locomoção (feature 007). */
  arrivalDay?: DateStr;
  /** Feature 012: chegada dentro de um dia comum (Miami, 18/11). */
  arrivalInDay?: boolean;
  /** Feature 013: nomes dos grupos do roteiro que não são bairro. */
  notNeighborhoods?: string[];
  /** Partida declarada (feature 007, Q1). */
  departure?: { date: DateStr; before: DeclaredDepartureItem[]; trip: DeclaredDepartureItem[] };
  /** Passos sem ponto próprio usam o ponto do guia da sua região (feature 007, R8). */
  stepsUseAreaPoint?: boolean;
  commitments: Commitment[];
  days: FullDay[];
  checklist: ChecklistItem[];
  practicalTips: { topic: string; text: string }[];
  excluded: { name: string; reason: string }[];
  updatedAt: DateStr;
  /** Autoria do documento-fonte (feature 004). */
  source?: { title: string; byline: string };
  /** Documento inteiro em HTML, uma entrada por seção "##", na ordem. */
  docHtml?: { id: string; title: string; html: string }[];
  /** Notas por data (dicas, destaques, partida), em HTML. */
  dayNotes?: Record<DateStr, string>;
  /** Decisões sobre o checklist que valem no app sem editar a cópia do doc (feature 005, Q1). */
  checklistOverrides?: { find: string; replace: string }[];
  /** Itens da partida por data (feature 006). */
  departures?: Record<DateStr, DepartureItem[]>;
  /** Chegada num dia de locomoção (feature 007): itens marcáveis e o resto da seção em HTML. */
  arrivals?: Record<DateStr, { items: DepartureItem[]; html?: string }>;
  /** Dicas práticas extraídas do doc, sem reescrita (feature 008, contracts/tips-content.md). */
  tips?: Tip[];
}

export type TipCategory = 'clima' | 'dinheiro' | 'reservas' | 'transporte' | 'apps' | 'filas' | 'outros';

/** Dica prática do doc do casal (feature 008): texto sem reescrita, com a seção de origem. */
export interface Tip {
  /** "tip:<cidade>:<n>" */
  id: string;
  cityId: CityId;
  category: TipCategory;
  title: string;
  html: string;
  /** Título da seção "##" de origem. */
  source: string;
}
