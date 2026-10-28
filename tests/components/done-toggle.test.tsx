import { fireEvent, render, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DoneToggle } from '../../src/components/DoneToggle';
import { markActivity } from '../../src/domain/full-itinerary';
import { setup } from './helpers';

afterEach(() => vi.useRealTimers());

describe('DoneToggle (003 US2)', () => {
  it('checkbox acessível com texto, alterna e grava', () => {
    const { store } = setup();
    render(<DoneToggle activityKey="k1" title="Magic Kingdom" />);
    const cb = screen.getByRole('checkbox', { name: 'Marcar Magic Kingdom como feito' });
    expect(cb.getAttribute('aria-checked')).toBe('false');
    expect(cb.textContent).toBe('Pendente');
    fireEvent.click(cb);
    expect(store.get().activityMarks.k1!.state).toBe('done');
    expect(screen.getByRole('checkbox', { name: 'Marcar Magic Kingdom como pendente' }).textContent).toBe('Feito');
    fireEvent.click(cb);
    expect(store.get().activityMarks.k1).toBeUndefined();
  });

  it('mostra "Pulada" e toca para feito', () => {
    const { store } = setup();
    store.update((s) => markActivity(s, 'k2', 'skipped'));
    render(<DoneToggle activityKey="k2" title="X" />);
    const cb = screen.getByRole('checkbox');
    expect(cb.textContent).toBe('Pulada');
    fireEvent.click(cb);
    expect(store.get().activityMarks.k2!.state).toBe('done');
  });

  it('armazenamento cheio mantém o estado e avisa', () => {
    const { storage, store } = setup();
    storage.failWrites = true;
    render(<DoneToggle activityKey="k3" title="X" />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(store.get().activityMarks.k3).toBeUndefined();
    expect(screen.getByRole('alert').textContent).toBe('Não foi possível salvar: armazenamento cheio.');
  });

});
