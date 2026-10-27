// Feature 008 (T011): endereços antigos levam à tela equivalente; a barra de baixo é Início · Dicas · Transporte.
import { describe, expect, it } from 'vitest';
import { redirectFor } from '../../src/app';
import { fixtureContent } from '../fixtures/content';

const content = fixtureContent();

describe('redirecionamentos (feature 008)', () => {
  it('"#/viagem" vai para o Início', () => {
    expect(redirectFor('/viagem', content)).toBe('/');
  });

  it('"#/dia" vai para hoje durante a viagem e para o 1º dia fora dela', () => {
    expect(redirectFor('/dia', content, '2026-11-03')).toBe('/dia/2026-11-03');
    expect(redirectFor('/dia', content, '2026-10-27')).toBe('/dia/2026-10-31');
    expect(redirectFor('/dia', content, '2026-12-01')).toBe('/dia/2026-10-31');
  });

  it('rotas das features 002/003 continuam redirecionando', () => {
    expect(redirectFor('/destino/nova-york/2026-11-02', content)).toBe('/dia/2026-11-02');
    expect(redirectFor('/full/nova-york/2026-11-03', content)).toBe('/dia/2026-11-03');
    expect(redirectFor('/full/nova-york/documento', content)).toBeNull();
    expect(redirectFor('/cidade/orlando', content)).toBeNull();
  });
});

describe('redirecionamentos (feature 009)', () => {
  it('Dicas, Transporte, "Por perto" e Viagem vão para o Início; abas da cidade vão para a cidade', () => {
    for (const p of ['/dicas', '/transporte', '/perto', '/viagem']) expect(redirectFor(p, content), p).toBe('/');
    expect(redirectFor('/cidade/orlando/bairros', content)).toBe('/cidade/orlando');
    expect(redirectFor('/cidade/nova-york/dicas', content)).toBe('/cidade/nova-york');
    expect(redirectFor('/exibicao', content)).toBeNull();
    expect(redirectFor('/perto/2026-11-01/soho', content)).toBeNull();
  });
});
