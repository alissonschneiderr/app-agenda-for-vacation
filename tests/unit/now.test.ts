import { describe, expect, it } from 'vitest';
import { parseNycDoc } from '../../scripts/doc-parser';
import { indexContent } from '../../src/content/load';
import { markActivity } from '../../src/domain/full-itinerary';
import {
  allSteps,
  currentArea,
  dayKind,
  howToGet,
  modeOf,
  nextStep,
  nowFromUrl,
  nowIndex,
  stepEnd,
  tripNow,
  tripPhase,
  upcoming,
} from '../../src/domain/now';
import { dayView } from '../../src/domain/trip-view';
import { emptyState } from '../../src/storage/user-store';
import { fixtureContent } from '../fixtures/content';
import { fixtureFullItinerary } from '../fixtures/full-itinerary';

const DOC = `# Teste

Oct 22, 2026 · @Alisson

## Dia 2 (domingo, 01/11): SoHo · Chinatown

Um dia de teste.

**⚠️ Maratona:** os relógios voltam 1 hora.

**09h40 – saída:** metrô 6 até Bleecker St (\\~15 min).

### 📍 SoHo

**Atrações (no roteiro):**

- **10h00 — 🏛️ Greene Street**
  - O maior conjunto de ferro fundido.
- **11h15 às 12h30 — 🛍️ Compras no SoHo** (lista abaixo).
- **\\~12h30 — pausa livre** (tempo para comer).

🚶 **Deslocamento para Chinatown:** 10 minutos a pé, descendo a Mott Street.

### 📍 Chinatown

**Atrações (no roteiro):**

- **13h40 — 🏛️ Mott Street**
  - A rua principal.
- **13h55 — 🏛️ Doyers Street**
  - A curva.

🛥️ **Deslocamento para Williamsburg (14h40):** **NYC Ferry**, rota East River.

- **15h00 às 16h25 — 🛍️ Compras na Bedford Avenue** (lista abaixo).

🏨 **\\~16h30 – volta ao hotel:** metrô E até Lexington Av/53 St.
`;

function setup() {
  const c = fixtureContent();
  const full = fixtureFullItinerary();
  const { doc } = parseNycDoc(DOC, { year: 2026, pointLinks: {}, commitments: [] });
  full.days = full.days.map((d) => doc.days.find((x) => x.date === d.date) ?? d);
  c.fullItineraries = [full];
  const content = indexContent(c);
  return { content, day: (s = emptyState()) => dayView(content, s, '2026-11-01') };
}

const min = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));
const title = (a: { title: string } | null | undefined) => a?.title;

describe('now.ts (feature 006)', () => {
  it('fim do passo: explícito; senão, início do seguinte; senão, +15 min', () => {
    const list = allSteps(setup().day());
    const at = (t: string) => list.findIndex((a) => a.title === t);
    expect(stepEnd(list, at('Compras no SoHo'))).toBe(min('12:30'));
    expect(stepEnd(list, at('Greene Street'))).toBe(min('11:15'));
    expect(stepEnd(list, list.length - 1)).toBe(min('16:45'));
  });

  it('próximo passo: pula deslocamentos, intervalos livres e marcados; null com o dia concluído', () => {
    const { day } = setup();
    expect(title(nextStep(day(), min('09:00')))).toBe('Greene Street');
    expect(title(nextStep(day(), min('11:20')))).toBe('Compras no SoHo');
    // às 12h45 a pausa livre não conta: o próximo é Mott Street
    expect(title(nextStep(day(), min('12:45')))).toBe('Mott Street');
    let s = markActivity(emptyState(), 'ny3-2026-11-01-05', 'done');
    s = markActivity(s, 'ny3-2026-11-01-02', 'skipped');
    expect(title(nextStep(day(s), min('09:00')))).toBe('Compras no SoHo');
    // tudo passou: volta ao primeiro pendente
    expect(title(nextStep(day(), min('23:00')))).toBe('Greene Street');
    // não é hoje: o primeiro pendente
    expect(title(nextStep(day(), null))).toBe('Greene Street');
    let all = emptyState();
    for (const a of allSteps(day()).filter((x) => x.trackable)) all = markActivity(all, a.key, 'done');
    expect(nextStep(day(all), min('10:00'))).toBeNull();
  });

  it('os próximos 3 depois do passo atual', () => {
    const d = setup().day();
    const step = nextStep(d, min('09:00'));
    expect(upcoming(d, step).map((a) => a.title)).toEqual(['Compras no SoHo', 'Mott Street', 'Doyers Street']);
  });

  it('marca "agora": antes do primeiro passo que começa depois do horário', () => {
    const d = setup().day();
    const list = allSteps(d);
    expect(list[nowIndex(d, min('13:45'))]!.title).toBe('Doyers Street');
    expect(nowIndex(d, min('23:00'))).toBe(list.length);
    expect(nowIndex(d, min('06:00'))).toBe(0);
  });

  it('região atual = a do próximo passo; sem passo, a última', () => {
    const d = setup().day();
    expect(currentArea(d, nextStep(d, min('13:30')))?.name).toBe('Chinatown');
    expect(currentArea(d, null)?.name).toBe('Chinatown');
  });

  it('como chegar: saída do hotel, deslocamento da região anterior, deslocamento com horário', () => {
    const d = setup().day();
    const by = (t: string) => allSteps(d).find((a) => a.title === t)!;
    expect(howToGet(d, by('Greene Street'))).toMatchObject({ title: 'saída', text: 'metrô 6 até Bleecker St (~15 min).', mode: 'subway' });
    expect(howToGet(d, by('Mott Street'))).toMatchObject({ text: 'Deslocamento para Chinatown: 10 minutos a pé, descendo a Mott Street.', mode: 'walk' });
    expect(howToGet(d, by('Compras na Bedford Avenue'))).toMatchObject({ timeLabel: '14h40', mode: 'ferry' });
    expect(howToGet(d, by('Doyers Street'))).toBeNull();
  });

  it('modo de transporte pelo texto do roteiro', () => {
    expect(modeOf('táxi (~15 min)')).toBe('taxi');
    expect(modeOf('metrô E até Lexington, ou táxi')).toBe('subway');
    expect(modeOf('10 minutos a pé')).toBe('walk');
  });

  it('tipo de dia e fase da viagem', () => {
    const { content } = setup();
    expect(dayKind(content, '2026-11-07')).toBe('transit');
    expect(dayKind(content, '2026-11-09')).toBe('park');
    expect(tripPhase(content, '2026-10-30')).toBe('before');
    expect(tripPhase(content, '2026-11-03')).toBe('during');
    expect(tripPhase(content, '2026-11-22')).toBe('after');
  });

  it('?agora= vira o horário local da viagem, inclusive depois do fim do horário de verão', () => {
    expect(tripNow(nowFromUrl('?agora=2026-11-01T13:30'))).toEqual({ date: '2026-11-01', minutes: min('13:30') });
    expect(tripNow(nowFromUrl('?x=1&agora=2026-10-31T08:05'))).toEqual({ date: '2026-10-31', minutes: min('08:05') });
    const real = new Date('2026-11-03T15:00:00Z');
    expect(nowFromUrl('', real)).toBe(real);
    expect(nowFromUrl('?agora=amanhã', real)).toBe(real);
  });
});
