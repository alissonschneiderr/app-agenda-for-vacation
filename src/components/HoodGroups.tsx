import type { LoadedContent } from '../content/load';
import type { PlaceGroup } from '../domain/notebook';
import { DayPlaceCard } from './DayPlaceCard';

/**
 * Lugares de uma seção do dia agrupados pelo grupo do roteiro (feature 010, FR-001 a FR-004): o
 * cabeçalho é só o nome — a frase e a foto do bairro ficam em "Bairros" — e fica preso abaixo do
 * menu do dia enquanto o grupo está na tela.
 */
export function HoodGroups({ groups, section, content }: { groups: PlaceGroup[]; section: string; content: LoadedContent }) {
  return (
    <>
      {groups.map((g, i) => {
        const id = `${section}-g${i}`;
        return (
          <section key={id} class="hood-group" aria-labelledby={id}>
            <h3 class="hood-group-head" id={id}>
              {g.name}
            </h3>
            <div class="card-stack">
              {g.items.map((p) => (
                <DayPlaceCard key={p.id} p={p} content={content} />
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
