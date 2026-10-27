import type { ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';
import type { CityId, Photo } from '../content/types';
import { Icon, type IconName } from './Icon';

/**
 * Capa / cabeçalho do caderno de viagem (feature 008, research R3): onde o design tem um degradê, a
 * foto real do lugar, com véu escuro para o texto branco; sem foto, o degradê da cidade com um ícone
 * em traço ao fundo, como no design.
 */
export function Cover({
  photo,
  cityId,
  icon = 'compass',
  size = 'card',
  lazy = false,
  children,
  class: className,
}: {
  photo?: Photo;
  cityId?: CityId;
  icon?: IconName;
  size?: 'hero' | 'compact' | 'card' | 'strip';
  lazy?: boolean;
  children?: ComponentChildren;
  class?: string;
}) {
  const [failed, setFailed] = useState(false);
  const hasPhoto = !!photo && !failed;
  return (
    <div
      class={`cover cover-${size} ${hasPhoto ? 'has-photo' : 'no-photo'} ${className ?? ''}`}
      style={hasPhoto ? undefined : { background: `var(--cover-${cityId ?? 'default'}, var(--cover-default))` }}
    >
      {hasPhoto ? (
        <img
          class="cover-img"
          src={`${import.meta.env.BASE_URL}${photo.src}`}
          alt={photo.alt}
          title={`Foto: ${photo.author} · ${photo.license}`}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <span class="cover-icon" aria-hidden="true">
          <Icon name={icon} size={120} />
        </span>
      )}
      <div class="cover-veil" aria-hidden="true" />
      <div class="cover-body">{children}</div>
    </div>
  );
}
