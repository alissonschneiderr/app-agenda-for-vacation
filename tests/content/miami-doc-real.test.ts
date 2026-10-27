// Confere o roteiro de Miami do app contra a cópia do documento do casal (feature 012, SC-001–SC-004, SC-006).
// As contagens são feitas direto no texto, com expressões simples, sem usar o leitor.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { docErrors, readFullItineraries } from '../../scripts/build-content';

const md = readFileSync(join(import.meta.dirname, '../../content/full/miami/roteiro.md'), 'utf8');
const source = readFileSync(join(import.meta.dirname, '../../specs/012-miami-itinerary-doc/source/roteiro-miami-2026-10-27-rev15.md'), 'utf8');
const mia = readFullItineraries().find((f) => f.id === 'miami')!;
const sections = md.split(/^## /m).slice(1);
const dayText = (date: string) => sections.find((s) => s.startsWith('Dia') && s.split('\n')[0]!.includes(`${date.slice(8)}/${date.slice(5, 7)}`))!;
const strip = (s: string) => s.replace(/\\~/g, '~');
const TIMED = /^- \*\*(\\?~?\d{1,2}h(?:\d{2})?)/gm;
const words = (s: string) =>
  s
    .replace(/\]\([^)]*\)/g, ']')
    .replace(/[*_\\[\]#|>-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

describe('roteiro de Miami = cópia do documento (27/10/2026, rev. 15)', () => {
  it('sem erros de leitura nem de fidelidade', () => {
    expect(docErrors.filter((e) => e.includes('miami'))).toEqual([]);
  });

  it('os 3 dias, de 18 a 20/11, com os títulos do documento', () => {
    expect(mia.days.map((d) => d.date)).toEqual(['2026-11-18', '2026-11-19', '2026-11-20']);
    expect(sections.filter((s) => s.startsWith('Dia')).map((s) => s.split('\n')[0]!.split(': ')[1])).toEqual([
      'Chegada · South Beach · Ocean Drive',
      'Compras na Sawgrass Mills',
      'Praia · South Pointe · Joe\'s Stone Crab',
    ]);
  });

  it('as atrações com horário estão no app, na ordem, com o horário do documento (SC-001)', () => {
    for (const d of mia.days) {
      // A chegada de 18/11 ("### 🚆 Chegada e traslado") vai para o bloco "A chegada" (US2), não para as paradas.
      const text = dayText(d.date).replace(/### 🚆[\s\S]*?(?=\n### )/u, '');
      const labels = [...text.matchAll(TIMED)].map((m) => strip(m[1]!));
      // Refeições com horário fora da lista ("**08h00 – café da manhã**", "**15h30 – almoço tardio**") contam à parte.
      const app = d.activities.filter((a) => a.type !== 'transit' && !/^(café da manhã|almoço tardio)$/.test(a.title)).map((a) => a.timeLabel);
      expect(app, d.date).toEqual(labels);
    }
  });

  it('refeições e check-in com horário entram na linha do tempo, fora do progresso (não viram "Dicas")', () => {
    const titles = (d: number) => mia.days[d]!.activities.filter((a) => a.type === 'free').map((a) => a.title);
    expect(titles(0)).toEqual(['almoço tardio']);
    expect(titles(1)).toEqual(['café da manhã', 'pausa livre']);
    expect(mia.days.flatMap((d) => d.alerts ?? [])).toEqual([]);
  });

  it('18/11 (US2): a chegada vai para o bloco "A chegada", com os 2 itens com horário e os traslados', () => {
    const a = mia.arrivals!['2026-11-18']!;
    expect(a.items.map((i) => i.label)).toEqual(['14h21 – chegada na MiamiCentral', '~15h15 – Kasa La Flora']);
    expect(a.html).toMatch(/Uber ou Lyft/);
    expect(a.html).toMatch(/Metrobus 120/);
    expect(a.html).toMatch(/Shuttle da Brightline/);
    expect(mia.days[0]!.areas!.map((x) => x.name)).toEqual(['South Beach (Art Deco District)']);
  });

  it('restaurantes e cafés: 4, 5 e 6 nos dias certos (SC-002)', () => {
    expect(mia.days.map((d) => (d.places ?? []).filter((p) => p.kind === 'food').length)).toEqual([4, 5, 6]);
    expect((mia.days[2]!.places ?? []).find((p) => p.name === "Joe's Stone Crab")).toBeTruthy();
  });

  it('todos os links de fotos e de mapa do texto estão no app (SC-003)', () => {
    const have = new Set(
      mia.days.flatMap((d) => [
        ...(d.places ?? []).flatMap((p) => [...p.mapsUrls, ...(p.photoUrls ?? [])]),
        ...(d.areas ?? []).flatMap((a) => [...a.photoUrls, ...(a.mapsUrls ?? [])]),
      ]).map((l) => l.url),
    );
    const html = mia.docHtml!.map((h) => h.html).join(' ');
    for (const s of sections.filter((x) => x.startsWith('Dia'))) {
      for (const [, url] of s.matchAll(/\]\((https:\/\/www\.google\.com\/(?:search\?tbm=isch|maps)[^)\s]+)\)/g)) {
        expect(have.has(url!) || html.includes(url!.replace(/&/g, '&amp;')), url).toBe(true);
      }
    }
  });

  it('documento completo: a abertura e todas as seções "##", na ordem (SC-004)', () => {
    expect(mia.docHtml!.map((h) => h.title)).toEqual(['Roteiro Miami — 18 a 20 de novembro', ...sections.map((s) => s.split('\n')[0]!.trim())]);
    expect(mia.docHtml![0]!.html).toMatch(/Thanksgiving/);
    expect(mia.docHtml![0]!.html).toMatch(/Kasa La Flora/);
  });

  it('nada fora do documento: o texto do app é o da cópia, palavra por palavra (SC-006)', () => {
    // Ajustes de formato da conversão (research R2): byline, "Sobre as fotos" e a linha de almoço/check-in.
    const app = words(md).join(' ');
    const src = words(source)
      .join(' ')
      .replace(/^(.*?) 2026 10 27 · Alisson/, '$1 Oct 27, 2026 · @Alisson')
      .replace(/ \*?\*?Sobre as fotos:.*?\(que também mostra fotos do lugar\)\./, '');
    expect(words(app).filter((w) => !src.includes(w))).toEqual([]);
  });
});

describe('preparação de Miami (feature 012, US3)', () => {
  it('6 reservas com a data de uso do documento; "Antes de embarcar" sem data', () => {
    expect(mia.checklist.map((c) => c.forDate)).toEqual(['2026-11-18', '2026-11-19', '2026-11-19', '2026-11-20', '2026-11-18', undefined]);
    expect(mia.checklist[3]!.what).toBe("Joe's Stone Crab, jantar às 18h");
  });

  it('dicas por categoria, com o texto do documento', () => {
    expect((mia.tips ?? []).map((t) => [t.category, t.title])).toEqual([
      ['reservas', 'O que reservar ou confirmar antes'],
      ['transporte', 'Transporte'],
      ['clima', 'Clima no fim de novembro'],
      ['dinheiro', 'Gorjetas'],
      ['dinheiro', 'Impostos e compras'],
      ['outros', 'Segurança'],
      ['outros', 'O que levar para a praia'],
      ['outros', 'Outros'],
    ]);
  });

  it('"O que levar para a praia" com 7 itens marcáveis no documento', () => {
    const tips = mia.docHtml!.find((h) => h.title === '🧳 Dicas práticas')!.html;
    const praia = tips.slice(tips.indexOf('O que levar para a praia'));
    expect(praia.slice(0, praia.indexOf('</ul>')).match(/type="checkbox"/g)).toHaveLength(7);
  });
});
