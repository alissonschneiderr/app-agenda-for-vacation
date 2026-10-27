// Feature 009 (US1): a cidade só com a capa curta e a lista de dias em cards inteiramente clicáveis.
import { render, screen, within } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { seedSuggested } from '../../src/domain/itineraries';
import { City } from '../../src/pages/City';
import { setupReal } from './companion-helpers';

afterEach(() => vi.useRealTimers());

describe('Cidade (feature 009, US1)', () => {
  it('Nova York: capa curta (foto, país, nome, datas, noites), sem frase, tags nem abas', () => {
    const { content } = setupReal('2026-10-27T15:00:00Z');
    const { container } = render(<City content={content} cityId="nova-york" />);
    const cover = container.querySelector('.cover')!;
    expect(cover.querySelector('img.cover-img')).toBeTruthy();
    expect(cover.textContent).toContain('Estados Unidos');
    expect(cover.textContent).toContain('31/10 a 07/11');
    expect(cover.textContent).toContain('7 noites');
    expect(cover.textContent).not.toContain(content.pointsById.get('ny-central-park')!.summary);
    expect(container.querySelector('.city-tags')).toBeNull();
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.getByRole('link', { name: 'Voltar' }).getAttribute('href')).toBe('#/');
  });

  it('8 cards de dia, cada um com 1 link para o dia', () => {
    const { content } = setupReal('2026-10-27T15:00:00Z');
    render(<City content={content} cityId="nova-york" />);
    const days = screen.getAllByRole('article');
    expect(days).toHaveLength(8);
    days.forEach((d, i) => {
      const links = within(d).getAllByRole('link');
      expect(links).toHaveLength(1);
      expect(links[0]!.getAttribute('href')).toBe(`#/dia/2026-${i === 0 ? '10-31' : `11-0${i}`}`);
    });
    expect(days[1]!.querySelector('img.cover-img')).toBeTruthy();
  });

  it('Miami: dias com o roteiro do casal (feature 012); nenhum "Sem informações"', () => {
    const { content, store } = setupReal('2026-10-27T15:00:00Z');
    store.update((s) => seedSuggested(content, s));
    const { container } = render(<City content={content} cityId="miami" />);
    expect(screen.getAllByRole('article').map((a) => a.getAttribute('aria-label'))).toContain('quinta, 19/11: Compras na Sawgrass Mills');
    expect(container.textContent).not.toMatch(/Sem informações/);
  });
});
