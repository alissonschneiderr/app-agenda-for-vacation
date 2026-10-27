// Validação do roteiro FULL: regras F1–F19 da feature 002, ajustadas pelas features 004 e 005
// (specs/005-nyc-itinerary-doc/contracts/validation-rules.md).
import { z } from 'zod';
import type { Activity, FullDay, FullItinerary } from '../src/content/types';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'data deve ser YYYY-MM-DD');
const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'hora deve ser HH:MM');
const text = z.string().trim().min(1, 'não pode ser vazio');
const latLng = z.object({ lat: z.number(), lng: z.number() });
const place = z.object({ name: text, address: text, location: latLng.optional() });

const fact = z.discriminatedUnion('status', [
  z.object({ text, status: z.literal('confirmed'), source: z.url(), checkedAt: date }),
  z.object({ text, status: z.literal('unconfirmed'), note: text }),
]);

const activity = z.object({
  id: z.string().regex(/^[a-z0-9]+-\d{4}-\d{2}-\d{2}-\d{2}$/, 'id deve ser <prefixo>-AAAA-MM-DD-NN'),
  type: z.enum(['attraction', 'meal', 'shopping', 'screen', 'transit', 'rest', 'commitment', 'hotel', 'free']),
  title: text,
  start: hhmm,
  durationMin: z.number().int().positive(),
  place: place.optional(),
  description: z.string(),
  priority: z.enum(['essential', 'important', 'optional']),
  booking: z.object({ required: z.boolean(), how: z.string().optional(), price: z.string().optional() }),
  facts: z.array(fact),
  pointId: z.string().optional(),
  meal: z
    .object({ kind: z.enum(['breakfast', 'lunch', 'snack', 'dinner']), order: text, why: text, priceRange: text })
    .optional(),
  shop: z
    .object({
      kind: z.enum(['thrift', 'vintage', 'independent', 'designer', 'tech']),
      why: text,
      justification: z.string().optional(),
    })
    .optional(),
  screen: z
    .array(
      z.object({
        work: text,
        kind: z.enum(['setting', 'filming', 'both']),
        access: z.enum(['inside', 'outside']),
        association: text,
        address: text,
      }),
    )
    .optional(),
  transit: z
    .object({
      mode: z.enum(['walk', 'subway', 'bus', 'taxi', 'airtrain', 'ferry']),
      from: text,
      to: text,
      minutes: z.number().int().positive(),
      lines: z.string().optional(),
      cost: z.string().optional(),
    })
    .optional(),
  earlyReason: z.string().optional(),
  commitmentId: z.string().optional(),
  timeLabel: z.string().optional(),
  how: z.string().optional(),
  optional: z.boolean().optional(),
  inferredDuration: z.boolean().optional(),
  placeIds: z.array(z.string()).optional(),
  areaId: z.string().nullable().optional(),
});

const link = z.object({ label: text, url: z.url() });

const docPlace = z.object({
  id: text,
  kind: z.enum(['food', 'shop', 'screen', 'attraction']),
  name: text,
  address: z.string().optional(),
  mapsUrls: z.array(link),
  photoUrls: z.array(link).optional(),
  level: z.string().optional(),
  price: z.string().optional(),
  queue: z.string().optional(),
  fields: z.array(z.object({ label: z.string(), text })),
  works: z.string().optional(),
  photoTip: z.string().optional(),
  access: z.string().optional(),
  land: z.string().optional(),
  pointId: z.string().optional(),
});

export const fullDaySchema = z.object({
  date,
  region: text,
  goal: text,
  events: z.array(z.string()),
  activities: z.array(activity),
  returnToHotel: text,
  alternatives: z.array(z.object({ when: z.enum(['rain', 'tired', 'closed']), text })),
  places: z.array(docPlace).optional(),
  mapUrl: z.url().optional(),
  alerts: z.array(z.object({ id: z.string().regex(/^al:\d{4}-\d{2}-\d{2}:\d+$/), html: text })).optional(),
  areas: z
    .array(
      z.object({
        id: text,
        kind: z.enum(['bairro', 'chegada', 'noite', 'ideias']),
        name: text,
        photoUrls: z.array(link),
        intro: z.string().optional(),
        activityIds: z.array(z.string()),
        placeIds: z.array(z.string()),
        notesHtml: z.string().optional(),
        transfer: z.string().optional(),
        transferInTimeline: z.boolean().optional(),
      }),
    )
    .optional(),
});

const transitionItem = z.object({
  id: z.string().regex(/^tr:\d{4}-\d{2}-\d{2}:c?\d+$/, 'id deve ser tr:<data>:<n> ou tr:<data>:c<n>'),
  label: text,
  text: z.string(),
  block: z.enum(['before', 'trip', 'arrival']),
});

/** Item de partida do meta.json (feature 007, Q1): trecho literal do doc ou dado do casal com fonte. */
const declaredItem = z
  .object({ label: text, quote: text.optional(), source: text.optional() })
  .refine((d) => d.quote || d.source, 'item de partida precisa de quote (trecho do doc) ou source (D6)');

export const fullItinerarySchema = z.object({
  id: text,
  cityId: z.enum(['nova-york', 'orlando', 'miami']),
  title: text,
  travelers: text,
  base: place.optional(),
  arrival: z.object({ airport: text, date, time: hhmm.optional() }),
  idPrefix: z.string().regex(/^[a-z]+[0-9]*$/, 'idPrefix deve ser letras minúsculas e dígitos').optional(),
  arrivalDay: date.optional(),
  stepsUseAreaPoint: z.boolean().optional(),
  departure: z
    .object({ date, before: z.array(declaredItem), trip: z.array(declaredItem) })
    .optional(),
  commitments: z.array(
    z.object({ id: text, date, time: hhmm, arriveBy: hhmm, title: text, place }),
  ),
  days: z.array(fullDaySchema),
  checklist: z.array(
    z.object({
      id: z.string().regex(/^ck:[a-z-]+:\d+$/, 'id deve ser ck:<cidade>:<n>').optional(),
      what: text,
      forDate: date.optional(),
      deadline: date.optional(),
      when: z.string().optional(),
      note: z.string().optional(),
      link: z.url().optional(),
      activityId: z.string().optional(),
    }),
  ),
  practicalTips: z.array(z.object({ topic: text, text })),
  excluded: z.array(z.object({ name: text, reason: text })),
  updatedAt: date,
  source: z.object({ title: z.string(), byline: z.string() }).optional(),
  docHtml: z.array(z.object({ id: text, title: text, html: text })).optional(),
  dayNotes: z.record(z.string(), z.string()).optional(),
  checklistOverrides: z.array(z.object({ find: text, replace: text })).optional(),
  departures: z
    .record(
      date,
      z.array(transitionItem),
    )
    .optional(),
  arrivals: z.record(date, z.object({ items: z.array(transitionItem), html: z.string().optional() })).optional(),
  tips: z
    .array(
      z.object({
        id: z.string().regex(/^tip:[a-z-]+:\d+$/, 'id deve ser tip:<cidade>:<n>'),
        cityId: z.enum(['nova-york', 'orlando', 'miami']),
        category: z.enum(['clima', 'dinheiro', 'reservas', 'transporte', 'apps', 'filas', 'outros']),
        title: text,
        html: text,
        source: text,
      }),
    )
    .optional(),
});

export const NY_DATES = ['2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06'];
export const ORLANDO_DATES = ['2026-11-08', '2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15', '2026-11-16', '2026-11-17'];
/** F2 por roteiro (feature 007): os dias que cada roteiro do casal cobre. */
export const EXPECTED_DATES: Record<string, string[]> = { 'nova-york': NY_DATES, orlando: ORLANDO_DATES };
export const ARRIVAL_DATE = '2026-10-31';
export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number) as [number, number];
  return h * 60 + m;
}

export function endMinutes(a: Pick<Activity, 'start' | 'durationMin'>): number {
  return toMinutes(a.start) + a.durationMin;
}

export interface FullValidateOptions {
  strict: boolean;
  pointIds?: Set<string>;
}

function validateDay(day: FullDay, it: FullItinerary, opts: FullValidateOptions, errors: string[]): void {
  const err = (msg: string, a?: Activity) => errors.push(`roteiro FULL ${day.date}${a ? ` ${a.id}` : ''}: ${msg}`);
  const acts = day.activities;

  // Campos obrigatórios por tipo (no roteiro do doc, compras e locações vêm dos lugares do bairro).
  for (const a of acts) {
    const fromDoc = !!a.timeLabel;
    if (a.type === 'meal' && !a.meal) err('refeição sem meal', a);
    if (a.type === 'shopping' && !a.shop && !fromDoc) err('compras sem shop', a);
    if (a.type === 'screen' && !a.screen?.length && !fromDoc) err('local de série sem screen (F15)', a);
    if (a.type === 'commitment' && !a.commitmentId) err('compromisso sem commitmentId', a);
    if (a.type === 'commitment' && a.priority !== 'essential') err('compromisso deve ser essential', a);
    if (a.pointId && opts.pointIds && !opts.pointIds.has(a.pointId)) err(`pointId inexistente ${a.pointId} (F19)`, a);
    for (const id of a.placeIds ?? []) if (!day.places?.some((p) => p.id === id)) err(`lugar inexistente ${id}`, a);
  }
  for (const p of day.places ?? []) {
    if (p.kind === 'screen' && !p.works) err(`locação "${p.name}" sem obra (F15)`);
    if (p.pointId && opts.pointIds && !opts.pointIds.has(p.pointId)) err(`lugar "${p.name}" com pointId inexistente ${p.pointId} (F19)`);
  }
  for (const area of day.areas ?? []) {
    for (const id of area.activityIds) if (!acts.some((a) => a.id === id)) err(`área "${area.name}" com atividade inexistente ${id}`);
    for (const id of area.placeIds) if (!day.places?.some((p) => p.id === id)) err(`área "${area.name}" com lugar inexistente ${id}`);
  }

  // F4: sobreposição, só quando a anterior tem fim explícito (duração deduzida não acusa).
  for (let i = 1; i < acts.length; i++) {
    const prev = acts[i - 1]!;
    const cur = acts[i]!;
    if (!prev.inferredDuration && endMinutes(prev) > toMinutes(cur.start)) {
      err(`sobrepõe a anterior ${prev.id} (termina ${fmt(endMinutes(prev))}, esta começa ${cur.start}) (F4)`, cur);
    }
  }

  if (!opts.strict) return;

  // F3
  if (acts.length === 0) err('dia sem atividades (F3)');

  // F8: compromisso presente; chegada (linha "Chegada ao…" ou o próprio compromisso) até arriveBy,
  // e arriveBy pelo menos 30 min antes do início.
  for (const c of it.commitments.filter((c) => c.date === day.date)) {
    const a = acts.find((x) => x.type === 'commitment' && x.commitmentId === c.id);
    if (!a) {
      err(`falta o compromisso ${c.id} (F8)`);
      continue;
    }
    if (toMinutes(c.arriveBy) > toMinutes(c.time) - 30) err(`${c.id}: arriveBy deve ser ≤ ${fmt(toMinutes(c.time) - 30)} (F8)`);
    // No roteiro do doc (feature 005) a chegada está no texto da noite, conferida pela regra D5.
    if (a.timeLabel && day.areas) continue;
    const arrival = acts.find((x) => /^Chegada ao/.test(x.title) && toMinutes(x.start) < toMinutes(a.start));
    const arrivesAt = arrival?.start ?? a.start;
    if (toMinutes(arrivesAt) > toMinutes(c.arriveBy)) err(`${c.id}: chega às ${arrivesAt}, depois de ${c.arriveBy} (F8)`, arrival ?? a);
  }

  // F9: nenhum outro espetáculo na noite do musical.
  if (day.date === it.commitments.find((c) => c.id === 'mj-musical')?.date) {
    for (const a of acts) {
      if (a.type === 'attraction' && /(musical|broadway|espet[aá]culo)/i.test(a.title)) err(`outro espetáculo em ${day.date} (F9)`, a);
    }
  }

  // F10: chegada pelo JFK e ida ao hotel.
  if (it.id === 'nova-york' && day.date === ARRIVAL_DATE) {
    const first = acts[0];
    const startsAt = day.areas?.[0]?.name ?? first?.place?.name ?? first?.title ?? '';
    if (!/JFK/.test(startsAt)) err('31/10 deve começar no JFK (F10)');
    const toHotel = (a: Activity) => /POD 51/i.test(a.transit?.to ?? (a.transit ? '' : a.title));
    if (!acts.some((a) => a.type === 'transit' && toHotel(a))) err('31/10 sem deslocamento JFK → POD 51 (F10)');
  }

  // F18: ingressos no checklist.
  for (const a of acts.filter((x) => x.booking.required)) {
    if (!it.checklist.some((c) => c.activityId === a.id)) err('precisa de ingresso mas não está no checklist (F18)', a);
  }
}

function fmt(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
}

export function validateFullItinerary(input: unknown, opts: FullValidateOptions): string[] {
  const parsed = fullItinerarySchema.safeParse(input);
  if (!parsed.success) {
    return parsed.error.issues.map((i) => `roteiro FULL schema: ${i.path.join('.')}: ${i.message} (F1)`);
  }
  const it = parsed.data as FullItinerary;
  const errors: string[] = [];

  const ids = new Set<string>();
  for (const a of it.days.flatMap((d) => d.activities)) {
    if (ids.has(a.id)) errors.push(`roteiro FULL: id de atividade repetido ${a.id}`);
    ids.add(a.id);
  }
  for (const d of it.days) {
    for (const a of d.activities) {
      if (!a.id.includes(`-${d.date}-`)) errors.push(`roteiro FULL ${d.date} ${a.id}: id deve conter a data do dia (-${d.date}-)`);
    }
  }

  if (opts.strict) {
    const dates = it.days.map((d) => d.date);
    const expected = EXPECTED_DATES[it.id];
    if (expected && JSON.stringify(dates) !== JSON.stringify(expected)) {
      errors.push(`roteiro FULL ${it.id}: dias devem ser ${expected.join(', ')} em ordem; há ${dates.join(', ') || 'nenhum'} (F2)`);
    }
  }

  for (const day of it.days) validateDay(day, it, opts, errors);
  return errors;
}
