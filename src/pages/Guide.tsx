import { PageHeader } from '../components/PageHeader';
import { useMemo, useState } from 'preact/hooks';
import { CategoryFilter, CityPicker } from '../components/Filters';
import { Icon } from '../components/Icon';
import { dayHeadline } from '../components/DayLabel';
import { PointList } from '../components/PointCard';
import { PointMap } from '../components/PointMap';
import type { LoadedContent } from '../content/load';
import type { CityId } from '../content/types';
import { filterPoints } from '../domain/search';
import { cityForDate, dayInfo, todayInTripZone } from '../domain/trip';
import { href, navigate } from '../lib/router';

export function Guide({ content, cityId }: { content: LoadedContent; cityId?: string }) {
  const now = new Date();
  const today = todayInTripZone(now);
  const todayCity = cityForDate(content.trip, today);
  const day = dayInfo(content.trip, today);
  const city = (content.cities.find((c) => c.id === cityId)?.id ?? todayCity) as CityId;
  const cityInfo = content.cities.find((c) => c.id === city)!;

  const [view, setView] = useState<'list' | 'map'>('list');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const all = content.pointsByCity.get(city) ?? [];
  const categories = content.categories.filter((c) => all.some((p) => p.categoryId === c.id));
  const points = filterPoints(all, { cityId: city, categoryId: category, query });
  const markers = useMemo(() => points.map((point) => ({ point })), [points.map((p) => p.id).join()]);

  const clear = () => {
    setQuery('');
    setCategory(null);
  };

  return (
    <main class="page">
      <nav class="row guide-links" aria-label="Atalhos do guia">
        <a class="btn btn-quiet" href="#/favoritos">
          <Icon name="star" size={18} /> Favoritos
        </a>
        <a class="btn btn-quiet" href="#/roteiros">
          <Icon name="calendar" size={18} /> Meus roteiros
        </a>
      </nav>
      <PageHeader back="#/" label="Guia de pontos turísticos" title={`Guia de ${cityInfo.name}`} />
      {day.kind === 'travel' && (
        <p class="today" role="status">
          Hoje · {dayHeadline(day, content)}
        </p>
      )}
      {city === 'nova-york' && content.fullItineraries?.some((f) => f.days.some((d) => d.date === today)) && (
        <p>
          <a class="btn btn-primary" href={href(`/destino/nova-york/${today}`)}>
            Roteiro de hoje
          </a>
        </p>
      )}
      <CityPicker
        cities={content.cities}
        value={city}
        todayCity={todayCity}
        onChange={(id) => {
          clear();
          navigate(id === todayCity ? '/guia' : `/guia/${id}`);
        }}
      />
      <div class="row" style={{ margin: '8px 0' }}>
        <label class="visually-hidden" for="search">
          Buscar pelo nome
        </label>
        <input
          id="search"
          class="search"
          type="search"
          placeholder="Buscar pelo nome"
          value={query}
          onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
          style={{ flex: 1 }}
        />
        <div class="segmented" role="group" aria-label="Visualização">
          <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>
            Lista
          </button>
          <button type="button" aria-pressed={view === 'map'} onClick={() => setView('map')}>
            Mapa
          </button>
        </div>
      </div>
      <CategoryFilter categories={categories} value={category} onChange={setCategory} />
      {view === 'list' ? (
        <PointList points={points} content={content} now={now} onClear={clear} />
      ) : (
        <PointMap markers={markers} center={cityInfo.center} zoom={12} />
      )}
    </main>
  );
}
