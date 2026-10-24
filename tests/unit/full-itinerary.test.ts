import { describe, expect, it } from 'vitest';
import {
  dayProgress,
  endTime,
  leaveBy,
  markActivity,
  toggleDone,
  nextActivity,
  unmarkActivity,
} from '../../src/domain/full-itinerary';
import { emptyState } from '../../src/storage/user-store';
import { fixtureFullItinerary } from '../fixtures/full-itinerary';

const it2 = fixtureFullItinerary();
const day = it2.days.find((d) => d.date === '2026-11-02')!;
const T = new Date('2026-11-02T20:00:00Z'); // 15:00 em NY (EST)

describe('roteiro FULL: domínio', () => {
  it('marca, troca e desfaz', () => {
    let s = markActivity(emptyState(), 'a', 'done', T);
    expect(s.activityMarks).toEqual({ a: { state: 'done', at: T.toISOString() } });
    s = markActivity(s, 'a', 'skipped', T);
    expect(s.activityMarks.a!.state).toBe('skipped');
    s = unmarkActivity(s, 'a');
    expect(s.activityMarks).toEqual({});
    expect(unmarkActivity(s, 'nada')).toBe(s);
  });

  it('calcula fim e progresso (sem contar deslocamentos)', () => {
    expect(endTime({ start: '23:30', durationMin: 45 })).toBe('00:15');
    const first = day.activities.find((a) => a.type === 'meal')!;
    const s = markActivity(emptyState(), first.id, 'done');
    const p = dayProgress(day, s.activityMarks);
    expect(p.done).toBe(1);
    expect(p.total).toBe(day.activities.filter((a) => a.type !== 'transit').length);
  });

  it('próxima atividade no dia atual: primeira sem marca que ainda não terminou', () => {
    // 15:00 → o brechó (14:05–15:35) ainda não terminou
    expect(nextActivity(day, {}, T)!.title).toMatch(/Brechó/);
    const s = markActivity(emptyState(), nextActivity(day, {}, T)!.id, 'skipped');
    expect(nextActivity(day, s.activityMarks, T)!.title).toMatch(/Lanche/);
  });

  it('se todas já passaram, a primeira sem marca; em outro dia, nenhuma', () => {
    const late = new Date('2026-11-03T04:30:00Z'); // 23:30 de 02/11 em NY
    expect(nextActivity(day, {}, late)!.title).toBe('Saída do hotel');
    expect(nextActivity(day, {}, new Date('2026-11-03T15:00:00Z'))).toBeNull();
  });

  it('horário-limite de saída para o compromisso', () => {
    expect(leaveBy(day, it2.commitments[0]!)).toBe('17:50');
  });

  it('toggleDone: ausente → feito; pulada → feito; feito → pendente', () => {
    let s = toggleDone(emptyState(), 'k', T);
    expect(s.activityMarks.k!.state).toBe('done');
    s = toggleDone(s, 'k', T);
    expect(s.activityMarks.k).toBeUndefined();
    s = toggleDone(markActivity(emptyState(), 'k', 'skipped', T), 'k', T);
    expect(s.activityMarks.k!.state).toBe('done');
  });
});
