import type { CityId, DateStr, TripLeg } from '../content/types';

export const TRIP_TIME_ZONE = 'America/New_York';

export type DayInfo =
  | { kind: 'sightseeing'; date: DateStr; cityId: CityId }
  | { kind: 'travel'; date: DateStr; origin: CityId; destination: CityId | null }
  | { kind: 'outside'; date: DateStr };

/** Data de hoje (YYYY-MM-DD) no fuso da viagem, independente do fuso do aparelho. */
export function todayInTripZone(now: Date, timeZone = TRIP_TIME_ZONE): DateStr {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function addDays(date: DateStr, days: number): DateStr {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export function tripRange(trip: TripLeg[]): { start: DateStr; end: DateStr } {
  return { start: trip[0]!.arrive, end: trip[trip.length - 1]!.depart };
}

export function isTravelDay(trip: TripLeg[], date: DateStr): boolean {
  return trip.some((leg) => leg.depart === date);
}

export function travelLeg(
  trip: TripLeg[],
  date: DateStr,
): { origin: CityId; destination: CityId | null } | null {
  const i = trip.findIndex((leg) => leg.depart === date);
  if (i === -1) return null;
  return { origin: trip[i]!.cityId, destination: trip[i + 1]?.cityId ?? null };
}

export function dayInfo(trip: TripLeg[], date: DateStr): DayInfo {
  const travel = travelLeg(trip, date);
  if (travel) return { kind: 'travel', date, ...travel };
  const leg = trip.find((l) => l.arrive <= date && date < l.depart);
  if (leg) return { kind: 'sightseeing', date, cityId: leg.cityId };
  return { kind: 'outside', date };
}

/** Todos os dias de passeio da viagem, em ordem. */
export function sightseeingDays(trip: TripLeg[]): { date: DateStr; cityId: CityId }[] {
  const days: { date: DateStr; cityId: CityId }[] = [];
  const { start, end } = tripRange(trip);
  for (let d = start; d <= end; d = addDays(d, 1)) {
    const info = dayInfo(trip, d);
    if (info.kind === 'sightseeing') days.push({ date: d, cityId: info.cityId });
  }
  return days;
}

/** Todas as datas da viagem (passeio e locomoção), em ordem. */
export function tripDates(trip: TripLeg[]): DateStr[] {
  const dates: DateStr[] = [];
  const { start, end } = tripRange(trip);
  for (let d = start; d <= end; d = addDays(d, 1)) dates.push(d);
  return dates;
}

/** Cidade padrão de um dia: passeio → cidade; locomoção → destino (último dia → origem); fora → 1ª cidade. */
export function cityForDate(trip: TripLeg[], date: DateStr): CityId {
  const info = dayInfo(trip, date);
  if (info.kind === 'sightseeing') return info.cityId;
  if (info.kind === 'travel') return info.destination ?? info.origin;
  return trip[0]!.cityId;
}

/** Cidades aceitas num roteiro daquele dia (para o aviso de outra cidade). */
export function citiesForDate(trip: TripLeg[], date: DateStr): CityId[] {
  const info = dayInfo(trip, date);
  if (info.kind === 'sightseeing') return [info.cityId];
  if (info.kind === 'travel') return info.destination ? [info.origin, info.destination] : [info.origin];
  return [];
}

const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

/** Ex.: "sábado, 31/10". */
export function formatDayLabel(date: DateStr): string {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${weekday}, ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
}

/** Ex.: "22/10/2026". */
export function formatDate(date: DateStr): string {
  const [y, m, d] = date.split('-');
  return `${d}/${m}/${y}`;
}
