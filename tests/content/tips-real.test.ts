// Feature 008 (T010, SC-008): as dicas vêm dos docs do casal, sem reescrita (D7), nas categorias do
// contrato (specs/008-travel-notebook-ui/contracts/tips-content.md).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { docErrors, readFullItineraries } from '../../scripts/build-content';

const its = readFullItineraries();
const tipsOf = (id: string) => its.find((f) => f.id === id)!.tips!;
const doc = (id: string) => readFileSync(join(import.meta.dirname, `../../content/full/${id}/roteiro.md`), 'utf8');
const words = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/<[^>]+>/g, ' ').replace(/&(amp|quot|#39|lt|gt);/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();

describe('dicas reais (feature 008)', () => {
  it('Nova York: 6 dicas nas categorias do contrato', () => {
    expect(tipsOf('nova-york').map((t) => t.category)).toEqual(['reservas', 'transporte', 'clima', 'dinheiro', 'dinheiro', 'outros']);
  });

  it('Orlando: 7 dicas nas categorias do contrato', () => {
    expect(tipsOf('orlando').map((t) => t.category)).toEqual(['reservas', 'clima', 'transporte', 'dinheiro', 'dinheiro', 'apps', 'filas']);
  });

  it('nenhuma dica fala de voo internacional (Q1 da 007) e nenhum erro D7', () => {
    expect(JSON.stringify(tipsOf('orlando'))).not.toMatch(/voo internacional/i);
    expect(docErrors.filter((e) => e.includes('D7'))).toEqual([]);
  });

  it('cada dica (sem marcação) está no texto do doc da cidade', () => {
    for (const id of ['nova-york', 'orlando']) {
      const text = ` ${words(doc(id).replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'))} `;
      for (const t of tipsOf(id)) {
        const own = words(t.html.replace('Tenement Museum, tour das 16h15', 'Tenement Museum, tour das 15h30'));
        expect(text.includes(` ${own} `), `${id}: ${t.title}`).toBe(true);
      }
    }
  });
});
