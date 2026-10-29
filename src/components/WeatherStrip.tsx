import type { LoadedContent } from '../content/load';
import type { CityId, DateStr } from '../content/types';
import { formatDayMonth, formatWeekday } from '../domain/trip';
import { describe, homeStrip, weatherFor } from '../domain/weather';
import { useWeather } from '../lib/weather';
import { Icon } from './Icon';
import { spokenWeather, tempRange, Updated } from './WeatherBox';

const SHORT: Record<CityId, string> = { 'nova-york': 'NY', orlando: 'ORL', miami: 'MIA' };

/**
 * Faixa do Início (feature 017, FR-003/FR-008, Q1): hoje e os 4 dias seguintes. Dia da viagem abre o
 * dia; fora da viagem, a previsão da 1ª (ou da última) cidade, sem link. Todos os cards têm o mesmo
 * visual e a sigla da cidade. A hora da busca aparece uma vez.
 */
export function WeatherStrip({ content, today }: { content: LoadedContent; today: DateStr }) {
  const store = useWeather();
  const days = homeStrip(content, today);
  const any = days.some((d) => d.cities.some((id) => weatherFor(store, id, d.date, today).kind === 'forecast'));
  return (
    <section class="weather-strip" aria-label="Previsão: hoje e os próximos 4 dias">
      <ol>
        {days.map(({ date, cities, inTrip }) => {
          const parts = cities.map((id) => ({ id, w: weatherFor(store, id, date, today) }));
          const spoken = parts.map(({ id, w }) => (w.kind === 'forecast' ? spokenWeather(content.cityName(id), w.day, false) : content.cityName(id))).join('; ');
          const label = `${formatWeekday(date)}, ${formatDayMonth(date)}, ${spoken}`;
          const body = (
            <>
              <span class="weather-date">{formatDayMonth(date)}</span>
              {parts.map(({ id, w }) =>
                w.kind === 'forecast' ? (
                  <span key={id} class="weather-mini">
                    <span class="weather-short">{SHORT[id]}</span>
                    <Icon name={describe(w.day.code).icon} size={22} />
                    <span class="weather-minmax">{tempRange(w.day)}</span>
                  </span>
                ) : (
                  <span key={id} class="weather-mini muted">
                    <span class="weather-short">{SHORT[id]}</span>—
                  </span>
                ),
              )}
            </>
          );
          if (!inTrip) {
            return (
              <li key={date} class="weather-day is-out">
                <span aria-hidden="true" class="weather-card">
                  {body}
                </span>
                <span class="visually-hidden">{label}</span>
              </li>
            );
          }
          return (
            <li key={date} class="weather-day">
              <a class="weather-card" href={`#/dia/${date}`} aria-label={label}>
                {body}
              </a>
            </li>
          );
        })}
      </ol>
      {any && store && <Updated fetchedAt={store.fetchedAt} />}
      {!any && <p class="muted weather-updated">Previsão disponível com internet</p>}
    </section>
  );
}
