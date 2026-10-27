// Feature 012: os dias de Miami do casal com a experiência das features 009–011. Conteúdo real do app.
import { render, screen, within } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Day } from '../../src/pages/Day';
import { StepDetail } from '../../src/pages/StepDetail';
import { setupReal } from './companion-helpers';

afterEach(() => vi.useRealTimers());

const at = (local: string) => new Date(`${local}:00-05:00`).toISOString();
const names = (root: Element, sel: string) => [...root.querySelectorAll(sel)].map((e) => e.textContent!.trim());

describe('Miami (feature 012, US1)', () => {
  it('18/11: Paradas de South Beach, 4 restaurantes sob o grupo e 2 locações em Curiosidades', () => {
    const { content } = setupReal(at('2026-11-18T16:00'));
    const { container } = render(<Day content={content} date="2026-11-18" />);
    const stops = names(container, '#paradas .stop-card .tl-name');
    expect(stops).toEqual(['Lummus Park', 'Pôr do sol', 'Ocean Drive', 'Española Way']);
    expect(names(container, '#comer h3.hood-group-head')).toEqual(['South Beach (Art Deco District)']);
    expect(container.querySelectorAll('#comer article')).toHaveLength(4);
    expect(names(container, '#curiosidades article .place-row-name')).toEqual(['The Carlyle', '728 Ocean Drive']);
  });

  it('19/11: Sawgrass com 3 paradas, 5 restaurantes, 5 categorias de lojas e o Uber em Transporte', () => {
    const { content } = setupReal(at('2026-11-18T16:00'));
    const { container } = render(<Day content={content} date="2026-11-19" />);
    expect(names(container, '#paradas .stop-card .tl-name')).toEqual(['Simon Guest Services (perto da Burlington)', 'The Colonnade Outlets', 'Ala principal']);
    expect(container.querySelectorAll('#comer article')).toHaveLength(5);
    expect(names(container, '#lojas article .place-row-name')).toEqual(['Esporte', 'Roupas e jeans', 'Lojas de departamento com desconto', 'Garimpo barato', 'Beleza e casa']);
    expect(container.querySelector('#transporte')!.textContent).toMatch(/Uber ou Lyft até a Sawgrass Mills, 50–70 minutos/);
    expect(container.querySelector('#dicas')).toBeNull(); // o documento não traz aviso dentro do dia
  });

  it('20/11: praia, Beachwalk e South Pointe; 6 restaurantes com o Joe\'s; sem Transporte (dia a pé)', () => {
    const { content } = setupReal(at('2026-11-18T16:00'));
    const { container } = render(<Day content={content} date="2026-11-20" />);
    expect(names(container, '#paradas .stop-card .tl-name')).toEqual(['Praia na altura das ruas 12 a 14', 'Mais praia', 'Beachwalk', 'South Pointe Park e o píer']);
    expect(container.querySelectorAll('#comer article')).toHaveLength(6);
    expect([...container.querySelectorAll('#comer article')].some((a) => a.textContent!.includes("Joe's Stone Crab"))).toBe(true);
    // A nota depois do preço ("Reservem pelo OpenTable…") fica no detalhe do lugar, como em NY.
    const joes = content.fullItineraries.find((f) => f.id === 'miami')!.days[2]!.places!.find((p) => p.name === "Joe's Stone Crab")!;
    expect(joes.queue).toMatch(/Reservem pelo OpenTable/);
    expect(container.querySelector('#transporte')).toBeNull();
  });

  it('Lummus Park: título, descritivo do documento e "Grátis", sem "Ler mais"', () => {
    const { content } = setupReal(at('2026-11-18T16:00'));
    const d = content.fullItineraries.find((f) => f.id === 'miami')!.days[0]!;
    const key = d.activities.find((a) => a.title === 'Lummus Park')!.id;
    const { container } = render(<StepDetail content={content} date="2026-11-18" stepKey={key} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Lummus Park' })).toBeTruthy();
    expect(container.querySelector('.step-description')!.textContent).toMatch(/torres de salva-vidas coloridas.*Grátis/);
    expect(within(container as HTMLElement).queryByText('Ler mais')).toBeNull();
  });
});

describe('Miami, 18/11 (feature 012, US2)', () => {
  it('Transporte com "Antes de sair", "A viagem" e "A chegada" em Miami; menu com a tarde em South Beach', () => {
    const { content } = setupReal(at('2026-11-18T16:00'));
    const { container } = render(<Day content={content} date="2026-11-18" />);
    const t = container.querySelector('#transporte')!.textContent!;
    for (const s of ['1. Antes de sair', '2. A viagem', '3. A chegada', 'MiamiCentral', 'Uber', 'Metrobus 120', 'Kasa La Flora']) expect(t, s).toContain(s);
    const menu = screen.getByRole('navigation', { name: 'Seções do dia' });
    expect(within(menu).getAllByRole('link').map((a) => a.textContent)).toEqual(['Paradas', 'Restaurantes e Cafés', 'Curiosidades', 'Bairros', 'Transporte']);
  });
});
