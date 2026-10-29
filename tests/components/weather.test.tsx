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
const ny = { '2026-10-29': { code: 0, max: 20, min: 9, rain: 0 }, '2026-10-30': { code: 1, max: 18, min: 7, rain: 10 }, '2026-10-31': { code: 3, max: 15, min: 5, rain: 10 }, '2026-11-01': { code: 2, max: 15, min: 9, rain: 20 }, '2026-11-02': { code: 61, max: 19, min: 11, rain: 70 } };

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
    // Mesmo padrão em todos os boxes: a cidade sempre aparece, mesmo com uma só.
    expect([...box.querySelectorAll('.weather-city')].map((e) => e.textContent)).toEqual(['Nova York']);
  });

  it('07/11: as duas cidades, com o nome de cada uma', () => {
    const day = { code: 0, max: 20, min: 12, rain: 0 };
    const { content } = withWeather('2026-11-03T19:00:00Z', { fetchedAt: '2026-11-03T18:00:00.000Z', cities: { 'nova-york': { '2026-11-07': day }, orlando: { '2026-11-07': { ...day, max: 28 } } } });
    render(<WeatherBox content={content} date="2026-11-07" today="2026-11-03" />);
    const box = screen.getByRole('region', { name: 'Tempo' });
    expect([...box.querySelectorAll('.weather-city')].map((e) => e.textContent)).toEqual(['Nova York', 'Orlando']);
    expect(box.textContent).toContain('28° / 12°');
  });

  it('18/11 visto de 29/10: "Previsão a partir de 03/11" (fora dos 16 dias)', () => {
    const { content } = withWeather('2026-10-29T19:00:00Z', { fetchedAt: FETCHED, cities: { 'nova-york': ny } });
    render(<WeatherBox content={content} date="2026-11-18" today="2026-10-29" />);
    expect(screen.getByRole('region', { name: 'Tempo' }).textContent).toContain('Previsão a partir de 03/11');
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
  it('29/10: 5 dias; hoje e amanhã (antes da viagem) com o tempo de NY, sem link; 31/10 a 02/11 com link', () => {
    const { content } = withWeather('2026-10-29T19:00:00Z', { fetchedAt: FETCHED, cities: { 'nova-york': ny } });
    const { container } = render(<WeatherStrip content={content} today="2026-10-29" />);
    const items = [...container.querySelectorAll('.weather-strip li')];
    expect(items).toHaveLength(5);
    for (const i of [0, 1]) {
      expect(items[i]!.querySelector('a')).toBeNull();
      expect(items[i]!.classList.contains('is-out')).toBe(true);
      expect(items[i]!.textContent).toContain('NY');
      expect(items[i]!.textContent).not.toContain('fora da viagem');
    }
    expect(items[0]!.textContent).toContain('20° / 9°');
    expect(within(items[1] as HTMLElement).getByText('Sexta-feira, 30/10, Nova York: parcialmente nublado, máxima 18, mínima 7 graus')).toBeTruthy();
    const sat = screen.getByRole('link', { name: 'Sábado, 31/10, Nova York: nublado, máxima 15, mínima 5 graus' });
    expect(sat.getAttribute('href')).toBe('#/dia/2026-10-31');
    // Mesmo padrão nos 5 cards: sigla da cidade e a mesma estrutura, dentro ou fora da viagem.
    for (const item of items) {
      expect(item.querySelector('.weather-card')).toBeTruthy();
      expect(item.querySelector('.weather-short')!.textContent).toBe('NY');
    }
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
    expect(last.textContent).toContain('28° / 12°');
  });

  it('nada salvo: "Previsão disponível com internet"', () => {
    const { content } = withWeather('2026-10-29T19:00:00Z', null);
    const { container } = render(<WeatherStrip content={content} today="2026-10-29" />);
    expect(container.textContent).toContain('Previsão disponível com internet');
  });
});

describe('box do dia com a previsão de longo alcance (ajuste da feature 017)', () => {
  it('11/11 visto de 29/10 (13 dias à frente): a previsão salva aparece', () => {
    const { content } = withWeather('2026-10-29T19:00:00Z', { fetchedAt: FETCHED, cities: { orlando: { '2026-11-11': { code: 0, max: 27, min: 17, rain: 5 } } } });
    render(<WeatherBox content={content} date="2026-11-11" today="2026-10-29" />);
    const box = screen.getByRole('region', { name: 'Tempo' });
    expect(box.textContent).toContain('27° / 17°');
    expect(box.textContent).not.toContain('Previsão a partir');
  });
});
