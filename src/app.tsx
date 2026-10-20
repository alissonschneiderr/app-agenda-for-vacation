import { useEffect } from 'preact/hooks';
import { BottomNav } from './components/BottomNav';
import { OfflineBanner } from './components/OfflineBanner';
import { useContent } from './content/load';
import { seedSuggested } from './domain/itineraries';
import { matchRoute, useRoute } from './lib/router';
import { Credits } from './pages/Credits';
import { FullDay } from './pages/FullDay';
import { FullDocument } from './pages/FullDocument';
import { FullOverview } from './pages/FullOverview';
import { Favorites } from './pages/Favorites';
import { Home } from './pages/Home';
import { ItineraryDetail } from './pages/ItineraryDetail';
import { Itineraries } from './pages/Itineraries';
import { PointDetail } from './pages/PointDetail';
import { getUserStore } from './storage/user-store';
import type { LoadedContent } from './content/load';

function Page({ path, content }: { path: string; content: LoadedContent }) {
  let m: Record<string, string> | null;
  if (path === '/') return <Home content={content} />;
  if ((m = matchRoute('/cidade/:cityId', path))) return <Home key={m.cityId} content={content} cityId={m.cityId} />;
  if ((m = matchRoute('/ponto/:pointId', path))) return <PointDetail key={m.pointId} content={content} pointId={m.pointId!} />;
  if (path === '/favoritos') return <Favorites content={content} />;
  if (path === '/roteiros') return <Itineraries content={content} />;
  if ((m = matchRoute('/roteiros/:id', path))) return <ItineraryDetail key={m.id} content={content} id={m.id!} />;
  if (path === '/creditos') return <Credits content={content} />;
  if (path === '/full/nova-york') return <FullOverview content={content} />;
  if (path === '/full/nova-york/documento') return <FullDocument content={content} />;
  if ((m = matchRoute('/full/nova-york/:date', path))) return <FullDay key={m.date} content={content} date={m.date!} />;
  return (
    <main class="page">
      <h1>Página não encontrada</h1>
      <a href="#/">Voltar ao guia</a>
    </main>
  );
}

export function App() {
  const path = useRoute();
  const state = useContent();

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
      {state.status === 'ready' && <Page path={path} content={state.content} />}
      <BottomNav path={path} />
    </div>
  );
}
