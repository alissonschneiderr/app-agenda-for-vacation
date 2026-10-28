import { CityCard } from '../components/CityCard';
import { Icon } from '../components/Icon';
import type { LoadedContent } from '../content/load';
import { cityCard } from '../domain/notebook';
import { useUserState } from '../storage/user-store';

/** "Nova York, Orlando e Miami", dos nomes das cidades na ordem da viagem. */
function joinNames(names: string[]): string {
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} e ${names.at(-1)}` : (names[0] ?? '');
}

/**
 * Início (feature 009, Q1 = B): só os destinos, em cards grandes, verticais e inteiramente
 * clicáveis. Sem capa da viagem, "Agora", "Reservar hoje", destaques, consulta ou rodapé.
 */
export function Start({ content }: { content: LoadedContent }) {
  const [state] = useUserState();
  const order = content.trip.map((l) => l.cityId);
  return (
    <main class="page start">
      <header class="start-head">
        <span class="round-btn round-btn-brand" aria-hidden="true">
          <Icon name="compass" size={22} />
        </span>
        <div>
          <p class="eyebrow page-head-label">{order.length} destinos</p>
          <h1 class="page-head-title">{joinNames(order.map((id) => content.cityName(id)))}</h1>
        </div>
        {/* Feature 014: o app instalado não tem barra de endereço — a Exibição (versão) abre por aqui. */}
        <a class="round-btn start-settings" href="#/exibicao" aria-label="Exibição e versão">
          <Icon name="settings" size={20} />
        </a>
      </header>
      <section class="card-stack" aria-label="Destinos">
        {order.map((id) => (
          <CityCard key={id} c={cityCard(content, state, id)} />
        ))}
      </section>
    </main>
  );
}
