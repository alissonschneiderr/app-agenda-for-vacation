// Busca da previsão no Open-Meteo (feature 017, research R1/R4): só com internet, no máximo a cada
// 3 h, uma por vez. Salva no armazenamento do app; qualquer falha mantém o que está salvo.
import { useEffect, useState } from 'preact/hooks';
import type { LoadedContent } from '../content/load';
import type { CityId } from '../content/types';
import { cityLocations, FORECAST_DAYS, mergeWeather, type DayWeather, type WeatherStore } from '../domain/weather';
import { getAppStorage } from '../storage/app-storage';

export const WEATHER_KEY = 'ctha:weather';
const EVERY_MS = 3 * 3600_000;
const DAILY = 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max';

const listeners = new Set<(w: WeatherStore | null) => void>();
let running: Promise<void> | null = null;

export function readWeather(): WeatherStore | null {
  try {
    const raw = getAppStorage().getItem(WEATHER_KEY);
    const w = raw ? (JSON.parse(raw) as WeatherStore) : null;
    return w && typeof w.fetchedAt === 'string' && w.cities && typeof w.cities === 'object' ? w : null;
  } catch {
    return null;
  }
}

function saveWeather(w: WeatherStore): void {
  try {
    getAppStorage().setItem(WEATHER_KEY, JSON.stringify(w));
  } catch {
    // sem espaço: vale só nesta sessão
  }
  for (const l of listeners) l(w);
}

export function weatherUrl(content: Pick<LoadedContent, 'trip' | 'cities'>): string {
  const locs = cityLocations(content);
  const q = new URLSearchParams({
    latitude: locs.map((l) => l.lat).join(','),
    longitude: locs.map((l) => l.lng).join(','),
    daily: DAILY,
    timezone: 'America/New_York',
    forecast_days: String(FORECAST_DAYS),
  });
  return `https://api.open-meteo.com/v1/forecast?${q.toString().replace(/%2C/g, ',')}`;
}

interface Daily {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: (number | null)[];
}

function parse(content: Pick<LoadedContent, 'trip' | 'cities'>, body: unknown, now: Date): WeatherStore {
  const list = Array.isArray(body) ? body : [body];
  const cities: WeatherStore['cities'] = {};
  cityLocations(content).forEach(({ cityId }, i) => {
    const d = (list[i] as { daily?: Daily } | undefined)?.daily;
    if (!d || !Array.isArray(d.time) || !d.time.length) throw new Error('resposta sem dias');
    const days: Record<string, DayWeather> = {};
    d.time.forEach((date, j) => {
      const max = d.temperature_2m_max[j];
      const min = d.temperature_2m_min[j];
      const code = d.weather_code[j];
      if (typeof max !== 'number' || typeof min !== 'number' || typeof code !== 'number') return;
      const rain = d.precipitation_probability_max?.[j];
      days[date] = { code, max: Math.round(max), min: Math.round(min), rain: typeof rain === 'number' ? Math.round(rain) : null };
    });
    cities[cityId as CityId] = days;
  });
  return { fetchedAt: now.toISOString(), cities };
}

/** Busca se houver internet e a última busca tiver mais de 3 h (FR-004, FR-006). Nunca lança. */
export function refreshWeather(content: Pick<LoadedContent, 'trip' | 'cities'>, now: Date = new Date()): Promise<void> {
  if (running) return running;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return Promise.resolve();
  const saved = readWeather();
  if (saved && now.getTime() - Date.parse(saved.fetchedAt) < EVERY_MS) return Promise.resolve();
  running = (async () => {
    try {
      const res = await fetch(weatherUrl(content));
      if (!res.ok) return;
      saveWeather(mergeWeather(readWeather(), parse(content, await res.json(), now)));
    } catch {
      // sem rede, serviço fora ou resposta estranha: fica o que está salvo
    } finally {
      running = null;
    }
  })();
  return running;
}

/** A previsão salva, atualizada quando uma busca termina. */
export function useWeather(): WeatherStore | null {
  const [w, setW] = useState(readWeather);
  useEffect(() => {
    listeners.add(setW);
    setW(readWeather());
    return () => {
      listeners.delete(setW);
    };
  }, []);
  return w;
}
