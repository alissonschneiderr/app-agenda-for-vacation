// Feature 008 (T012, SC-002): nenhum texto do design de referência aparece no app — só o visual vale.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { assembleContent } from '../../scripts/build-content';

/** Termos próprios do design (destinos e títulos dele), sem relação com a viagem do casal. */
const TERMS = /\b(lisboa|coimbra|sintra|portugal|caderno de viagem|fado)\b/i;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : [p];
  });
}

/** Código sem comentários: comentários não aparecem na tela. */
function withoutComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
}

describe('nenhum texto do design no app (feature 008, SC-002)', () => {
  it('conteúdo (content.json)', () => {
    const m = JSON.stringify(assembleContent()).match(TERMS);
    expect(m?.[0]).toBeUndefined();
  });

  it('textos do código das telas (src/, sem comentários)', () => {
    const src = join(import.meta.dirname, '../../src');
    for (const f of files(src).filter((x) => /\.(tsx?|css)$/.test(x))) {
      const m = withoutComments(readFileSync(f, 'utf8')).match(TERMS);
      expect(m?.[0], f).toBeUndefined();
    }
  });
});
