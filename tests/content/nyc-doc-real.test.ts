// Confere o roteiro de Nova York do app contra a cópia do doc do casal (feature 005, SC-001–SC-005).
// As contagens são feitas direto no texto, com expressões simples, sem usar o leitor.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { readFullItineraries } from '../../scripts/build-content';

const md = readFileSync(join(import.meta.dirname, '../../content/full/nova-york/roteiro.md'), 'utf8');
const ny = readFullItineraries().find((f) => f.id === 'nova-york')!;
const strip = (s: string) => s.replace(/\\~/g, '~');

/** Seções "## Dia N (…, dd/mm)" do texto, por data. */
function daySections(): Map<string, string> {
  const out = new Map<string, string>();
  for (const s of md.split(/^## /m).slice(1)) {
    const m = /^Dia \d+ \([^,]+, (\d{2})\/(\d{2})\)/.exec(s);
    if (m) out.set(`2026-${m[2]}-${m[1]}`, s);
  }
  return out;
}

describe('roteiro de NY = cópia do doc (22/10/2026)', () => {
  const sections = daySections();

  it('os 7 dias, de 31/10 a 06/11', () => {
    expect(ny.days.map((d) => d.date)).toEqual(['2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06']);
  });

  it('os "###" de cada dia, na ordem, são as áreas do app', () => {
    for (const d of ny.days) {
      const headings = [...sections.get(d.date)!.matchAll(/^### \S+ (.+)$/gmu)].map((m) => m[1]!.trim());
      expect(d.areas!.map((a) => a.name), d.date).toEqual(headings);
    }
    expect(ny.days[1]!.areas!.map((a) => a.name)).toEqual(['SoHo', 'Nolita', 'Chinatown', 'Little Italy', 'Lower East Side', 'East Village']);
  });

  it('os 75 itens de lista com horário estão no app, na ordem, com o horário do doc (SC-001)', () => {
    let total = 0;
    for (const d of ny.days) {
      const labels = [...sections.get(d.date)!.matchAll(/^- \*\*((?:até )?\\?~?\d{2}h(?:\d{2})?(?:\s*(?:às|–)\s*\\?~?\d{2}h(?:\d{2})?)?)/gm)].map((m) => strip(m[1]!));
      total += labels.length;
      const inApp = d.activities.map((a) => a.timeLabel);
      let from = 0;
      for (const l of labels) {
        const at = inApp.indexOf(l, from);
        expect(at, `${d.date} ${l}`).toBeGreaterThanOrEqual(from);
        from = at + 1;
      }
    }
    expect(total).toBe(75);
  });

  it('as 16 linhas de logística com horário viram deslocamentos sem Feito/Pendente', () => {
    const lines = [...md.matchAll(/^(?:🏨|🚶|🛥️|🚕)? ?\*\*(?:\\~)?[^*]*\d{2}h\d{2}[^*]*\*\*/gmu)].length;
    expect(lines).toBe(16);
    const transit = ny.days.flatMap((d) => d.activities).filter((a) => a.type === 'transit' && a.timeLabel);
    expect(transit.length).toBeGreaterThanOrEqual(16);
  });

  it('noites com evento: desfile, Knicks, MJ e Harlem', () => {
    const night = (date: string, title: RegExp) => ny.days.find((d) => d.date === date)!.activities.find((a) => title.test(a.title));
    expect(night('2026-10-31', /Village Halloween Parade/)).toMatchObject({ timeLabel: '19h', type: 'attraction' });
    expect(night('2026-11-02', /Knicks x Nets/)).toMatchObject({ timeLabel: '19h30', type: 'commitment', commitmentId: 'knicks-nets' });
    expect(night('2026-11-05', /MJ The Musical/)).toMatchObject({ timeLabel: '19h00', type: 'commitment', commitmentId: 'mj-musical' });
    expect(night('2026-11-06', /jantar no Harlem/)).toMatchObject({ timeLabel: '19h' });
    expect(ny.days.find((d) => d.date === '2026-11-04')!.activities.some((a) => /MJ/.test(a.title))).toBe(false);
  });

  it('compromissos: Knicks 02/11 19h30 chegada 18h30; MJ 05/11 19h chegada 18h30 (FR-014)', () => {
    expect(ny.commitments).toEqual([
      expect.objectContaining({ id: 'knicks-nets', date: '2026-11-02', time: '19:30', arriveBy: '18:30' }),
      expect.objectContaining({ id: 'mj-musical', date: '2026-11-05', time: '19:00', arriveBy: '18:30' }),
    ]);
  });

  it('pausas e tardes livres ficam fora do progresso (FR-006)', () => {
    const free = ny.days.flatMap((d) => d.activities).filter((a) => a.type === 'free');
    expect(free.map((a) => a.title)).toEqual(expect.arrayContaining(['pausa livre', 'tarde livre']));
  });

  it('nenhuma atividade dos roteiros anteriores (ids ny- e nyv2-) (SC-005)', () => {
    expect(ny.days.flatMap((d) => d.activities).every((a) => a.id.startsWith('ny3-'))).toBe(true);
  });

  it('todos os links de fotos e de mapa do doc estão no app (SC-003)', () => {
    const photos = md.match(/https:\/\/www\.google\.com\/search\?tbm=isch[^)\s>]+/g)!;
    const maps = md.match(/https:\/\/www\.google\.com\/maps\/search[^)\s>]+/g)!;
    expect(photos).toHaveLength(85);
    expect(maps).toHaveLength(160);
    const inApp = new Set([
      ...ny.days.flatMap((d) => d.places!.flatMap((p) => [...p.mapsUrls, ...(p.photoUrls ?? [])].map((u) => u.url))),
      ...ny.days.flatMap((d) => d.areas!.flatMap((a) => a.photoUrls.map((u) => u.url))),
      ...ny.days.flatMap((d) => d.areas!.flatMap((a) => [...(a.notesHtml ?? '').matchAll(/href="([^"]+)"/g)].map((m) => m[1]!.replace(/&amp;/g, '&')))),
    ]);
    for (const u of [...photos, ...maps]) expect(inApp.has(u), u).toBe(true);
  });

  it('Chinatown: 6 opções de comida e o aviso de cafeteria (US2)', () => {
    const d = ny.days.find((x) => x.date === '2026-11-01')!;
    const area = d.areas!.find((a) => a.name === 'Chinatown')!;
    const food = area.placeIds.filter((id) => id.startsWith('food-'));
    expect(food).toHaveLength(6);
    expect(area.notesHtml).toContain('Nenhuma cafeteria no estilo La Cabra neste bairro.');
  });

  it('o que comprar antes: 8 itens, Tenement às 16h15 (Q1), ingressos ligados ao dia (FR-017)', () => {
    expect(ny.checklist.map((c) => c.what)).toEqual([
      'Top of the Rock, horário das 15h',
      'Tenement Museum, tour das 16h15',
      'Museu de História Natural, 10h',
      'MET, 15h',
      'MoMA, 10h30',
      'Vessel, ~12h30',
      'Visita guiada da Biblioteca Pública',
      'Empire State Building, 12h (86º andar)',
    ]);
    const ticketed = ny.days.flatMap((d) => d.activities).filter((a) => a.booking.required);
    expect(ticketed).toHaveLength(7);
    for (const a of ticketed) expect(ny.checklist.some((c) => c.activityId === a.id), a.title).toBe(true);
  });

  it('todas as seções "##" do doc, na ordem, e a partida em 07/11 (SC-004, FR-015)', () => {
    const titles = [...md.matchAll(/^## (.+)$/gm)].map((m) => m[1]!.trim());
    expect(ny.docHtml!.map((h) => h.title)).toEqual(titles);
    expect(ny.dayNotes!['2026-11-07']).toContain('LaGuardia');
    expect(ny.departures!['2026-11-07']!.map((d) => [d.label, d.block])).toEqual([
      ['Check-out', 'before'],
      ['Chegada ao aeroporto', 'trip'],
      ['Melhor forma de ir: táxi ou Uber', 'trip'],
      ['Último café', 'before'],
    ]);
    // Avisos do dia (feature 006): a maratona em 01/11, sem a legenda de preço.
    expect(ny.days[1]!.alerts!.some((a) => a.html.includes('Maratona'))).toBe(true);
    expect(ny.days[0]!.alerts?.some((a) => a.html.includes('Legenda')) ?? false).toBe(false);
  });
});
