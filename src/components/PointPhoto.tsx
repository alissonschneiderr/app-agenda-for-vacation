import { useState } from 'preact/hooks';
import type { Photo } from '../content/types';

/** Foto com marcador no lugar quando não está disponível (ex.: não baixada e offline). */
export function PointPhoto({ photo, class: className }: { photo: Photo | undefined; class?: string }) {
  const [failed, setFailed] = useState(false);
  if (!photo || failed) {
    return (
      <div class={`${className ?? ''} photo-missing`} role="img" aria-label={photo?.alt ?? 'Sem foto'}>
        Foto indisponível
      </div>
    );
  }
  return (
    <img
      class={className}
      src={`${import.meta.env.BASE_URL}${photo.src}`}
      alt={photo.alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
