import { useState } from 'preact/hooks';
import type { DocPlace } from '../content/types';
import { useOnline } from '../lib/pwa';
import { Icon } from './Icon';

type Link = { label: string; url: string };

/** Rótulo do botão: o do doc só quando há mais de um link do mesmo tipo (ex.: "770 Third Ave"). */
function label(base: string, l: Link, many: boolean): string {
  const extra = l.label.replace(/^(📷\s*)?(Google Maps|Mapa|fotos|ver fotos)\s*\(?/i, '').replace(/\)$/, '').trim();
  return many && extra ? `${base} (${extra})` : base;
}

/**
 * "Ver fotos" e "Abrir no mapa" com os links do doc (feature 005, FR-011).
 * Sem internet, avisa e mostra o endereço, como o "Como chegar" do guia.
 */
export function LinkButtons({ place }: { place: Pick<DocPlace, 'name' | 'address' | 'mapsUrls' | 'photoUrls'> }) {
  const online = useOnline();
  const [warn, setWarn] = useState(false);
  const photos = place.photoUrls ?? [];
  const maps = place.mapsUrls;
  if (!photos.length && !maps.length) return null;

  if (!online) {
    return (
      <div class="maps-buttons">
        {photos.length > 0 && (
          <button type="button" class="btn" onClick={() => setWarn(true)}>
            <Icon name="camera" size={18} /> Ver fotos
          </button>
        )}
        {maps.length > 0 && (
          <button type="button" class="btn" onClick={() => setWarn(true)}>
            <Icon name="map" size={18} /> Abrir no mapa
          </button>
        )}
        {warn && (
          <p class="notice" role="alert">
            Fotos e mapa precisam de internet. Endereço: {place.address ?? place.name}.
          </p>
        )}
      </div>
    );
  }
  return (
    <div class="maps-buttons">
      {photos.map((l) => (
        <a key={l.url} class="btn" href={l.url} target="_blank" rel="noopener">
          <Icon name="camera" size={18} /> {label('Ver fotos', l, photos.length > 1)}
        </a>
      ))}
      {maps.map((l) => (
        <a key={l.url} class="btn" href={l.url} target="_blank" rel="noopener">
          <Icon name="map" size={18} /> {label('Abrir no mapa', l, maps.length > 1)}
        </a>
      ))}
    </div>
  );
}
