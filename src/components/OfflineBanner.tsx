import { useEffect, useState } from 'preact/hooks';
import { useOfflineState, useOnline } from '../lib/pwa';

export function OfflineBanner({ recovered = false }: { recovered?: boolean }) {
  const online = useOnline();
  const offlineState = useOfflineState();
  const [showReady, setShowReady] = useState(false);

  useEffect(() => {
    if (offlineState !== 'ready') return;
    setShowReady(true);
    const t = setTimeout(() => setShowReady(false), 5000);
    return () => clearTimeout(t);
  }, [offlineState]);

  return (
    <div aria-live="polite">
      {!online && (
        <div class="banner banner-offline" role="status">
          Você está offline. O guia, os favoritos e os roteiros continuam funcionando.
        </div>
      )}
      {offlineState === 'failed' && (
        <div class="banner banner-error" role="alert">
          Não foi possível salvar o guia para uso offline (armazenamento cheio ou indisponível). Seus
          favoritos e roteiros não foram afetados.
        </div>
      )}
      {online && showReady && (
        <div class="banner banner-info" role="status">
          Guia disponível offline.
        </div>
      )}
      {recovered && (
        <div class="banner banner-error" role="alert">
          Os dados salvos estavam corrompidos e o app recomeçou do zero. Uma cópia foi guardada no aparelho.
        </div>
      )}
    </div>
  );
}
