// Feature 007 (FR-016): "Reservar hoje" em "Agora" nos dias em que os Multi Pass abrem.
import { fireEvent, render, screen, within } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { tripProgress } from '../../src/domain/trip-view';
import { Now } from '../../src/pages/Now';
import { setupReal } from './companion-helpers';

afterEach(() => vi.useRealTimers());

describe('Reservar hoje (feature 007)', () => {
  it('06/11: Multi Pass do Hollywood Studios; Feito marca ck:orlando:1 e fica fora do progresso', () => {
    const { content, store } = setupReal('2026-11-06T14:00:00Z'); // 09:00 em NY
    const before = tripProgress(content, store.get());
    render(<Now content={content} />);
    const box = screen.getByRole('region', { name: 'Reservar hoje' });
    expect(within(box).getByText(/Multi Pass Hollywood Studios/)).toBeTruthy();
    expect(within(box).getByText(/06\/11, no app My Disney Experience · ~US\$ 29 por pessoa/)).toBeTruthy();
    const toggle = within(box).getByRole('checkbox');
    fireEvent.click(toggle);
    expect(store.get().activityMarks['ck:orlando:1']?.state).toBe('done');
    expect(tripProgress(content, store.get())).toEqual(before);
    fireEvent.click(toggle);
    expect(store.get().activityMarks['ck:orlando:1']).toBeUndefined();
  });

  it('07/11 (dia de locomoção): Multi Pass do EPCOT e Single Pass, acima dos três blocos', () => {
    const { content } = setupReal('2026-11-07T14:00:00Z');
    const { container } = render(<Now content={content} />);
    const box = screen.getByRole('region', { name: 'Reservar hoje' });
    expect(within(box).getAllByRole('listitem').map((li) => li.querySelector('.tr-label')!.textContent)).toEqual([
      "Multi Pass EPCOT (Test Track + Soarin' + Mission: SPACE)",
      'Single Pass Guardians of the Galaxy (opcional)',
    ]);
    const blocks = container.querySelector('.transition')!;
    expect(box.compareDocumentPosition(blocks) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('08/11: sem "Reservar hoje"', () => {
    const { content } = setupReal('2026-11-08T14:00:00Z');
    render(<Now content={content} />);
    expect(screen.queryByRole('region', { name: 'Reservar hoje' })).toBeNull();
  });
});
