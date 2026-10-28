import { useState } from 'preact/hooks';
import { DirectionsButton } from '../components/DirectionsButton';
import { DoneToggle } from '../components/DoneToggle';
import { Icon } from '../components/Icon';
import { LinkButtons } from '../components/LinkButtons';
import { eventFields, MODE_ICON, MODE_LABEL, stepAddress, stepPhoto, stepPlace, stepTicket } from '../components/step-helpers';
import { PlaceCard } from '../components/PlaceCard';
import { DayPlaceCard } from '../components/DayPlaceCard';
import { PageHeader } from '../components/PageHeader';
import { PointPhoto } from '../components/PointPhoto';
import { RouteButton } from '../components/RouteButton';
import type { LoadedContent } from '../content/load';
import { markActivity, unmarkActivity } from '../domain/full-itinerary';
import { shoppingSlice } from '../domain/notebook';
import { howToGet } from '../domain/now';
import { todayHoursLabel } from '../domain/opening-hours';
import { formatDayLabel } from '../domain/trip';
import { findActivity } from '../domain/trip-view';
import { SAVE_ERROR_MESSAGE, useUserState } from '../storage/user-store';
import { driverHref, stepHref } from '../lib/links';

/**
 * Detalhe de um passo (feature 006, FR-016): fotos, horário e nome, aviso, como chegar, ações,
 * orientações do evento e o contexto — na feature 009, título → descritivo completo → práticas → ações.
 */
export function StepDetail({ content, date, stepKey }: { content: LoadedContent; date: string; stepKey: string }) {
  const [state, update] = useUserState();
  const [error, setError] = useState(false);
  const found = findActivity(content, state, date, stepKey);
  if (!found) {
    return (
      <main class="page">
        <h1>Passo não encontrado</h1>
        <a href={`#/dia/${date}`}>Voltar ao dia</a>
      </main>
    );
  }
  const { activity: a, day, prev, next } = found;
  const place = stepPlace(a);
  const area = day.areas.find((x) => x.id === a.areaId);
  const photo = stepPhoto(a, area);
  const ticket = stepTicket(a);
  const how = howToGet(day, a);
  const event = eventFields(a);
  const context = [...(place?.fields.filter((f) => !f.label).map((f) => f.text) ?? []), a.point && !place ? a.point.description : undefined].filter(
    Boolean,
  ) as string[];
  const others = a.places.slice(1);
  const skipped = a.mark?.state === 'skipped';
  const hasAddress = !!stepAddress(a);

  const practicalFacts = a.queue || a.access || a.land || a.optional;
  // Feature 010: atração de compras com as lojas do bairro, da mesma fonte de "Brechós e Lojas".
  const shops = shoppingSlice(day, a);
  return (
    <main class="page step-detail">
      <PageHeader back={`#/dia/${date}`} label={area?.name ?? a.categoryLabel} title={formatDayLabel(date)} titleAs="p" />

      {photo ? (
        <figure class="step-photo">
          <PointPhoto photo={photo} class="detail-photo" />
          <figcaption>
            Foto: {photo.author} · {photo.license}
          </figcaption>
        </figure>
      ) : (
        <div class="step-photo step-photo-empty">
          <Icon name="camera" size={36} />
          <span>Sem foto offline</span>
        </div>
      )}

      {/* Feature 009: título → descritivo completo (sem "Ler mais") → informações práticas → ações. */}
      <header class="step-head">
        <p class="step-time">{a.timeLabel ?? a.start ?? a.categoryLabel}</p>
        <h1 class="step-title">{a.title}</h1>
      </header>

      {(context.length > 0 || event.length > 0 || others.length > 0) && (
        <section class="step-description" aria-label="Descritivo">
          {context.map((t, i) => (
            <p key={i}>{t}</p>
          ))}
          {event.length > 0 && (
            <dl class="place-fields">
              {event.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.text}</dd>
                </div>
              ))}
            </dl>
          )}
          {others.map((p) => (
            <PlaceCard key={p.id} place={p} compact />
          ))}
        </section>
      )}

      <section class="step-practical detail-block" aria-label="Informações práticas">
        <h2 class="block-heading">
          <Icon name="info" size={18} /> Informações práticas
        </h2>
        {area && (
          <p>
            <Icon name="pin" size={16} /> {area.kind === 'bairro' ? `Em ${area.name}` : area.name}
            {(place?.address ?? a.address) && ` · ${place?.address ?? a.address}`}
          </p>
        )}
        {!area && (place?.address ?? a.address) && (
          <p>
            <Icon name="pin" size={16} /> {place?.address ?? a.address}
          </p>
        )}
        {ticket && (
          <p class="next-ticket">
            <Icon name="ticket" size={18} /> {ticket}
          </p>
        )}
        {a.point && !place && (
          <p>
            <Icon name="clock" size={16} /> {todayHoursLabel(a.point.openingHours, new Date(), 'America/New_York')} · {a.point.price}
          </p>
        )}
        {practicalFacts && (
          <dl class="step-facts">
            {a.queue && (
              <div>
                <dt>Fila</dt>
                <dd>{a.queue}</dd>
              </div>
            )}
            {a.access && (
              <div>
                <dt>Como entrar</dt>
                <dd>{a.access}</dd>
              </div>
            )}
            {a.land && (
              <div>
                <dt>Área do parque</dt>
                <dd>{a.land}</dd>
              </div>
            )}
            {a.optional && (
              <div>
                <dt>Opcional</dt>
                <dd>sim, como no roteiro</dd>
              </div>
            )}
          </dl>
        )}
        {how && (
          <p>
            <Icon name={MODE_ICON[how.mode]} size={18} /> <strong>{MODE_LABEL[how.mode]}</strong>
            {how.timeLabel && ` · ${how.timeLabel}`} · {how.title && `${how.title}: `}
            {how.text}
          </p>
        )}
        <div class="row">
          {place && <LinkButtons place={{ name: place.name, address: place.address, mapsUrls: place.mapsUrls, photoUrls: place.photoUrls }} />}
          {!place && a.location && <DirectionsButton point={{ location: a.location, address: a.address ?? '' }} />}
          <RouteButton content={content} date={date} spotKey={a.key} />
          {hasAddress && (
            <a class="btn" href={driverHref(date, a.key)}>
              <Icon name="taxi" size={18} /> Motorista
            </a>
          )}
        </div>
      </section>

      {shops && (
        <section class="step-shops" aria-label={`Lojas e brechós em ${shops.name}`}>
          <h2 class="block-heading">
            <Icon name="bag" size={18} /> Lojas e brechós em {shops.name}
          </h2>
          <div class="card-stack">
            {shops.items.map((p) => (
              <DayPlaceCard key={p.id} p={p} content={content} />
            ))}
          </div>
          <a class="btn" href={`#/dia/${date}?secao=lojas`}>
            Ver todas as lojas do dia
          </a>
        </section>
      )}

      {a.trackable && (
        <div class="row step-actions">
          <DoneToggle activityKey={a.key} title={a.title} />
          <button
            type="button"
            class="btn"
            onClick={() => setError(!update((s) => (skipped ? unmarkActivity(s, a.key) : markActivity(s, a.key, 'skipped'))).ok)}
          >
            <Icon name="skip" size={18} /> {skipped ? 'Desfazer "pulado"' : 'Pular'}
          </button>
        </div>
      )}
      {error && (
        <p class="error" role="alert">
          {SAVE_ERROR_MESSAGE}
        </p>
      )}

      <nav class="day-pager" aria-label="Outros passos do dia">
        {prev ? (
          <a class="btn" href={stepHref(date, prev.key)}>
            <Icon name="chevron-left" /> <span class="pager-label">{prev.title}</span>
          </a>
        ) : (
          <span />
        )}
        {next && (
          <a class="btn" href={stepHref(date, next.key)}>
            <span class="pager-label">{next.title}</span> <Icon name="chevron-right" />
          </a>
        )}
      </nav>
    </main>
  );
}
