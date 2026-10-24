import { fireEvent, render, screen, within } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TransitionBlocks } from '../../src/components/TransitionBlocks';
import { seedSuggested } from '../../src/domain/itineraries';
import { TripOverview } from '../../src/pages/TripOverview';
import { emptyState } from '../../src/storage/user-store';
import { setupCompanion, setupReal } from './companion-helpers';

afterEach(() => {
  vi.useRealTimers();
  delete document.documentElement.dataset.contrast;
});

describe('Viagem (feature 006, US5)', () => {
  it('3 cidades em ordem, "vocês estão aqui", dias por tipo e progresso', () => {
    const { content, store } = setupCompanion('2026-11-03T15:00:00Z');
    store.update((s) => seedSuggested(content, s));
    render(<TripOverview content={content} />);
    const cities = screen.getByRole('list', { name: 'Cidades' });
    expect(within(cities).getAllByRole('heading').map((h) => h.textContent)).toEqual(['Nova York', 'Orlando', 'Miami']);
    expect(screen.getByText(/Vocês estão aqui · dia 4 de 8/)).toBeTruthy();
    expect(screen.getAllByRole('link', { name: /sábado, 07\/11, viagem/ })).toHaveLength(2);
    expect(screen.getByRole('link', { name: /segunda, 09\/11, parque/ })).toBeTruthy();
    expect(screen.getAllByRole('progressbar').length).toBeGreaterThanOrEqual(3); // viagem + cidades com atividades
  });

  it('consulta e exibição: guia, documento, dicas; alto contraste liga e persiste', () => {
    const { content } = setupCompanion('2026-11-03T15:00:00Z');
    render(<TripOverview content={content} />);
    expect(screen.getByRole('link', { name: /Guia de pontos turísticos/ }).getAttribute('href')).toBe('#/guia');
    expect(screen.getByRole('link', { name: /Documento de Nova York/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Créditos das fotos/ })).toBeTruthy();
    expect(screen.queryByRole('link', { name: /Favoritos|Meus roteiros/ })).toBeNull();
    fireEvent.click(screen.getByRole('checkbox', { name: /Alto contraste/ }));
    expect(document.documentElement.dataset.contrast).toBe('high');
    expect(JSON.parse(localStorage.getItem('ctha:prefs')!).highContrast).toBe(true);
  });
});

describe('Dia de transição (feature 006, FR-019)', () => {
  it('três blocos com itens marcáveis e desfazíveis; chegada sem orientações diz isso', () => {
    const { content } = setupCompanion('2026-11-07T13:00:00Z');
    const { rerender } = render(<TransitionBlocks content={content} state={emptyState()} date="2026-11-07" />);
    const before = screen.getByRole('region', { name: 'Antes de sair' });
    expect(within(before).getAllByText(/Check-out|Último café/).length).toBe(2);
    const trip = screen.getByRole('region', { name: 'A viagem' });
    expect(within(trip).getByText('Melhor forma de ir: táxi ou Uber')).toBeTruthy();
    const arrival = screen.getByRole('region', { name: 'A chegada' });
    expect(within(arrival).getByText('Sem orientações no roteiro.')).toBeTruthy();
    const toggle = within(before).getAllByRole('checkbox')[0]!;
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-checked')).toBe('false');
    rerender(<TransitionBlocks content={content} state={emptyState()} date="2026-11-21" />);
    expect(screen.getByText('Fim da viagem. Boa volta para casa!')).toBeTruthy();
  });
});

describe('Orlando na transição e na Viagem (feature 007, US3)', () => {
  it('07/11: "A chegada" com os 2 itens do doc (marcáveis) e os mercados', () => {
    const { content } = setupReal('2026-11-07T14:00:00Z');
    render(<TransitionBlocks content={content} state={emptyState()} date="2026-11-07" />);
    const arrival = screen.getByRole('region', { name: 'A chegada' });
    const boxes = within(arrival).getAllByRole('checkbox');
    expect(boxes).toHaveLength(2);
    expect(within(arrival).getByText(/Retirar o carro no aeroporto \(MCO\)/)).toBeTruthy();
    expect(within(arrival).getByText(/Compras básicas/)).toBeTruthy();
    expect(arrival.textContent).toContain('Publix');
    expect(arrival.textContent).not.toContain('Sem orientações no roteiro.');
    fireEvent.click(boxes[0]!);
    expect(boxes[0]!.getAttribute('aria-checked')).toBe('true');
  });

  it('18/11 (Q1): check-out e carro do doc, "De trem para Miami", sem voo internacional', () => {
    const { content } = setupReal('2026-11-18T14:00:00Z');
    const { container } = render(<TransitionBlocks content={content} state={emptyState()} date="2026-11-18" />);
    const before = screen.getByRole('region', { name: 'Antes de sair' });
    expect(within(before).getByText('faça o check-out com folga e devolva o carro no aeroporto (MCO)')).toBeTruthy();
    expect(within(screen.getByRole('region', { name: 'A viagem' })).getByText('De trem para Miami')).toBeTruthy();
    expect(within(screen.getByRole('region', { name: 'A chegada' })).getByText('Sem orientações no roteiro.')).toBeTruthy();
    expect(container.textContent).not.toMatch(/voo internacional/i);
    expect(screen.queryByText('Orientações completas do roteiro')).toBeNull();
  });

  it('Viagem: reservas de Orlando (6) com link para a regra; documento de cada cidade', () => {
    const { content } = setupReal('2026-11-03T15:00:00Z');
    render(<TripOverview content={content} />);
    const orl = screen.getByRole('region', { name: 'Reservas de Orlando' });
    expect(within(orl).getAllByRole('listitem')).toHaveLength(6);
    expect(within(orl).getByText(/06\/11, no app My Disney Experience/)).toBeTruthy();
    expect(within(orl).getByRole('link', { name: 'Regra dos ingressos e checklist' }).getAttribute('href')).toMatch(/^#\/full\/orlando\/documento\/.+reservar/);
    expect(screen.getByRole('link', { name: /Documento de Nova York/ }).getAttribute('href')).toBe('#/full/nova-york/documento');
    expect(screen.getByRole('link', { name: /Documento de Orlando/ }).getAttribute('href')).toBe('#/full/orlando/documento');
    expect(screen.getByRole('link', { name: /Dicas práticas de Orlando/ })).toBeTruthy();
  });
});
