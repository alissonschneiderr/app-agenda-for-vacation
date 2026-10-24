// Feature 007: os dias de Orlando lidos do doc do casal (US1 e US2), com o conteúdo real do app.
import { render, screen, within } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Day } from '../../src/pages/Day';
import { Nearby } from '../../src/pages/Nearby';
import { Now } from '../../src/pages/Now';
import { setupReal } from './companion-helpers';

afterEach(() => vi.useRealTimers());

// Orlando está no fuso de Nova York; em novembro, UTC−5.
const at = (local: string) => new Date(`${local}:00-05:00`).toISOString();

describe('Orlando — dia de parque (US1)', () => {
  it('08/11: chegada ao estacionamento, atrações com fila e área, almoço como intervalo, avisos', () => {
    const { content } = setupReal(at('2026-11-08T07:00'));
    const { container } = render(<Day content={content} date="2026-11-08" />);
    const moves = [...container.querySelectorAll('.tl-move')].map((e) => e.textContent);
    expect(moves[0]).toContain('06h50 chegada ao estacionamento');
    const first = container.querySelector('.tl-step')!;
    expect(first.textContent).toContain('Jungle Cruise');
    expect(first.querySelector('.tl-sub')!.textContent).toBe('Adventureland · fila ~5 min');
    const lunch = [...container.querySelectorAll('.tl-free')].find((e) => e.textContent!.includes('Almoço'))!;
    expect(lunch.querySelector('[role="checkbox"]')).toBeNull();
    expect(container.querySelector('details.alert-list')!.textContent).toContain("Tiana's Bayou Adventure");
    const parade = [...container.querySelectorAll('.tl-step')].find((e) => e.textContent!.includes('Festival of Fantasy'))!;
    expect(parade.querySelector('.tl-sub')!.textContent).toBe('opcional');
  });

  it('Agora em 09/11 às 12h30: Runaway Railway 13h00 · Multi Pass; almoço com "Ver onde comer"', () => {
    const { content } = setupReal(at('2026-11-09T12:30'));
    render(<Now content={content} />);
    const card = screen.getByRole('article', { name: "Próximo passo: Mickey & Minnie's Runaway Railway" });
    expect(within(card).getByText('13h00')).toBeTruthy();
    expect(within(card).getByText(/~5 min · Multi Pass/)).toBeTruthy();
    expect(within(card).getByText(/Hollywood Studios/)).toBeTruthy();
    expect(screen.getByText(/Ver onde comer/)).toBeTruthy();
  });

  it('sem roteiros sugeridos nos dias de Orlando', () => {
    const { content } = setupReal(at('2026-11-10T08:00'));
    const { container } = render(<Day content={content} date="2026-11-10" />);
    expect(container.textContent).not.toMatch(/Roteiro sugerido|Ver o guia de Orlando/);
    expect(container.querySelectorAll('.tl-step').length).toBeGreaterThan(5);
  });
});

describe('Orlando — dias de folga e "Por perto" (US2)', () => {
  it('13/11: KSC → deslocamento → Cocoa Beach → volta → Disney Springs', () => {
    const { content } = setupReal(at('2026-11-13T07:00'));
    const { container } = render(<Day content={content} date="2026-11-13" />);
    expect([...container.querySelectorAll('.tl-area-name')].map((e) => e.textContent)).toEqual([
      'Kennedy Space Center Visitor Complex',
      'Cocoa Beach',
      'Noite: Disney Springs',
    ]);
    const text = container.textContent!;
    expect(text.indexOf('Deslocamento para Cocoa Beach')).toBeGreaterThan(text.indexOf('Gateway e Rocket Garden'));
    expect(text.indexOf('Deslocamento para Cocoa Beach')).toBeLessThan(text.indexOf('Cocoa Beach', text.indexOf('Deslocamento para Cocoa Beach') + 30));
    const times = [...container.querySelectorAll('.tl-step .tl-time')].map((e) => e.textContent);
    expect(times).toEqual(['9h00', '10h30', '14h00']);
    expect([...container.querySelectorAll('.tl-free')].map((e) => e.textContent)).toEqual([expect.stringContaining('Almoço no complexo')]);
  });

  it('11/11: compras com horário marcáveis e a alternativa ao outlet como nota', () => {
    const { content } = setupReal(at('2026-11-11T09:00'));
    const { container } = render(<Day content={content} date="2026-11-11" />);
    const shop = [...container.querySelectorAll('.tl-step')].find((e) => e.textContent!.includes('Compras'))!;
    expect(shop.textContent).toContain('~14h');
    expect(shop.querySelector('[role="checkbox"]')).toBeTruthy();
    expect(container.textContent).toContain('Alternativa ao outlet');
  });

  it('Por perto em 08/11: 5 opções para comer no Magic Kingdom, com área e sem preço', () => {
    const { content } = setupReal(at('2026-11-08T12:00'));
    const { container } = render(<Nearby content={content} date="2026-11-08" areaId="magic-kingdom" />);
    expect(screen.getByRole('link', { name: 'Comer (5)' })).toBeTruthy();
    const items = [...container.querySelectorAll('.place-short')];
    expect(items).toHaveLength(5);
    expect(items[3]!.textContent).toContain("Casey's Corner");
    expect(items[3]!.textContent).toContain('Main Street, cachorro-quente');
    expect(container.textContent).not.toMatch(/💵/);
    expect(container.querySelector('[role="checkbox"]')).toBeNull();
  });
});
