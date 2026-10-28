// Modelos das telas do "caderno de viagem" (feature 008, specs/008-travel-notebook-ui/data-model.md):
// capa da viagem, cartões de cidade e de dia, miniaturas das paradas, bairros e transporte.
// Funções puras sobre as visões das features 003/006; nenhum texto novo, só dados do app.
import type { LoadedContent } from '../content/load';
import type { CityId, DateStr, DayAlert, DayArea, DayKind, DepartureItem, Photo, Tip } from '../content/types';
import type { UserState } from '../storage/types';
import { dayKind } from './now';
import { cityForDate, formatDayLabel, tripDates, tripRange } from './trip';
import { dayView, destinationDates, type DayActivityView, type TripDayView } from './trip-view';

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
  phase: 'before' | 'during' | 'after';
}

/** "Casal" → 2 pessoas; outro texto → sem número inventado (0 = não mostrar). */
export function peopleOf(travelers: string | undefined): number {
  return travelers && /^casal$/i.test(travelers.trim()) ? 2 : 0;
}

export function tripCover(content: LoadedContent, today: DateStr): TripCover {
  const { start, end } = tripRange(content.trip);
  const dates = tripDates(content.trip);
  const phase = today < start ? 'before' : today > end ? 'after' : 'during';
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
  title: string;
  kind: DayKind;
  summary: string;
  photo?: Photo;
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
  // Feature 012: dia de viagem com dia do roteiro (Miami, 18/11) usa o título do roteiro; os outros, a rota.
  const title =
    route && !view.fullDay?.region
      ? `${content.cityName(route.from)} → ${route.to ? content.cityName(route.to) : 'casa'}`
      : (view.fullDay?.region ?? itineraryTitle ?? content.cityName(cityId));
  const summary = view.fullDay?.goal ?? content.suggestedItineraries.find((s) => s.date === date)?.notes ?? '';
  return {
    date,
    label: formatDayLabel(date),
    cityId,
    title,
    kind,
    summary,
    photo: firstArea?.photo ?? firstStep ?? (route ? undefined : heroPhoto(content, cityId)),
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
  hasNotes: boolean;
}

/** Tempo livre não é lugar (feature 013, FR-009). */
export const FREE_TIME = /^(manhã|tarde|noite) livre|tempo livre/i;

/**
 * Bairro de verdade (feature 013, Q1 = A): grupo "📍" do roteiro, fora da lista `notNeighborhoods` do
 * roteiro (parques, museus, a ponte, outlets) e que não é tempo livre. Nada é deduzido do nome.
 */
export function isNeighborhood(area: Pick<DayArea, 'kind' | 'name'>, notNeighborhoods: readonly string[] = []): boolean {
  return area.kind === 'bairro' && !notNeighborhoods.includes(area.name) && !FREE_TIME.test(area.name);
}

/** A lista `notNeighborhoods` do roteiro que tem o dia. */
export function notNeighborhoodsFor(content: LoadedContent, date: DateStr): string[] {
  return (content.fullItineraries ?? []).find((f) => f.days.some((d) => d.date === date))?.notNeighborhoods ?? [];
}

export function neighborhoods(content: LoadedContent, state: UserState, cityId: CityId): NeighborhoodCard[] {
  // Feature 013: os dias de viagem com grupos do roteiro (ex.: 18/11 em Miami) também entram.
  // O dia de troca (ex.: 18/11) é das duas cidades, mas os grupos dele são do roteiro de uma só.
  const owner = (date: DateStr) => (content.fullItineraries ?? []).find((f) => f.days.some((d) => d.date === date))?.cityId;
  return destinationDates(content, cityId)
    .filter((date) => (owner(date) ?? cityId) === cityId)
    .flatMap((date) => {
      const view = dayView(content, state, date);
      const not = notNeighborhoodsFor(content, date);
      return view.areas
        .filter((a) => isNeighborhood(a, not))
        .map((a) => ({
          date,
          areaId: a.id,
          name: a.name,
          ...(a.intro ? { intro: a.intro } : {}),
          ...(a.photo ? { photo: a.photo } : {}),
          hasNotes: !!a.notesHtml,
        }));
    });
}

/** Rótulo curto de uma data: "07/11". */
export function shortLabel(date: DateStr): string {
  return `${date.slice(8)}/${date.slice(5, 7)}`;
}


// ---------- feature 009: seções do dia, lugares e dados a revisar ----------

export type DaySectionId = 'paradas' | 'comer' | 'lojas' | 'curiosidades' | 'bairros' | 'transporte' | 'dicas';

export interface DaySection {
  id: DaySectionId;
  label: string;
  count: number;
}

const SECTION_LABEL: Record<DaySectionId, string> = {
  paradas: 'Paradas',
  comer: 'Restaurantes e Cafés',
  lojas: 'Brechós e Lojas',
  curiosidades: 'Curiosidades',
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

/** Grupo de uma seção do dia (feature 010, R1/R2): o grupo do roteiro, com o nome como está nele. */
export interface PlaceGroup {
  /** Id do grupo do roteiro; `null` = "Outros" (lugar fora de qualquer grupo). */
  areaId: string | null;
  name: string;
  /** `false` para blocos da noite, chegada e ideias — entram na revisão (Q2 = A). */
  isNeighborhood: boolean;
  items: DayPlace[];
}

type PlaceKind = 'food' | 'shop' | 'screen';

function toDayPlace(view: TripDayView, p: TripDayView['places'][number], areaId: string, areaName: string): DayPlace {
  const text = p.fields.find((f) => !f.label)?.text ?? p.works;
  return {
    id: p.id,
    name: p.name,
    where: p.address ?? areaName.replace(/^Noite:\s*/, ''),
    ...(text ? { summary: text } : {}),
    ...(p.level ? { level: p.level } : {}),
    ...(p.price ? { price: p.price } : {}),
    ...(p.mapsUrls[0] ? { mapUrl: p.mapsUrls[0].url } : {}),
    ...(p.photo ? { photo: p.photo } : {}),
    href: `#/perto/${view.date}/${areaId}/${p.id}`,
  };
}

/**
 * Restaurantes e cafés, lojas ou curiosidades do dia agrupados pelos grupos do roteiro, na ordem dele
 * (feature 010, FR-001 a FR-003). Cada lugar aparece uma vez por seção (o primeiro grupo vence); o que
 * não está em grupo nenhum vai para "Outros", no fim.
 */
export function dayPlaceGroups(view: TripDayView, kind: PlaceKind): PlaceGroup[] {
  const seen = new Set<string>();
  const groups: PlaceGroup[] = [];
  for (const area of view.areas) {
    const items: DayPlace[] = [];
    for (const id of area.placeIds) {
      const p = view.places.find((x) => x.id === id);
      if (!p || p.kind !== kind || seen.has(p.name)) continue;
      seen.add(p.name);
      items.push(toDayPlace(view, p, area.id, area.name));
    }
    if (items.length) groups.push({ areaId: area.id, name: area.name, isNeighborhood: area.kind === 'bairro', items });
  }
  const loose = view.places.filter((p) => p.kind === kind && !seen.has(p.name) && !view.areas.some((a) => a.placeIds.includes(p.id)));
  if (loose.length) {
    const fallback = view.areas[0]?.id ?? 'dia';
    groups.push({ areaId: null, name: 'Outros', isNeighborhood: false, items: loose.map((p) => toDayPlace(view, p, fallback, '')) });
  }
  return groups;
}

/**
 * Lojas e brechós do bairro de uma atração de compras (feature 010, R7): o mesmo grupo de "Brechós e
 * Lojas" do dia, para os textos nunca divergirem. Sem bairro ou sem lojas, nada.
 */
export function shoppingSlice(view: TripDayView, activity: Pick<DayActivityView, 'category' | 'areaId'>): PlaceGroup | undefined {
  if (activity.category !== 'shopping' || !activity.areaId) return undefined;
  return dayPlaceGroups(view, 'shop').find((g) => g.areaId === activity.areaId);
}

/** Lugares de uma seção do dia, na ordem dos grupos (feature 009; derivado dos grupos na 010). */
export function dayPlaces(view: TripDayView, kind: PlaceKind): DayPlace[] {
  return dayPlaceGroups(view, kind).flatMap((g) => g.items);
}

/** Modos que não são a pé (feature 010, R3). `modeOf` escolhe o ícone; esta regra decide se o trecho entra. */
const NOT_WALKING = /metr[ôo]|\blinha\b|\btrem\b|airtrain|ferry|\bbarco\b|\bbarca\b|t[áa]xi|\buber\b|\blyft\b|\bcarro\b|monotrilho|[ôo]nibus|skyliner/i;

/**
 * Trecho que ajuda a se deslocar: cita metrô, ferry, táxi, carro etc. A pé ou só horário de parque, não.
 * Alternativa entre parênteses ("15 minutos a pé… (ou táxi de 5 minutos)") não torna o trecho a pé relevante.
 */
export function isRelevantMove(text: string): boolean {
  return NOT_WALKING.test(text.replace(/\(ou [^)]*\)/gi, ''));
}

/** Passo de deslocamento que entra em "Transporte": o título não diz "a pé" e a instrução cita um modo que não é a pé. */
function isRelevantStep(a: Pick<DayActivityView, 'title' | 'how'>): boolean {
  return !!a.how && !/a pé/i.test(a.title) && isRelevantMove(a.how);
}

export interface DayMove {
  key: string;
  /** "09h40 · saída" para passos com horário; vazio nas transferências entre regiões. */
  label?: string;
  text: string;
}

/** Trechos relevantes do dia, na ordem do roteiro: saídas e deslocamentos com instrução e transferências entre regiões. */
export function dayMoves(view: TripDayView): DayMove[] {
  const steps = view.groups
    .flatMap((g) => g.activities)
    .filter((a) => a.category === 'transit' && a.how && !/^volta/i.test(a.title) && isRelevantStep(a))
    .map((a) => ({ key: a.key, label: `${a.timeLabel ?? a.start ?? ''} · ${a.title}`.replace(/^ · /, ''), text: a.how! }));
  const transfers = view.areas
    .filter((a) => a.transfer)
    .map((a) => ({ key: `tr-${a.id}`, text: a.transfer!.replace(/^\S+\s+/u, '') }))
    .filter((m) => isRelevantMove(m.text));
  return [...steps, ...transfers];
}

/** Itens de "Transporte" do dia (feature 010): trechos relevantes e, nos dias de troca de cidade, os blocos. O mapa não conta. */
export function dayTransportCount(view: TripDayView, content: LoadedContent): number {
  const full = content.fullItineraries ?? [];
  const blocks = full.flatMap((f) => f.departures?.[view.date] ?? []).length + full.flatMap((f) => f.arrivals?.[view.date]?.items ?? []).length;
  const isTransit = dayKind(content, view.date) === 'transit';
  return dayMoves(view).length + (isTransit ? blocks : 0);
}

/** Marcadores de dica que muda o planejamento: número/hora/data, dia da semana, destaque ou tema específico. */
const SPECIFIC_TIP = /\d|segunda|terça|quarta|quinta|sexta|sábado|domingo|fechad|fecha\b|reserv|maratona|horário|feriado|chuv|frio|calor|neve|furac|segurança|ingresso|fila virtual|multi pass|single pass|park-to-park|evento|desfile|parada\b/i;
/** Padrões de dica óbvia (feature 010, FR-016). */
const GENERIC_TIP = /a pé|sapato|tênis confortáve|aproveit|hidrat|levem água|água\b|protetor solar|curtam|divirtam/i;

/**
 * Dica genérica (feature 010, R4): só quando não tem nenhum marcador específico **e** cai num padrão
 * óbvio. Na dúvida, a dica fica. O corte é da dica inteira; o texto nunca é reescrito.
 */
export function isGenericTip(html: string): boolean {
  if (/<strong>/i.test(html)) return false;
  const text = html.replace(/<[^>]+>/g, ' ');
  return !SPECIFIC_TIP.test(text) && GENERIC_TIP.test(text);
}

/** Dicas do dia que ficam em "Dicas" (feature 010, FR-015 a FR-017). */
export function dayTips(view: TripDayView): DayAlert[] {
  return (view.fullDay?.alerts ?? []).filter((a) => !isGenericTip(a.html));
}

/** Seções do dia com conteúdo, na ordem fixa (feature 009, FR-011/FR-017). */
export function daySections(view: TripDayView, content: LoadedContent): DaySection[] {
  const counts: Record<DaySectionId, number> = {
    // Paradas marcáveis; num dia sem nada a marcar (ex.: 13/11 só com folga e praia, feature 011), os grupos do roteiro.
    paradas: view.groups.flatMap((g) => g.activities).filter((a) => a.trackable).length || view.areas.length,
    comer: dayPlaces(view, 'food').length,
    lojas: dayPlaces(view, 'shop').length,
    curiosidades: dayPlaces(view, 'screen').length,
    bairros: view.areas.filter((a) => isNeighborhood(a, notNeighborhoodsFor(content, view.date))).length,
    transporte: dayTransportCount(view, content),
    dicas: dayTips(view).length,
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

// ---------- feature 010: o que a regra nova tirou de cada dia (relatório) ----------

export interface SectionReview {
  date: DateStr;
  /** Seções que existiam pela regra da 009 e saíram pela da 010. */
  removed: ('transporte' | 'dicas')[];
  /** Trechos que ficaram fora de "Transporte" (a pé, só horário, sem modo). */
  droppedMoves: string[];
  /** Dicas cortadas por genéricas, com o texto do roteiro. */
  cutTips: string[];
  /** Cabeçalhos que não são bairros (blocos da noite etc.) — Q2 = A, para revisão. */
  nonNeighborhoodGroups: { section: 'comer' | 'lojas' | 'curiosidades'; name: string }[];
  /** Lugares sem grupo no roteiro ("Outros") ou em mais de um grupo. */
  uncertain: { section: 'comer' | 'lojas' | 'curiosidades'; name: string; reason: string }[];
}

const KIND_SECTION = { food: 'comer', shop: 'lojas', screen: 'curiosidades' } as const;

/** Relatório da feature 010 (R6), dia a dia — só os dias com algo a relatar. */
export function sectionReview(content: LoadedContent, state: UserState): SectionReview[] {
  const out: SectionReview[] = [];
  for (const date of tripDates(content.trip)) {
    const view = dayView(content, state, date);
    const now = daySections(view, content).map((x) => x.id);
    const steps = view.groups.flatMap((g) => g.activities).filter((a) => a.category === 'transit' && a.how && !/^volta/i.test(a.title));
    const transfers = view.areas.filter((a) => a.transfer).map((a) => a.transfer!.replace(/^\S+\s+/u, ''));
    const full = content.fullItineraries ?? [];
    const blocks = full.flatMap((f) => f.departures?.[date] ?? []).length + full.flatMap((f) => f.arrivals?.[date]?.items ?? []).length;
    const before009 = steps.length + transfers.length + (view.mapUrl ? 1 : 0) + (dayKind(content, date) === 'transit' ? blocks : 0);
    const removed: SectionReview['removed'] = [];
    if (before009 > 0 && !now.includes('transporte')) removed.push('transporte');
    const alerts = view.fullDay?.alerts ?? [];
    if (alerts.length > 0 && !now.includes('dicas')) removed.push('dicas');
    const droppedMoves = [
      ...steps.filter((a) => !isRelevantStep(a)).map((a) => `${a.title}: ${a.how}`),
      ...transfers.filter((t) => !isRelevantMove(t)),
    ];
    const cutTips = alerts.filter((a) => isGenericTip(a.html)).map((a) => a.html.replace(/<[^>]+>/g, '').trim());
    const nonNeighborhoodGroups: SectionReview['nonNeighborhoodGroups'] = [];
    const uncertain: SectionReview['uncertain'] = [];
    for (const kind of ['food', 'shop', 'screen'] as const) {
      const section = KIND_SECTION[kind];
      for (const g of dayPlaceGroups(view, kind)) {
        if (g.areaId === null) for (const i of g.items) uncertain.push({ section, name: i.name, reason: 'sem grupo no roteiro (ficou em "Outros")' });
        else if (!g.isNeighborhood) nonNeighborhoodGroups.push({ section, name: g.name });
      }
      for (const p of view.places.filter((x) => x.kind === kind)) {
        const areas = view.areas.filter((a) => a.placeIds.includes(p.id));
        if (areas.length > 1) uncertain.push({ section, name: p.name, reason: `em ${areas.length} grupos (${areas.map((a) => a.name).join(', ')}); ficou no primeiro` });
      }
    }
    if (removed.length || droppedMoves.length || cutTips.length || nonNeighborhoodGroups.length || uncertain.length)
      out.push({ date, removed, droppedMoves, cutTips, nonNeighborhoodGroups, uncertain });
  }
  return out;
}
