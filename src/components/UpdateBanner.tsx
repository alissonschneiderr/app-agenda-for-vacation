import { useState } from 'preact/hooks';
import { applyUpdate, useUpdateReady } from '../lib/pwa';
import { Icon } from './Icon';

/** Fechado nesta abertura: a versão nova entra na próxima vez que o app abrir. */
let dismissed = false;

/**
 * Aviso de versão nova (feature 014, R2, contracts/screens.md): discreto, no rodapé, sem recarregar
 * sozinho. "atualizar" troca a versão e volta para a mesma tela.
 */
export function UpdateBanner() {
  const ready = useUpdateReady();
  const [closed, setClosed] = useState(dismissed);
  if (!ready || closed) return null;
  return (
    <div class="app-notice update-banner" role="status">
      <Icon name="sparkle" size={18} />
      <p>Nova versão disponível</p>
      <button type="button" class="btn btn-primary" onClick={applyUpdate}>
        atualizar
      </button>
      <button
        type="button"
        class="round-btn"
        aria-label="Fechar aviso"
        onClick={() => {
          dismissed = true;
          setClosed(true);
        }}
      >
        <Icon name="close" size={18} />
      </button>
    </div>
  );
}
