import { useMemo } from 'preact/hooks';
import { AddToItinerary } from '../components/AddToItinerary';
import { DirectionsButton } from '../components/DirectionsButton';
import { FavoriteButton } from '../components/FavoriteButton';
import { StatusBadge } from '../components/PointCard';
import { PointMap } from '../components/PointMap';
import { PointPhoto } from '../components/PointPhoto';
import type { LoadedContent } from '../content/load';
import { todayHoursLabel, weeklyLines } from '../domain/opening-hours';
import { formatDate } from '../domain/trip';
import { useOnline } from '../lib/pwa';
import { href } from '../lib/router';

export function PointDetail({ content, pointId }: { content: LoadedContent; pointId: string }) {
  const point = content.pointsById.get(pointId);
  const online = useOnline();
  const markers = useMemo(() => (point ? [{ point }] : []), [point]);

  if (!point) {
    return (
      <main class="page">
        <h1>Ponto não encontrado</h1>
        <p>Este ponto não está mais no guia.</p>
        <a href="#/">Voltar ao guia</a>
      </main>
    );
  }

  const now = new Date();
  const tz = content.cities.find((c) => c.id === point.cityId)?.timeZone ?? 'America/New_York';
  const verified = formatDate(point.verifiedAt);

  return (
    <main class="page">
      <a href={href(`/guia/${point.cityId}`)} class="small">
        ← Guia de {content.cityName(point.cityId)}
      </a>
      <h1>{point.name}</h1>
      <p class="muted">
        {content.categoryName(point.categoryId)} · {content.cityName(point.cityId)}{' '}
        <StatusBadge point={point} now={now} content={content} />
      </p>

      <div class="gallery">
        {(point.photos.length ? point.photos : [undefined]).map((photo, i) => (
          <figure key={i}>
            <PointPhoto photo={photo} />
            {photo && (
              <figcaption>
                Foto: {photo.author} ·{' '}
                {photo.licenseUrl ? (
                  <a href={photo.licenseUrl} target="_blank" rel="noopener">
                    {photo.license}
                  </a>
                ) : (
                  photo.license
                )}{' '}
                ·{' '}
                <a href={photo.sourceUrl} target="_blank" rel="noopener">
                  Wikimedia Commons
                </a>
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      <div class="row" style={{ margin: '12px 0' }}>
        <FavoriteButton point={point} />
        <DirectionsButton point={point} />
      </div>
      <AddToItinerary point={point} content={content} />

      <div class="description">
        {point.description.split(/\n\n+/).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <ul class="facts">
        <li>
          <span class="label">Endereço</span>
          {point.address}
        </li>
        <li>
          <span class="label">Horário</span>
          <strong>{todayHoursLabel(point.openingHours, now, tz)}</strong>
          {weeklyLines(point.openingHours).map((l) => (
            <div key={l} class="small muted">
              {l}
            </div>
          ))}
        </li>
        <li>
          <span class="label">Preço</span>
          {point.price}
        </li>
        {point.officialUrl && (
          <li>
            <span class="label">Site oficial</span>
            <a href={point.officialUrl} target="_blank" rel="noopener">
              {point.officialUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
            </a>
          </li>
        )}
      </ul>

      <p class="notice">
        {online ? `Informações verificadas em ${verified}.` : `Você está offline. Informações verificadas em ${verified}.`}{' '}
        Confirme horário e preço no site oficial antes da visita.
      </p>

      <PointMap markers={markers} center={point.location} zoom={15} small />
      <p class="small muted">
        <a href="#/creditos">Créditos das fotos e do mapa</a>
      </p>
    </main>
  );
}
