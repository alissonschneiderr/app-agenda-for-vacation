import { render, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FullDay } from '../../src/pages/FullDay';
import { setupFull } from './full-helpers';

afterEach(() => vi.useRealTimers());

describe('Refeições e compras (US2)', () => {
  it('mostra o que pedir, por que ir e faixa de preço', () => {
    const { content } = setupFull();
    render(<FullDay content={content} date="2026-11-03" />);
    expect(screen.getAllByText('Almoço').length).toBeGreaterThan(0);
    expect(screen.getByText('Pastrami')).toBeTruthy();
    expect(screen.getByText('Histórico')).toBeTruthy();
    expect(screen.getByText('Faixa de preço: US$ 25–35')).toBeTruthy();
  });

  it('mostra o tipo de loja e o resumo "Onde comer hoje" com as 4 refeições', () => {
    const { content } = setupFull();
    render(<FullDay content={content} date="2026-11-03" />);
    expect(screen.getAllByText('Brechó').length).toBeGreaterThan(0);
    const eat = screen.getByRole('heading', { name: 'Onde comer hoje' }).nextElementSibling!;
    expect(eat.querySelectorAll('li')).toHaveLength(4);
    expect(eat.textContent).toMatch(/Café da manhã.*Almoço.*Lanche.*Jantar/s);
  });
});
