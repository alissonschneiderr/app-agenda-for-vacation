import { render } from 'preact';
import { registerSW } from 'virtual:pwa-register';
import { App } from './app';
import { setOfflineState, setUpdateReady } from './lib/pwa';
import { setAppStorage } from './storage/app-storage';
import { openPersistentStorage } from './storage/persistent';
import './styles/base.css';

// Feature 014 (R4, R5): os dados do casal vêm do IndexedDB (migrados do localStorage na primeira vez)
// antes da primeira tela; depois o app pede ao navegador para não apagá-los.
void (async () => {
  setAppStorage(await openPersistentStorage({ legacy: window.localStorage, onWriteError: (e) => console.warn('Falha ao gravar no IndexedDB', e) }));
  render(<App />, document.getElementById('app')!);
  void navigator.storage?.persist?.().catch(() => undefined);
})();

const HOUR = 60 * 60_000;
const TEN_MIN = 10 * 60_000;

const updateSW = registerSW({
  immediate: true,
  // Feature 014 (R2): a versão nova fica esperando o "atualizar" do casal; nada recarrega sozinho.
  onNeedRefresh: () => setUpdateReady(updateSW),
  onOfflineReady: () => setOfflineState('ready'),
  onRegisteredSW: (_url, registration) => {
    // Em uma visita depois da instalação, o SW já está ativo: o guia já está disponível offline.
    if (registration?.active && navigator.serviceWorker.controller) setOfflineState('ready');
    if (!registration) return;
    // Procura versão nova a cada hora com o app aberto e ao voltar para ele (no máximo a cada 10 min).
    // Sem internet a busca falha em silêncio e tenta de novo depois.
    let last = Date.now();
    const check = () => {
      last = Date.now();
      void registration.update().catch(() => undefined);
    };
    setInterval(check, HOUR);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && Date.now() - last > TEN_MIN) check();
    });
  },
  // Falha ao salvar o conteúdo offline (ex.: armazenamento cheio).
  onRegisterError: () => setOfflineState('failed'),
});
