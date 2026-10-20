import { fireEvent, render, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FullDay } from '../../src/pages/FullDay';
import { setupFull } from './full-helpers';

afterEach(() => vi.useRealTimers());

describe('FullDay (US1)', () => {
  it('mostra cabeçalho, atividades em ordem, prioridade e deslocamentos', () => {
    const { content } = setupFull();
    render(<FullDay content={content} date="2026-11-03" />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('terça, 03/11');
    expect(screen.getByText('Região 11-03')).toBeTruthy();
    expect(screen.getByText('Objetivo 11-03')).toBeTruthy();
    const titles = [...document.querySelectorAll('.activity-title')].map((e) => e.textContent);
    expect(titles.slice(0, 3)).toEqual(['Saída do hotel', 'Café 11-03', 'Atração 11-03']);
    expect(screen.getAllByText('Essencial').length).toBeGreaterThan(0);
    expect(screen.getByText(/🚇 Metrô · 15 min · 6 · US\$ 3,00/)).toBeTruthy();
    expect(screen.getByText('Metrô linha 6 até 51 St.')).toBeTruthy();
  });

  it('destaca o compromisso com chegada e horário-limite de saída', () => {
    const { content } = setupFull();
    render(<FullDay content={content} date="2026-11-02" />);
    expect(screen.getByText(/Ingresso comprado · começa às 19:30 · chegar até 18:45 · sair da atividade anterior até 17:50/)).toBeTruthy();
  });

  it('destaca a próxima atividade no dia atual e marca feita/pulada/desfazer', () => {
    const { content, store } = setupFull('2026-11-02T20:00:00Z'); // 15:00 em NY
    render(<FullDay content={content} date="2026-11-02" />);
    const next = document.querySelector('.activity-next')!;
    expect(next.querySelector('.activity-title')!.textContent).toBe('Brechó 11-02');
    fireEvent.click(next.querySelector('button')!); // ✓ Feita
    const id = next.id;
    expect(store.get().activityMarks[id]!.state).toBe('done');
    expect(document.querySelector('.activity-next .activity-title')!.textContent).toBe('Lanche 11-02');
    fireEvent.click(screen.getByRole('button', { name: 'Desfazer' }));
    expect(store.get().activityMarks[id]).toBeUndefined();
  });

  it('não destaca nada fora do dia atual e navega entre dias', () => {
    const { content } = setupFull();
    render(<FullDay content={content} date="2026-11-05" />);
    expect(document.querySelector('.activity-next')).toBeNull();
    expect(screen.getByRole('link', { name: /quarta, 04\/11/ }).getAttribute('href')).toBe('#/full/nova-york/2026-11-04');
    expect(screen.getByRole('link', { name: /sexta, 06\/11/ })).toBeTruthy();
  });

  it('data inválida', () => {
    const { content } = setupFull();
    render(<FullDay content={content} date="2026-12-25" />);
    expect(screen.getByRole('heading', { name: 'Dia não encontrado' })).toBeTruthy();
  });
});
