// Modelos das telas do "caderno de viagem" (feature 008, specs/008-travel-notebook-ui/data-model.md):
// capa da viagem, cartões de cidade e de dia, miniaturas das paradas, bairros e transporte.
// Funções puras sobre as visões das features 003/006; nenhum texto novo, só dados do app.
import type { LoadedContent } from '../content/load';
import type { CityId, DateStr, DayArea, DayKind, DepartureItem, Photo, Tip } from '../content/types';
import type { UserState } from '../storage/types';
import { dayKind } from './now';
import { cityForDate, formatDayLabel, tripDates, tripRange } from './trip';
import { dayView, destinationDates, destinationView, sumProgress, type DayActivityView, type Progress, type TripDayView } from './trip-view';

const DAY_MS = 86_400_000;

function daysBetween(a: DateStr, b: DateStr): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / DAY_MS);
}

function heroPhoto(content: LoadedContent, cityId: CityId): Photo | undefined {
  const city = content.cities.find((c) => c.id === cityId);
  return city ? content.pointsById.get(city.heroPointId)?.photos[0] : undefined;
}

// ---------- capa da viagem ----------

export interface TripCover {
  photo?: Photo;
  daysLeft?: number;
  /** Dia da viagem (1-based) durante a viagem. */
  dayNumber?: number;
  totalDays: number;
  people: number;
  start: DateStr;
  end: DateStr;
  cities: number;
  progress: Progress;
  phase: 'before' | 'during' | 'after';
}

/** "Casal" → 2 pessoas; outro texto → sem número inventado (0 = não mostrar). */
export function peopleOf(travelers: string | undefined): number {
  return travelers && /^casal$/i.test(travelers.trim()) ? 2 : 0;
}

export function tripCover(content: LoadedContent, state: UserState, today: DateStr): TripCover {
  const { start, end } = tripRange(content.trip);
  const dates = tripDates(content.trip);
  const phase = today < start ? 'before' : today > end ? 'after' : 'during';
  const progress = sumProgress(content.cities.map((c) => destinationView(content, state, c.id).progress));
  const first = content.trip[0]!.cityId;
  return {
    photo: heroPhoto(content, first),
    ...(phase === 'before' ? { daysLeft: daysBetween(today, start) } : {}),
    ...(phase === 'during' ? { dayNumber: dates.indexOf(today) + 1 } : {}),
    totalDays: dates.length,
    people: peopleOf(content.fullItineraries?.[0]?.travelers),
    start,
    end,
    cities: content.cities.length,
    progress,
    phase,
  };
}

// ---------- cidade ----------

export interface CityCard {
  cityId: CityId;
  name: string;
  country: string;
  photo?: Photo;
  nights: number;
  start: DateStr;
  end: DateStr;
  /** Dias de roteiro (sem os de locomoção). */
  roadmapDays: number;
  phrase: string;
  tags: string[];
  progress: Progress;
  /** Dias de locomoção da cidade, com a rota. */
  arrival?: { date: DateStr; from: CityId };
  departure?: { date: DateStr; to: CityId | null };
}

/** Regiões ("bairro") mais citadas no roteiro da cidade, na ordem da 1ª aparição. */
function topRegions(content: LoadedContent, state: UserState, dates: DateStr[], max: number): string[] {
  const count = new Map<string, number>();
  for (const d of dates) {
    for (const a of dayView(content, state, d).areas) if (a.kind === 'bairro') count.set(a.name, (count.get(a.name) ?? 0) + 1);
  }
  const order = [...count.keys()];
  return order.sort((a, b) => count.get(b)! - count.get(a)! || order.indexOf(a) - order.indexOf(b)).slice(0, max);
}

export function cityCard(content: LoadedContent, state: UserState, cityId: CityId): CityCard {
  const city = content.cities.find((c) => c.id === cityId)!;
  const legIndex = content.trip.findIndex((l) => l.cityId === cityId);
  const leg = content.trip[legIndex]!;
  const dates = destinationDates(content, cityId);
  const own = dates.filter((d) => dayKind(content, d) !== 'transit');
  const commitments = (content.fullItineraries ?? []).filter((f) => f.cityId === cityId).flatMap((f) => f.commitments.map((c) => c.title));
  const prev = content.trip[legIndex - 1];
  const next = content.trip[legIndex + 1];
  return {
    cityId,
    name: city.name,
    country: city.country,
    photo: heroPhoto(content, cityId),
    nights: daysBetween(leg.arrive, leg.depart),
    start: leg.arrive,
    end: leg.depart,
    roadmapDays: own.length,
    phrase: content.pointsById.get(city.heroPointId)?.summary ?? '',
    tags: [...commitments, ...topRegions(content, state, own, Math.max(0, 6 - commitments.length))],
    progress: destinationView(content, state, cityId).progress,
    ...(prev ? { arrival: { date: leg.arrive, from: prev.cityId } } : {}),
    departure: { date: leg.depart, to: next?.cityId ?? null },
  };
}

// ---------- paradas e dias ----------

/**
 * Miniatura de uma parada (R3): a foto do próprio lugar; senão, a do ponto do guia quando o ponto é do
 * próprio passo (não o parque herdado para mapa/motorista, feature 007 R8); compras usam a foto da
 * região de compras. Nunca a foto da cidade.
 */
export function stopThumb(step: DayActivityView, area?: Pick<DayArea, 'photo'>): Photo | undefined {
  const own = step.places.find((p) => p.photo)?.photo;
  if (own) return own;
  const placeWithoutPoint = step.places.length > 0 && step.places.every((p) => !p.pointId);
  if (!placeWithoutPoint && step.photos[0]) return step.photos[0];
  if (step.category === 'shopping') return area?.photo;
  return undefined;
}

export interface DayCard {
  date: DateStr;
  label: string;
  cityId: CityId;
  /** Dia da viagem (1-based). */
  dayNumber: number;
  title: string;
  kind: DayKind;
  stops: number;
  summary: string;
  photo?: Photo;
  progress: Progress;
  /** Dias de locomoção: rota. */
  route?: { from: CityId; to: CityId | null };
  view: TripDayView;
}

export function dayCard(content: LoadedContent, state: UserState, date: DateStr): DayCard {
  const view = dayView(content, state, date);
  const kind = dayKind(content, date);
  const cityId = cityForDate(content.trip, date);
  const steps = view.groups.flatMap((g) => g.activities);
  const leaving = content.trip.findIndex((l) => l.depart === date);
  const route = leaving >= 0 ? { from: content.trip[leaving]!.cityId, to: content.trip[leaving + 1]?.cityId ?? null } : undefined;
  const firstArea = view.areas.find((a) => a.kind === 'bairro' && a.photo);
  const firstStep = steps.map((s) => stopThumb(s, view.areas.find((a) => a.id === s.areaId))).find(Boolean);
  const itineraryTitle = view.groups.find((g) => g.source === 'itinerary')?.title ?? content.suggestedItineraries.find((s) => s.date === date)?.title;
  const title = route
    ? `${content.cityName(route.from)} → ${route.to ? content.cityName(route.to) : 'casa'}`
    : (view.fullDay?.region ?? itineraryTitle ?? content.cityName(cityId));
  const summary = view.fullDay?.goal ?? content.suggestedItineraries.find((s) => s.date === date)?.notes ?? '';
  return {
    date,
    label: formatDayLabel(date),
    cityId,
    dayNumber: tripDates(content.trip).indexOf(date) + 1,
    title,
    kind,
    stops: steps.filter((s) => s.trackable).length,
    summary,
    photo: firstArea?.photo ?? firstStep ?? (route ? undefined : heroPhoto(content, cityId)),
    progress: view.progress,
    ...(route ? { route } : {}),
    view,
  };
}

// ---------- bairros ----------

export interface NeighborhoodCard {
  date: DateStr;
  areaId: string;
  name: string;
  intro?: string;
  photo?: Photo;
  counts: { food: number; sweets: number; shops: number; screen: number };
  hasNotes: boolean;
}

export function neighborhoods(content: LoadedContent, state: UserState, cityId: CityId): NeighborhoodCard[] {
  return destinationDates(content, cityId)
    .filter((d) => dayKind(content, d) !== 'transit')
    .flatMap((date) => {
      const view = dayView(content, state, date);
      return view.areas
        .filter((a) => a.kind === 'bairro')
        .map((a) => {
          const places = view.places.filter((p) => a.placeIds.includes(p.id));
          const food = places.filter((p) => p.kind === 'food');
          return {
            date,
            areaId: a.id,
            name: a.name,
            ...(a.intro ? { intro: a.intro } : {}),
            ...(a.photo ? { photo: a.photo } : {}),
            counts: {
              food: food.length,
              sweets: food.filter((p) => p.level === '🍰').length,
              shops: places.filter((p) => p.kind === 'shop').length,
              screen: places.filter((p) => p.kind === 'screen').length,
            },
            hasNotes: !!a.notesHtml,
          };
        });
    });
}

/** Rótulo curto de uma data: "07/11". */
export function shortLabel(date: DateStr): string {
  return `${date.slice(8)}/${date.slice(5, 7)}`;
}


// ---------- feature 009: seções do dia, lugares e dados a revisar ----------

export type DaySectionId = 'paradas' | 'comer' | 'lojas' | 'bairros' | 'transporte' | 'dicas';

export interface DaySection {
  id: DaySectionId;
  label: string;
  count: number;
}

const SECTION_LABEL: Record<DaySectionId, string> = {
  paradas: 'Paradas',
  comer: 'Restaurantes e Cafés',
  lojas: 'Brechós e Lojas',
  bairros: 'Bairros',
  transporte: 'Transporte',
  dicas: 'Dicas',
};

export interface DayPlace {
  id: string;
  name: string;
  /** Endereço do roteiro; senão, o nome da região. */
  where: string;
  summary?: string;
  level?: string;
  price?: string;
  mapUrl?: string;
  photo?: Photo;
  href: string;
}

/** Restaurantes e cafés (`food`) ou lojas (`shop`) das regiões do dia, na ordem do roteiro, sem repetir nome. */
export function dayPlaces(view: TripDayView, kind: 'food' | 'shop'): DayPlace[] {
  const seen = new Set<string>();
  const out: DayPlace[] = [];
  for (const area of view.areas) {
    for (const id of area.placeIds) {
      const p = view.places.find((x) => x.id === id);
      if (!p || p.kind !== kind || seen.has(p.name)) continue;
      seen.add(p.name);
      out.push({
        id: p.id,
        name: p.name,
        where: p.address ?? area.name.replace(/^Noite:\s*/, ''),
        ...(p.fields.find((f) => !f.label)?.text ? { summary: p.fields.find((f) => !f.label)!.text } : p.works ? { summary: p.works } : {}),
        ...(p.level ? { level: p.level } : {}),
        ...(p.price ? { price: p.price } : {}),
        ...(p.mapsUrls[0] ? { mapUrl: p.mapsUrls[0].url } : {}),
        ...(p.photo ? { photo: p.photo } : {}),
        href: `#/perto/${view.date}/${area.id}/${p.id}`,
      });
    }
  }
  return out;
}

/** Itens de "Transporte" do dia: saídas e deslocamentos com instrução, transferências, mapa e blocos de viagem. */
export function dayTransportCount(view: TripDayView, content: LoadedContent): number {
  const steps = view.groups.flatMap((g) => g.activities).filter((a) => a.category === 'transit' && a.how && !/^volta/i.test(a.title));
  const transfers = view.areas.filter((a) => a.transfer).length;
  const full = content.fullItineraries ?? [];
  const blocks = full.flatMap((f) => f.departures?.[view.date] ?? []).length + full.flatMap((f) => f.arrivals?.[view.date]?.items ?? []).length;
  const isTransit = dayKind(content, view.date) === 'transit';
  return steps.length + transfers + (view.mapUrl ? 1 : 0) + (isTransit ? blocks : 0);
}

/** Seções do dia com conteúdo, na ordem fixa (feature 009, FR-011/FR-017). */
export function daySections(view: TripDayView, content: LoadedContent): DaySection[] {
  const counts: Record<DaySectionId, number> = {
    paradas: view.groups.flatMap((g) => g.activities).filter((a) => a.trackable).length,
    comer: dayPlaces(view, 'food').length,
    lojas: dayPlaces(view, 'shop').length,
    bairros: view.areas.filter((a) => a.kind === 'bairro').length,
    transporte: dayTransportCount(view, content),
    dicas: view.fullDay?.alerts?.length ?? 0,
  };
  return (Object.keys(SECTION_LABEL) as DaySectionId[]).filter((id) => counts[id] > 0).map((id) => ({ id, label: SECTION_LABEL[id], count: counts[id] }));
}

export interface DataReviewItem {
  date: DateStr;
  name: string;
  kind: 'Restaurante/café' | 'Loja' | 'Texto sem estrutura';
  missing: string;
}

/** Dados que o roteiro não traz por inteiro (FR-022): nada é inventado, só listado para revisão. */
export function dataReview(content: LoadedContent, state: UserState): DataReviewItem[] {
  const out: DataReviewItem[] = [];
  for (const date of tripDates(content.trip)) {
    const view = dayView(content, state, date);
    for (const kind of ['food', 'shop'] as const) {
      for (const p of dayPlaces(view, kind)) {
        const place = view.places.find((x) => x.id === p.id)!;
        if (!place.address && !p.mapUrl) out.push({ date, name: p.name, kind: kind === 'food' ? 'Restaurante/café' : 'Loja', missing: 'endereço e link de mapa' });
      }
    }
    for (const f of content.fullItineraries ?? []) {
      const html = f.arrivals?.[date]?.html;
      const markets = html ? /Mercados[\s\S]*?<ul>([\s\S]*?)<\/ul>/.exec(html) : null;
      for (const m of markets ? [...markets[1]!.matchAll(/<li>([^<]+)<\/li>/g)] : []) {
        out.push({ date, name: m[1]!.trim(), kind: 'Texto sem estrutura', missing: 'citado só como texto da chegada (sem endereço); não entra em "Brechós e Lojas"' });
      }
    }
  }
  return out;
}
