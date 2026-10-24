// Confere o roteiro de Orlando do app contra a cópia do doc do casal (feature 007, SC-001–SC-005).
// As contagens são feitas direto no texto, com expressões simples, sem usar o leitor.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { docErrors, readFullItineraries } from '../../scripts/build-content';

const md = readFileSync(join(import.meta.dirname, '../../content/full/orlando/roteiro.md'), 'utf8');
const orl = readFullItineraries().find((f) => f.id === 'orlando')!;
const sections = md.split(/^## /m).slice(1);
const dayText = (date: string) => sections.find((s) => s.startsWith('Dia') && s.split('\n')[0]!.includes(`${date.slice(8)}/${date.slice(5, 7)}`))!;
const strip = (s: string) => s.replace(/\\~/g, '~');
const TIMED = /^- \*\*(\\?~?\d{1,2}h(?:\d{2})?(?:\s*(?:–|ou)\s*\\?~?\d{1,2}h(?:\d{2})?)?)/gm;

describe('roteiro de Orlando = cópia do doc (24/10/2026, rev. 26)', () => {
  it('sem erros de leitura nem de fidelidade', () => {
    expect(docErrors.filter((e) => !e.includes('nova-york'))).toEqual([]);
  });

  it('os 10 dias, de 08 a 17/11', () => {
    expect(orl.days.map((d) => d.date)).toEqual([
      '2026-11-08',
      '2026-11-09',
      '2026-11-10',
      '2026-11-11',
      '2026-11-12',
      '2026-11-13',
      '2026-11-14',
      '2026-11-15',
      '2026-11-16',
      '2026-11-17',
    ]);
  });

  it('os 75 itens com horário estão no app, na ordem, com o horário do doc (SC-001)', () => {
    let total = 0;
    for (const d of orl.days) {
      const labels = [...dayText(d.date).matchAll(TIMED)].map((m) => strip(m[1]!));
      total += labels.length;
      const app = d.activities.filter((a) => a.type !== 'transit' && a.type !== 'shopping').map((a) => a.timeLabel);
      expect(app, d.date).toEqual(labels);
    }
    expect(total).toBe(75);
  });

  it('95 passos no total; 69 com Feito/Pendente (sem almoços nem "tempo livre", com as 2 compras)', () => {
    const acts = orl.days.flatMap((d) => d.activities);
    expect(acts).toHaveLength(75 + 18 + 2);
    expect(acts.filter((a) => a.type === 'transit')).toHaveLength((md.match(/^\*\*\d{2}h\d{2} – (chegada|saída)/gm) ?? []).length + (md.match(/^### 🏨/gm) ?? []).length);
    expect(acts.filter((a) => a.type === 'free').map((a) => a.title.split(' ')[0])).toEqual(['Almoço', 'Almoço', 'Shows', 'Almoço', 'Almoço', 'Almoço', 'Almoço', 'Almoço']);
    expect(acts.filter((a) => a.type !== 'transit' && a.type !== 'free')).toHaveLength(69);
    expect(acts.filter((a) => a.type === 'shopping').map((a) => a.timeLabel)).toEqual(['~14h às 18h', '~13h às 17h']);
  });

  it('as regiões de cada dia são os "### 📍" e "### 🌙" do doc, na ordem', () => {
    for (const d of orl.days) {
      const headings = [...dayText(d.date).matchAll(/^### (?:📍|🌙) (.+)$/gmu)].map((m) => strip(m[1]!).trim());
      expect(d.areas!.map((a) => a.name), d.date).toEqual(headings);
    }
  });

  it('as 29 opções de "Onde comer" estão nos dias certos (SC-002)', () => {
    const docFood = sections.flatMap((s) => {
      const out: string[] = [];
      let inList = false;
      for (const l of s.split('\n')) {
        if (/Onde comer/.test(l)) inList = true;
        else if (/^#/.test(l)) inList = false;
        else if (inList && l.startsWith('- ')) out.push(l.slice(2));
      }
      return out;
    });
    expect(docFood).toHaveLength(29);
    const app = orl.days.flatMap((d) => (d.places ?? []).filter((p) => p.kind === 'food'));
    expect(app).toHaveLength(29);
  });

  it('todos os links de fotos e os 10 mapas do dia (SC-003)', () => {
    const photos = md.match(/https:\/\/www\.google\.com\/search\?tbm=isch[^)\s]+/g)!;
    expect(photos).toHaveLength(81);
    const have = new Set(orl.days.flatMap((d) => [...(d.places ?? []).flatMap((p) => p.photoUrls ?? []), ...(d.areas ?? []).flatMap((a) => a.photoUrls)].map((l) => l.url)));
    for (const u of photos) expect(have.has(u), u).toBe(true);
    expect(orl.days.filter((d) => d.mapUrl)).toHaveLength(10);
  });

  it('todas as seções "##" no documento completo, na ordem (SC-004)', () => {
    expect(orl.docHtml!.map((h) => h.title)).toEqual(sections.map((s) => s.split('\n')[0]!.trim()));
    expect(orl.docHtml).toHaveLength(17);
  });

  it('chegada (07/11): 2 itens marcáveis, mercados e noite em HTML', () => {
    const a = orl.arrivals!['2026-11-07']!;
    expect(a.items.map((i) => i.id)).toEqual(['tr:2026-11-07:c1', 'tr:2026-11-07:c2']);
    for (const m of ['Walmart Supercenter', 'Target', 'Publix', 'Disney Springs']) expect(a.html).toContain(m);
  });

  it('partida (18/11, Q1): check-out e carro do doc, trem do casal, nada de voo internacional', () => {
    expect(orl.departures!['2026-11-18']!.map((i) => [i.block, i.label])).toEqual([
      ['before', 'Check-out e carro'],
      ['trip', 'De trem para Miami'],
    ]);
    expect(JSON.stringify(orl.departures)).not.toMatch(/voo internacional/i);
    expect(orl.dayNotes?.['2026-11-18']).toBeUndefined();
  });

  it('reservas: 6 itens, com prazo nos dois Multi Pass e no Single Pass', () => {
    expect(orl.checklist).toHaveLength(6);
    expect(orl.checklist.map((c) => c.id)).toEqual(['ck:orlando:1', 'ck:orlando:2', 'ck:orlando:3', 'ck:orlando:4', 'ck:orlando:5', 'ck:orlando:6']);
    expect(orl.checklist.filter((c) => c.deadline).map((c) => [c.what.split(' (')[0], c.deadline])).toEqual([
      ['Multi Pass Hollywood Studios', '2026-11-06'],
      ['Multi Pass EPCOT', '2026-11-07'],
      ['Single Pass Guardians of the Galaxy', '2026-11-07'],
    ]);
    expect(orl.checklist.map((c) => c.forDate)).toEqual(['2026-11-09', '2026-11-10', '2026-11-10', '2026-11-13', '2026-11-14', '2026-11-12']);
  });

  it('passos dentro de um parque apontam para o parque (mapa e motorista, R8)', () => {
    const mk = orl.days[0]!.activities.find((a) => a.title === 'Jungle Cruise')!;
    expect(mk.pointId).toBe('orl-magic-kingdom');
    expect(orl.days[0]!.activities.find((a) => a.title === 'volta ao hotel')!.pointId).toBeUndefined();
  });
});
