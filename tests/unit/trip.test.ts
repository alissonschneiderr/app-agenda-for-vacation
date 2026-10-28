import { describe, expect, it } from 'vitest';
import {
  addDays,
  cityForDate,
  deviceToday,
  formatDayMonth,
  formatWeekday,
  todayInCity,
  citiesForDate,
  dayInfo,
  formatDayLabel,
  isTravelDay,
  sightseeingDays,
  todayInTripZone,
  travelLeg,
} from '../../src/domain/trip';
import { fixtureContent } from '../fixtures/content';

const { trip } = fixtureContent();

// Cidade esperada para cada data de 30/10 a 22/11 (FR-019).
const expected: Record<string, string> = {};
for (let d = '2026-10-30'; d <= '2026-11-22'; d = addDays(d, 1)) {
  if (d < '2026-10-31' || d > '2026-11-21') expected[d] = 'nova-york';
  else if (d < '2026-11-07') expected[d] = 'nova-york';
  else if (d < '2026-11-18') expected[d] = 'orlando';
  else expected[d] = 'miami';
}

describe('trip', () => {
  it('identifica os dias de locomoção', () => {
    expect(['2026-11-07', '2026-11-18', '2026-11-21'].every((d) => isTravelDay(trip, d))).toBe(true);
    expect(isTravelDay(trip, '2026-10-31')).toBe(false);
    expect(isTravelDay(trip, '2026-11-08')).toBe(false);
  });

  it('dá origem e destino da locomoção', () => {
    expect(travelLeg(trip, '2026-11-07')).toEqual({ origin: 'nova-york', destination: 'orlando' });
    expect(travelLeg(trip, '2026-11-18')).toEqual({ origin: 'orlando', destination: 'miami' });
    expect(travelLeg(trip, '2026-11-21')).toEqual({ origin: 'miami', destination: null });
    expect(travelLeg(trip, '2026-11-08')).toBeNull();
  });

  it('tem 19 dias de passeio: 7 em NY, 10 em Orlando, 2 em Miami', () => {
    const days = sightseeingDays(trip);
    expect(days).toHaveLength(19);
    expect(days.filter((d) => d.cityId === 'nova-york').map((d) => d.date)).toEqual([
      '2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06',
    ]);
    expect(days.filter((d) => d.cityId === 'orlando')).toHaveLength(10);
    expect(days.filter((d) => d.cityId === 'miami').map((d) => d.date)).toEqual(['2026-11-19', '2026-11-20']);
  });

  it.each(Object.entries(expected))('cidade do dia %s = %s', (date, city) => {
    expect(cityForDate(trip, date)).toBe(city);
  });

  it('classifica dias fora do período', () => {
    expect(dayInfo(trip, '2026-10-30').kind).toBe('outside');
    expect(dayInfo(trip, '2026-11-22').kind).toBe('outside');
  });

  it('aceita origem e destino em dias de locomoção', () => {
    expect(citiesForDate(trip, '2026-11-07')).toEqual(['nova-york', 'orlando']);
    expect(citiesForDate(trip, '2026-11-21')).toEqual(['miami']);
    expect(citiesForDate(trip, '2026-11-10')).toEqual(['orlando']);
    expect(citiesForDate(trip, '2026-12-01')).toEqual([]);
  });

  it('calcula "hoje" no fuso de Nova York, não no do aparelho', () => {
    // 02:30 UTC de 07/11 ainda é 06/11 em Nova York (UTC-5 após o fim do horário de verão).
    expect(todayInTripZone(new Date('2026-11-07T02:30:00Z'))).toBe('2026-11-06');
    expect(todayInTripZone(new Date('2026-11-07T05:30:00Z'))).toBe('2026-11-07');
    // Antes do fim do horário de verão (UTC-4).
    expect(todayInTripZone(new Date('2026-10-31T03:59:00Z'))).toBe('2026-10-30');
    expect(todayInTripZone(new Date('2026-10-31T04:00:00Z'))).toBe('2026-10-31');
  });

  it('formata o rótulo do dia', () => {
    expect(formatDayLabel('2026-10-31')).toBe('sábado, 31/10');
    expect(formatDayLabel('2026-11-07')).toBe('sábado, 07/11');
  });
});

describe('datas dos rótulos e "hoje" (feature 013)', () => {
  it('formatDayMonth: DD/MM', () => {
    expect(formatDayMonth('2026-11-19')).toBe('19/11');
    expect(formatDayMonth('2026-10-31')).toBe('31/10');
  });

  it('formatWeekday: dia da semana por extenso, com inicial maiúscula', () => {
    expect(formatWeekday('2026-11-19')).toBe('Quinta-feira');
    expect(formatWeekday('2026-11-01')).toBe('Domingo');
    expect(formatWeekday('2026-10-31')).toBe('Sábado');
    expect(formatWeekday('2026-11-18')).toBe('Quarta-feira');
  });

  it('deviceToday: a data local do aparelho, sem horário', () => {
    expect(deviceToday(new Date(2026, 10, 2, 23, 59))).toBe('2026-11-02');
    expect(deviceToday(new Date(2026, 9, 31, 0, 1))).toBe('2026-10-31');
  });

  it('todayInCity: só dentro do período, com os limites', () => {
    const ny = ['2026-10-31', '2026-11-01', '2026-11-02'];
    expect(todayInCity(ny, '2026-11-02')).toBe('2026-11-02');
    expect(todayInCity(ny, '2026-10-31')).toBe('2026-10-31');
    expect(todayInCity(ny, '2026-10-30')).toBeUndefined();
    expect(todayInCity(ny, '2026-11-03')).toBeUndefined();
    expect(todayInCity([], '2026-11-03')).toBeUndefined();
  });
});
