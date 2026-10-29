// Feature 017: busca no Open-Meteo, a cada 3 h, só com internet; falha mantém o salvo. Sem rede de verdade.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { assembleContent } from '../../scripts/build-content';
import { indexContent } from '../../src/content/load';
import { readWeather, refreshWeather, WEATHER_KEY } from '../../src/lib/weather';
import { setAppStorage } from '../../src/storage/app-storage';
import { MemoryStorage } from '../fixtures/content';

const content = indexContent(assembleContent());
const NOW = new Date('2026-10-29T18:00:00.000Z');
const city = (max: number) => ({
  daily: {
    time: ['2026-10-29', '2026-10-30'],
    weather_code: [2, 3],
    temperature_2m_max: [max + 0.4, 17.8],
    temperature_2m_min: [9.04, 7.2],
    precipitation_probability_max: [20, null],
  },
});
const ok = () => new Response(JSON.stringify([city(19), city(28), city(29)]), { status: 200 });
let storage: MemoryStorage;
let fetchMock: ReturnType<typeof vi.fn>;

function online(on: boolean) {
  Object.defineProperty(window.navigator, 'onLine', { configurable: true, get: () => on });
}

beforeEach(() => {
  storage = new MemoryStorage();
  setAppStorage(storage);
  fetchMock = vi.fn(async () => ok());
  vi.stubGlobal('fetch', fetchMock);
  online(true);
});
afterEach(() => {
  vi.unstubAllGlobals();
  setAppStorage(null);
  online(true);
});

describe('previsão do tempo — busca (feature 017)', () => {
  it('uma chamada com as 3 cidades e 7 dias; salva arredondado', async () => {
    await refreshWeather(content, NOW);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0]![0] as string);
    expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    const centers = content.trip.map((l) => content.cities.find((c) => c.id === l.cityId)!.center);
    expect(url.searchParams.get('latitude')).toBe(centers.map((c) => c.lat).join(','));
    expect(url.searchParams.get('longitude')).toBe(centers.map((c) => c.lng).join(','));
    expect(url.searchParams.get('daily')).toBe('weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max');
    expect(url.searchParams.get('timezone')).toBe('America/New_York');
    expect(url.searchParams.get('forecast_days')).toBe('7');
    const saved = readWeather()!;
    expect(saved.fetchedAt).toBe(NOW.toISOString());
    expect(saved.cities['nova-york']!['2026-10-29']).toEqual({ code: 2, max: 19, min: 9, rain: 20 });
    expect(saved.cities['nova-york']!['2026-10-30']).toEqual({ code: 3, max: 18, min: 7, rain: null });
    expect(saved.cities['miami']!['2026-10-29']!.max).toBe(29);
  });

  it('a cada 3 h no máximo', async () => {
    await refreshWeather(content, NOW);
    await refreshWeather(content, new Date(NOW.getTime() + 2 * 3600_000));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await refreshWeather(content, new Date(NOW.getTime() + 3 * 3600_000 + 1000));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('sem internet: não chama e mantém o salvo', async () => {
    await refreshWeather(content, NOW);
    online(false);
    await refreshWeather(content, new Date(NOW.getTime() + 5 * 3600_000));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(readWeather()!.fetchedAt).toBe(NOW.toISOString());
  });

  it('erro de rede, status 500 ou JSON inválido: mantém o salvo, sem exceção', async () => {
    await refreshWeather(content, NOW);
    const later = (h: number) => new Date(NOW.getTime() + h * 3600_000);
    for (const [i, failure] of [
      () => Promise.reject(new TypeError('rede')),
      async () => new Response('erro', { status: 500 }),
      async () => new Response('{não é json', { status: 200 }),
      async () => new Response(JSON.stringify({ daily: {} }), { status: 200 }),
    ].entries()) {
      fetchMock.mockImplementationOnce(failure);
      await expect(refreshWeather(content, later(4 * (i + 1)))).resolves.toBeUndefined();
      expect(readWeather()!.fetchedAt).toBe(NOW.toISOString());
    }
  });

  it('duas chamadas seguidas: uma busca só', async () => {
    await Promise.all([refreshWeather(content, NOW), refreshWeather(content, NOW)]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('salvo quebrado: lido como vazio', () => {
    storage.setItem(WEATHER_KEY, '{quebrado');
    expect(readWeather()).toBeNull();
  });
});
