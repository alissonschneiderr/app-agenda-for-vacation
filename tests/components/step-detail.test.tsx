import { fireEvent, render, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StepDetail } from '../../src/pages/StepDetail';
import { Day } from '../../src/pages/Day';
import { setupCompanion, setupReal } from './companion-helpers';

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

describe('atração de compras (feature 010, US3)', () => {
  const at = (local: string) => new Date(`${local}:00-05:00`).toISOString();

  it('"Compras no SoHo": 5 lojas com o mesmo texto da seção do dia e o atalho para ela', () => {
    const { content } = setupReal(at('2026-11-01T09:00'));
    const step = render(<StepDetail content={content} date="2026-11-01" stepKey="ny3-2026-11-01-05" />);
    const shops = step.container.querySelector('section.step-shops')!;
    expect(shops.querySelector('h2')!.textContent!.trim()).toBe('Lojas e brechós em SoHo');
    const cards = [...shops.querySelectorAll('article')].map((a) => a.textContent);
    expect(cards).toHaveLength(5);
    expect(shops.querySelector('a.btn')!.getAttribute('href')).toBe('#/dia/2026-11-01?secao=lojas');
    // título → (descritivo, se houver) → práticas → lojas
    const order = ['h1', '.step-description', '.step-practical', 'section.step-shops']
      .map((sel) => [...step.container.querySelectorAll('*')].indexOf(step.container.querySelector(sel)!))
      .filter((i) => i >= 0);
    expect(order).toHaveLength(3);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    step.unmount();
    const day = render(<Day content={content} date="2026-11-01" />);
    const soho = [...day.container.querySelectorAll('#lojas .hood-group')].find((g) => g.querySelector('h3')!.textContent === 'SoHo')!;
    expect([...soho.querySelectorAll('article')].map((a) => a.textContent)).toEqual(cards);
  });

  it('"Compras (tarde)" de 11/11, sem lojas no roteiro: sem o bloco', () => {
    const { content } = setupReal(at('2026-11-01T09:00'));
    const { container } = render(<StepDetail content={content} date="2026-11-11" stepKey="orl1-2026-11-11-01" />);
    expect(container.querySelector('h1')).toBeTruthy();
    expect(container.querySelector('section.step-shops')).toBeNull();
  });
});
