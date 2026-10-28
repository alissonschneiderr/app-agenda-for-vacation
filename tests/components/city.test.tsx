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

describe('cidade aberta no dia de hoje (feature 013, US1)', () => {
  const opened = (iso: string, cityId: string) => {
    const calls: Element[] = [];
    Element.prototype.scrollIntoView ??= () => {}; // o jsdom não implementa
    const spy = vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(function (this: Element) {
      calls.push(this);
    });
    const { content } = setupReal(iso);
    const { container, unmount } = render(<City content={content} cityId={cityId} />);
    const labels = [...container.querySelectorAll('article.day-card')].map((a) => a.getAttribute('data-date'));
    unmount();
    spy.mockRestore();
    return { scrolledTo: calls.map((e) => e.getAttribute('data-date')), labels };
  };

  it('hoje = 02/11 em Nova York: rola até o card de 02/11; a ordem continua crescente', () => {
    const r = opened(new Date(2026, 10, 2, 10, 0).toISOString(), 'nova-york');
    expect(r.scrolledTo).toEqual(['2026-11-02']);
    expect(r.labels[0]).toBe('2026-10-31');
  });

  it('antes (28/10) e depois (10/11) do período: não rola', () => {
    expect(opened(new Date(2026, 9, 28, 10, 0).toISOString(), 'nova-york').scrolledTo).toEqual([]);
    expect(opened(new Date(2026, 10, 10, 10, 0).toISOString(), 'nova-york').scrolledTo).toEqual([]);
  });

  it('dia de troca (07/11): Nova York e Orlando abrem no card de 07/11', () => {
    const iso = new Date(2026, 10, 7, 10, 0).toISOString();
    expect(opened(iso, 'nova-york').scrolledTo).toEqual(['2026-11-07']);
    expect(opened(iso, 'orlando').scrolledTo).toEqual(['2026-11-07']);
  });
});

describe('card do dia (feature 013, US2)', () => {
  it('19/11 em Miami: chip "19/11", subtítulo "Quinta-feira", sem "Dia N"; aria-label como antes', () => {
    const { content } = setupReal('2026-10-27T15:00:00Z');
    const { container } = render(<City content={content} cityId="miami" />);
    const card = container.querySelector('article.day-card[data-date="2026-11-19"]')!;
    expect(card.querySelector('.cover-tag')!.textContent).toBe('19/11');
    expect(card.querySelector('.eyebrow')!.textContent).toBe('Quinta-feira');
    expect(card.textContent).not.toMatch(/Dia \d+/);
    expect(card.getAttribute('aria-label')).toBe('quinta, 19/11: Compras na Sawgrass Mills');
  });
});
