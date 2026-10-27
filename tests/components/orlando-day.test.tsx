// Feature 007: os dias de Orlando lidos do doc do casal (US1 e US2), com o conteúdo real do app.
import { render, screen, within } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Day } from '../../src/pages/Day';
import { Nearby } from '../../src/pages/Nearby';
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
    expect(container.querySelector('#dicas details.alert-list')!.textContent).toContain("Tiana's Bayou Adventure");
    expect(container.querySelectorAll('#comer article')).toHaveLength(5);
    const parade = [...container.querySelectorAll('.tl-step')].find((e) => e.textContent!.includes('Festival of Fantasy'))!;
    expect(parade.querySelector('.tl-sub')!.textContent).toBe('opcional');
  });


  it('sem roteiros sugeridos nos dias de Orlando', () => {
    const { content } = setupReal(at('2026-11-10T08:00'));
    const { container } = render(<Day content={content} date="2026-11-10" />);
    expect(container.textContent).not.toMatch(/Roteiro sugerido|Ver o guia de Orlando/);
    expect(container.querySelectorAll('.tl-step').length).toBeGreaterThan(5);
  });
});

describe('Orlando — dias de folga e "Por perto" (US2)', () => {
  it('13/11 (feature 011): Manhã livre → carro → Cocoa Beach (~13h às ~17h) → volta → Disney Springs', () => {
    const { content } = setupReal(at('2026-11-13T07:00'));
    const { container } = render(<Day content={content} date="2026-11-13" />);
    expect([...container.querySelectorAll('.tl-area-name')].map((e) => e.textContent)).toEqual(['Manhã livre', 'Cocoa Beach', 'Noite: Disney Springs']);
    expect(container.textContent).not.toMatch(/Kennedy|\bKSC\b|Atlantis|Rocket Garden|Bus Tour/);
    const text = container.querySelector('.stops')!.textContent!;
    const move = text.indexOf('Deslocamento para Cocoa Beach');
    expect(move).toBeGreaterThan(-1);
    expect(text.slice(move, move + 80)).toContain('~1h de carro');
    expect(text.indexOf('Cocoa Beach', move + 40)).toBeGreaterThan(move);
    expect(container.textContent).toMatch(/13h às ~17h/);
  });

  it('11/11: compras com horário marcáveis; sem a alternativa do KSC (feature 011)', () => {
    const { content } = setupReal(at('2026-11-11T09:00'));
    const { container } = render(<Day content={content} date="2026-11-11" />);
    const shop = [...container.querySelectorAll('.tl-step')].find((e) => e.textContent!.includes('Compras'))!;
    expect(shop.textContent).toContain('~14h');
    expect(shop.querySelector('[role="checkbox"]')).toBeTruthy();
    expect(container.textContent).not.toContain('Alternativa ao outlet');
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
