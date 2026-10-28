// Feature 016 (US1): a tela "Rota até…" — lista do dia, outros dias, inverter, sem internet.
import { fireEvent, render, screen, within } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { routeSpot, routeUrl } from '../../src/domain/route';
import { Route } from '../../src/pages/Route';
import { getUserStore } from '../../src/storage/user-store';
import { setupReal } from './companion-helpers';
import { setOnline } from './helpers';

const MOTT = 'ny3-2026-11-01-08';
const at = (local: string) => new Date(`${local}:00-05:00`).toISOString();

afterEach(() => {
  vi.useRealTimers();
  setOnline(true);
  window.location.hash = '';
});

function open(key: string, query = '') {
  const { content } = setupReal(at('2026-11-01T13:30'));
  window.location.hash = `#/rota/2026-11-01/${encodeURIComponent(key)}${query}`;
  const r = render(<Route content={content} date="2026-11-01" spotKey={key} />);
  const origin = routeSpot(content, getUserStore().get(), '2026-11-01', key);
  return { ...r, content, origin };
}

describe('Rota até… (feature 016, US1)', () => {
  // As curiosidades de NY não têm link de mapa no roteiro: não entram (o mesmo local do "Abrir no mapa").
  it('lista do dia: Paradas, Restaurantes e Cafés, Brechós e Lojas; sem a origem', () => {
    const { container } = open(MOTT);
    const region = screen.getByRole('region', { name: 'Rota a partir de Mott Street' });
    expect(within(region).getByRole('heading', { name: 'Domingo, 01/11' })).toBeTruthy();
    const blocks = [...container.querySelectorAll('.route-group-title')].map((e) => e.textContent);
    expect(blocks).toEqual(['Paradas', 'Restaurantes e Cafés', 'Brechós e Lojas']);
    expect(within(region).queryByRole('link', { name: /^Mott Street/ })).toBeNull();
    expect(container.textContent).not.toContain('Compras no SoHo');
  });

  it('cada opção abre a rota no Google Maps, da origem até ela, em outra aba', () => {
    const { origin } = open(MOTT);
    const doyers = screen.getByRole('link', { name: 'Doyers Street, 13h55' });
    expect(doyers.getAttribute('target')).toBe('_blank');
    expect(doyers.getAttribute('rel')).toBe('noopener');
    expect(doyers.getAttribute('href')).toBe(routeUrl(origin!, { target: 'Doyers Street New York' }));
    const cabra = screen.getByRole('link', { name: 'La Cabra SoHo' });
    expect(cabra.getAttribute('href')).toContain(`origin=${encodeURIComponent(origin!.target)}`);
  });

  it('Inverter: "Rota até Mott Street" e o sentido trocado', () => {
    const { origin, unmount } = open(MOTT);
    expect(screen.getByRole('link', { name: /Inverter/ }).getAttribute('href')).toBe(`#/rota/2026-11-01/${MOTT}?inv=1`);
    unmount();
    open(MOTT, '?inv=1');
    expect(screen.getByRole('region', { name: 'Rota até Mott Street' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Doyers Street, 13h55' }).getAttribute('href')).toBe(routeUrl({ target: 'Doyers Street New York' }, origin!));
    expect(screen.getByRole('link', { name: /Inverter/ }).getAttribute('href')).toBe(`#/rota/2026-11-01/${MOTT}`);
  });

  it('Ver outros dias: os outros dias de Nova York, depois do dia da origem', () => {
    const { unmount } = open(MOTT);
    expect(screen.getByRole('link', { name: 'Ver outros dias' }).getAttribute('href')).toBe(`#/rota/2026-11-01/${MOTT}?outros=1`);
    expect(screen.queryByRole('heading', { name: 'Sábado, 31/10' })).toBeNull();
    unmount();
    open(MOTT, '?outros=1');
    const days = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(days[0]).toBe('Domingo, 01/11');
    expect(days).toContain('Sábado, 31/10');
    expect(days).toContain('Segunda-feira, 02/11');
    expect(screen.queryByRole('link', { name: 'Ver outros dias' })).toBeNull();
  });

  it('sem internet: a lista abre; tocar avisa com os dois endereços', () => {
    setupReal(at('2026-11-01T13:30'));
    setOnline(false);
    const { origin, content } = open(MOTT);
    const doyers = routeSpot(content, getUserStore().get(), '2026-11-01', 'ny3-2026-11-01-09')!;
    expect(screen.queryByRole('link', { name: 'Doyers Street, 13h55' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Doyers Street, 13h55' }));
    expect(screen.getByRole('alert').textContent).toBe(`A rota precisa de internet. De: ${origin!.address}. Até: ${doyers.address}.`);
  });

  it('dia sem outro lugar: "Nenhum outro lugar neste dia" e os outros dias já abertos', () => {
    const { content } = setupReal(at('2026-11-11T13:30'));
    const state = getUserStore().get();
    const key = content.fullItineraries.flatMap((f) => f.days).find((d) => d.date === '2026-11-11')!.activities.find((a) => routeSpot(content, state, '2026-11-11', a.id))!.id;
    window.location.hash = `#/rota/2026-11-11/${key}`;
    render(<Route content={content} date="2026-11-11" spotKey={key} />);
    expect(screen.getByText('Nenhum outro lugar neste dia')).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Ver outros dias' })).toBeNull();
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThan(1);
  });

  it('lugar desconhecido: "Lugar não encontrado" e volta ao dia', () => {
    open('nao-existe');
    expect(screen.getByText('Lugar não encontrado')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Voltar ao dia' }).getAttribute('href')).toBe('#/dia/2026-11-01');
  });

  it('voltar do cabeçalho: para a atração de origem', () => {
    open(MOTT);
    expect(screen.getByRole('link', { name: 'Voltar' }).getAttribute('href')).toBe(`#/dia/2026-11-01/${MOTT}`);
  });
});

describe('Rota até… a partir de um lugar (feature 016, US2)', () => {
  it('La Cabra SoHo: as paradas do dia, sem La Cabra; voltar para o dia', () => {
    open('food-la-cabra-soho');
    const region = screen.getByRole('region', { name: 'Rota a partir de La Cabra SoHo' });
    expect(within(region).getByRole('link', { name: 'Mott Street, 13h40' })).toBeTruthy();
    expect(within(region).queryByRole('link', { name: 'La Cabra SoHo' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Voltar' }).getAttribute('href')).toBe('#/dia/2026-11-01');
  });
});
