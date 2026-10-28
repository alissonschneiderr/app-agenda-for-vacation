// Rota entre dois lugares do roteiro (feature 016, specs/016-route-between-attractions/data-model.md).
// O local de cada lugar é o mesmo do "Abrir no mapa" (ou do "Como chegar"): nada é deduzido.
import type { LoadedContent } from '../content/load';
import type { CityId, DateStr } from '../content/types';
import type { UserState } from '../storage/types';
import { dayPlaceGroups } from './notebook';
import { cityForDate } from './trip';
import { dayView, destinationDates, type DayActivityView, type TripDayView } from './trip-view';

export type RouteGroup = 'paradas' | 'comer' | 'lojas' | 'curiosidades';

export interface RouteSpot {
  /** Chave do passo ou id do lugar: a mesma de `#/rota/<data>/<key>`. */
  key: string;
  date: DateStr;
  name: string;
  /** Só nas paradas: o horário do roteiro. */
  time?: string;
  group: RouteGroup;
  /** Local para o Google Maps: a busca do link de mapa do roteiro ou "lat,lng" do ponto. */
  target: string;
  /** Para o aviso sem internet: o endereço do roteiro; senão, o `target`. */
  address: string;
}

export interface RouteDay {
  date: DateStr;
  spots: RouteSpot[];
}

/** Texto da busca de um link do Google Maps do doc ("query=Top+of+the+Rock+New+York"). */
export function mapsQuery(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).searchParams.get('query')?.replace(/\+/g, ' ') ?? undefined;
  } catch {
    return undefined;
  }
}

const PLACE_GROUP: [RouteGroup, 'food' | 'shop' | 'screen'][] = [
  ['comer', 'food'],
  ['lojas', 'shop'],
  ['curiosidades', 'screen'],
];

/** Parada com o mapa do lugar do roteiro; sem lugar, com o ponto do guia (o "Como chegar"). */
function stepSpot(date: DateStr, a: DayActivityView): RouteSpot | null {
  if (!a.trackable) return null;
  const place = a.places[0];
  const target = place ? mapsQuery(place.mapsUrls[0]?.url) : a.location && `${a.location.lat},${a.location.lng}`;
  if (!target) return null;
  const time = a.timeLabel ?? a.start;
  return {
    key: a.key,
    date,
    name: place?.name ?? a.title,
    ...(time ? { time } : {}),
    group: 'paradas',
    target,
    address: place?.address ?? a.address ?? a.point?.address ?? target,
  };
}

function placeSpot(view: TripDayView, id: string): RouteSpot | null {
  const p = view.places.find((x) => x.id === id);
  const group = PLACE_GROUP.find(([, kind]) => kind === p?.kind)?.[0];
  const target = mapsQuery(p?.mapsUrls[0]?.url);
  if (!p || !group || !target) return null;
  return { key: p.id, date: view.date, name: p.name, group, target, address: p.address ?? target };
}

export function routeSpot(content: LoadedContent, state: UserState, date: DateStr, key: string): RouteSpot | null {
  const view = dayView(content, state, date);
  const step = view.groups.flatMap((g) => g.activities).find((a) => a.key === key);
  return step ? stepSpot(date, step) : placeSpot(view, key);
}

function daySpots(view: TripDayView): RouteSpot[] {
  const steps = view.groups.flatMap((g) => g.activities).flatMap((a) => stepSpot(view.date, a) ?? []);
  const places = PLACE_GROUP.flatMap(([, kind]) => dayPlaceGroups(view, kind).flatMap((g) => g.items.flatMap((p) => placeSpot(view, p.id) ?? [])));
  const seen = new Set<string>();
  return [...steps, ...places].filter((s) => !seen.has(s.target) && seen.add(s.target));
}

/** A cidade do dia: a dona do roteiro do dia (dia de troca, feature 013); senão, a da viagem. */
export function routeCity(content: LoadedContent, date: DateStr): CityId {
  return (content.fullItineraries ?? []).find((f) => f.days.some((d) => d.date === date))?.cityId ?? cityForDate(content.trip, date);
}

const cache = new WeakMap<LoadedContent, WeakMap<UserState, Map<CityId, RouteDay[]>>>();

/** Lugares com local de cada dia da cidade, na ordem do roteiro. Calculado uma vez por estado. */
export function routeSpots(content: LoadedContent, state: UserState, cityId: CityId): RouteDay[] {
  let byState = cache.get(content);
  if (!byState) cache.set(content, (byState = new WeakMap()));
  let byCity = byState.get(state);
  if (!byCity) byState.set(state, (byCity = new Map()));
  let days = byCity.get(cityId);
  if (!days) {
    days = destinationDates(content, cityId)
      .filter((date) => routeCity(content, date) === cityId)
      .map((date) => ({ date, spots: daySpots(dayView(content, state, date)) }));
    byCity.set(cityId, days);
  }
  return days;
}

/** Destinos possíveis a partir de `origin`: o dia dela; com `otherDays`, os outros dias da cidade depois. */
export function routeChoices(content: LoadedContent, state: UserState, origin: RouteSpot, otherDays: boolean): RouteDay[] {
  const days = routeSpots(content, state, routeCity(content, origin.date));
  const own = days.find((d) => d.date === origin.date) ?? { date: origin.date, spots: [] };
  const ordered = otherDays ? [own, ...days.filter((d) => d !== own)] : [own];
  return ordered.map((d) => ({ date: d.date, spots: d.spots.filter((s) => s.key !== origin.key && s.target !== origin.target) }));
}

/** O lugar tem local e há outro lugar na cidade para onde ir (FR-001). */
export function hasRoute(content: LoadedContent, state: UserState, date: DateStr, key: string): boolean {
  const origin = routeSpot(content, state, date, key);
  return !!origin && routeChoices(content, state, origin, true).some((d) => d.spots.length > 0);
}

/** Rota no Google Maps (Maps URLs); o meio de transporte fica a cargo do casal, lá (FR-005). */
export function routeUrl(from: Pick<RouteSpot, 'target'>, to: Pick<RouteSpot, 'target'>): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from.target)}&destination=${encodeURIComponent(to.target)}`;
}
