import { useEffect } from 'preact/hooks';
import { installCardClicks } from './components/CardLink';
import { InstallHint } from './components/InstallHint';
import { OfflineToast } from './components/OfflineToast';
import { UpdateBanner } from './components/UpdateBanner';
import { installOfflineLinks } from './lib/offline-links';
import { refreshWeather } from './lib/weather';
import { OfflineBanner } from './components/OfflineBanner';
import { useContent } from './content/load';
import type { LoadedContent } from './content/load';
import { seedSuggested } from './domain/itineraries';
import { nowFromUrl, tripNow } from './domain/now';
import { tripRange } from './domain/trip';
import { destinationDates } from './domain/trip-view';
import { matchRoute, useRoute } from './lib/router';
import { City } from './pages/City';
import { Credits } from './pages/Credits';
import { Display } from './pages/Display';
import { Day } from './pages/Day';
import { Driver } from './pages/Driver';
import { Route } from './pages/Route';
import { Favorites } from './pages/Favorites';
import { FullDocument } from './pages/FullDocument';
import { Guide } from './pages/Guide';
import { Itineraries } from './pages/Itineraries';
import { ItineraryDetail } from './pages/ItineraryDetail';
import { Nearby } from './pages/Nearby';
import { PointDetail } from './pages/PointDetail';
import { Start } from './pages/Start';
import { StepDetail } from './pages/StepDetail';
import { applyContrast, getPrefs } from './storage/prefs';
import { getUserStore } from './storage/user-store';

/** Rotas das features 006 e 008 (specs/008-travel-notebook-ui/contracts/screens.md). */
function Page({ path, content }: { path: string; content: LoadedContent }) {
  let m: Record<string, string> | null;
  if (path === '/') return <Start content={content} />;
  if (path === '/dia') return <Day content={content} />;
  if ((m = matchRoute('/dia/:date', path))) return <Day key={m.date} content={content} date={m.date} />;
  if ((m = matchRoute('/dia/:date/:key', path))) return <StepDetail key={m.key} content={content} date={m.date!} stepKey={m.key!} />;
  if ((m = matchRoute('/perto/:date/:areaId', path))) return <Nearby key={`${m.date}-${m.areaId}`} content={content} date={m.date} areaId={m.areaId} />;
  if ((m = matchRoute('/perto/:date/:areaId/:placeId', path)))
    return <Nearby key={m.placeId} content={content} date={m.date} areaId={m.areaId} placeId={m.placeId} />;
  if ((m = matchRoute('/motorista/:date/:key', path))) return <Driver content={content} date={m.date!} itemKey={m.key!} />;
  if ((m = matchRoute('/rota/:date/:key', path))) return <Route key={`${m.date}-${m.key}`} content={content} date={m.date!} spotKey={m.key!} />;
  if (path === '/exibicao') return <Display />;
  if ((m = matchRoute('/cidade/:cityId', path))) return <City key={m.cityId} content={content} cityId={m.cityId!} />;
  if (path === '/guia') return <Guide content={content} />;
  if ((m = matchRoute('/guia/:cityId', path))) return <Guide key={m.cityId} content={content} cityId={m.cityId} />;
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
      <a href="#/">Voltar para o Início</a>
    </main>
  );
}

/** Rotas antigas (features 002, 003 e 006) que passaram para as telas das features 006 e 008. */
export function redirectFor(path: string, content?: Pick<LoadedContent, 'trip'>, today?: string): string | null {
  let m: Record<string, string> | null;
  // Feature 009: Dicas, Transporte e "Por perto" da viagem saíram; as abas da cidade também.
  if (['/viagem', '/dicas', '/transporte', '/perto'].includes(path)) return '/';
  if ((m = matchRoute('/cidade/:city/:tab', path))) return `/cidade/${m.city}`;
  if (path === '/dia' && content) {
    const { start, end } = tripRange(content.trip);
    const date = today && today >= start && today <= end ? today : start;
    return `/dia/${date}`;
  }
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
  const today = tripNow(nowFromUrl(typeof location === 'undefined' ? '' : location.search)).date;
  const target = redirectFor(path, state.status === 'ready' ? state.content : undefined, today);

  useEffect(() => {
    if (target) window.location.replace(`#${target}`);
  }, [target]);

  useEffect(() => applyContrast(getPrefs().highContrast), []);

  // Feature 009: cards inteiros clicáveis (um único link por card).
  useEffect(() => installCardClicks(), []);

  // Feature 014: sem internet, link externo avisa em vez de abrir uma página de erro.
  useEffect(() => installOfflineLinks(), []);

  useEffect(() => {
    if (state.status === 'ready') getUserStore().update((s) => seedSuggested(state.content, s));
  }, [state]);

  // Feature 017: previsão do tempo ao abrir e ao voltar para o app (no máximo a cada 3 h; nunca bloqueia).
  useEffect(() => {
    if (state.status !== 'ready') return;
    const content = state.content;
    void refreshWeather(content);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refreshWeather(content);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [state]);

  return (
    <div class="app">
      <OfflineBanner recovered={getUserStore().recovered} />
      <InstallHint />
      <UpdateBanner />
      <OfflineToast />
      {state.status === 'loading' && <main class="page empty">Carregando o guia…</main>}
      {state.status === 'unavailable' && (
        <main class="page empty">
          <h1>Guia ainda não baixado</h1>
          <p>Conecte-se à internet uma vez para baixar o guia.</p>
        </main>
      )}
      {state.status === 'ready' && !target && <Page path={path} content={state.content} />}
    </div>
  );
}
