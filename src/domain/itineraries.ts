import type { CityId, Content, DateStr, Point, TripLeg } from '../content/types';
import type { Itinerary, UserState } from '../storage/types';
import { citiesForDate, dayInfo, type DayInfo } from './trip';

export const TRIP_START = '2026-10-31';
export const TRIP_END = '2026-11-21';
export const NAME_MAX = 60;

export type ItineraryError = 'NAME_EMPTY' | 'NAME_TOO_LONG' | 'DATE_OUT_OF_RANGE' | 'DUPLICATE' | 'NOT_FOUND';

export type Result = { ok: true; state: UserState; id?: string } | { ok: false; error: ItineraryError };

export const ERROR_MESSAGES: Record<ItineraryError, string> = {
  NAME_EMPTY: 'Dê um nome ao roteiro.',
  NAME_TOO_LONG: `O nome pode ter no máximo ${NAME_MAX} caracteres.`,
  DATE_OUT_OF_RANGE: 'Escolha um dia entre 31/10 e 21/11.',
  DUPLICATE: 'Este ponto já está neste roteiro.',
  NOT_FOUND: 'Roteiro não encontrado.',
};

function validateName(name: string): ItineraryError | null {
  const trimmed = name.trim();
  if (!trimmed) return 'NAME_EMPTY';
  if (trimmed.length > NAME_MAX) return 'NAME_TOO_LONG';
  return null;
}

function validateDate(date: DateStr | null): ItineraryError | null {
  return date !== null && (date < TRIP_START || date > TRIP_END) ? 'DATE_OUT_OF_RANGE' : null;
}

function newId(): string {
  return crypto.randomUUID();
}

function modify(state: UserState, id: string, fn: (it: Itinerary) => Itinerary | ItineraryError, now: Date): Result {
  const current = state.itineraries.find((it) => it.id === id);
  if (!current) return { ok: false, error: 'NOT_FOUND' };
  const next = fn(current);
  if (typeof next === 'string') return { ok: false, error: next };
  const updated = { ...next, updatedAt: now.toISOString() };
  return { ok: true, id, state: { ...state, itineraries: state.itineraries.map((it) => (it.id === id ? updated : it)) } };
}

export function createItinerary(state: UserState, name: string, date: DateStr | null, now = new Date()): Result {
  const error = validateName(name) ?? validateDate(date);
  if (error) return { ok: false, error };
  const ts = now.toISOString();
  const it: Itinerary = {
    id: newId(),
    name: name.trim(),
    date,
    origin: 'user',
    sourceId: null,
    items: [],
    createdAt: ts,
    updatedAt: ts,
  };
  return { ok: true, id: it.id, state: { ...state, itineraries: [...state.itineraries, it] } };
}

export function renameItinerary(state: UserState, id: string, name: string, now = new Date()): Result {
  return modify(state, id, (it) => validateName(name) ?? { ...it, name: name.trim() }, now);
}

export function setItineraryDate(state: UserState, id: string, date: DateStr | null, now = new Date()): Result {
  return modify(state, id, (it) => validateDate(date) ?? { ...it, date }, now);
}

/** Remove as marcações de conclusão dos itens de um roteiro (chaves `it:<id>:…`, feature 003). */
function dropMarks(state: UserState, prefix: string): UserState {
  const keys = Object.keys(state.activityMarks).filter((k) => k.startsWith(prefix));
  if (keys.length === 0) return state;
  const activityMarks = { ...state.activityMarks };
  for (const k of keys) delete activityMarks[k];
  return { ...state, activityMarks };
}

export function deleteItinerary(state: UserState, id: string): Result {
  if (!state.itineraries.some((it) => it.id === id)) return { ok: false, error: 'NOT_FOUND' };
  return { ok: true, state: dropMarks({ ...state, itineraries: state.itineraries.filter((it) => it.id !== id) }, `it:${id}:`) };
}

export function addPoint(state: UserState, id: string, point: Pick<Point, 'id' | 'name'>, now = new Date()): Result {
  return modify(
    state,
    id,
    (it) =>
      it.items.some((i) => i.pointId === point.id)
        ? 'DUPLICATE'
        : { ...it, items: [...it.items, { pointId: point.id, pointName: point.name }] },
    now,
  );
}

export function removePoint(state: UserState, id: string, pointId: string, now = new Date()): Result {
  const r = modify(state, id, (it) => ({ ...it, items: it.items.filter((i) => i.pointId !== pointId) }), now);
  return r.ok ? { ...r, state: dropMarks(r.state, `it:${id}:${pointId}`) } : r;
}

function move(state: UserState, id: string, index: number, to: number, now: Date): Result {
  return modify(
    state,
    id,
    (it) => {
      if (index < 0 || index >= it.items.length || to < 0 || to >= it.items.length || index === to) return it;
      const items = [...it.items];
      const [item] = items.splice(index, 1);
      items.splice(to, 0, item!);
      return { ...it, items };
    },
    now,
  );
}

export const moveUp = (s: UserState, id: string, index: number, now = new Date()) => move(s, id, index, index - 1, now);
export const moveDown = (s: UserState, id: string, index: number, now = new Date()) => move(s, id, index, index + 1, now);
export const moveToTop = (s: UserState, id: string, index: number, now = new Date()) => move(s, id, index, 0, now);

/** Aviso de FR-022: ponto de cidade diferente da(s) cidade(s) do dia do roteiro. */
export function otherCityWarning(
  it: Pick<Itinerary, 'date'>,
  point: Pick<Point, 'cityId'>,
  trip: TripLeg[],
): { pointCity: CityId; dayCities: CityId[] } | null {
  if (!it.date) return null;
  const dayCities = citiesForDate(trip, it.date);
  if (dayCities.length === 0 || dayCities.includes(point.cityId)) return null;
  return { pointCity: point.cityId, dayCities };
}

export interface DayGroup {
  date: DateStr | null;
  day: DayInfo | null;
  itineraries: Itinerary[];
}

/** Agrupa por dia em ordem cronológica; roteiros sem dia por último (FR-021). */
export function groupByDate(itineraries: Itinerary[], trip: TripLeg[]): DayGroup[] {
  const byDate = new Map<DateStr | null, Itinerary[]>();
  for (const it of itineraries) {
    const list = byDate.get(it.date) ?? [];
    list.push(it);
    byDate.set(it.date, list);
  }
  const dates = [...byDate.keys()].filter((d): d is DateStr => d !== null).sort();
  const groups: DayGroup[] = dates.map((date) => ({
    date,
    day: dayInfo(trip, date),
    itineraries: byDate.get(date)!.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  }));
  const undated = byDate.get(null);
  if (undated) groups.push({ date: null, day: null, itineraries: undated });
  return groups;
}

/** Copia roteiros sugeridos nunca semeados; nunca altera os existentes (FR-025, research R10). */
export function seedSuggested(content: Pick<Content, 'suggestedItineraries' | 'points'>, state: UserState, now = new Date()): UserState {
  const seeded = new Set(state.seededIds);
  const fresh = content.suggestedItineraries.filter((s) => !seeded.has(s.id));
  if (fresh.length === 0) return state;
  const names = new Map(content.points.map((p) => [p.id, p.name]));
  const ts = now.toISOString();
  const created: Itinerary[] = fresh.map((s) => ({
    id: newId(),
    name: s.title.slice(0, NAME_MAX),
    date: s.date,
    origin: 'suggested',
    sourceId: s.id,
    items: s.pointIds.map((pointId) => ({ pointId, pointName: names.get(pointId) ?? pointId })),
    createdAt: ts,
    updatedAt: ts,
  }));
  return {
    ...state,
    seededIds: [...state.seededIds, ...fresh.map((s) => s.id)],
    itineraries: [...state.itineraries, ...created],
  };
}
