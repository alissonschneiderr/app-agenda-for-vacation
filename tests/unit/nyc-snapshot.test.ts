// Feature 007 (T002): o leitor passa a aceitar também o doc de Orlando. A saída para o doc de Nova York
// MUST continuar idêntica (ids, títulos, horários, lugares, áreas, avisos, docHtml, departures):
// qualquer mudança de id deixaria órfãs as marcações do casal. Nunca atualizar este snapshot.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseNycDoc } from '../../scripts/doc-parser';

const dir = join(import.meta.dirname, '../../content/full/nova-york');
const read = (f: string) => readFileSync(join(dir, f), 'utf8');

describe('regressão: leitor sobre o doc de Nova York', () => {
  it('saída idêntica à de antes da feature 007', () => {
    const meta = JSON.parse(read('meta.json'));
    const { doc, errors } = parseNycDoc(read('roteiro.md'), {
      year: 2026,
      pointLinks: JSON.parse(read('point-links.json')),
      commitments: meta.commitments,
      checklistOverrides: meta.checklistOverrides,
    });
    expect(errors).toEqual([]);
    expect(doc).toMatchSnapshot();
  });
});
