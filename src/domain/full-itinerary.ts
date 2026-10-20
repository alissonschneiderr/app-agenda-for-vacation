import type { Activity, Commitment, DateStr, FullDay } from '../content/types';
import type { ActivityMark, UserState } from '../storage/types';
import { zonedNow } from './opening-hours';
import { TRIP_TIME_ZONE } from './trip';

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number) as [number, number];
  return h * 60 + m;
}

export function formatMinutes(min: number): string {
  return `${String(Math.floor(min / 60) % 24).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
}

export function endTime(a: Pick<Activity, 'start' | 'durationMin'>): string {
  return formatMinutes(toMinutes(a.start) + a.durationMin);
}

export function markActivity(state: UserState, id: string, mark: ActivityMark['state'], now = new Date()): UserState {
  return { ...state, activityMarks: { ...state.activityMarks, [id]: { state: mark, at: now.toISOString() } } };
}

export function unmarkActivity(state: UserState, id: string): UserState {
  if (!(id in state.activityMarks)) return state;
  const { [id]: _removed, ...rest } = state.activityMarks;
  return { ...state, activityMarks: rest };
}

/** Atividades que contam para o progresso (deslocamentos não contam). */
export function trackable(day: FullDay): Activity[] {
  return day.activities.filter((a) => a.type !== 'transit');
}

export function dayProgress(day: FullDay, marks: UserState['activityMarks']): { done: number; skipped: number; total: number } {
  const acts = trackable(day);
  return {
    done: acts.filter((a) => marks[a.id]?.state === 'done').length,
    skipped: acts.filter((a) => marks[a.id]?.state === 'skipped').length,
    total: acts.length,
  };
}

/**
 * Próxima atividade (FR-027a): só no dia atual em Nova York; a primeira sem marca cujo fim ainda
 * não passou; se todas já passaram, a primeira sem marca.
 */
export function nextActivity(day: FullDay, marks: UserState['activityMarks'], now: Date): Activity | null {
  const { date, minutes } = zonedNow(now, TRIP_TIME_ZONE);
  if (date !== day.date) return null;
  const open = trackable(day).filter((a) => !marks[a.id]);
  return open.find((a) => toMinutes(a.start) + a.durationMin >= minutes) ?? open[0] ?? null;
}

/** Horário-limite para sair rumo ao compromisso: início do deslocamento que chega a ele. */
export function leaveBy(day: FullDay, commitment: Commitment): string | null {
  const i = day.activities.findIndex((a) => a.type === 'commitment' && a.commitmentId === commitment.id);
  if (i <= 0) return null;
  const prev = day.activities[i - 1]!;
  return prev.type === 'transit' ? prev.start : endTime(prev);
}

export function commitmentFor(commitments: Commitment[], date: DateStr): Commitment | undefined {
  return commitments.find((c) => c.date === date);
}
