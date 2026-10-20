import { describe, expect, it } from 'vitest';
import type { WeeklyHours } from '../../src/content/types';
import { openStatus, todayHoursLabel, weeklyLines, zonedNow } from '../../src/domain/opening-hours';

const TZ = 'America/New_York';
const empty = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
const museum: WeeklyHours = {
  ...empty,
  mon: [{ open: '10:00', close: '17:00' }],
  tue: [{ open: '10:00', close: '17:00' }],
  sat: [{ open: '10:00', close: '17:00' }],
  sun: [{ open: '10:00', close: '17:00' }],
  exceptions: { '2026-11-03': 'closed', '2026-11-10': [{ open: '12:00', close: '14:00' }] },
};
const bar: WeeklyHours = { ...empty, fri: [{ open: '20:00', close: '02:00' }] };

// 2026-11-02 é segunda-feira. Após 01/11 Nova York está em UTC-5.
const ny = (local: string, offset = '-05:00') => new Date(`${local}${offset}`);

describe('opening-hours', () => {
  it('considera as bordas do horário (aberto às 16:59, fechado às 17:00 e 17:01)', () => {
    expect(openStatus(museum, ny('2026-11-02T09:59'), TZ)).toBe('closed');
    expect(openStatus(museum, ny('2026-11-02T10:00'), TZ)).toBe('open');
    expect(openStatus(museum, ny('2026-11-02T16:59'), TZ)).toBe('open');
    expect(openStatus(museum, ny('2026-11-02T17:00'), TZ)).toBe('closed');
    expect(openStatus(museum, ny('2026-11-02T17:01'), TZ)).toBe('closed');
  });

  it('dia sem intervalos = fechado', () => {
    expect(openStatus(museum, ny('2026-11-04T12:00'), TZ)).toBe('closed'); // quarta
  });

  it('aplica exceções por data', () => {
    expect(openStatus(museum, ny('2026-11-03T12:00'), TZ)).toBe('closed'); // terça fechada
    expect(openStatus(museum, ny('2026-11-10T11:00'), TZ)).toBe('closed');
    expect(openStatus(museum, ny('2026-11-10T13:00'), TZ)).toBe('open');
  });

  it('trata horário que passa da meia-noite', () => {
    // sexta 06/11 20:00 → sábado 02:00
    expect(openStatus(bar, ny('2026-11-06T19:59'), TZ)).toBe('closed');
    expect(openStatus(bar, ny('2026-11-06T23:30'), TZ)).toBe('open');
    expect(openStatus(bar, ny('2026-11-07T01:59'), TZ)).toBe('open');
    expect(openStatus(bar, ny('2026-11-07T02:00'), TZ)).toBe('closed');
  });

  it('"24h" sempre aberto e "see-official" desconhecido', () => {
    expect(openStatus('24h', new Date(), TZ)).toBe('open');
    expect(openStatus('see-official', new Date(), TZ)).toBe('unknown');
  });

  it('continua correto no fim do horário de verão (01/11/2026)', () => {
    // 31/10 (sábado) 16:30 em UTC-4 = 20:30Z → aberto; 17:30 UTC-4 → fechado.
    expect(openStatus(museum, new Date('2026-10-31T20:30:00Z'), TZ)).toBe('open');
    expect(openStatus(museum, new Date('2026-10-31T21:30:00Z'), TZ)).toBe('closed');
    // 01/11 (domingo) 10:30 em UTC-5 = 15:30Z → aberto; 09:30 local = 14:30Z → fechado.
    expect(openStatus(museum, new Date('2026-11-01T15:30:00Z'), TZ)).toBe('open');
    expect(openStatus(museum, new Date('2026-11-01T14:30:00Z'), TZ)).toBe('closed');
    // A hora 01:00–02:00 se repete; zonedNow segue consistente.
    expect(zonedNow(new Date('2026-11-01T05:30:00Z'), TZ)).toEqual({ date: '2026-11-01', minutes: 90 });
    expect(zonedNow(new Date('2026-11-01T06:30:00Z'), TZ)).toEqual({ date: '2026-11-01', minutes: 90 });
  });

  it('não depende do fuso do processo', () => {
    // O mesmo instante dá o mesmo resultado em America/New_York, seja qual for process.env.TZ.
    const instant = new Date('2026-11-02T16:30:00Z'); // 11:30 em NY
    expect(zonedNow(instant, TZ)).toEqual({ date: '2026-11-02', minutes: 690 });
    expect(openStatus(museum, instant, TZ)).toBe('open');
  });

  it('gera rótulos legíveis', () => {
    expect(todayHoursLabel(museum, ny('2026-11-02T12:00'), TZ)).toBe('Hoje: 10:00–17:00');
    expect(todayHoursLabel(museum, ny('2026-11-04T12:00'), TZ)).toBe('Fechado hoje');
    expect(todayHoursLabel('24h', new Date(), TZ)).toBe('Aberto 24 horas');
    expect(weeklyLines(museum)[2]).toBe('Qua: fechado');
  });
});
