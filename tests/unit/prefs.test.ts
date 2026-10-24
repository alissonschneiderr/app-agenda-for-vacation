import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getPrefs, loadPrefs, markAlertRead, PREFS_KEY, resetPrefsCache, setHighContrast } from '../../src/storage/prefs';

beforeEach(() => {
  localStorage.clear();
  resetPrefsCache();
  delete document.documentElement.dataset.contrast;
});
afterEach(() => vi.restoreAllMocks());

describe('preferências do aparelho (feature 006)', () => {
  it('padrões quando não há nada salvo ou o salvo está corrompido', () => {
    expect(loadPrefs()).toEqual({ readAlerts: [], highContrast: false });
    localStorage.setItem(PREFS_KEY, '{quebrado');
    expect(loadPrefs()).toEqual({ readAlerts: [], highContrast: false });
  });

  it('aviso lido fica salvo, sem repetir', () => {
    markAlertRead('al:2026-11-01:1');
    markAlertRead('al:2026-11-01:1');
    expect(JSON.parse(localStorage.getItem(PREFS_KEY)!).readAlerts).toEqual(['al:2026-11-01:1']);
    resetPrefsCache();
    expect(getPrefs().readAlerts).toEqual(['al:2026-11-01:1']);
  });

  it('alto contraste liga o atributo no documento e persiste', () => {
    setHighContrast(true);
    expect(document.documentElement.dataset.contrast).toBe('high');
    expect(loadPrefs().highContrast).toBe(true);
    setHighContrast(false);
    expect(document.documentElement.dataset.contrast).toBeUndefined();
  });

  it('sem armazenamento (exceção), segue em memória sem quebrar', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    resetPrefsCache();
    expect(getPrefs()).toEqual({ readAlerts: [], highContrast: false });
    markAlertRead('al:x:1');
    expect(getPrefs().readAlerts).toEqual(['al:x:1']);
  });
});
