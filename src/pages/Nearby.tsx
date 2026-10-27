import { Cover } from '../components/Cover';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/PageHeader';
import { LinkButtons } from '../components/LinkButtons';
import { PlaceCard } from '../components/PlaceCard';
import { PointPhoto } from '../components/PointPhoto';
import { useQuery } from '../lib/router';
import type { LoadedContent } from '../content/load';
import type { DocPlace } from '../content/types';
import { currentArea, nextStep, tripNow, tripPhase } from '../domain/now';
import { cityForDate, formatDayLabel, tripRange } from '../domain/trip';
import { dayView } from '../domain/trip-view';
import { useClock } from '../lib/clock';
import { useUserState } from '../storage/user-store';
import { driverHref } from '../lib/links';

type Group = 'comer' | 'lojas' | 'curiosidades';
const GROUPS: [Group, string, DocPlace['kind']][] = [
  ['comer', 'Comer', 'food'],
  ['lojas', 'Lojas', 'shop'],
  ['curiosidades', 'Curiosidades', 'screen'],
];
const LEVELS: [string, string][] = [
  ['☕', 'Café'],
  ['🏆', 'Clássicos'],
  ['🍰', 'Doces'],
];

/** "Por perto" (feature 006, FR-014/FR-015): as opções sem horário da região atual. */
export function Nearby({ content, date: param, areaId, placeId }: { content: LoadedContent; date?: string; areaId?: string; placeId?: string }) {
  const [state] = useUserState();
  const now = useClock();
  const { date: today, minutes } = tripNow(now);
  const date = param ?? (tripPhase(content, today) === 'during' ? today : tripRange(content.trip).start);
  const day = dayView(content, state, date);
  const area =
    day.areas.find((a) => a.id === areaId) ??
    currentArea(day, nextStep(day, date === today ? minutes : null)) ??
    day.areas[0];
  const q = useQuery();
  const group = (q.get('g') as Group) || 'comer';
  const level = q.get('n') ?? '';
  const base = `#/perto/${date}/${area?.id ?? ''}`;
  const link = (g: Group, n = '') => `${base}?g=${g}${n ? `&n=${encodeURIComponent(n)}` : ''}`;

  if (!area) {
    const city = cityForDate(content.trip, date);
    return (
      <main class="page nearby">
        <h1 class="page-title">Por perto</h1>
        <p>O roteiro de {formatDayLabel(date)} não traz opções por região.</p>
        <a class="btn btn-big" href={`#/guia/${city}`}>
          Ver o guia de {content.cityName(city)}
        </a>
      </main>
    );
  }

  const places = day.places.filter((p) => area.placeIds.includes(p.id));
  const selected = placeId ? places.find((p) => p.id === placeId) : undefined;
  if (selected) {
    return (
      <main class="page nearby-detail">
        <a class="back-link" href={`${base}?g=${GROUPS.find((g) => g[2] === selected.kind)?.[0] ?? 'comer'}`}>
          <Icon name="chevron-left" size={18} /> {area.name}
        </a>
        {selected.photo && <PointPhoto photo={selected.photo} class="detail-photo" />}
        <PlaceCard place={selected} />
        {(selected.address || selected.mapsUrls.length > 0) && (
          <a class="btn btn-big" href={driverHref(date, selected.id)}>
            <Icon name="taxi" size={22} /> Mostrar ao motorista
          </a>
        )}
      </main>
    );
  }

  const kindOf = GROUPS.find((g) => g[0] === group)![2];
  const inGroup = places.filter((p) => p.kind === kindOf);
  const shown = group === 'comer' && level ? inGroup.filter((p) => p.level === level) : inGroup;

  const city = cityForDate(content.trip, date);
  return (
    <main class="page nearby">
      <PageHeader back={`#/dia/${date}`} label={`${content.cityName(city)} · ${formatDayLabel(date)}`} title="Por perto" />
      {/* Feature 008: o bairro no formato do design — capa com a foto da região, nome e a frase do doc. */}
      <Cover photo={area.photo} cityId={city} icon="pin" size="compact">
        <p class="eyebrow">
          <Icon name="pin" size={14} /> Bairro
        </p>
        <h2 class="hood-title">{area.name}</h2>
      </Cover>
      {area.intro && <p class="hood-intro">{area.intro}</p>}
      <nav class="chips" aria-label="Regiões do dia">
        {day.areas
          .filter((a) => a.placeIds.some((id) => day.places.find((p) => p.id === id)?.kind !== 'attraction'))
          .map((a) => (
            <a key={a.id} class="chip" href={`#/perto/${date}/${a.id}?g=${group}`} aria-current={a.id === area.id ? 'true' : undefined}>
              {a.name.replace(/^Noite:\s*/, '')}
            </a>
          ))}
      </nav>
      {area.photoUrls.length > 0 && <LinkButtons place={{ name: area.name, mapsUrls: [], photoUrls: area.photoUrls }} />}

      <nav class="segmented" aria-label="Tipo de opção">
        {GROUPS.map(([g, label, kind]) => (
          <a key={g} href={link(g)} aria-current={g === group ? 'page' : undefined}>
            {label} ({places.filter((p) => p.kind === kind).length})
          </a>
        ))}
      </nav>

      {group === 'comer' && inGroup.length > 0 && (
        <nav class="chips chips-small" aria-label="Filtro de comida">
          <a class="chip" href={link('comer')} aria-current={!level ? 'true' : undefined}>
            Todos
          </a>
          {LEVELS.map(([n, label]) => (
            <a key={n} class="chip" href={link('comer', n)} aria-current={level === n ? 'true' : undefined}>
              {n} {label}
            </a>
          ))}
        </nav>
      )}

      {area.notesHtml && group === 'comer' && (
        <details class="area-notes" open>
          <summary>Avisos de {area.name}</summary>
          {/* HTML gerado no build a partir do roteiro.md do próprio app. */}
          <div class="doc-html" dangerouslySetInnerHTML={{ __html: area.notesHtml }} />
        </details>
      )}

      {shown.length ? (
        <div class="place-list">
          {shown.map((p) => (
            <PlaceCard key={p.id} place={p} short href={`#/perto/${date}/${area.id}/${p.id}`} />
          ))}
        </div>
      ) : (
        <p class="muted">Nenhuma opção deste tipo em {area.name}.</p>
      )}
    </main>
  );
}
