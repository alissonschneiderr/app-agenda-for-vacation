import type { LoadedContent } from '../content/load';
import type { CityId, DateStr } from '../content/types';
import { zonedNow } from '../domain/opening-hours';
import { formatDayMonth, TRIP_TIME_ZONE } from '../domain/trip';
import { dayCities, describe, stale, weatherFor, type DayWeather } from '../domain/weather';
import { useWeather } from '../lib/weather';
import { Icon } from './Icon';

/** "atualizada em 29/10 às 14h05", na hora da viagem (como o resto do app). */
export function updatedLabel(fetchedAt: string): string {
  const { date, minutes } = zonedNow(new Date(fetchedAt), TRIP_TIME_ZONE);
  return `atualizada em ${formatDayMonth(date)} às ${String(Math.floor(minutes / 60)).padStart(2, '0')}h${String(minutes % 60).padStart(2, '0')}`;
}

/** Texto do leitor de tela: "Nova York: parcialmente nublado, máxima 15, mínima 9 graus[, 20% de chance de chuva]". */
export function spokenWeather(city: string, d: DayWeather, withRain = true): string {
  const rain = withRain && d.rain !== null ? `, ${d.rain}% de chance de chuva` : '';
  return `${city}: ${describe(d.code).label.toLowerCase()}, máxima ${d.max}, mínima ${d.min} graus${rain}`;
}

export function Updated({ fetchedAt }: { fetchedAt: string }) {
  return <p class={`weather-updated${stale(fetchedAt, new Date()) ? ' is-stale' : ''}`}>{updatedLabel(fetchedAt)}</p>;
}

/**
 * Box "Tempo" do dia (feature 017, FR-001/FR-002/FR-007): a previsão da cidade do dia — as duas no
 * dia de troca. Além de 7 dias, "Previsão a partir de DD/MM"; sem nada salvo, o aviso de internet.
 */
export function WeatherBox({ content, date, today }: { content: LoadedContent; date: DateStr; today: DateStr }) {
  const store = useWeather();
  const cities = dayCities(content, date);
  if (!cities.length) return null;
  const rows = cities.map((id: CityId) => ({ id, w: weatherFor(store, id, date, today) }));
  const fetchedAt = rows.find((r) => r.w.kind === 'forecast') && store?.fetchedAt;
  const later = rows.find((r) => r.w.kind === 'later')?.w;
  return (
    <section class="weather-box" aria-label="Tempo">
      <h2 class="weather-title">Tempo</h2>
      {rows.map(({ id, w }) => {
        if (w.kind !== 'forecast') return null;
        const { icon, label } = describe(w.day.code);
        return (
          <div key={id} class="weather-row">
            {cities.length > 1 && <p class="weather-city">{content.cityName(id)}</p>}
            <p class="weather-main" aria-hidden="true">
              <Icon name={icon} size={28} /> {label}
            </p>
            <p class="weather-temps" aria-hidden="true">
              <span>
                {w.day.max}° / {w.day.min}°
              </span>
              {w.day.rain !== null && (
                <span class="weather-rain">
                  <Icon name="rain" size={16} /> {w.day.rain}%
                </span>
              )}
            </p>
            <p class="visually-hidden">{spokenWeather(content.cityName(id), w.day)}</p>
          </div>
        );
      })}
      {later?.kind === 'later' && !fetchedAt && <p class="muted">Previsão a partir de {formatDayMonth(later.from)}</p>}
      {rows.every((r) => r.w.kind === 'none') && <p class="muted">Previsão disponível com internet</p>}
      {fetchedAt && <Updated fetchedAt={fetchedAt} />}
    </section>
  );
}
