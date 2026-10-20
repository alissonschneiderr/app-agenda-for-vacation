import { fireEvent, render, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FullDocument } from '../../src/pages/FullDocument';
import { FullDay } from '../../src/pages/FullDay';
import { setupFull } from './full-helpers';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('Documento, alternativas e checklist (US4)', () => {
  it('documento tem capa, 7 dias, checklist, endereços, orientações e exclusões', () => {
    const { content } = setupFull();
    render(<FullDocument content={content} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Roteiro FULL de Nova York' })).toBeTruthy();
    expect(document.querySelector('.doc-cover')!.textContent).toMatch(/Hotel: POD 51, 230 East 51st Street/);
    expect(screen.getAllByText(/New York Knicks x Brooklyn Nets/).length).toBeGreaterThan(0);
    const dayHeadings = [...document.querySelectorAll('.doc-day > h2')].map((h) => h.textContent);
    expect(dayHeadings.slice(0, 7)).toHaveLength(7);
    expect(dayHeadings[0]).toBe('sábado, 31/10 · Região 10-31');
    expect(screen.getByRole('heading', { name: 'Checklist de ingressos e reservas' })).toBeTruthy();
    expect(screen.getByText(/resolver até 29\/10\/2026/)).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Endereços por dia' })).toBeTruthy();
    expect(screen.getByText('Use o mesmo cartão no OMNY.')).toBeTruthy();
    expect(screen.getByText('Fora de temporada')).toBeTruthy();
    // documento não tem botões de marcação
    expect(screen.queryByRole('button', { name: '✓ Feita' })).toBeNull();
  });

  it('botão de impressão chama window.print', () => {
    const { content } = setupFull();
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    render(<FullDocument content={content} />);
    fireEvent.click(screen.getByRole('button', { name: 'Imprimir / salvar PDF' }));
    expect(print).toHaveBeenCalled();
  });

  it('agenda do dia mostra as alternativas', () => {
    const { content } = setupFull();
    render(<FullDay content={content} date="2026-11-03" />);
    expect(screen.getByText('Museu coberto perto')).toBeTruthy();
    expect(screen.getByText('Se cansar:')).toBeTruthy();
  });
});
