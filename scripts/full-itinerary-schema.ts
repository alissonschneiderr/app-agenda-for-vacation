// Validação do roteiro FULL (specs/002-nyc-full-itinerary/contracts/full-itinerary-content.md, regras F1–F19).
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
  id: z.string().regex(/^ny-\d{4}-\d{2}-\d{2}-\d{2}$/, 'id deve ser ny-AAAA-MM-DD-NN'),
  type: z.enum(['attraction', 'meal', 'shopping', 'screen', 'transit', 'rest', 'commitment', 'hotel']),
  title: text,
  start: hhmm,
  durationMin: z.number().int().positive(),
  place: place.optional(),
  description: text,
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
});

export const fullDaySchema = z.object({
  date,
  region: text,
  goal: text,
  events: z.array(z.string()),
  activities: z.array(activity),
  returnToHotel: text,
  alternatives: z.array(z.object({ when: z.enum(['rain', 'tired', 'closed']), text })),
});

export const fullItinerarySchema = z.object({
  id: text,
  cityId: z.enum(['nova-york', 'orlando', 'miami']),
  title: text,
  travelers: text,
  base: place,
  arrival: z.object({ airport: text, date, time: hhmm }),
  commitments: z.array(
    z.object({ id: text, date, time: hhmm, arriveBy: hhmm, title: text, place }),
  ),
  days: z.array(fullDaySchema),
  checklist: z.array(
    z.object({ what: text, forDate: date, deadline: date, link: z.url().optional(), activityId: z.string().optional() }),
  ),
  practicalTips: z.array(z.object({ topic: text, text })),
  excluded: z.array(z.object({ name: text, reason: text })),
  updatedAt: date,
});

export const NY_DATES = ['2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06'];
export const ARRIVAL_DATE = '2026-10-31';
const SHOW_DATE = '2026-11-04';

/** Termos proibidos (F12): restrições alimentares e lojas excluídas. Comparação sem acento e sem caixa. */
export const FORBIDDEN_TERMS = [
  'ostra',
  'oyster',
  'frutos do mar',
  'seafood',
  'lobster',
  'lagosta',
  'camarao',
  'shrimp',
  'steakhouse',
  'b&h',
  'tiffany',
];

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number) as [number, number];
  return h * 60 + m;
}

export function endMinutes(a: Pick<Activity, 'start' | 'durationMin'>): number {
  return toMinutes(a.start) + a.durationMin;
}

function fold(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export interface FullValidateOptions {
  strict: boolean;
  pointIds?: Set<string>;
}

function validateDay(day: FullDay, it: FullItinerary, opts: FullValidateOptions, errors: string[]): void {
  const err = (msg: string, a?: Activity) => errors.push(`roteiro FULL ${day.date}${a ? ` ${a.id}` : ''}: ${msg}`);
  const acts = day.activities;
  const baseAddress = it.base.address;

  // Campos obrigatórios por tipo.
  for (const a of acts) {
    if (a.type !== 'transit' && !a.place) err('falta place', a);
    if (a.type === 'meal' && !a.meal) err('refeição sem meal', a);
    if (a.type === 'shopping' && !a.shop) err('compras sem shop', a);
    if (a.type === 'screen' && !a.screen?.length) err('local de série sem screen (F15)', a);
    if (a.type === 'transit' && !a.transit) err('deslocamento sem transit', a);
    if (a.type === 'commitment' && !a.commitmentId) err('compromisso sem commitmentId', a);
    if (a.type === 'commitment' && a.priority !== 'essential') err('compromisso deve ser essential', a);
    if (a.pointId && opts.pointIds && !opts.pointIds.has(a.pointId)) err(`pointId inexistente ${a.pointId} (F19)`, a);
  }

  // F4: ordem e sobreposição.
  for (let i = 1; i < acts.length; i++) {
    const prev = acts[i - 1]!;
    const cur = acts[i]!;
    if (endMinutes(prev) > toMinutes(cur.start)) {
      err(`sobrepõe a anterior ${prev.id} (termina ${fmt(endMinutes(prev))}, esta começa ${cur.start}) (F4)`, cur);
    }
  }

  // F5: deslocamento quando o endereço muda.
  let lastAddress: string | null = null;
  let prevWasTransit = false;
  for (const a of acts) {
    if (a.type === 'transit') {
      prevWasTransit = true;
      continue;
    }
    const addr = a.place?.address ?? null;
    if (addr && lastAddress && addr !== lastAddress && !prevWasTransit) {
      err(`muda de endereço sem deslocamento antes (F5)`, a);
    }
    if (addr) lastAddress = addr;
    prevWasTransit = false;
  }

  // F6: passeios a partir das 10h.
  if (day.date !== ARRIVAL_DATE) {
    for (const a of acts) {
      if (['attraction', 'shopping', 'screen', 'commitment'].includes(a.type) && toMinutes(a.start) < 600 && !a.earlyReason) {
        err('começa antes das 10h sem earlyReason (F6)', a);
      }
    }
  }

  // F12: termos proibidos em todo o texto do dia (palavra inteira, com plural: "ostra" não casa com "mostra").
  const dayText = fold(JSON.stringify(day));
  for (const term of FORBIDDEN_TERMS) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`(^|[^a-z])${escaped}s?([^a-z]|$)`).test(dayText)) err(`contém termo proibido "${term}" (F12)`);
  }

  // F14: Apple Store só com justificativa.
  for (const a of acts) {
    if (a.type === 'shopping' && /apple/i.test(`${a.title} ${a.place?.name ?? ''}`) && !a.shop?.justification) {
      err('Apple Store sem justificativa (F14)', a);
    }
  }

  if (!opts.strict) return;

  // F3
  if (acts.length === 0) err('dia sem atividades (F3)');

  // F7: começa e termina no hotel (31/10 começa no aeroporto).
  const isBase = (a: Activity | undefined) => !!a && (a.type === 'hotel' || a.place?.address === baseAddress);
  const first = acts[0];
  const last = acts[acts.length - 1];
  if (day.date !== ARRIVAL_DATE && !isBase(first)) err('o dia deve começar no hotel (F7)');
  if (!isBase(last)) err('o dia deve terminar no hotel (F7)');

  // F8: compromissos.
  for (const c of it.commitments.filter((c) => c.date === day.date)) {
    const a = acts.find((x) => x.type === 'commitment' && x.commitmentId === c.id);
    if (!a) {
      err(`falta o compromisso ${c.id} (F8)`);
      continue;
    }
    if (toMinutes(c.arriveBy) > toMinutes(c.time) - 30) err(`${c.id}: arriveBy deve ser ≤ ${fmt(toMinutes(c.time) - 30)} (F8)`);
    if (toMinutes(a.start) > toMinutes(c.arriveBy)) err(`${c.id}: chega às ${a.start}, depois de ${c.arriveBy} (F8)`, a);
  }

  // F9: nenhum outro espetáculo na noite do musical.
  if (day.date === SHOW_DATE) {
    for (const a of acts) {
      if (a.type === 'attraction' && /(musical|broadway|espet[aá]culo)/i.test(a.title)) err('outro espetáculo em 04/11 (F9)', a);
    }
  }

  // F10: chegada pelo JFK.
  if (day.date === ARRIVAL_DATE) {
    if (!/JFK/.test(first?.place?.name ?? '')) err('31/10 deve começar no JFK (F10)');
    if (!acts.some((a) => a.type === 'transit' && /POD 51/i.test(a.transit?.to ?? ''))) err('31/10 sem deslocamento JFK → POD 51 (F10)');
  }

  // F11: refeições.
  for (const kind of ['breakfast', 'lunch', 'snack', 'dinner'] as const) {
    const meals = acts.filter((a) => a.meal?.kind === kind);
    if (meals.length !== 1) err(`deve ter exatamente 1 refeição "${kind}", tem ${meals.length} (F11)`);
  }
  const lunch = acts.find((a) => a.meal?.kind === 'lunch');
  if (lunch && (toMinutes(lunch.start) < 720 || toMinutes(lunch.start) > 840)) err('almoço deve começar entre 12:00 e 14:00 (F11)', lunch);
  const snack = acts.find((a) => a.meal?.kind === 'snack');
  if (snack && (toMinutes(snack.start) < 930 || toMinutes(snack.start) > 990)) err('lanche deve começar entre 15:30 e 16:30 (F11)', snack);

  // F13: desvio até refeição ou local de série ≤ 20 min.
  for (let i = 1; i < acts.length; i++) {
    const cur = acts[i]!;
    const prev = acts[i - 1]!;
    if ((cur.type === 'meal' || cur.type === 'screen') && prev.type === 'transit' && (prev.transit?.minutes ?? 0) > 20) {
      err(`deslocamento de ${prev.transit?.minutes} min até ${cur.type === 'meal' ? 'refeição' : 'local de série'} (máx. 20) (F13)`, cur);
    }
  }

  // F17: alternativas.
  if (!day.alternatives.some((a) => a.when === 'rain')) err('falta alternativa de chuva (F17)');
  if (!day.alternatives.some((a) => a.when === 'tired' || a.when === 'closed')) err('falta alternativa de cansaço/fechamento (F17)');

  // F18: reservas no checklist.
  for (const a of acts.filter((x) => x.booking.required)) {
    if (!it.checklist.some((c) => c.activityId === a.id)) err('precisa de reserva mas não está no checklist (F18)', a);
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
      if (!a.id.startsWith(`ny-${d.date}-`)) errors.push(`roteiro FULL ${d.date} ${a.id}: id deve começar com ny-${d.date}-`);
    }
  }

  if (opts.strict) {
    const dates = it.days.map((d) => d.date);
    if (JSON.stringify(dates) !== JSON.stringify(NY_DATES)) {
      errors.push(`roteiro FULL: dias devem ser ${NY_DATES.join(', ')} em ordem; há ${dates.join(', ') || 'nenhum'} (F2)`);
    }
  }

  for (const day of it.days) validateDay(day, it, opts, errors);
  return errors;
}
