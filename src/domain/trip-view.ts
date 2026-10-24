// Visão unificada da viagem por destino → dia → atividade (feature 003, data-model.md).
// Junta o roteiro FULL (feature 002) e os roteiros datados do usuário (feature 001) num formato só,
// sem inventar horários para quem não tem.
import type { LoadedContent } from '../content/load';
import type { Activity, CityId, Commitment, DateStr, DayArea, DocPlace, FullDay, LatLng, Photo, Point } from '../content/types';
import type { ActivityMark, Itinerary, UserState } from '../storage/types';
import { toMinutes } from './full-itinerary';
import { zonedNow } from './opening-hours';
import { cityForDate, dayInfo, formatDayLabel, tripDates, TRIP_TIME_ZONE, type DayInfo } from './trip';

export type Category = 'attraction' | 'restaurant' | 'shopping' | 'screen' | 'transit' | 'commitment' | 'rest';

export const CATEGORY_LABEL: Record<Category, string> = {
  attraction: 'Atração',
  restaurant: 'Restaurante',
  shopping: 'Compras',
  screen: 'Série e filme',
  transit: 'Transporte',
  commitment: 'Ingresso comprado',
  rest: 'Descanso e hotel',
};

export interface DayActivityView {
  key: string;
  date: DateStr;
  title: string;
  category: Category;
  /** Rótulo exibido (para pontos do guia, a categoria do guia: Museu, Parque temático…). */
  categoryLabel: string;
  start?: string;
  durationMin?: number;
  /** Horário como está no documento do casal (feature 004), ex.: "19h30–~22h00". */
  timeLabel?: string;
  /** Duração deduzida até a próxima linha: não é exibida. */
  inferredDuration?: boolean;
  /** Coluna "Como ir" do documento. */
  how?: string;
  optional: boolean;
  /** Lugares do documento ligados a esta linha. */
  places: DocPlace[];
  /** Bairro do doc (feature 005); null = antes do primeiro bairro. */
  areaId?: string | null;
  /** Pausa, tempo ou tarde livre (feature 005): intervalo, sem Feito/Pendente. */
  free: boolean;
  /** Fila estimada, forma de entrar e área do parque, como no doc (feature 007). */
  queue?: string;
  access?: string;
  land?: string;
  placeName?: string;
  address?: string;
  location?: LatLng;
  photos: Photo[];
  trackable: boolean;
  unavailable: boolean;
  bookingRequired: boolean;
  mark?: ActivityMark;
  full?: Activity;
  point?: Point;
  itinerary?: Itinerary;
}

export interface ActivityGroup {
  id: string;
  title: string;
  source: 'full' | 'itinerary';
  itineraryId?: string;
  notes?: string;
  activities: DayActivityView[];
}

export interface Progress {
  done: number;
  total: number;
}

export interface TripDayView {
  date: DateStr;
  label: string; // "segunda, 02/11"
  info: DayInfo;
  index: number; // 1-based dentro do destino
  count: number;
  events: string[];
  groups: ActivityGroup[];
  hasTimes: boolean;
  progress: Progress;
  fullDay?: FullDay;
  /** Notas do documento para o dia (dicas, destaques, partida), em HTML gerado no build. */
  notesHtml?: string;
  /** Todos os lugares do dia descritos no documento. */
  places: DocPlace[];
  /** Bairros do dia, na ordem do doc (feature 005). */
  areas: DayArea[];
  /** Link "Mapa do dia" (feature 005). */
  mapUrl?: string;
}

export interface DestinationView {
  cityId: CityId;
  name: string;
  hero?: { photo: Photo; point: Point };
  period: { start: DateStr; end: DateStr };
  days: TripDayView[];
  commitments: Commitment[];
  activityCount: number;
  progress: Progress;
}

export function activityKeyForItem(itineraryId: string, pointId: string): string {
  return `it:${itineraryId}:${pointId}`;
}

function fullCategory(a: Activity): Category {
  switch (a.type) {
    case 'meal':
      return 'restaurant';
    case 'shopping':
      return 'shopping';
    case 'screen':
      return 'screen';
    case 'transit':
      return 'transit';
    case 'commitment':
      return 'commitment';
    case 'rest':
    case 'hotel':
    case 'free':
      return 'rest';
    default:
      return 'attraction';
  }
}

function fromFull(a: Activity, day: FullDay, content: LoadedContent, marks: UserState['activityMarks']): DayActivityView {
  const date = day.date;
  const point = a.pointId ? content.pointsById.get(a.pointId) : undefined;
  const category = fullCategory(a);
  const places = (a.placeIds ?? []).flatMap((id) => day.places?.find((p) => p.id === id) ?? []);
  const own = places[0];
  return {
    key: a.id,
    date,
    title: a.title,
    category,
    categoryLabel: CATEGORY_LABEL[category],
    start: a.start,
    durationMin: a.durationMin,
    timeLabel: a.timeLabel,
    inferredDuration: a.inferredDuration,
    how: a.how,
    optional: !!a.optional,
    places,
    areaId: a.areaId,
    free: a.type === 'free',
    ...(own?.kind === 'attraction' && own.queue ? { queue: own.queue } : {}),
    // Em NY, `access` do lugar é o texto do ingresso (já mostrado como ingresso); só vale com a fila.
    ...(own?.kind === 'attraction' && own.queue && own.access ? { access: own.access } : {}),
    ...(own?.land ? { land: own.land } : {}),
    placeName: a.place?.name,
    address: a.place?.address,
    location: a.place?.location ?? point?.location,
    photos: point?.photos ?? [],
    trackable: a.type !== 'transit' && a.type !== 'free',
    unavailable: false,
    bookingRequired: a.booking.required,
    mark: marks[a.id],
    full: a,
    point,
  };
}

function fromItem(
  it: Itinerary,
  item: Itinerary['items'][number],
  content: LoadedContent,
  marks: UserState['activityMarks'],
): DayActivityView {
  const point = content.pointsById.get(item.pointId);
  const key = activityKeyForItem(it.id, item.pointId);
  return {
    key,
    date: it.date!,
    title: point?.name ?? item.pointName,
    category: point?.categoryId === 'compras' ? 'shopping' : 'attraction',
    categoryLabel: point ? content.categoryName(point.categoryId) : 'Indisponível',
    optional: false,
    places: [],
    free: false,
    placeName: point?.name,
    address: point?.address,
    location: point?.location,
    photos: point?.photos ?? [],
    trackable: true,
    unavailable: !point,
    bookingRequired: false,
    mark: marks[key],
    point,
    itinerary: it,
  };
}

/** Linhas opcionais só contam quando feitas: não ficam como pendência obrigatória. */
export function progressOf(activities: DayActivityView[]): Progress {
  const tracked = activities.filter((a) => a.trackable && (!a.optional || a.mark?.state === 'done'));
  return { done: tracked.filter((a) => a.mark?.state === 'done').length, total: tracked.length };
}

export function sumProgress(list: Progress[]): Progress {
  return list.reduce((acc, p) => ({ done: acc.done + p.done, total: acc.total + p.total }), { done: 0, total: 0 });
}

export function fullDayFor(content: LoadedContent, date: DateStr): FullDay | undefined {
  for (const f of content.fullItineraries ?? []) {
    const d = f.days.find((x) => x.date === date);
    if (d) return d;
  }
  return undefined;
}

/** Datas de um destino: do dia de chegada ao de saída (inclui os dias de locomoção). */
export function destinationDates(content: LoadedContent, cityId: CityId): DateStr[] {
  const leg = content.trip.find((l) => l.cityId === cityId);
  if (!leg) return [];
  return tripDates(content.trip).filter((d) => d >= leg.arrive && d <= leg.depart);
}

export function dayView(content: LoadedContent, state: UserState, date: DateStr, cityId?: CityId): TripDayView {
  const fullDay = fullDayFor(content, date);
  const groups: ActivityGroup[] = [];
  if (fullDay) {
    groups.push({
      id: `full-${date}`,
      title: 'Roteiro FULL',
      source: 'full',
      activities: fullDay.activities.map((a) => fromFull(a, fullDay, content, state.activityMarks)),
    });
  }
  // Feature 007 (R9): num dia com roteiro FULL, os sugeridos guardados no aparelho não aparecem.
  const its = state.itineraries
    .filter((it) => it.date === date && !(fullDay && it.origin === 'suggested'))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  for (const it of its) {
    const notes = it.sourceId ? content.suggestedItineraries.find((s) => s.id === it.sourceId)?.notes : undefined;
    groups.push({
      id: it.id,
      title: it.name,
      source: 'itinerary',
      itineraryId: it.id,
      notes,
      activities: it.items.map((item) => fromItem(it, item, content, state.activityMarks)),
    });
  }
  const city = cityId ?? cityForDate(content.trip, date);
  const dates = destinationDates(content, city);
  const all = groups.flatMap((g) => g.activities);
  return {
    date,
    label: formatDayLabel(date),
    info: dayInfo(content.trip, date),
    index: dates.indexOf(date) + 1,
    count: dates.length,
    events: fullDay?.events ?? [],
    groups,
    hasTimes: all.some((a) => a.start),
    progress: progressOf(all),
    fullDay,
    notesHtml: (content.fullItineraries ?? []).map((f) => f.dayNotes?.[date]).find(Boolean),
    places: fullDay?.places ?? [],
    areas: fullDay?.areas ?? [],
    mapUrl: fullDay?.mapUrl,
  };
}

export function destinationView(content: LoadedContent, state: UserState, cityId: CityId): DestinationView {
  const city = content.cities.find((c) => c.id === cityId)!;
  const dates = destinationDates(content, cityId);
  const days = dates.map((d) => dayView(content, state, d, cityId));
  const heroPoint = content.pointsById.get(city.heroPointId);
  const commitments = (content.fullItineraries ?? [])
    .filter((f) => f.cityId === cityId)
    .flatMap((f) => f.commitments);
  // Dias de locomoção aparecem nos dois destinos; para o total da cidade, conta-se cada dia uma vez
  // só no destino em que ele "pertence" (cityForDate), evitando somar duas vezes na viagem.
  const own = days.filter((d) => cityForDate(content.trip, d.date) === cityId);
  return {
    cityId,
    name: city.name,
    hero: heroPoint?.photos[0] ? { photo: heroPoint.photos[0], point: heroPoint } : undefined,
    period: { start: dates[0]!, end: dates[dates.length - 1]! },
    days,
    commitments,
    activityCount: own.reduce((n, d) => n + d.progress.total, 0),
    progress: sumProgress(own.map((d) => d.progress)),
  };
}

export function tripProgress(content: LoadedContent, state: UserState): Progress {
  return sumProgress(content.cities.map((c) => destinationView(content, state, c.id).progress));
}

/** Dia anterior/seguinte da viagem inteira (atravessa destinos). */
export function adjacentDay(content: LoadedContent, date: DateStr, dir: 1 | -1): { date: DateStr; cityId: CityId } | null {
  const dates = tripDates(content.trip);
  const next = dates[dates.indexOf(date) + dir];
  return next ? { date: next, cityId: cityForDate(content.trip, next) } : null;
}

export function findActivity(content: LoadedContent, state: UserState, date: DateStr, key: string) {
  const day = dayView(content, state, date);
  const list = day.groups.flatMap((g) => g.activities);
  const index = list.findIndex((a) => a.key === key);
  if (index === -1) return null;
  const tracked = list.filter((a) => a.trackable);
  const t = tracked.findIndex((a) => a.key === key);
  return {
    day,
    activity: list[index]!,
    /** Deslocamento planejado logo depois desta atividade (só no roteiro FULL). */
    nextTransit: list[index + 1]?.category === 'transit' ? list[index + 1] : undefined,
    prev: tracked[t - 1],
    next: tracked[t + 1],
  };
}

/** Próxima atividade pendente do dia de hoje (fuso de Nova York). */
export function nextPendingActivity(content: LoadedContent, state: UserState, now: Date) {
  const { date, minutes } = zonedNow(now, TRIP_TIME_ZONE);
  if (!tripDates(content.trip).includes(date)) return null;
  const day = dayView(content, state, date);
  const pending = day.groups.flatMap((g) => g.activities).filter((a) => a.trackable && a.mark?.state !== 'done' && a.mark?.state !== 'skipped');
  const upcoming = pending.find((a) => !a.start || toMinutes(a.start) + (a.durationMin ?? 0) >= minutes) ?? pending[0];
  return upcoming ? { date, cityId: cityForDate(content.trip, date), activity: upcoming, day } : { date, cityId: cityForDate(content.trip, date), activity: null, day };
}

export function destinationHref(cityId: CityId, date?: DateStr, key?: string): string {
  // Feature 006: o dia vive em #/dia; sem data, a visão da viagem.
  void cityId;
  return date ? `#/dia/${date}${key ? `/${encodeURIComponent(key)}` : ''}` : '#/viagem';
}

export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h${m ? String(m).padStart(2, '0') : ''}` : `${m} min`;
}

export function shortDate(date: DateStr): string {
  const [, m, d] = date.split('-');
  return `${d}/${m}`;
}
