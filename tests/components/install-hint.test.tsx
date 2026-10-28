// Feature 014 (US1, R8): dica de instalação só no Safari do iPhone, fora do app instalado.
import { fireEvent, render, screen } from '@testing-library/preact';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { InstallHint } from '../../src/components/InstallHint';
import { getPrefs, resetPrefsCache } from '../../src/storage/prefs';

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1';
const ANDROID = 'Mozilla/5.0 (Linux; Android 16; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Mobile Safari/537.36';
const setUA = (ua: string, standalone?: boolean) => {
  Object.defineProperty(navigator, 'userAgent', { value: ua, configurable: true });
  Object.defineProperty(navigator, 'standalone', { value: standalone, configurable: true });
};
const TEXT = 'Instale: toque em Compartilhar e depois em Adicionar à Tela de Início';

beforeEach(() => {
  localStorage.clear();
  resetPrefsCache();
});
afterEach(() => setUA(ANDROID, undefined));

describe('dica de instalação', () => {
  it('iPhone, no Safari: aparece; "×" fecha e não volta', () => {
    setUA(IPHONE, false);
    const first = render(<InstallHint />);
    expect(screen.getByText(TEXT)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Fechar dica' }));
    expect(screen.queryByText(TEXT)).toBeNull();
    expect(getPrefs().installHintDismissed).toBe(true);
    first.unmount();
    render(<InstallHint />);
    expect(screen.queryByText(TEXT)).toBeNull();
  });

  it('iPhone com o app instalado, ou Android: não aparece', () => {
    setUA(IPHONE, true);
    const a = render(<InstallHint />);
    expect(screen.queryByText(TEXT)).toBeNull();
    a.unmount();
    setUA(ANDROID, undefined);
    render(<InstallHint />);
    expect(screen.queryByText(TEXT)).toBeNull();
  });
});
