import { setPrefs, usePrefs } from '../storage/prefs';
import { Icon } from './Icon';

/** iPhone ou iPad (o iPadOS se apresenta como Mac com toque). */
function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/** Aberto pelo ícone da tela inicial (o Safari marca `navigator.standalone`). */
function isInstalled(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true || (typeof matchMedia !== 'undefined' && matchMedia('(display-mode: standalone)').matches);
}

/**
 * Dica de instalação no Safari do iPhone (feature 014, R8): no iOS só o app instalado na tela inicial
 * tem os dados garantidos. Some depois de fechada ou com o app instalado. No Android o Chrome oferece
 * "Instalar app" sozinho.
 */
export function InstallHint() {
  const prefs = usePrefs();
  if (prefs.installHintDismissed || !isIOS() || isInstalled()) return null;
  return (
    <aside class="app-notice install-hint" role="note">
      <Icon name="info" size={18} />
      <p>Instale: toque em Compartilhar e depois em Adicionar à Tela de Início</p>
      <button type="button" class="round-btn" aria-label="Fechar dica" onClick={() => setPrefs((p) => ({ ...p, installHintDismissed: true }))}>
        <Icon name="close" size={18} />
      </button>
    </aside>
  );
}
