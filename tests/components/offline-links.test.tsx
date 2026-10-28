// Feature 014 (US3, R9): sem internet, link externo avisa em vez de abrir uma página de erro.
import { act, render, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it } from 'vitest';
import { OfflineToast } from '../../src/components/OfflineToast';
import { installOfflineLinks } from '../../src/lib/offline-links';

const setOnline = (on: boolean) => Object.defineProperty(navigator, 'onLine', { value: on, configurable: true });
afterEach(() => setOnline(true));

function click(a: HTMLAnchorElement): MouseEvent {
  const e = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
  act(() => {
    a.dispatchEvent(e);
  });
  return e;
}

describe('links externos sem internet', () => {
  it('offline: cancela o clique e mostra "Sem internet agora…"; online: segue; link interno nunca é bloqueado', () => {
    const off = installOfflineLinks();
    render(
      <div>
        <a href="https://www.google.com/maps/search/?api=1&query=Lummus+Park" target="_blank" rel="noopener">
          Abrir no mapa
        </a>
        <a href="#/dia/2026-11-01">Dia</a>
        <OfflineToast />
      </div>,
    );
    const map = screen.getByRole('link', { name: 'Abrir no mapa' }) as HTMLAnchorElement;
    const day = screen.getByRole('link', { name: 'Dia' }) as HTMLAnchorElement;
    setOnline(false);
    expect(click(map).defaultPrevented).toBe(true);
    expect(screen.getByRole('status').textContent).toBe('Sem internet agora — tente de novo quando tiver conexão');
    const internal = click(day);
    expect(internal.defaultPrevented).toBe(false);
    setOnline(true);
    expect(click(map).defaultPrevented).toBe(false);
    off();
  });
});
