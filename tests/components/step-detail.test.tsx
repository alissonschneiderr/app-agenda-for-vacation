import { fireEvent, render, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StepDetail } from '../../src/pages/StepDetail';
import { setupCompanion } from './companion-helpers';

afterEach(() => vi.useRealTimers());

describe('Detalhe do passo (feature 006, US4)', () => {
  it('ordem: foto, horário e nome, aviso, como chegar, ações; contexto recolhido em "Ler mais"', () => {
    const { content } = setupCompanion('2026-11-01T14:30:00Z');
    const { container } = render(<StepDetail content={content} date="2026-11-01" stepKey="ny3-2026-11-01-02" />);
    const order = ['.step-photo', '.step-head', '[aria-label="Como chegar"]', '.step-actions', '.read-more'].map((sel) => {
      const el = container.querySelector(sel);
      expect(el, sel).not.toBeNull();
      return [...container.querySelectorAll('*')].indexOf(el!);
    });
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(screen.getByRole('heading', { level: 1, name: 'Greene Street' })).toBeTruthy();
    expect(screen.getByText('ingresso com horário — comprem antes')).toBeTruthy();
    expect(container.querySelector('.read-more')!.hasAttribute('open')).toBe(false);
    expect(container.querySelector('.read-more')!.textContent).toContain('Reparem nas colunas');
  });

  it('foto do guia ligada ao lugar, com crédito; sem foto, ícone e "Sem foto offline"', () => {
    const { content } = setupCompanion('2026-11-01T14:30:00Z');
    const { container, unmount } = render(<StepDetail content={content} date="2026-11-01" stepKey="ny3-2026-11-01-02" />);
    expect(container.querySelector('.step-photo img')).not.toBeNull();
    expect(container.querySelector('.step-photo figcaption')!.textContent).toMatch(/^Foto: /);
    unmount();
    render(<StepDetail content={content} date="2026-11-01" stepKey="ny3-2026-11-01-06" />);
    expect(screen.getByText('Sem foto offline')).toBeTruthy();
  });

  it('evento: orientações rotuladas; "Pular" e desfazer', () => {
    const { content } = setupCompanion('2026-11-01T14:30:00Z');
    render(<StepDetail content={content} date="2026-11-01" stepKey="ny3-2026-11-01-08" />);
    expect(screen.getByText('Como chegar', { selector: 'dt' })).toBeTruthy();
    expect(screen.getByText('cheguem por volta das 18h30.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Pular/ }));
    expect(screen.getByRole('button', { name: /Desfazer "pulado"/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Desfazer "pulado"/ }));
    expect(screen.getByRole('button', { name: /^Pular/ })).toBeTruthy();
  });
});
