import { PageHeader } from '../components/PageHeader';
import { useOfflineState, usePersisted } from '../lib/pwa';
import { setHighContrast, usePrefs } from '../storage/prefs';

/**
 * Exibição (feature 009, Q1 = B): o liga/desliga do alto contraste (modo sol). Na feature 014 também
 * mostra a versão instalada (para conferir que os dois celulares estão iguais), se o armazenamento é
 * persistente e se o guia já está disponível offline. Abre pelo botão ⚙ do Início.
 */
export function Display() {
  const prefs = usePrefs();
  const persisted = usePersisted();
  const offline = useOfflineState();
  return (
    <main class="page display">
      <PageHeader back="#/" label="Ajustes" title="Exibição" />
      <label class="switch">
        <input type="checkbox" checked={prefs.highContrast} onChange={(e) => setHighContrast((e.target as HTMLInputElement).checked)} />
        <span>Alto contraste (modo sol)</span>
      </label>
      <section class="nb-card display-info" aria-label="Sobre este app">
        <div class="nb-card-body">
          <p>{`Versão ${__APP_VERSION__}`}</p>
          {persisted !== null && (
            <p>
              {persisted
                ? 'Armazenamento: persistente ✓'
                : 'Armazenamento: comum — instale o app na tela inicial para o sistema não apagar os dados'}
            </p>
          )}
          <p>{offline === 'ready' ? 'Disponível offline ✓' : offline === 'failed' ? 'Não foi possível salvar o guia offline' : 'Salvando o guia para usar offline…'}</p>
        </div>
      </section>
    </main>
  );
}
