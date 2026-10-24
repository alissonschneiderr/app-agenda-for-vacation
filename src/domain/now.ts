// O "agora" da viagem (feature 006, specs/006-trip-companion-ux/research.md R2–R5):
// próximo passo, marca "agora", região atual, como chegar e tipo de dia.
// Funções puras sobre a visão do dia (trip-view); o relógio entra como parâmetro.
import type { LoadedContent } from '../content/load';
import type { DateStr, DayArea, DayKind } from '../content/types';
import { toMinutes } from './full-itinerary';
import { zonedNow } from './opening-hours';
import { tripRange, TRIP_TIME_ZONE } from './trip';
import type { DayActivityView, TripDayView } from './trip-view';

/** Sem fim explícito nem próximo início, um passo dura isto (min). */
const DEFAULT_MIN = 15;

export function allSteps(day: TripDayView): DayActivityView[] {
  return day.groups.flatMap((g) => g.activities);
}

function isPending(a: DayActivityView): boolean {
  return a.trackable && !a.mark;
}

/** Fim do passo em minutos: fim explícito; senão, o início do passo seguinte; senão, início + 15. */
export function stepEnd(list: DayActivityView[], i: number): number | null {
  const a = list[i]!;
  if (!a.start) return null;
  const start = toMinutes(a.start);
  if (a.durationMin && !a.inferredDuration) return start + a.durationMin;
  const next = list.slice(i + 1).find((x) => x.start && toMinutes(x.start) > start);
  return next ? toMinutes(next.start!) : start + DEFAULT_MIN;
}

/**
 * Próximo passo: o primeiro marcável pendente cujo fim ainda não passou; sem nenhum assim, o primeiro
 * pendente; sem pendentes, null (dia concluído). `nowMin` null = não é o dia de hoje.
 */
export function nextStep(day: TripDayView, nowMin: number | null): DayActivityView | null {
  const list = allSteps(day);
  const pending = list.map((a, i) => ({ a, i })).filter(({ a }) => isPending(a));
  if (!pending.length) return null;
  if (nowMin === null) return pending[0]!.a;
  const current = pending.find(({ i }) => {
    const end = stepEnd(list, i);
    return end === null || end > nowMin;
  });
  return (current ?? pending[0]!).a;
}

/** Os passos marcáveis pendentes que vêm depois de `step`. */
export function upcoming(day: TripDayView, step: DayActivityView | null, n = 3): DayActivityView[] {
  const list = allSteps(day);
  const from = step ? list.indexOf(step) + 1 : 0;
  return list.slice(from).filter(isPending).slice(0, n);
}

/** Posição da marca "agora": antes do primeiro passo que começa depois de `nowMin`. */
export function nowIndex(day: TripDayView, nowMin: number): number {
  const list = allSteps(day);
  const i = list.findIndex((a) => a.start && toMinutes(a.start) > nowMin);
  return i === -1 ? list.length : i;
}

/** Região do próximo passo; sem passo, a última região do dia. */
export function currentArea(day: TripDayView, step: DayActivityView | null): DayArea | undefined {
  if (step?.areaId) return day.areas.find((a) => a.id === step.areaId);
  return day.areas.at(-1);
}

export type TravelMode = 'walk' | 'subway' | 'taxi' | 'ferry';

export interface HowToGet {
  /** Rótulo do roteiro ("Deslocamento para Nolita", "saída"), quando houver. */
  title?: string;
  timeLabel?: string;
  text: string;
  mode: TravelMode;
}

export function modeOf(text: string): TravelMode {
  const t = text.toLowerCase();
  if (/ferry|barco/.test(t)) return 'ferry';
  if (/táxi|taxi|uber/.test(t) && !/metrô/.test(t)) return 'taxi';
  if (/metrô|linha [a-z0-9]|trem|airtrain/.test(t)) return 'subway';
  return 'walk';
}

/**
 * Como chegar ao passo, pela instrução do roteiro (R3): o deslocamento com horário logo antes;
 * senão, o deslocamento da região anterior; senão, a saída do hotel.
 */
export function howToGet(day: TripDayView, step: DayActivityView): HowToGet | null {
  const list = allSteps(day);
  const i = list.indexOf(step);
  for (let j = i - 1; j >= 0 && !list[j]!.trackable; j--) {
    const t = list[j]!;
    if (t.category === 'transit') {
      const text = t.how ?? t.full?.transit?.lines ?? '';
      return { title: t.title, timeLabel: t.timeLabel ?? t.start, text, mode: modeOf(`${t.title} ${text}`) };
    }
  }
  const prevTracked = list.slice(0, i).reverse().find((a) => a.trackable);
  if (prevTracked && step.areaId && prevTracked.areaId !== step.areaId) {
    const prevArea = day.areas.find((a) => a.id === prevTracked.areaId);
    if (prevArea?.transfer) {
      const text = prevArea.transfer.replace(/^\S+\s+/u, '');
      return { text, mode: modeOf(text) };
    }
  }
  if (!prevTracked) {
    const departure = list.find((a) => a.category === 'transit' && !a.areaId && a.how);
    if (departure) return { title: departure.title, timeLabel: departure.timeLabel, text: departure.how!, mode: modeOf(departure.how!) };
  }
  return null;
}

export function dayKind(content: Pick<LoadedContent, 'dayKinds'>, date: DateStr): DayKind {
  return content.dayKinds?.[date] ?? 'walk';
}

export type TripPhase = 'before' | 'during' | 'after';

export function tripPhase(content: Pick<LoadedContent, 'trip'>, date: DateStr): TripPhase {
  const { start, end } = tripRange(content.trip);
  return date < start ? 'before' : date > end ? 'after' : 'during';
}

/** Data e minuto atuais no fuso da viagem. */
export function tripNow(now: Date): { date: DateStr; minutes: number } {
  return zonedNow(now, TRIP_TIME_ZONE);
}

/**
 * `?agora=AAAA-MM-DDTHH:MM` (hora local da viagem) → Date, para simular um momento na revisão do
 * casal. Sem o parâmetro (ou inválido), devolve `real`.
 */
export function nowFromUrl(search: string, real: Date = new Date()): Date {
  const m = /[?&]agora=(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(search);
  if (!m) return real;
  const [, y, mo, d, h, mi] = m.map(Number) as number[];
  const target = h! * 60 + mi!;
  const targetDate = `${m[1]}-${m[2]}-${m[3]}`;
  let t = Date.UTC(y!, mo! - 1, d!, h!, mi!);
  for (let k = 0; k < 3; k++) {
    const z = zonedNow(new Date(t), TRIP_TIME_ZONE);
    const dayDiff = z.date === targetDate ? 0 : z.date < targetDate ? 1440 : -1440;
    t += (target + dayDiff - z.minutes) * 60_000;
  }
  return new Date(t);
}
