import type { DateStr, Interval, OpeningHours, Weekday } from '../content/types';
import { addDays } from './trip';

export type OpenStatus = 'open' | 'closed' | 'unknown';

const WEEKDAY_KEYS: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/** Data e minuto do dia "agora" no fuso da cidade. */
export function zonedNow(now: Date, timeZone: string): { date: DateStr; minutes: number } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number) as [number, number];
  return h * 60 + m;
}

function weekdayOf(date: DateStr): Weekday {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  return WEEKDAY_KEYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]!;
}

/** Intervalos de um dia, considerando exceções por data. */
export function intervalsFor(hours: Exclude<OpeningHours, string>, date: DateStr): Interval[] {
  const exception = hours.exceptions?.[date];
  if (exception === 'closed') return [];
  if (exception) return exception;
  return hours[weekdayOf(date)];
}

const crossesMidnight = (i: Interval) => toMinutes(i.close) <= toMinutes(i.open);

export function openStatus(hours: OpeningHours, now: Date, timeZone: string): OpenStatus {
  if (hours === '24h') return 'open';
  if (hours === 'see-official') return 'unknown';
  const { date, minutes } = zonedNow(now, timeZone);
  const today = intervalsFor(hours, date).some((i) =>
    crossesMidnight(i) ? minutes >= toMinutes(i.open) : minutes >= toMinutes(i.open) && minutes < toMinutes(i.close),
  );
  if (today) return 'open';
  // Intervalo de ontem que passou da meia-noite.
  const yesterday = intervalsFor(hours, addDays(date, -1)).some(
    (i) => crossesMidnight(i) && minutes < toMinutes(i.close),
  );
  return yesterday ? 'open' : 'closed';
}

export function formatIntervals(intervals: Interval[]): string {
  return intervals.map((i) => `${i.open}–${i.close}`).join(', ');
}

/** Texto do horário de hoje, ex.: "Hoje: 10:00–17:00". */
export function todayHoursLabel(hours: OpeningHours, now: Date, timeZone: string): string {
  if (hours === '24h') return 'Aberto 24 horas';
  if (hours === 'see-official') return 'Horário: consulte o site oficial';
  const { date } = zonedNow(now, timeZone);
  const today = intervalsFor(hours, date);
  return today.length ? `Hoje: ${formatIntervals(today)}` : 'Fechado hoje';
}

const WEEK_LABELS: [Weekday, string][] = [
  ['mon', 'Seg'],
  ['tue', 'Ter'],
  ['wed', 'Qua'],
  ['thu', 'Qui'],
  ['fri', 'Sex'],
  ['sat', 'Sáb'],
  ['sun', 'Dom'],
];

/** Linhas do horário semanal para o detalhe, ex.: ["Seg: 10:00–17:00", "Ter: fechado"]. */
export function weeklyLines(hours: OpeningHours): string[] {
  if (hours === '24h') return ['Todos os dias: 24 horas'];
  if (hours === 'see-official') return [];
  return WEEK_LABELS.map(([k, label]) => `${label}: ${hours[k].length ? formatIntervals(hours[k]) : 'fechado'}`);
}
