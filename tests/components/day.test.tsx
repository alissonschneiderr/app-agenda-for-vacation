import { render, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { seedSuggested } from '../../src/domain/itineraries';
import { Day } from '../../src/pages/Day';
import { setupCompanion } from './companion-helpers';

afterEach(() => vi.useRealTimers());

describe('Dia (feature 006, US2)', () => {
  it('linha do tempo: regiões, passos, conectores, intervalo, noite; sem opções misturadas', () => {
    const { content } = setupCompanion('2026-11-01T18:30:00Z');
    const { container } = render(<Day content={content} date="2026-11-01" />);
    expect([...container.querySelectorAll('.tl-area-name')].map((e) => e.textContent)).toEqual([
      'SoHo',
      'Chinatown',
      'Noite: Knicks x Nets no Madison Square Garden (19h30)',
    ]);
    expect(screen.getByRole('link', { name: 'Opções (5)' }).getAttribute('href')).toBe('#/perto/2026-11-01/soho');
    expect(container.querySelectorAll('.tl-step')).toHaveLength(5);
    expect(container.querySelector('.tl-free')!.textContent).toContain('pausa livre');
    expect([...container.querySelectorAll('.tl-move')].map((e) => e.textContent)).toEqual([
      expect.stringContaining('09h40 saída'),
      expect.stringContaining('~16h30 volta ao hotel'),
    ]);
    expect(container.querySelector('.tl-step.is-night')!.textContent).toContain('Knicks x Nets');
    // nenhum cartão de restaurante ou loja dentro da linha do tempo
    expect(container.querySelector('.tl-list .place-card, .tl-list .place-short')).toBeNull();
  });

  it('marca "agora" só no dia de hoje, antes do primeiro passo que ainda não começou', () => {
    const { content } = setupCompanion('2026-11-01T18:30:00Z');
    const { container, unmount } = render(<Day content={content} date="2026-11-01" />);
    const now = container.querySelector('.tl-now')!;
    expect(now.textContent).toBe('agora · 13h30');
    expect(now.nextElementSibling!.textContent).toContain('Chinatown');
    unmount();
    const other = render(<Day content={content} date="2026-11-02" />);
    expect(other.container.querySelector('.tl-now')).toBeNull();
  });

  it('cabeçalho com dia anterior/seguinte e "Voltar para hoje" fora de hoje', () => {
    const { content } = setupCompanion('2026-11-01T18:30:00Z');
    render(<Day content={content} date="2026-11-03" />);
    expect(screen.getByRole('link', { name: /Dia anterior/ }).getAttribute('href')).toBe('#/dia/2026-11-02');
    expect(screen.getByRole('link', { name: /Próximo dia/ }).getAttribute('href')).toBe('#/dia/2026-11-04');
    expect(screen.getByRole('link', { name: 'Voltar para hoje' }).getAttribute('href')).toBe('#/dia');
  });

  it('avisos do dia recolhidos no topo', () => {
    const { content } = setupCompanion('2026-11-01T18:30:00Z');
    const { container } = render(<Day content={content} date="2026-11-01" />);
    const list = container.querySelector('details.alert-list')!;
    expect(list.hasAttribute('open')).toBe(false);
    expect(list.querySelector('summary')!.textContent).toContain('2 avisos');
  });

  it('dia de praia em blocos de período; dia de transição em três blocos; Orlando como lista', () => {
    const { content, store } = setupCompanion('2026-11-01T18:30:00Z');
    store.update((s) => seedSuggested(content, s));
    content.dayKinds['2026-11-01'] = 'beach';
    const beach = render(<Day content={content} date="2026-11-01" />);
    expect([...beach.container.querySelectorAll('.tl-period')].map((e) => e.textContent)).toEqual(['Manhã', 'Tarde', 'Pôr do sol']);
    beach.unmount();
    const transit = render(<Day content={content} date="2026-11-07" />);
    expect(screen.getByRole('heading', { name: '1. Antes de sair' })).toBeTruthy();
    transit.unmount();
    const orlando = render(<Day content={content} date="2026-11-08" />);
    expect(orlando.container.querySelectorAll('.tl-step').length).toBeGreaterThan(0);
    expect(orlando.container.querySelector('.tl-now')).toBeNull();
  });
});
