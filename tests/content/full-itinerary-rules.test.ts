import { describe, expect, it } from 'vitest';
import { validateFullItinerary } from '../../scripts/full-itinerary-schema';
import type { FullItinerary } from '../../src/content/types';
import { fixtureFullItinerary } from '../fixtures/full-itinerary';

const strict = { strict: true };

function mutate(fn: (it: FullItinerary) => void): FullItinerary {
  const it = fixtureFullItinerary();
  fn(it);
  return it;
}
const day = (it: FullItinerary, date: string) => it.days.find((d) => d.date === date)!;
const errs = (it: FullItinerary, opts = strict) => validateFullItinerary(it, opts).join('\n');

describe('regras do roteiro FULL', () => {
  it('fixture completa passa no strict', () => {
    expect(validateFullItinerary(fixtureFullItinerary(), strict)).toEqual([]);
  });

  it('F1: schema', () => {
    expect(errs(mutate((it) => ((day(it, '2026-11-01').activities[0] as { start: string }).start = '9h')))).toMatch(/F1/);
    expect(errs(mutate((it) => (day(it, '2026-11-01').activities[0]!.facts = [{ text: 'x', status: 'confirmed', source: 'nao-url', checkedAt: '2026-10-21' }])))).toMatch(/F1/);
  });

  it('F2: os 7 dias em ordem', () => {
    expect(errs(mutate((it) => it.days.pop()))).toMatch(/F2/);
    expect(errs(mutate((it) => it.days.reverse()))).toMatch(/F2/);
  });

  it('F3: dia sem atividades', () => {
    expect(errs(mutate((it) => (day(it, '2026-11-03').activities = [])))).toMatch(/F3/);
  });

  it('F4: sobreposição; terminar exatamente no início da próxima é válido', () => {
    expect(errs(mutate((it) => (day(it, '2026-11-03').activities[2]!.durationMin = 90)))).toMatch(/F4/);
    // a fixture já tem atividades encostadas (fim == início da próxima)
    expect(validateFullItinerary(fixtureFullItinerary(), strict)).toEqual([]);
  });

  it('F8: compromisso presente e com 30 min de folga', () => {
    expect(errs(mutate((it) => (day(it, '2026-11-02').activities = day(it, '2026-11-02').activities.filter((a) => a.type !== 'commitment'))))).toMatch(/F8/);
    expect(errs(mutate((it) => (it.commitments[0]!.arriveBy = '19:01')))).toMatch(/arriveBy deve ser ≤ 19:00 \(F8\)/);
    // chega 29 min antes: inválido
    expect(errs(mutate((it) => (it.commitments[0]!.arriveBy = '19:01')))).toMatch(/F8/);
    const late = mutate((it) => {
      const d = day(it, '2026-11-02');
      d.activities.find((a) => a.type === 'commitment')!.start = '18:50';
      d.activities.find((a) => a.type === 'commitment')!.durationMin = 120;
    });
    expect(errs(late)).toMatch(/chega às 18:50/);
  });

  it('F9: outro espetáculo em 04/11', () => {
    expect(errs(mutate((it) => (day(it, '2026-11-04').activities.find((a) => a.type === 'attraction')!.title = 'Outro musical da Broadway')))).toMatch(/F9/);
  });

  it('F10: 31/10 começa no JFK e vai ao POD 51', () => {
    expect(errs(mutate((it) => (day(it, '2026-10-31').activities[0]!.place!.name = 'Aeroporto LGA')))).toMatch(/F10/);
  });

  it('feature 005: sem regra de refeições; duração deduzida não acusa sobreposição', () => {
    expect(errs(mutate((it) => day(it, '2026-11-03').activities.splice(day(it, '2026-11-03').activities.findIndex((a) => a.meal?.kind === 'snack'), 1)))).not.toMatch(/F11/);
    const inferred = mutate((it) => {
      const a = day(it, '2026-11-03').activities[2]!;
      a.durationMin = 600;
      a.inferredDuration = true;
    });
    expect(errs(inferred)).not.toMatch(/F4/);
  });

  it('feature 004: restrições de comida e lojas da 002 não valem mais', () => {
    expect(errs(mutate((it) => (day(it, '2026-11-03').activities[2]!.description = 'Ostras e Tiffany & Co.')))).toEqual('');
  });

  it('F8: chegada por uma linha "Chegada ao…" antes do compromisso', () => {
    const ok = mutate((it) => {
      const d = day(it, '2026-11-02');
      const c = d.activities.find((a) => a.type === 'commitment')!;
      c.start = '19:30';
      c.durationMin = 60;
      const before = d.activities[d.activities.indexOf(c) - 1]!;
      before.title = 'Chegada ao Madison Square Garden';
    });
    const out = errs(ok);
    expect(out).not.toMatch(/chega às/);
  });

  it('F15: local de série sem dados', () => {
    expect(errs(mutate((it) => (day(it, '2026-11-03').activities.find((a) => a.type === 'screen')!.screen = [])), { strict: false })).toMatch(/F15/);
  });

  it('F16: fato não confirmado precisa de nota', () => {
    const it = mutate((it) => (day(it, '2026-11-03').activities[2]!.facts = [{ text: 'x', status: 'unconfirmed' } as never]));
    expect(errs(it, { strict: false })).toMatch(/F1/);
  });

  it('F18: reserva sem item no checklist', () => {
    const it = mutate((it) => (day(it, '2026-11-03').activities.find((a) => a.type === 'attraction')!.booking = { required: true, how: 'site' }));
    expect(errs(it)).toMatch(/F18/);
    it.checklist.push({ what: 'Ingresso', forDate: '2026-11-03', deadline: '2026-10-28', activityId: 'ny-2026-11-03-05' });
    expect(errs(it)).not.toMatch(/F18/);
  });

  it('F19: pointId inexistente', () => {
    const it = mutate((it) => (day(it, '2026-11-03').activities[2]!.pointId = 'ny-nao-existe'));
    expect(errs(it, { strict: false, pointIds: new Set(['ny-met']) } as never)).toMatch(/F19/);
  });

  it('ids de atividade únicos e com a data do dia', () => {
    expect(errs(mutate((it) => (day(it, '2026-11-03').activities[1]!.id = 'ny-2026-11-04-02')), { strict: false })).toMatch(/id deve conter a data do dia \(-2026-11-03-\)/);
  });
});
