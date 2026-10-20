import type { LoadedContent } from '../content/load';
import type { Point } from '../content/types';
import { openStatus } from '../domain/opening-hours';
import { href } from '../lib/router';
import { FavoriteButton } from './FavoriteButton';
import { PointPhoto } from './PointPhoto';

export function StatusBadge({ point, now, content }: { point: Point; now: Date; content: LoadedContent }) {
  if (point.status === 'temporarily-closed') return <span class="badge badge-warn">Fechado temporariamente</span>;
  const tz = content.cities.find((c) => c.id === point.cityId)?.timeZone ?? 'America/New_York';
  const s = openStatus(point.openingHours, now, tz);
  if (s === 'open') return <span class="badge badge-open">Aberto agora</span>;
  if (s === 'closed') return <span class="badge badge-closed">Fechado agora</span>;
  return null;
}

export function PointCard({
  point,
  content,
  now,
  showFavorite = true,
}: {
  point: Point;
  content: LoadedContent;
  now: Date;
  showFavorite?: boolean;
}) {
  return (
    <div class="card-row">
      <a class="card" href={href(`/ponto/${point.id}`)}>
        <PointPhoto photo={point.photos[0]} class="thumb" />
        <div>
          <p class="title">{point.name}</p>
          <p class="meta">{content.categoryName(point.categoryId)}</p>
          <p class="meta">{point.summary}</p>
          <StatusBadge point={point} now={now} content={content} />
        </div>
      </a>
      {showFavorite && <FavoriteButton point={point} compact />}
    </div>
  );
}

export function PointList({
  points,
  content,
  now,
  onClear,
}: {
  points: Point[];
  content: LoadedContent;
  now: Date;
  onClear?: () => void;
}) {
  if (points.length === 0) {
    return (
      <div class="empty">
        <p>Nenhum ponto encontrado.</p>
        {onClear && (
          <button type="button" class="btn" onClick={onClear}>
            Limpar filtros
          </button>
        )}
      </div>
    );
  }
  return (
    <ul class="list">
      {points.map((p) => (
        <li key={p.id}>
          <PointCard point={p} content={content} now={now} />
        </li>
      ))}
    </ul>
  );
}
