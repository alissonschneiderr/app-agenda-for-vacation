// Feature 009 (Q1 = B): o alto contraste fica em #/exibicao, só por endereço direto.
import { fireEvent, render, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it } from 'vitest';
import { Display } from '../../src/pages/Display';
import { resetPrefsCache } from '../../src/storage/prefs';

afterEach(() => {
  delete document.documentElement.dataset.contrast;
  localStorage.clear();
  resetPrefsCache();
});

describe('Exibição (feature 009)', () => {
  it('liga o alto contraste e guarda', () => {
    render(<Display />);
    expect(screen.getByRole('heading', { level: 1, name: 'Exibição' })).toBeTruthy();
    fireEvent.click(screen.getByRole('checkbox', { name: /Alto contraste/ }));
    expect(document.documentElement.dataset.contrast).toBe('high');
    expect(JSON.parse(localStorage.getItem('ctha:prefs')!).highContrast).toBe(true);
  });
});
