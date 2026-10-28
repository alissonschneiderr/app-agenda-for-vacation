import { useState } from 'preact/hooks';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/PageHeader';
import type { LoadedContent } from '../content/load';
import { SECTION_LABEL } from '../domain/notebook';
import { routeChoices, routeCity, routeSpot, routeUrl, type RouteGroup, type RouteSpot } from '../domain/route';
import { formatDayMonth, formatWeekday } from '../domain/trip';
import { routeHref, stepHref } from '../lib/links';
import { useOnline } from '../lib/pwa';
import { useQuery } from '../lib/router';
import { useUserState } from '../storage/user-store';

const GROUPS: RouteGroup[] = ['paradas', 'comer', 'lojas', 'curiosidades'];

/**
 * "Rota até…" (feature 016, contracts/screens.md): os outros lugares do dia e, com "Ver outros dias",
 * os da cidade inteira (Q1 = C). Cada um abre a rota no Google Maps; "Inverter" troca o sentido.
 * Sem internet, a lista abre e a escolha mostra os dois endereços (FR-006).
 */
export function Route({ content, date, spotKey }: { content: LoadedContent; date: string; spotKey: string }) {
  const [state] = useUserState();
  const query = useQuery();
  const online = useOnline();
  const [warn, setWarn] = useState<string | null>(null);
  const origin = routeSpot(content, state, date, spotKey);
  if (!origin) {
    return (
      <main class="page">
        <PageHeader back={`#/dia/${date}`} label="Rota" title="Lugar não encontrado" />
        <a href={`#/dia/${date}`}>Voltar ao dia</a>
      </main>
    );
  }

  const inv = query.get('inv') === '1';
  const own = routeChoices(content, state, origin, false)[0]!;
  const others = query.get('outros') === '1' || own.spots.length === 0;
  const days = routeChoices(content, state, origin, others);
  const asked = query.get('outros') === '1';
  const href = (i: boolean, o: boolean) => {
    const qs = [i && 'inv=1', o && 'outros=1'].filter(Boolean).join('&');
    return routeHref(date, spotKey, qs && `?${qs}`);
  };
  const back = origin.group === 'paradas' ? stepHref(date, spotKey) : `#/dia/${date}`;
  const title = inv ? `Até ${origin.name}` : `A partir de ${origin.name}`;

  const option = (s: RouteSpot) => {
    const [from, to] = inv ? [s, origin] : [origin, s];
    const name = s.time ? `${s.name}, ${s.time}` : s.name;
    const body = (
      <>
        {s.time && <span class="route-time">{s.time}</span>}
        <span class="route-name">{s.name}</span>
        <Icon name="chevron-right" size={18} />
      </>
    );
    return (
      <li key={s.key}>
        {online ? (
          <a class="route-option" href={routeUrl(from, to)} target="_blank" rel="noopener" aria-label={name}>
            {body}
          </a>
        ) : (
          <button type="button" class="route-option" aria-label={name} onClick={() => setWarn(`A rota precisa de internet. De: ${from.address}. Até: ${to.address}.`)}>
            {body}
          </button>
        )}
      </li>
    );
  };

  return (
    <main class="page route-page">
      <PageHeader back={back} label={`Rota · ${content.cityName(routeCity(content, origin.date))}`} title={title} />
      <div class="row route-actions">
        <a class="btn" href={href(!inv, asked)}>
          <Icon name="route" size={18} /> Inverter
        </a>
        {!others && (
          <a class="btn" href={href(inv, true)}>
            <Icon name="calendar" size={18} /> Ver outros dias
          </a>
        )}
      </div>
      {warn && (
        <p class="notice" role="alert">
          {warn}
        </p>
      )}
      <section aria-label={inv ? `Rota até ${origin.name}` : `Rota a partir de ${origin.name}`}>
        {days.map((d, i) => (
          <section key={d.date} class="route-day" aria-label={`${formatWeekday(d.date)}, ${formatDayMonth(d.date)}`}>
            <h2 class="route-day-title">
              {formatWeekday(d.date)}, {formatDayMonth(d.date)}
            </h2>
            {i === 0 && d.spots.length === 0 && <p class="muted">Nenhum outro lugar neste dia</p>}
            {GROUPS.map((g) => {
              const spots = d.spots.filter((s) => s.group === g);
              if (!spots.length) return null;
              return (
                <div key={g} class="route-group">
                  <p class="eyebrow route-group-title">{SECTION_LABEL[g]}</p>
                  <ul class="route-list">{spots.map(option)}</ul>
                </div>
              );
            })}
          </section>
        ))}
      </section>
    </main>
  );
}
