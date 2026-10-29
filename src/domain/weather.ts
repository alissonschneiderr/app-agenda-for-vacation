// Previsão do tempo (feature 017, specs/017-weather-forecast/data-model.md): funções puras sobre a
// previsão salva. A busca no serviço fica em src/lib/weather.ts.
import type { LoadedContent } from '../content/load';
import type { CityId, DateStr, LatLng } from '../content/types';
import { tripRange } from './trip';

export interface DayWeather {
  /** Código WMO do dia. */
  code: number;
  /** Máxima e mínima em °C, arredondadas. */
  max: number;
  min: number;
  /** Chance de chuva máxima do dia, em %; `null` quando o serviço não traz. */
  rain: number | null;
}

export interface WeatherStore {
  /** Hora (ISO) da última busca que deu certo. */
  fetchedAt: string;
  cities: Partial<Record<CityId, Record<DateStr, DayWeather>>>;
}

/** Dias pedidos ao serviço (hoje + 6): além disso a previsão erra muito (research R2, Q2 = A). */
export const FORECAST_DAYS = 7;

export type WeatherIcon = 'sun' | 'cloud-sun' | 'cloud' | 'fog' | 'rain' | 'snow' | 'storm';

/** Código WMO → ícone e descrição em português (research R5). */
export function describe(code: number): { icon: WeatherIcon; label: string } {
  if (code === 0) return { icon: 'sun', label: 'Céu limpo' };
  if (code === 1 || code === 2) return { icon: 'cloud-sun', label: 'Parcialmente nublado' };
  if (code === 3) return { icon: 'cloud', label: 'Nublado' };
  if (code === 45 || code === 48) return { icon: 'fog', label: 'Neblina' };
  if (code >= 51 && code <= 57) return { icon: 'rain', label: 'Garoa' };
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { icon: 'rain', label: 'Chuva' };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { icon: 'snow', label: 'Neve' };
  if (code >= 95 && code <= 99) return { icon: 'storm', label: 'Tempestade' };
  return { icon: 'cloud', label: 'Tempo variável' };
}

function addDays(date: DateStr, n: number): DateStr {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export type DayForecast =
  | { kind: 'forecast'; day: DayWeather; fetchedAt: string }
  | { kind: 'later'; from: DateStr }
  | { kind: 'none' };

/** Previsão salva do dia; além de hoje + 6, "a partir de" (data − 6); senão, nada salvo. */
export function weatherFor(store: WeatherStore | null, cityId: CityId, date: DateStr, today: DateStr): DayForecast {
  const day = store?.cities[cityId]?.[date];
  if (store && day) return { kind: 'forecast', day, fetchedAt: store.fetchedAt };
  if (date > addDays(today, FORECAST_DAYS - 1)) return { kind: 'later', from: addDays(date, -(FORECAST_DAYS - 1)) };
  return { kind: 'none' };
}

/** Cidades do dia, na ordem da viagem: uma; duas no dia de troca (a que sai e a que chega). */
export function dayCities(content: Pick<LoadedContent, 'trip'>, date: DateStr): CityId[] {
  return content.trip.filter((l) => l.arrive <= date && date <= l.depart).map((l) => l.cityId);
}

/**
 * Faixa do Início (Q1): hoje e os 4 dias seguintes. Fora da viagem também há previsão (pedido do
 * casal): antes dela, a da 1ª cidade; depois, a da última — nunca a localização do aparelho (FR-009).
 */
export function homeStrip(content: Pick<LoadedContent, 'trip'>, today: DateStr): { date: DateStr; cities: CityId[]; inTrip: boolean }[] {
  const { start, end } = tripRange(content.trip);
  const first = content.trip[0]!.cityId;
  const last = content.trip[content.trip.length - 1]!.cityId;
  return [0, 1, 2, 3, 4].map((n) => {
    const date = addDays(today, n);
    if (date < start) return { date, cities: [first], inTrip: false };
    if (date > end) return { date, cities: [last], inTrip: false };
    return { date, cities: dayCities(content, date), inTrip: true };
  });
}

/** Os dias que vieram substituem os salvos; os outros ficam. */
export function mergeWeather(old: WeatherStore | null, fresh: WeatherStore): WeatherStore {
  if (!old) return fresh;
  const cities: WeatherStore['cities'] = { ...old.cities };
  for (const [id, days] of Object.entries(fresh.cities) as [CityId, Record<DateStr, DayWeather>][]) cities[id] = { ...old.cities[id], ...days };
  return { fetchedAt: fresh.fetchedAt, cities };
}

/** Previsão salva há mais de 24 h: "atualizada em …" em destaque. */
export function stale(fetchedAt: string, now: Date): boolean {
  return now.getTime() - Date.parse(fetchedAt) > 24 * 3600_000;
}

/** Local de cada cidade para o serviço: o centro que está no conteúdo, na ordem da viagem (R3). */
export function cityLocations(content: Pick<LoadedContent, 'trip' | 'cities'>): ({ cityId: CityId } & LatLng)[] {
  return content.trip.map((l) => ({ cityId: l.cityId, ...content.cities.find((c) => c.id === l.cityId)!.center }));
}
