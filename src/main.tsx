import { render } from 'preact';
import { registerSW } from 'virtual:pwa-register';
import { App } from './app';
import { setOfflineState } from './lib/pwa';
import './styles/base.css';

render(<App />, document.getElementById('app')!);

// Pede ao navegador para não apagar os dados do app (favoritos e roteiros).
void navigator.storage?.persist?.().catch(() => undefined);

registerSW({
  immediate: true,
  onOfflineReady: () => setOfflineState('ready'),
  onRegisteredSW: (_url, registration) => {
    // Em uma visita depois da instalação, o SW já está ativo: o guia já está disponível offline.
    if (registration?.active && navigator.serviceWorker.controller) setOfflineState('ready');
  },
  // Falha ao salvar o conteúdo offline (ex.: armazenamento cheio).
  onRegisterError: () => setOfflineState('failed'),
});
