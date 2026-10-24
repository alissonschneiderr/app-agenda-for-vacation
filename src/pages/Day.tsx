import { useRef } from 'preact/hooks';
import { DayAlerts } from '../components/DayAlerts';
import { Icon } from '../components/Icon';
import { PointPhoto } from '../components/PointPhoto';
import { ProgressBar } from '../components/ProgressBar';
import { NowMarker, TimelineRow } from '../components/TimelineRow';
import { TransitionBlocks } from '../components/TransitionBlocks';
import type { LoadedContent } from '../content/load';
import type { CityId, DayArea } from '../content/types';
import { toMinutes } from '../domain/full-itinerary';
import { allSteps, dayKind, nowIndex, tripNow, tripPhase } from '../domain/now';
import { cityForDate, formatDayLabel, tripRange } from '../domain/trip';
import { adjacentDay, dayView, destinationDates, type DayActivityView, type TripDayView } from '../domain/trip-view';
import { useClock } from '../lib/clock';
import { useUserState } from '../storage/user-store';
import { stepHref } from './Now';

const SWIPE_PX = 60;

function hhmm(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}h${String(min % 60).padStart(2, '0')}`;
}

/** Divisória de região: miniatura, nome e atalho para as opções em "Por perto". */
function AreaDivider({ area, day }: { area: DayArea; day: TripDayView }) {
  const options = day.places.filter((p) => area.placeIds.includes(p.id) && p.kind !== 'attraction').length;
  return (
    <li class={`tl-area tl-area-${area.kind}`}>
      {area.photo ? <PointPhoto photo={area.photo} class="tl-area-thumb" /> : <span class="tl-area-thumb tl-area-icon" aria-hidden="true"><Icon name="pin" size={20} /></span>}
      <h2 class="tl-area-name">{area.name}</h2>
      {options > 0 && (
        <a class="tl-area-options" href={`#/perto/${day.date}/${area.id}`}>
          Opções ({options})
        </a>
      )}
    </li>
  );
}

const BEACH_PERIODS: [string, number][] = [
  ['Manhã', 0],
  ['Tarde', 12 * 60],
  ['Pôr do sol', 16 * 60 + 30],
];

/**
 * Linha do tempo por tipo de dia (FR-013): regiões em ordem; praia em blocos de período; parque e
 * dias sem regiões como lista. A marca "agora" entra antes do primeiro passo que ainda não começou.
 */
function Timeline({ day, cityId, kind, nowMin }: { day: TripDayView; cityId: CityId; kind: string; nowMin: number | null }) {
  const list = allSteps(day);
  // A marca "agora" só faz sentido em dias com horários (Orlando e Miami ainda são listas).
  const marker = nowMin === null || !list.some((a) => a.start) ? -1 : nowIndex(day, nowMin);
  const items: preact.JSX.Element[] = [];
  let lastArea: string | null | undefined;
  let lastPeriod = '';
  const emitted = new Set<string>();
  // Uma região na ordem do doc: deslocamento com seção própria (🚗) antes dela, a divisória e, quando
  // a região não tem "Opções" ou não tem passos, as notas recolhidas (rota alternativa, avisos).
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
    items.push(<AreaDivider key={`area-${area.id}`} area={area} day={day} />);
    const options = day.places.filter((p) => area.placeIds.includes(p.id) && p.kind !== 'attraction').length;
    if (area.notesHtml && (!area.activityIds.length || options === 0)) {
      items.push(
        <li key={`notes-${area.id}`} class="tl-notes">
          <details>
            <summary>Ver</summary>
            <div class="doc-html" dangerouslySetInnerHTML={{ __html: area.notesHtml }} />
          </details>
        </li>,
      );
    }
  };
  // Regiões sem passos (manhã livre, praia, noite sem horário) entram na ordem do doc.
  const quietUpTo = (k: number) =>
    day.areas.slice(0, k).filter((x) => !emitted.has(x.id) && !x.activityIds.length && x.kind !== 'chegada').forEach(emitArea);
  list.forEach((a: DayActivityView, i) => {
    if (i === marker) items.push(<NowMarker key="now" time={hhmm(nowMin!)} />);
    if (day.areas.length && a.areaId && a.areaId !== lastArea) {
      const area = day.areas.find((x) => x.id === a.areaId);
      if (area && !emitted.has(area.id)) {
        quietUpTo(day.areas.indexOf(area));
        emitArea(area);
      }
    }
    if (kind === 'beach' && a.start) {
      const p = [...BEACH_PERIODS].reverse().find(([, from]) => toMinutes(a.start!) >= from)![0];
      if (p !== lastPeriod) items.push(<li key={`p-${p}`} class="tl-period">{p}</li>);
      lastPeriod = p;
    }
    if (a.areaId) lastArea = a.areaId;
    const night = day.areas.find((x) => x.id === a.areaId)?.kind === 'noite';
    items.push(<TimelineRow key={a.key} a={a} cityId={cityId} href={stepHref(day.date, a.key)} night={night} />);
  });
  if (marker === list.length && marker > 0) items.push(<NowMarker key="now" time={hhmm(nowMin!)} />);
  // Regiões sem passos depois do último passo (ex.: ideias da tarde livre, noite sem horário).
  quietUpTo(day.areas.length);
  return <ol class={`tl-list tl-${kind}`}>{items}</ol>;
}

export function Day({ content, date: param }: { content: LoadedContent; date?: string }) {
  const [state] = useUserState();
  const now = useClock();
  const { date: today, minutes } = tripNow(now);
  const { start } = tripRange(content.trip);
  const date = param ?? (tripPhase(content, today) === 'during' ? today : start);
  const cityId = cityForDate(content.trip, date);
  const day = dayView(content, state, date, cityId);
  const kind = dayKind(content, date);
  const prev = adjacentDay(content, date, -1);
  const next = adjacentDay(content, date, 1);
  const dates = destinationDates(content, cityId);
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

  return (
    <main class="page day" onPointerDown={onDown} onPointerUp={onUp}>
      <header class="day-bar">
        {prev ? (
          <a class="btn btn-icon" href={`#/dia/${prev.date}`} aria-label={`Dia anterior, ${formatDayLabel(prev.date)}`}>
            <Icon name="chevron-left" size={26} />
          </a>
        ) : (
          <span class="btn-icon" />
        )}
        <div class="day-bar-title">
          <h1>{formatDayLabel(date)}</h1>
          <p class="small muted">
            {content.cityName(cityId)} · dia {dates.indexOf(date) + 1} de {dates.length}
          </p>
        </div>
        {next ? (
          <a class="btn btn-icon" href={`#/dia/${next.date}`} aria-label={`Próximo dia, ${formatDayLabel(next.date)}`}>
            <Icon name="chevron-right" size={26} />
          </a>
        ) : (
          <span class="btn-icon" />
        )}
      </header>
      {date !== today && tripPhase(content, today) === 'during' && (
        <a class="btn today-link" href="#/dia">
          Voltar para hoje
        </a>
      )}
      <div class="day-meta">
        <ProgressBar progress={day.progress} scope={`Dia ${formatDayLabel(date)}`} />
        <DayAlerts alerts={day.fullDay?.alerts ?? []} mode="list" />
      </div>

      {kind === 'transit' ? (
        <TransitionBlocks content={content} state={state} date={date} />
      ) : day.groups.length === 0 ? (
        <p class="empty-day">Sem atividades planejadas para este dia.</p>
      ) : (
        <Timeline day={day} cityId={cityId} kind={kind} nowMin={date === today ? minutes : null} />
      )}

      {day.groups.some((g) => g.source === 'itinerary') && day.areas.length === 0 && (
        <a class="btn" href={`#/cidade/${cityId}`}>
          Ver o guia de {content.cityName(cityId)}
        </a>
      )}
    </main>
  );
}
