import { useEffect } from 'preact/hooks';
import { mapsQuery, stepAddress } from '../components/step-helpers';
import type { LoadedContent } from '../content/load';
import { cityForDate } from '../domain/trip';
import { dayView, findActivity } from '../domain/trip-view';
import { useUserState } from '../storage/user-store';

/** Nome e endereço do passo ou do lugar; quando o roteiro só traz rua e número, a cidade junto. */
export function driverTarget(content: LoadedContent, date: string, key: string, state: ReturnType<typeof useUserState>[0]) {
  const city = content.cityName(cityForDate(content.trip, date));
  const found = findActivity(content, state, date, key);
  let name: string | undefined;
  let address: string | undefined;
  if (found) {
    name = found.activity.places[0]?.name ?? found.activity.title;
    address = stepAddress(found.activity);
  } else {
    const place = dayView(content, state, date).places.find((p) => p.id === key);
    name = place?.name;
    address = place?.address ?? mapsQuery(place?.mapsUrls[0]?.url);
  }
  if (!name) return null;
  const full = address && !/new york|ny \d{5}|, ny\b|orlando|miami|brooklyn|fl \d{5}/i.test(address) ? `${address}, ${city}` : address;
  return { name, address: full };
}

/** "Mostrar ao motorista" (feature 006, FR-017): tela cheia, letras grandes, alto contraste. */
export function Driver({ content, date, itemKey }: { content: LoadedContent; date: string; itemKey: string }) {
  const [state] = useUserState();
  const t = driverTarget(content, date, itemKey, state);

  useEffect(() => {
    let lock: { release: () => Promise<void> } | undefined;
    const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } };
    nav.wakeLock
      ?.request('screen')
      .then((l) => (lock = l))
      .catch(() => {});
    return () => {
      lock?.release().catch(() => {});
    };
  }, []);

  const close = () => history.back();
  return (
    <div class="driver" onClick={close} role="dialog" aria-modal="true" aria-label="Mostrar ao motorista">
      {t ? (
        <>
          <p class="driver-name">{t.name}</p>
          {t.address ? <p class="driver-address">{t.address}</p> : <p class="driver-hint">Sem endereço no roteiro.</p>}
        </>
      ) : (
        <p class="driver-hint">Lugar não encontrado.</p>
      )}
      <p class="driver-hint">Toque para voltar</p>
    </div>
  );
}
