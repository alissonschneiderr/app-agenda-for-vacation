import { render, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ActivityCard } from '../../src/components/ActivityCard';
import type { Activity } from '../../src/content/types';
import { setupFull } from './full-helpers';

afterEach(() => vi.useRealTimers());

const activity: Activity = {
  id: 'ny-2026-11-05-07',
  type: 'screen',
  title: 'Bed-Stuy',
  start: '14:00',
  durationMin: 30,
  place: { name: 'Bed-Stuy', address: 'Bedford-Stuyvesant, Brooklyn, NY' },
  description: 'Bairro da infância de Chris Rock.',
  priority: 'optional',
  booking: { required: false },
  facts: [],
  screen: [
    { work: 'Todo Mundo Odeia o Chris', kind: 'setting', access: 'outside', association: 'A série se passa aqui, mas foi gravada em estúdio.', address: 'Bedford-Stuyvesant, Brooklyn, NY' },
    { work: 'Friends', kind: 'filming', access: 'outside', association: 'Fachada do prédio', address: '90 Bedford St, New York, NY 10014' },
  ],
};

describe('Locais de séries (US3)', () => {
  it('mostra obra, tipo, acesso, associação e endereço de cada obra', () => {
    setupFull();
    render(<ul><ActivityCard activity={activity} /></ul>);
    expect(screen.getByText('🎬 Todo Mundo Odeia o Chris · Ambientação · Só por fora')).toBeTruthy();
    expect(screen.getByText('A série se passa aqui, mas foi gravada em estúdio.')).toBeTruthy();
    expect(screen.getByText('🎬 Friends · Locação de filmagem · Só por fora')).toBeTruthy();
    expect(screen.getByText('90 Bedford St, New York, NY 10014')).toBeTruthy();
  });
});
