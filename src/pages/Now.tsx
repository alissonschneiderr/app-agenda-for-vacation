import { DayAlerts } from '../components/DayAlerts';
import { Icon } from '../components/Icon';
import { NextStepCard, stepAddress } from '../components/NextStepCard';
import { ProgressBar } from '../components/ProgressBar';
import { ReserveToday } from '../components/ReserveToday';
import { TransitionBlocks } from '../components/TransitionBlocks';
import { useMarkWithUndo } from '../components/UndoToast';
import type { LoadedContent } from '../content/load';
import { toMinutes } from '../domain/full-itinerary';
import { allSteps, currentArea, dayKind, howToGet, nextStep, stepEnd, tripNow, tripPhase, upcoming } from '../domain/now';
import { addDays, cityForDate, formatDayLabel, tripRange } from '../domain/trip';
import { dayView, destinationDates, tripProgress, type TripDayView } from '../domain/trip-view';
import { useClock } from '../lib/clock';
import type { UserState } from '../storage/types';

export function stepHref(date: string, key: string): string {
  return `#/dia/${date}/${encodeURIComponent(key)}`;
}

export function driverHref(date: string, key: string): string {
  return `#/motorista/${date}/${encodeURIComponent(key)}`;
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
}

function DayHeader({ content, day, transit = false }: { content: LoadedContent; day: TripDayView; transit?: boolean }) {
  const city = cityForDate(content.trip, day.date);
  const dates = destinationDates(content, city);
  if (transit) {
    return (
      <header class="now-head">
        <p class="eyebrow">Dia de viagem · {formatDayLabel(day.date)}</p>
      </header>
    );
  }
  return (
    <header class="now-head">
      <p class="eyebrow">
        {content.cityName(city)} · Dia {dates.indexOf(day.date) + 1} de {dates.length} · {formatDayLabel(day.date)}
      </p>
      {day.fullDay?.region && <h1 class="now-theme">{day.fullDay.region}</h1>}
      <ProgressBar progress={day.progress} scope={`Dia ${formatDayLabel(day.date)}`} />
    </header>
  );
}

/** Antes de 31/10: contagem, ingressos pendentes e a prévia do primeiro dia. */
function BeforeTrip({ content, state, today }: { content: LoadedContent; state: UserState; today: string }) {
  const { start } = tripRange(content.trip);
  const n = daysBetween(today, start);
  const toBuy = (content.fullItineraries ?? []).flatMap((f) => f.checklist).filter((c) => c.forDate && !(c.activityId && state.activityMarks[c.activityId]));
  const first = dayView(content, state, start);
  return (
    <main class="page now">
      <header class="now-head">
        <p class="eyebrow">Antes do embarque</p>
        <h1 class="now-theme">{n === 1 ? 'Falta 1 dia' : `Faltam ${n} dias`}</h1>
      </header>
      {toBuy.length > 0 && (
        <section class="card-section" aria-label="Ingressos para comprar antes">
          <h2 class="section-title">Ingressos para comprar antes</h2>
          <ul class="plain list-lines">
            {toBuy.map((c) => (
              <li key={c.what}>
                <Icon name="ticket" size={18} /> {c.when} · <strong>{c.what}</strong>
                {c.note && <span class="muted"> · {c.note}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
      <section class="card-section" aria-label="Primeiro dia">
        <h2 class="section-title">{formatDayLabel(start)}</h2>
        {first.fullDay?.region && <p>{first.fullDay.region}</p>}
        <a class="btn btn-primary btn-big" href={`#/dia/${start}`}>
          Ver o primeiro dia <Icon name="chevron-right" />
        </a>
      </section>
    </main>
  );
}

export function Now({ content }: { content: LoadedContent }) {
  const now = useClock();
  const { mark, toast, state } = useMarkWithUndo();
  const { date, minutes } = tripNow(now);
  const phase = tripPhase(content, date);

  if (phase === 'before') return <BeforeTrip content={content} state={state} today={date} />;
  if (phase === 'after') {
    const p = tripProgress(content, state);
    return (
      <main class="page now">
        <header class="now-head">
          <p class="eyebrow">Viagem concluída</p>
          <h1 class="now-theme">Vocês fizeram {p.done} de {p.total} atividades</h1>
        </header>
        <a class="btn btn-big" href="#/viagem">
          Ver a viagem
        </a>
      </main>
    );
  }

  const day = dayView(content, state, date);
  if (dayKind(content, date) === 'transit') {
    return (
      <main class="page now">
        <DayHeader content={content} day={day} transit />
        <ReserveToday content={content} state={state} date={date} />
        <TransitionBlocks content={content} state={state} date={date} />
      </main>
    );
  }

  const step = nextStep(day, minutes);
  const area = currentArea(day, step);
  const list = allSteps(day);
  const freeNow = list.find((a, i) => a.free && a.start && toMinutes(a.start) <= minutes && (stepEnd(list, i) ?? 0) > minutes);
  const nearbyCount = area ? day.places.filter((p) => area.placeIds.includes(p.id) && p.kind !== 'attraction').length : 0;
  const tomorrow = dayView(content, state, addDays(date, 1));

  return (
    <main class="page now">
      <DayHeader content={content} day={day} />
      <DayAlerts alerts={day.fullDay?.alerts ?? []} mode="banner" allHref={`#/dia/${date}`} />
      <ReserveToday content={content} state={state} date={date} />

      {freeNow && (
        <a class="free-banner" href={area ? `#/perto/${date}/${area.id}` : '#/perto'}>
          <Icon name="food" size={22} />
          <span>
            <strong>{freeNow.title}</strong> agora · Ver onde comer
          </span>
          <Icon name="chevron-right" />
        </a>
      )}

      {step ? (
        <NextStepCard
          step={step}
          how={howToGet(day, step)}
          areaName={area?.kind === 'bairro' ? area.name : undefined}
          areaPhoto={area?.photo}
          detailHref={stepHref(date, step.key)}
          driverHref={stepAddress(step) ? driverHref(date, step.key) : undefined}
          onDone={() => mark(step.key, step.title, 'done')}
          onSkip={() => mark(step.key, step.title, 'skipped')}
        />
      ) : (
        <section class="card-section day-done" aria-label="Dia concluído">
          <h2 class="section-title">Dia concluído</h2>
          <p>
            {day.progress.done} de {day.progress.total} feitas
            {list.some((a) => a.mark?.state === 'skipped') && ` · puladas: ${list.filter((a) => a.mark?.state === 'skipped').map((a) => a.title).join(', ')}`}
          </p>
          {tomorrow.fullDay?.region && (
            <p>
              Amanhã ({formatDayLabel(tomorrow.date)}): {tomorrow.fullDay.region}
            </p>
          )}
          <a class="btn btn-big" href={`#/dia/${tomorrow.date}`}>
            Ver amanhã <Icon name="chevron-right" />
          </a>
        </section>
      )}

      {step && (
        <section aria-label="Depois">
          <h2 class="section-title">Depois</h2>
          <ol class="plain later-list">
            {upcoming(day, step).map((a) => (
              <li key={a.key}>
                <a href={stepHref(date, a.key)}>
                  <span class="tl-time">{a.timeLabel ?? a.start ?? ''}</span> <span>{a.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}

      {area && nearbyCount > 0 && (
        <a class="btn btn-big nearby-shortcut" href={`#/perto/${date}/${area.id}`}>
          <Icon name="food" size={22} /> Comer e ver em {area.name.replace(/^Noite:\s*/, '')} ({nearbyCount})
        </a>
      )}
      {toast}
    </main>
  );
}
