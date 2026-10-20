import { useState } from 'preact/hooks';
import type { Point } from '../content/types';
import { useOnline } from '../lib/pwa';

export function directionsUrl(point: Pick<Point, 'location'>): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${point.location.lat},${point.location.lng}`;
}

export function DirectionsButton({ point }: { point: Pick<Point, 'location' | 'address'> }) {
  const online = useOnline();
  const [warn, setWarn] = useState(false);

  if (online) {
    return (
      <a class="btn btn-primary" href={directionsUrl(point)} target="_blank" rel="noopener">
        Como chegar
      </a>
    );
  }
  return (
    <div>
      <button type="button" class="btn btn-primary" onClick={() => setWarn(true)}>
        Como chegar
      </button>
      {warn && (
        <p class="notice" role="alert">
          A navegação precisa de internet. Endereço: {point.address}.
        </p>
      )}
    </div>
  );
}
