import { useEffect } from 'preact/hooks';
import { OfflineBanner } from './components/OfflineBanner';
import { TabBar } from './components/TabBar';
import { useContent } from './content/load';
import type { LoadedContent } from './content/load';
import { seedSuggested } from './domain/itineraries';
import { destinationDates } from './domain/trip-view';
import { matchRoute, useRoute } from './lib/router';
import { Credits } from './pages/Credits';
import { Day } from './pages/Day';
import { Driver } from './pages/Driver';
import { Favorites } from './pages/Favorites';
import { FullDocument } from './pages/FullDocument';
import { Home } from './pages/Home';
import { Itineraries } from './pages/Itineraries';
import { ItineraryDetail } from './pages/ItineraryDetail';
import { Nearby } from './pages/Nearby';
import { Now } from './pages/Now';
import { PointDetail } from './pages/PointDetail';
import { StepDetail } from './pages/StepDetail';
import { TripOverview } from './pages/TripOverview';
import { applyContrast, getPrefs } from './storage/prefs';
import { getUserStore } from './storage/user-store';

/** Rotas da feature 006 (specs/006-trip-companion-ux/contracts/routes.md). */
function Page({ path, content }: { path: string; content: LoadedContent }) {
  let m: Record<string, string> | null;
  if (path === '/') return <Now content={content} />;
  if (path === '/dia') return <Day content={content} />;
  if ((m = matchRoute('/dia/:date', path))) return <Day key={m.date} content={content} date={m.date} />;
  if ((m = matchRoute('/dia/:date/:key', path))) return <StepDetail key={m.key} content={content} date={m.date!} stepKey={m.key!} />;
  if (path === '/perto') return <Nearby content={content} />;
  if ((m = matchRoute('/perto/:date/:areaId', path))) return <Nearby key={`${m.date}-${m.areaId}`} content={content} date={m.date} areaId={m.areaId} />;
  if ((m = matchRoute('/perto/:date/:areaId/:placeId', path)))
    return <Nearby key={m.placeId} content={content} date={m.date} areaId={m.areaId} placeId={m.placeId} />;
  if ((m = matchRoute('/motorista/:date/:key', path))) return <Driver content={content} date={m.date!} itemKey={m.key!} />;
  if (path === '/viagem') return <TripOverview content={content} />;
  if (path === '/guia') return <Home content={content} />;
  if ((m = matchRoute('/cidade/:cityId', path))) return <Home key={m.cityId} content={content} cityId={m.cityId} />;
  if ((m = matchRoute('/ponto/:pointId', path))) return <PointDetail key={m.pointId} content={content} pointId={m.pointId!} />;
  if (path === '/favoritos') return <Favorites content={content} />;
  if (path === '/roteiros') return <Itineraries content={content} />;
  if ((m = matchRoute('/roteiros/:id', path))) return <ItineraryDetail key={m.id} content={content} id={m.id!} />;
  if (path === '/creditos') return <Credits content={content} />;
  if ((m = matchRoute('/full/:cityId/documento', path))) return <FullDocument key={m.cityId} content={content} cityId={m.cityId} />;
  if ((m = matchRoute('/full/:cityId/documento/:section', path)))
    return <FullDocument key={m.cityId} content={content} cityId={m.cityId} section={m.section} />;
  return (
    <main class="page">
      <h1>Página não encontrada</h1>
      <a href="#/">Voltar para Agora</a>
    </main>
  );
}

/** Rotas antigas (features 002/003) que passaram para as telas da feature 006. */
export function redirectFor(path: string, content?: Pick<LoadedContent, 'trip'>): string | null {
  let m: Record<string, string> | null;
  if ((m = matchRoute('/destino/:city/:date/:key', path))) return `/dia/${m.date}/${encodeURIComponent(m.key!)}`;
  if ((m = matchRoute('/destino/:city/:date', path))) return `/dia/${m.date}`;
  if ((m = matchRoute('/destino/:city', path))) {
    const first = content ? destinationDates(content as LoadedContent, m.city as never)[0] : undefined;
    return first ? `/dia/${first}` : '/dia';
  }
  if (path === '/full/nova-york') return '/dia/2026-10-31';
  m = matchRoute('/full/nova-york/:date', path);
  if (m && m.date !== 'documento') return `/dia/${m.date}`;
  return null;
}

export function App() {
  const path = useRoute();
  const state = useContent();
  const target = redirectFor(path, state.status === 'ready' ? state.content : undefined);

  useEffect(() => {
    if (target) window.location.replace(`#${target}`);
  }, [target]);

  useEffect(() => applyContrast(getPrefs().highContrast), []);

  useEffect(() => {
    if (state.status === 'ready') getUserStore().update((s) => seedSuggested(state.content, s));
  }, [state]);

  return (
    <div class="app">
      <OfflineBanner recovered={getUserStore().recovered} />
      {state.status === 'loading' && <main class="page empty">Carregando o guia…</main>}
      {state.status === 'unavailable' && (
        <main class="page empty">
          <h1>Guia ainda não baixado</h1>
          <p>Conecte-se à internet uma vez para baixar o guia.</p>
        </main>
      )}
      {state.status === 'ready' && !target && <Page path={path} content={state.content} />}
      {!path.startsWith('/motorista') && <TabBar path={path} />}
    </div>
  );
}
