import { useEffect, useRef, useState } from 'preact/hooks';
import type { LatLng, Point } from '../content/types';
import { useOnline } from '../lib/pwa';
import 'leaflet/dist/leaflet.css';

export interface MapMarker {
  point: Point;
  /** Número da sequência no roteiro (marcadores numerados). */
  number?: number;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export function PointMap({
  markers,
  center,
  zoom = 13,
  small = false,
  showRoute = false,
}: {
  markers: MapMarker[];
  center: LatLng;
  zoom?: number;
  small?: boolean;
  showRoute?: boolean;
}) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const leafletRef = useRef<typeof import('leaflet') | null>(null);
  const meRef = useRef<import('leaflet').Marker | null>(null);
  const online = useOnline();
  const [tilesFailed, setTilesFailed] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let layers: import('leaflet').LayerGroup | null = null;
    // Leaflet carregado sob demanda: fica fora do JS inicial.
    import('leaflet')
      .then((mod) => {
        const L = (mod as unknown as { default?: typeof import('leaflet') }).default ?? mod;
        if (cancelled || !el.current) return;
        leafletRef.current = L;
        if (!mapRef.current) {
          const map = L.map(el.current, { zoomControl: true }).setView([center.lat, center.lng], zoom);
          const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          });
          tiles.on('tileerror', () => setTilesFailed(true));
          tiles.on('tileload', () => setTilesFailed(false));
          tiles.addTo(map);
          mapRef.current = map;
        }
        const map = mapRef.current;
        layers = L.layerGroup().addTo(map);
        const latlngs: [number, number][] = [];
        for (const m of markers) {
          const icon = L.divIcon({
            className: '',
            html: `<div class="pin"><span>${m.number ?? ''}</span></div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 28],
            popupAnchor: [0, -26],
          });
          const pos: [number, number] = [m.point.location.lat, m.point.location.lng];
          latlngs.push(pos);
          L.marker(pos, { icon, title: m.point.name, alt: m.point.name })
            .bindPopup(
              `<strong>${m.number ? `${m.number}. ` : ''}${escapeHtml(m.point.name)}</strong><br>` +
                `<a href="#/ponto/${m.point.id}">Ver detalhes</a>`,
            )
            .addTo(layers);
        }
        if (showRoute && latlngs.length > 1) {
          L.polyline(latlngs, { color: '#e8553e', weight: 3, dashArray: '6 6' }).addTo(layers);
        }
        if (latlngs.length > 1) map.fitBounds(L.latLngBounds(latlngs), { padding: [32, 32], maxZoom: 15 });
        else if (latlngs.length === 1) map.setView(latlngs[0]!, Math.max(zoom, 15));
      })
      .catch(() => setTilesFailed(true));
    return () => {
      cancelled = true;
      layers?.remove();
    };
  }, [markers, center.lat, center.lng, zoom, showRoute]);

  useEffect(
    () => () => {
      mapRef.current?.remove();
      mapRef.current = null;
    },
    [],
  );

  const locate = () => {
    setLocError(null);
    if (!navigator.geolocation) {
      setLocError('Localização indisponível neste aparelho.');
      return;
    }
    // Só pede a permissão quando o usuário toca no botão (FR-006).
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const L = leafletRef.current;
        const map = mapRef.current;
        if (!L || !map) return;
        const ll: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        meRef.current?.remove();
        meRef.current = L.marker(ll, {
          icon: L.divIcon({ className: '', html: '<div class="me-dot"></div>', iconSize: [16, 16] }),
          title: 'Você está aqui',
        }).addTo(map);
        map.setView(ll, Math.max(map.getZoom(), 14));
      },
      () => setLocError('Sem permissão de localização. O mapa continua funcionando sem sua posição.'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div class={small ? 'map map-small' : 'map'}>
      <div ref={el} style={{ position: 'absolute', inset: 0 }} aria-label="Mapa" role="region" />
      {!small && (
        <div class="map-tools">
          <button type="button" class="btn" onClick={locate}>
            Minha localização
          </button>
        </div>
      )}
      {(locError || ((tilesFailed || !online) && !small) || (tilesFailed && small)) && (
        <div class="map-overlay">
          {(tilesFailed || !online) && (
            <p class="notice" role="status">
              Mapa disponível offline só nas áreas já vistas com internet. A lista e os detalhes continuam funcionando.
            </p>
          )}
          {locError && (
            <p class="notice" role="alert">
              {locError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
