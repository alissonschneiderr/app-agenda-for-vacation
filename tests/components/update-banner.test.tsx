// Feature 014 (US2, R2): versão nova avisada, sem recarregar sozinha.
import { act, fireEvent, render, screen } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import { UpdateBanner } from '../../src/components/UpdateBanner';
import { setUpdateReady } from '../../src/lib/pwa';

describe('aviso de versão nova', () => {
  it('sem versão nova, nada; com versão nova, "Nova versão disponível" e "atualizar" chama a troca', () => {
    const { container } = render(<UpdateBanner />);
    expect(container.textContent).toBe('');
    const update = vi.fn(async () => undefined);
    act(() => setUpdateReady(update));
    expect(screen.getByRole('status').textContent).toMatch(/Nova versão disponível/);
    fireEvent.click(screen.getByRole('button', { name: 'atualizar' }));
    expect(update).toHaveBeenCalledWith(true);
  });

  it('"×" esconde e não reabre na mesma abertura', () => {
    render(<UpdateBanner />);
    act(() => setUpdateReady(vi.fn(async () => undefined)));
    fireEvent.click(screen.getByRole('button', { name: 'Fechar aviso' }));
    expect(screen.queryByRole('status')).toBeNull();
    act(() => setUpdateReady(vi.fn(async () => undefined)));
    expect(screen.queryByRole('status')).toBeNull();
  });
});
