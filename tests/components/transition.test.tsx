import { fireEvent, render, screen, within } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TransitionBlocks } from '../../src/components/TransitionBlocks';
import { seedSuggested } from '../../src/domain/itineraries';
import { emptyState } from '../../src/storage/user-store';
import { setupCompanion, setupReal } from './companion-helpers';

afterEach(() => {
  vi.useRealTimers();
  delete document.documentElement.dataset.contrast;
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

describe('Orlando na transição (feature 007, US3)', () => {
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
    // Feature 012: "A chegada" agora traz a chegada de trem em Miami e os traslados do documento.
    const arrival = screen.getByRole('region', { name: 'A chegada' });
    expect(arrival.textContent).toMatch(/14h21 – chegada na MiamiCentral/);
    expect(arrival.textContent).toMatch(/Uber ou Lyft/);
    expect(arrival.textContent).toMatch(/Kasa La Flora/);
    expect(container.textContent).not.toMatch(/voo internacional/i);
    expect(screen.queryByText('Orientações completas do roteiro')).toBeNull();
  });

});
