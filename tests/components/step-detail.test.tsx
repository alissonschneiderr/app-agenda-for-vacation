import { fireEvent, render, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StepDetail } from '../../src/pages/StepDetail';
import { setupCompanion } from './companion-helpers';

afterEach(() => vi.useRealTimers());

describe('Detalhe do passo (features 006 e 009)', () => {
  it('ordem (feature 009): foto, título, descritivo completo sem "Ler mais", informações práticas, ações', () => {
    const { content } = setupCompanion('2026-11-01T14:30:00Z');
    const { container } = render(<StepDetail content={content} date="2026-11-01" stepKey="ny3-2026-11-01-02" />);
    expect(container.querySelector('details.read-more')).toBeNull();
    expect(screen.queryByText('Ler mais')).toBeNull();
    const order = ['.step-photo', 'h1', '.step-description', '.step-practical', '.step-actions'].map((sel) => {
      const el = container.querySelector(sel);
      expect(el, sel).not.toBeNull();
      return [...container.querySelectorAll('*')].indexOf(el!);
    });
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(screen.getByRole('heading', { level: 1, name: 'Greene Street' })).toBeTruthy();
    expect(container.querySelectorAll('h1')).toHaveLength(1);
    expect(container.querySelector('.step-description')!.textContent).toContain('Reparem nas colunas');
    expect(container.querySelector('.step-practical')!.textContent).toContain('ingresso com horário — comprem antes');
    expect(container.querySelector('.step-practical')!.textContent).toMatch(/Abrir no mapa/);
  });

  it('atração sem texto no roteiro não mostra a seção do descritivo vazia', () => {
    const { content } = setupCompanion('2026-11-01T14:30:00Z');
    const { container } = render(<StepDetail content={content} date="2026-11-01" stepKey="ny3-2026-11-01-06" />);
    const desc = container.querySelector('.step-description');
    if (desc) expect(desc.textContent!.trim().length).toBeGreaterThan(0);
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
