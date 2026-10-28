import type { LoadedContent } from '../content/load';
import type { DocPlace } from '../content/types';
import { Icon, type IconName } from './Icon';
import { LinkButtons } from './LinkButtons';
import { RouteButton } from './RouteButton';

export const PLACE_KIND: Record<DocPlace['kind'], { label: string; icon: IconName }> = {
  food: { label: 'Onde comer', icon: 'food' },
  shop: { label: 'Compras', icon: 'bag' },
  screen: { label: 'Filme e série', icon: 'film' },
  attraction: { label: 'Atração', icon: 'star' },
};

/** Níveis de comida do doc (feature 005). */
export const FOOD_LEVEL: Record<string, string> = {
  '☕': 'Café coado',
  '🏆': 'Ícone da cidade',
  '🍰': 'Doce',
};

/** Legenda de preço do doc (FR-018). */
export const PRICE_LEGEND = '💵 até USD 20 · 💵💵 USD 20–40 · 💵💵💵 USD 40–80 · 💵💵💵💵 acima de USD 80, por pessoa';

/** Avisos do próprio doc que pedem conferência antes de ir. */
const CHECK_RE = /\b(confiram|confirmem|vejam no Maps)\b/i;

/** Um lugar do doc do casal, com os textos como estão lá (FR-008 a FR-012). */
/**
 * Cartão curto para "Por perto" (feature 006, FR-015): nível, nome, preço, uma linha de texto e a fila.
 * O cartão inteiro leva ao detalhe.
 */
function ShortCard({ place, href }: { place: DocPlace; href: string }) {
  const kind = PLACE_KIND[place.kind];
  const levelName = place.level && FOOD_LEVEL[place.level];
  const text = place.works ?? place.fields.find((f) => f.label === 'Estilo')?.text ?? place.fields.find((f) => !f.label)?.text;
  return (
    <a class={`place-short place-${place.kind} ${place.photo ? 'has-thumb' : ''}`} href={href} aria-label={place.name}>
      {/* Feature 008: miniatura com a foto do próprio lugar, quando houver. */}
      {place.photo && <img class="place-thumb" src={`${import.meta.env.BASE_URL}${place.photo.src}`} alt="" loading="lazy" decoding="async" width={64} height={64} />}
      <span class="place-short-head">
        <span class="eyebrow">
          {place.level ? <span class="place-level">{place.level}</span> : <Icon name={kind.icon} size={14} />} {levelName ?? kind.label}
          {place.price && <span class="place-price" title={PRICE_LEGEND}> · {place.price}</span>}
        </span>
        <span class="place-short-name">{place.name}</span>
      </span>
      {text && <span class="place-short-text clamp-2">{text}</span>}
      {place.queue && <span class="place-short-queue small">Fila: {place.queue}</span>}
      {place.photoTip && <span class="place-short-queue small">Foto: {place.photoTip}</span>}
    </a>
  );
}

export function PlaceCard({
  place,
  compact = false,
  short = false,
  href,
  route,
}: {
  place: DocPlace;
  compact?: boolean;
  short?: boolean;
  href?: string;
  /** Feature 016: "Rota até…" a partir do lugar, no detalhe. */
  route?: { content: LoadedContent; date: string };
}) {
  if (short && href) return <ShortCard place={place} href={href} />;
  const kind = PLACE_KIND[place.kind];
  const fields = place.fields.filter((f) => f.label !== 'Nível');
  const levelText = place.fields.find((f) => f.label === 'Nível')?.text;
  // Só a frase do aviso, não o parágrafo inteiro de novo.
  const warnings = fields.flatMap((f) => f.text.split(/(?<=[.;])\s+/).filter((s) => CHECK_RE.test(s)));
  const Title = compact ? 'h4' : 'h3';
  const levelName = place.level && FOOD_LEVEL[place.level];
  return (
    <article class={`place-card place-${place.kind} ${compact ? 'is-compact' : ''}`} aria-label={place.name}>
      <header class="place-head">
        <p class="eyebrow">
          {place.level ? <span class="place-level">{place.level}</span> : <Icon name={kind.icon} size={14} />}{' '}
          {levelName ?? kind.label}
          {place.price && (
            <span class="place-price" title={PRICE_LEGEND}>
              {' '}
              · {place.price}
            </span>
          )}
        </p>
        <Title class="place-name">{href ? <a href={href}>{place.name}</a> : place.name}</Title>
        {place.address && <p class="small muted">{place.address}</p>}
      </header>
      {!compact && levelText && <p class="place-level-text">{levelText}</p>}
      {place.access && <p class="badge">🎟️ {place.access}</p>}
      {place.works && (
        <p>
          <strong>Na tela:</strong> {place.works}
        </p>
      )}
      {place.photoTip && (
        <p>
          <strong>Foto:</strong> {place.photoTip}
        </p>
      )}
      {fields.length > 0 && (
        <dl class="place-fields">
          {fields.map((f, i) => (
            <div key={i}>
              {f.label && <dt>{f.label}</dt>}
              <dd>{f.text}</dd>
            </div>
          ))}
        </dl>
      )}
      {place.queue && (
        <p class="small">
          <strong>Fila:</strong> {place.queue}
        </p>
      )}
      {!compact &&
        warnings.map((w, i) => (
          <p key={i} class="notice">
            <Icon name="info" size={16} /> {w}
          </p>
        ))}
      {route ? (
        <div class="row">
          <LinkButtons place={place} />
          <RouteButton content={route.content} date={route.date} spotKey={place.id} />
        </div>
      ) : (
        <LinkButtons place={place} />
      )}
    </article>
  );
}
