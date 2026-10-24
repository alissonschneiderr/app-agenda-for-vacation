import { render, screen, within } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Nearby } from '../../src/pages/Nearby';
import { setupCompanion } from './companion-helpers';

afterEach(() => {
  vi.useRealTimers();
  window.location.hash = '';
});

describe('Por perto (feature 006, US3)', () => {
  it('abre na região do próximo passo, com seletor de regiões', () => {
    const { content } = setupCompanion('2026-11-01T18:30:00Z');
    render(<Nearby content={content} />);
    const chips = screen.getByRole('navigation', { name: 'Regiões do dia' });
    expect(within(chips).getByRole('link', { name: 'Chinatown' }).getAttribute('aria-current')).toBe('true');
    expect(screen.getByText('☕ Nenhuma cafeteria no estilo La Cabra neste bairro.')).toBeTruthy();
    expect(screen.getAllByRole('link', { name: 'Nom Wah Tea Parlor' })).toHaveLength(1);
  });

  it('grupos com contagem e filtro ☕/🏆/🍰', () => {
    const { content } = setupCompanion('2026-11-01T14:30:00Z');
    window.location.hash = '#/perto/2026-11-01/soho?g=comer&n=%F0%9F%8D%B0';
    render(<Nearby content={content} date="2026-11-01" areaId="soho" />);
    const groups = screen.getByRole('navigation', { name: 'Tipo de opção' });
    expect(within(groups).getAllByRole('link').map((a) => a.textContent)).toEqual(['Comer (3)', 'Lojas (1)', 'Curiosidades (1)']);
    expect(screen.getAllByRole('link', { name: /Dominique Ansel|La Cabra|Prince Street/ }).map((a) => a.getAttribute('aria-label'))).toEqual([
      'Dominique Ansel Bakery',
    ]);
  });

  it('cartão curto: nível, nome, preço, texto e fila; curiosidade com obra e dica de foto', () => {
    const { content } = setupCompanion('2026-11-01T14:30:00Z');
    window.location.hash = '#/perto/2026-11-01/soho?g=comer';
    const { unmount } = render(<Nearby content={content} date="2026-11-01" areaId="soho" />);
    const card = screen.getByRole('link', { name: 'La Cabra SoHo' });
    expect(card.textContent).toContain('Café coado');
    expect(card.textContent).toContain('💵');
    expect(card.textContent).toContain('Peçam um coado');
    expect(card.textContent).toContain('Fila: Fila no fim de semana');
    unmount();
    window.location.hash = '#/perto/2026-11-01/soho?g=curiosidades';
    render(<Nearby content={content} date="2026-11-01" areaId="soho" />);
    const ghost = screen.getByRole('link', { name: '102 Prince St' });
    expect(ghost.textContent).toContain('Ghost (1990): o loft.');
    expect(ghost.textContent).toContain('Foto: da esquina oposta.');
  });

  it('detalhe da opção com mapa e "Mostrar ao motorista"', () => {
    const { content } = setupCompanion('2026-11-01T14:30:00Z');
    render(<Nearby content={content} date="2026-11-01" areaId="soho" placeId="shop-kith" />);
    expect(screen.getByRole('link', { name: 'Abrir no mapa' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Mostrar ao motorista/ }).getAttribute('href')).toBe('#/motorista/2026-11-01/shop-kith');
  });

  it('dia sem regiões (Orlando) leva ao guia da cidade', () => {
    const { content } = setupCompanion('2026-11-01T14:30:00Z');
    render(<Nearby content={content} date="2026-11-09" />);
    expect(screen.getByRole('link', { name: /Ver o guia de Orlando/ })).toBeTruthy();
  });
});
