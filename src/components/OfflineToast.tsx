import { useEffect, useState } from 'preact/hooks';
import { OFFLINE_MESSAGE, onOfflineNotice } from '../lib/offline-links';

/** Aviso curto ao tocar num link de internet sem conexão (feature 014, R9). Some em 4 s. */
export function OfflineToast() {
  const [on, setOn] = useState(false);
  useEffect(() => onOfflineNotice(setOn), []);
  if (!on) return null;
  return (
    <div class="app-notice offline-toast" role="status">
      <p>{OFFLINE_MESSAGE}</p>
    </div>
  );
}
