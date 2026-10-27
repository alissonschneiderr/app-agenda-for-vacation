// Feature 009 (US1): o Início só com os destinos — 3 cards grandes, verticais e inteiramente clicáveis.
import { render, screen, within } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Start } from '../../src/pages/Start';
import { setupReal } from './companion-helpers';

afterEach(() => vi.useRealTimers());

describe('Início (feature 009, US1)', () => {
  for (const when of ['2026-10-27T15:00:00Z', '2026-11-01T18:30:00Z']) {
    it(`só os 3 destinos, sem Agora, Reservar hoje, Destaques nem Consulta (${when.slice(0, 10)})`, () => {
      const { content } = setupReal(when);
      const { container } = render(<Start content={content} />);
      const cards = screen.getAllByRole('article');
      expect(cards.map((c) => c.getAttribute('aria-label'))).toEqual(['Nova York', 'Orlando', 'Miami']);
      for (const name of ['Agora', 'Reservar hoje', 'Destaques', 'Consulta']) expect(screen.queryByRole('region', { name })).toBeNull();
      expect(container.querySelector('footer')).toBeNull();
      expect(screen.queryByRole('checkbox')).toBeNull();
    });
  }

  it('cada card tem 1 link (o nome da cidade) para a cidade, com foto, país, noites e datas', () => {
    const { content } = setupReal('2026-10-27T15:00:00Z');
    render(<Start content={content} />);
    for (const card of screen.getAllByRole('article')) {
      const links = within(card).getAllByRole('link');
      expect(links).toHaveLength(1);
      expect(links[0]!.textContent).toBe(card.getAttribute('aria-label'));
      expect(card.querySelector('img.cover-img')).toBeTruthy();
      expect(card.textContent).toContain('Estados Unidos');
      expect(card.textContent).toMatch(/\d+ noites/);
      expect(card.querySelector('.card-chevron')).toBeTruthy();
      expect(card.textContent).not.toMatch(/Ver roteiro|Ver mais/);
    }
    expect(screen.getByRole('link', { name: 'Orlando' }).getAttribute('href')).toBe('#/cidade/orlando');
  });
});
