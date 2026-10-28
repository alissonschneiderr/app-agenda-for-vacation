import { useEffect, useRef } from 'preact/hooks';
import { Chip } from '../components/Chip';
import { HoodGroups } from '../components/HoodGroups';
import { NeighborhoodCard } from '../components/NeighborhoodCard';
import { SectionMenu } from '../components/SectionMenu';
import { Cover } from '../components/Cover';
import { DayAlerts } from '../components/DayAlerts';
import { KIND_ICON, KIND_LABEL } from '../components/day-kind';
import { Icon } from '../components/Icon';
import { MODE_ICON } from '../components/step-helpers';
import { PageHeader } from '../components/PageHeader';
import { SectionTitle } from '../components/SectionTitle';
import { StopCard } from '../components/StopCard';
import { NowMarker, TimelineRow } from '../components/TimelineRow';
import { TransitionBlocks } from '../components/TransitionBlocks';
import { useMarkWithUndo } from '../components/UndoToast';
import type { LoadedContent } from '../content/load';
import type { CityId, DayArea } from '../content/types';
import { toggleDone } from '../domain/full-itinerary';
import { dayCard, dayMoves, dayPlaceGroups, daySections, dayTips, neighborhoods, type DaySectionId, FREE_TIME } from '../domain/notebook';
import { allSteps, modeOf, nowIndex, tripNow, tripPhase } from '../domain/now';
import { cityForDate, formatDayLabel, formatDayMonth, formatWeekday, tripRange } from '../domain/trip';
import { adjacentDay, type DayActivityView, type TripDayView } from '../domain/trip-view';
import { useClock } from '../lib/clock';
import { useUserState } from '../storage/user-store';
import { driverHref, stepHref } from '../lib/links';
import { useQuery } from '../lib/router';

const SWIPE_PX = 60;


function hhmm(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}h${String(min % 60).padStart(2, '0')}`;
}

/** Linha de região dentro das paradas: nome e atalho para as opções do bairro. */
function AreaLine({ area, day }: { area: DayArea; day: TripDayView }) {
  const options = day.places.filter((p) => area.placeIds.includes(p.id) && p.kind !== 'attraction').length;
  return (
    <li class={`tl-area tl-area-${area.kind}`}>
      {/* Feature 013: tempo livre não é lugar — sem o alfinete. */}
      {!FREE_TIME.test(area.name) && <Icon name="pin" size={16} />}
      <h3 class="tl-area-name">{area.name}</h3>
      {options > 0 && (
        <a class="tl-area-options" href={`#/perto/${day.date}/${area.id}`}>
          Opções ({options})
        </a>
      )}
    </li>
  );
}

/** "Como circular hoje": saídas e deslocamentos do roteiro, sem texto novo. */
function Moves({ day }: { day: TripDayView }) {
  const moves = dayMoves(day);
  if (!moves.length) return null;
  return (
    <div class="moves">
      <ul class="move-list">
        {moves.map((m) => (
          <li key={m.key}>
            <Icon name={MODE_ICON[modeOf(m.text)]} size={18} />
            <span>
              {m.label && <strong>{m.label}:</strong>} {m.text}
            </span>
          </li>
        ))}
      </ul>
      {day.mapUrl && (
        <a class="nb-link" href={day.mapUrl} target="_blank" rel="noopener">
          <Icon name="map" size={18} /> Mapa do dia <Icon name="external" size={14} />
        </a>
      )}
    </div>
  );
}

/** Paradas do dia (contracts/screens.md "Dia", item 4): cartões, linhas discretas e a marca "agora". */
function Stops({ day, cityId, nowMin, onToggle }: { day: TripDayView; cityId: CityId; nowMin: number | null; onToggle: (a: DayActivityView) => void }) {
  const hasFood = day.places.some((p) => p.kind === 'food');
  const list = allSteps(day);
  const marker = nowMin === null || !list.some((a) => a.start) ? -1 : nowIndex(day, nowMin);
  const items: preact.JSX.Element[] = [];
  const emitted = new Set<string>();
  let lastArea: string | null | undefined;
  // Uma região na ordem do doc, com o deslocamento de seção própria (🚗) antes dela e, quando ela
  // não tem passos ou opções, as notas recolhidas (feature 007).
  const emitArea = (area: DayArea) => {
    emitted.add(area.id);
    const before = day.areas[day.areas.indexOf(area) - 1];
    if (before?.transferInTimeline && before.transfer) {
      items.push(
        <li key={`move-${area.id}`} class="tl-move">
          <Icon name="taxi" size={16} />
          <span class="tl-move-text">{before.transfer.replace(/^\S+\s+/u, '')}</span>
        </li>,
      );
    }
    items.push(<AreaLine key={`area-${area.id}`} area={area} day={day} />);
    // Região sem passos: as notas logo abaixo; com passos, depois do último passo dela (flushNotes).
    if (!area.activityIds.length) pushNotes(area);
  };
  const pushNotes = (area: DayArea) => {
    const options = day.places.filter((p) => area.placeIds.includes(p.id) && p.kind !== 'attraction').length;
    if (!area.notesHtml || (area.activityIds.length && options > 0)) return;
    items.push(
      <li key={`notes-${area.id}`} class="tl-notes">
        <details>
          <summary>Notas de {area.name}</summary>
          <div class="doc-html" dangerouslySetInnerHTML={{ __html: area.notesHtml }} />
        </details>
      </li>,
    );
  };
  const flushNotes = (id: string | null | undefined) => {
    const area = day.areas.find((x) => x.id === id);
    if (area?.activityIds.length) pushNotes(area);
  };
  const quietUpTo = (k: number) =>
    day.areas.slice(0, k).filter((x) => !emitted.has(x.id) && !x.activityIds.length && x.kind !== 'chegada').forEach(emitArea);
  list.forEach((a, i) => {
    if (i === marker) items.push(<NowMarker key="now" time={hhmm(nowMin!)} />);
    if (day.areas.length && a.areaId && a.areaId !== lastArea) {
      flushNotes(lastArea);
      const area = day.areas.find((x) => x.id === a.areaId);
      if (area && !emitted.has(area.id) && area.kind !== 'chegada') {
        quietUpTo(day.areas.indexOf(area));
        emitArea(area);
      }
    }
    if (a.areaId) lastArea = a.areaId;
    if (!a.trackable) {
      items.push(<TimelineRow key={a.key} a={a} cityId={cityId} href={stepHref(day.date, a.key)} />);
      return;
    }
    const area = day.areas.find((x) => x.id === a.areaId);
    const hasOptions = !!area && day.places.some((p) => area.placeIds.includes(p.id) && p.kind !== 'attraction');
    items.push(
      <StopCard
        key={a.key}
        a={a}
        area={area}
        done={a.mark?.state === 'done'}
        skipped={a.mark?.state === 'skipped'}
        night={area?.kind === 'noite'}
        detailHref={stepHref(day.date, a.key)}
        driverHref={driverHref(day.date, a.key)}
        nearbyHref={hasFood && hasOptions ? '#comer' : undefined}
        onToggle={() => onToggle(a)}
      />,
    );
  });
  flushNotes(lastArea);
  if (marker === list.length && marker > 0) items.push(<NowMarker key="now" time={hhmm(nowMin!)} />);
  quietUpTo(day.areas.length);
  return <ol class="tl-list stops">{items}</ol>;
}

export function Day({ content, date: param }: { content: LoadedContent; date?: string }) {
  const [, update] = useUserState();
  const { mark, toast, state } = useMarkWithUndo();
  const now = useClock();
  const { date: today, minutes } = tripNow(now);
  const { start } = tripRange(content.trip);
  const date = param ?? (tripPhase(content, today) === 'during' ? today : start);
  const cityId = cityForDate(content.trip, date);
  const card = dayCard(content, state, date);
  const day = card.view;
  const prev = adjacentDay(content, date, -1);
  const next = adjacentDay(content, date, 1);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const onDown = (e: PointerEvent) => {
    touch.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e: PointerEvent) => {
    const t = touch.current;
    touch.current = null;
    if (!t) return;
    const dx = e.clientX - t.x;
    const dy = e.clientY - t.y;
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const to = dx < 0 ? next : prev;
    if (to) location.hash = `#/dia/${to.date}`;
  };
  const sections = daySections(day, content);
  const has = (id: DaySectionId) => sections.some((x) => x.id === id);
  // Feature 010: "#/dia/<data>?secao=lojas" abre o dia já na seção (atalho da atração de compras).
  const secao = useQuery().get('secao');
  useEffect(() => {
    if (secao && sections.some((x) => x.id === secao)) document.getElementById(secao)?.scrollIntoView({ block: 'start' });
  }, [date, secao]);
  const toggle = (a: DayActivityView) => {
    if (a.mark?.state === 'done') update((s) => toggleDone(s, a.key));
    else mark(a.key, a.title, 'done');
  };

  return (
    <main class="page day" onPointerDown={onDown} onPointerUp={onUp}>
      <PageHeader
        back={`#/cidade/${cityId}`}
        label={`${content.cityName(cityId)} · ${date}`}
        title={`${formatDayMonth(date)} · ${card.title}`}
        progress={day.progress}
        scope={`Dia ${formatDayLabel(date)}`}
      />
      {date !== today && tripPhase(content, today) === 'during' && (
        <a class="btn today-link" href="#/dia">
          Voltar para hoje
        </a>
      )}

      <Cover photo={card.photo} cityId={cityId} icon={KIND_ICON[card.kind]} size="compact">
        <div class="cover-row cover-top">
          <p class="eyebrow">{content.cityName(cityId)}</p>
          <Chip variant="glass" icon="calendar">
            {formatWeekday(date)}
          </Chip>
          <nav class="day-nav" aria-label="Outros dias">
            {prev && (
              <a class="round-glass" href={`#/dia/${prev.date}`} aria-label={`Dia anterior, ${formatDayLabel(prev.date)}`}>
                <Icon name="chevron-left" size={20} />
              </a>
            )}
            {next && (
              <a class="round-glass" href={`#/dia/${next.date}`} aria-label={`Próximo dia, ${formatDayLabel(next.date)}`}>
                <Icon name="chevron-right" size={20} />
              </a>
            )}
          </nav>
        </div>
        <p class="eyebrow">{formatDayMonth(date)}</p>
        <h2 class="day-title clamp-2">{card.title}</h2>
        <div class="cover-row">
          <Chip variant="glass" icon={KIND_ICON[card.kind]}>
            {KIND_LABEL[card.kind]}
          </Chip>
          {card.stops > 0 && <Chip variant="glass">{card.stops === 1 ? '1 parada' : `${card.stops} paradas`}</Chip>}
        </div>
      </Cover>


      {card.summary && <p class="day-summary">{card.summary}</p>}

      {/* Feature 009: menu de seções preso no topo, só com o que existe no dia. */}
      <SectionMenu sections={sections} />

      {has('paradas') && (
        <section id="paradas" class="day-section" aria-label="Paradas do dia">
          <SectionTitle icon="pin" title="Paradas" />
          <Stops day={day} cityId={cityId} nowMin={date === today ? minutes : null} onToggle={toggle} />
          {day.groups.some((g) => g.source === 'itinerary') && day.areas.length === 0 && (
            <a class="btn" href={`#/guia/${cityId}`}>
              Ver o guia de {content.cityName(cityId)}
            </a>
          )}
        </section>
      )}

      {has('comer') && (
        <section id="comer" class="day-section" aria-label="Restaurantes e Cafés">
          <SectionTitle icon="food" title="Restaurantes e Cafés" />
          <HoodGroups groups={dayPlaceGroups(day, 'food')} section="comer" />
        </section>
      )}

      {has('lojas') && (
        <section id="lojas" class="day-section" aria-label="Brechós e Lojas">
          <SectionTitle icon="bag" title="Brechós e Lojas" />
          <HoodGroups groups={dayPlaceGroups(day, 'shop')} section="lojas" />
        </section>
      )}

      {has('curiosidades') && (
        <section id="curiosidades" class="day-section" aria-label="Curiosidades">
          <SectionTitle icon="film" title="Curiosidades" />
          <HoodGroups groups={dayPlaceGroups(day, 'screen')} section="curiosidades" />
        </section>
      )}

      {has('bairros') && (
        <section id="bairros" class="day-section" aria-label="Bairros">
          <SectionTitle icon="pin" title="Bairros" />
          <div class="card-stack">
            {neighborhoods(content, state, cityId)
              .filter((n) => n.date === date)
              .map((n) => (
                <NeighborhoodCard key={n.areaId} n={n} cityId={cityId} />
              ))}
          </div>
        </section>
      )}

      {has('transporte') && (
        <section id="transporte" class="day-section" aria-label="Transporte">
          <SectionTitle icon="route" title="Transporte" />
          <Moves day={day} />
          {card.kind === 'transit' && <TransitionBlocks content={content} state={state} date={date} hideEmpty />}
        </section>
      )}

      {has('dicas') && (
        <section id="dicas" class="day-section" aria-label="Dicas">
          <SectionTitle icon="lightbulb" title="Dicas" />
          <DayAlerts alerts={dayTips(day)} mode="list" open />
        </section>
      )}
      {toast}
    </main>
  );
}
