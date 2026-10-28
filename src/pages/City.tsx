import { useEffect, useRef } from 'preact/hooks';
import { Chip } from '../components/Chip';
import { Cover } from '../components/Cover';
import { DayCard } from '../components/DayCard';
import { PageHeader } from '../components/PageHeader';
import type { LoadedContent } from '../content/load';
import type { CityId } from '../content/types';
import { cityCard, dayCard, shortLabel } from '../domain/notebook';
import { deviceToday, todayInCity } from '../domain/trip';
import { destinationDates } from '../domain/trip-view';
import { useClock } from '../lib/clock';
import { useUserState } from '../storage/user-store';

/**
 * Cidade (feature 009, contracts/screens.md "Cidade"): cabeçalho fixo, capa curta e a lista de dias
 * em cards inteiramente clicáveis. Sem tags e sem as abas Dicas, Transporte e Bairros.
 */
export function City({ content, cityId: param }: { content: LoadedContent; cityId: string }) {
  const [state] = useUserState();
  const now = useClock();
  const list = useRef<HTMLElement>(null);
  const city = content.cities.find((c) => c.id === param);
  const dates = city ? destinationDates(content, city.id as CityId) : [];
  const today = todayInCity(dates, deviceToday(now));
  // Feature 013: durante o período da cidade, abre já no card de hoje (só ao montar; rolar não salta de novo).
  useEffect(() => {
    if (today) list.current?.querySelector(`[data-date="${today}"]`)?.scrollIntoView({ block: 'start' });
  }, [param]);
  if (!city) {
    return (
      <main class="page">
        <h1>Cidade não encontrada</h1>
        <a href="#/">Voltar para o Início</a>
      </main>
    );
  }
  const cityId = city.id as CityId;
  const c = cityCard(content, state, cityId);
  return (
    <main class="page city">
      <PageHeader back="#/" label={c.country} title={c.name} />
      <Cover photo={c.photo} cityId={cityId} icon="compass" size="compact">
        <p class="eyebrow">{c.country}</p>
        <h2 class="city-title">{c.name}</h2>
        <div class="cover-row">
          <Chip variant="glass" icon="calendar">
            {shortLabel(c.start)} a {shortLabel(c.end)}
          </Chip>
          <Chip variant="glass">{c.nights === 1 ? '1 noite' : `${c.nights} noites`}</Chip>
        </div>
      </Cover>
      <section class="card-stack city-days" aria-label="Dias" ref={list}>
        {dates.map((d) => (
          <DayCard key={d} d={dayCard(content, state, d)} />
        ))}
      </section>
    </main>
  );
}
