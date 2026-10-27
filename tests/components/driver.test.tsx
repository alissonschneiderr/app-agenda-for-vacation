// Feature 006 (FR-017): "Mostrar ao motorista" — nome e endereço do roteiro, em tela cheia.
import { act, fireEvent, render, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Driver } from '../../src/pages/Driver';
import { setupCompanion } from './companion-helpers';

afterEach(() => vi.useRealTimers());

// 18:30 UTC em 01/11 = 13:30 em Nova York (já no horário de inverno).
const AT_1330 = '2026-11-01T18:30:00Z';

describe('Mostrar ao motorista (FR-017)', () => {
  it('nome e endereço do roteiro; sem endereço, o texto do link de mapa do doc', () => {
    const { content } = setupCompanion(AT_1330);
    const { unmount } = render(<Driver content={content} date="2026-11-01" itemKey="ny3-2026-11-01-05" />);
    expect(screen.getByRole('dialog', { name: 'Mostrar ao motorista' }).textContent).toContain('Mott Street');
    expect(screen.getByText('Mott Street New York')).toBeTruthy();
    unmount();
    render(<Driver content={content} date="2026-11-01" itemKey="shop-kith" />);
    expect(screen.getByText('337 Lafayette St, Nova York')).toBeTruthy();
  });

  it('toque volta', () => {
    const { content } = setupCompanion(AT_1330);
    const back = vi.spyOn(history, 'back').mockImplementation(() => {});
    render(<Driver content={content} date="2026-11-01" itemKey="ny3-2026-11-01-06" />);
    act(() => {
      fireEvent.click(screen.getByRole('dialog'));
    });
    expect(back).toHaveBeenCalled();
  });
});

