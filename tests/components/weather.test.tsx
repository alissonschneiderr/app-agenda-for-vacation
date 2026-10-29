// Feature 017: box "Tempo" do dia (US1) e faixa hoje + 4 do Início (US2), com a previsão já salva.
import { render, screen, within } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WeatherBox } from '../../src/components/WeatherBox';
import { WeatherStrip } from '../../src/components/WeatherStrip';
import type { WeatherStore } from '../../src/domain/weather';
import { WEATHER_KEY } from '../../src/lib/weather';
import { getAppStorage } from '../../src/storage/app-storage';
import { setupReal } from './companion-helpers';

afterEach(() => vi.useRealTimers());

const FETCHED = '2026-10-29T18:05:00.000Z'; // 14h05 em Nova York
const ny = { '2026-10-31': { code: 3, max: 15, min: 5, rain: 10 }, '2026-11-01': { code: 2, max: 15, min: 9, rain: 20 }, '2026-11-02': { code: 61, max: 19, min: 11, rain: 70 } };

function withWeather(now: string, store: WeatherStore | null) {
  const ctx = setupReal(now);
  if (store) getAppStorage().setItem(WEATHER_KEY, JSON.stringify(store));
  return ctx;
}

describe('box "Tempo" no dia (feature 017, US1)', () => {
  it('01/11: descrição, máxima/mínima, chuva, hora da busca e texto para o leitor de tela', () => {
    const { content } = withWeather('2026-10-29T19:00:00Z', { fetchedAt: FETCHED, cities: { 'nova-york': ny } });
    render(<WeatherBox content={content} date="2026-11-01" today="2026-10-29" />);
    const box = screen.getByRole('region', { name: 'Tempo' });
    expect(box.textContent).toContain('Parcialmente nublado');
    expect(box.textContent).toContain('15° / 9°');
    expect(box.textContent).toContain('20%');
    expect(box.textContent).toContain('atualizada em 29/10 às 14h05');
    expect(within(box).getByText('Nova York: parcialmente nublado, máxima 15, mínima 9 graus, 20% de chance de chuva')).toBeTruthy();
    expect(box.querySelector('.weather-updated.is-stale')).toBeNull();
  });

  it('07/11: as duas cidades, com o nome de cada uma', () => {
    const day = { code: 0, max: 20, min: 12, rain: 0 };
    const { content } = withWeather('2026-11-03T19:00:00Z', { fetchedAt: '2026-11-03T18:00:00.000Z', cities: { 'nova-york': { '2026-11-07': day }, orlando: { '2026-11-07': { ...day, max: 28 } } } });
    render(<WeatherBox content={content} date="2026-11-07" today="2026-11-03" />);
    const box = screen.getByRole('region', { name: 'Tempo' });
    expect([...box.querySelectorAll('.weather-city')].map((e) => e.textContent)).toEqual(['Nova York', 'Orlando']);
    expect(box.textContent).toContain('28° / 12°');
  });

  it('18/11 visto de 29/10: "Previsão a partir de 12/11"', () => {
    const { content } = withWeather('2026-10-29T19:00:00Z', { fetchedAt: FETCHED, cities: { 'nova-york': ny } });
    render(<WeatherBox content={content} date="2026-11-18" today="2026-10-29" />);
    expect(screen.getByRole('region', { name: 'Tempo' }).textContent).toContain('Previsão a partir de 12/11');
  });

  it('nada salvo: "Previsão disponível com internet"', () => {
    const { content } = withWeather('2026-10-29T19:00:00Z', null);
    render(<WeatherBox content={content} date="2026-11-01" today="2026-10-29" />);
    expect(screen.getByRole('region', { name: 'Tempo' }).textContent).toContain('Previsão disponível com internet');
  });

  it('salva há mais de 24 h: "atualizada em" em destaque; sem chance de chuva, sem a parte da chuva', () => {
    const { content } = withWeather('2026-10-31T19:00:00Z', { fetchedAt: FETCHED, cities: { 'nova-york': { '2026-11-01': { code: 3, max: 14, min: 8, rain: null } } } });
    const { container } = render(<WeatherBox content={content} date="2026-11-01" today="2026-10-31" />);
    expect(container.querySelector('.weather-updated.is-stale')).toBeTruthy();
    expect(container.querySelector('.weather-rain')).toBeNull();
    expect(container.textContent).not.toContain('chance de chuva');
  });
});

describe('faixa hoje + 4 no Início (feature 017, US2)', () => {
  it('29/10: 5 dias; 29 e 30/10 fora da viagem sem link; 31/10 a 02/11 com link e nome acessível', () => {
    const { content } = withWeather('2026-10-29T19:00:00Z', { fetchedAt: FETCHED, cities: { 'nova-york': ny } });
    const { container } = render(<WeatherStrip content={content} today="2026-10-29" />);
    const items = [...container.querySelectorAll('.weather-strip li')];
    expect(items).toHaveLength(5);
    for (const i of [0, 1]) {
      expect(items[i]!.textContent).toContain('fora da viagem');
      expect(items[i]!.querySelector('a')).toBeNull();
    }
    const sat = screen.getByRole('link', { name: 'Sábado, 31/10, Nova York: nublado, máxima 15, mínima 5 graus' });
    expect(sat.getAttribute('href')).toBe('#/dia/2026-10-31');
    expect(screen.getByRole('link', { name: /^Domingo, 01\/11/ }).getAttribute('href')).toBe('#/dia/2026-11-01');
    expect(container.textContent).toContain('atualizada em 29/10 às 14h05');
  });

  it('07/11 com as duas cidades (NY e ORL)', () => {
    const day = { code: 0, max: 20, min: 12, rain: 0 };
    const { content } = withWeather('2026-11-03T19:00:00Z', { fetchedAt: '2026-11-03T18:00:00.000Z', cities: { 'nova-york': { '2026-11-07': day }, orlando: { '2026-11-07': { ...day, max: 28 } } } });
    const { container } = render(<WeatherStrip content={content} today="2026-11-03" />);
    const last = [...container.querySelectorAll('.weather-strip li')].at(-1)!;
    expect(last.textContent).toContain('NY');
    expect(last.textContent).toContain('ORL');
    expect(last.textContent).toContain('28°/12°');
  });

  it('nada salvo: "Previsão disponível com internet"', () => {
    const { content } = withWeather('2026-10-29T19:00:00Z', null);
    const { container } = render(<WeatherStrip content={content} today="2026-10-29" />);
    expect(container.textContent).toContain('Previsão disponível com internet');
  });
});
