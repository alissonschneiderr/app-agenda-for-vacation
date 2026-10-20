import { fireEvent, render, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { toggleFavorite } from '../../src/domain/favorites';
import { Favorites } from '../../src/pages/Favorites';
import { PointDetail } from '../../src/pages/PointDetail';
import { setup } from './helpers';

afterEach(() => vi.useRealTimers());

describe('Favoritos (US2)', () => {
  it('estado vazio explica como favoritar', () => {
    const { content } = setup();
    render(<Favorites content={content} />);
    expect(screen.getByText('Você ainda não tem favoritos.')).toBeTruthy();
  });

  it('favoritar no detalhe aparece na lista e o estado fica visível', () => {
    const { content, store } = setup();
    render(<PointDetail content={content} pointId="ny-met" />);
    const btn = screen.getByRole('button', { name: /Favoritar/ });
    fireEvent.click(btn);
    expect(store.get().favorites.map((f) => f.pointId)).toEqual(['ny-met']);
    expect(screen.getByRole('button', { name: /Favorito/ }).getAttribute('aria-pressed')).toBe('true');
  });

  it('lista favoritos, marca indisponíveis e permite remover', () => {
    const { content, store } = setup();
    store.update((s) => toggleFavorite(s, { id: 'ny-met', name: 'The Metropolitan Museum of Art' }));
    store.update((s) => toggleFavorite(s, { id: 'removido', name: 'Ponto antigo' }));
    render(<Favorites content={content} />);
    expect(screen.getByText('The Metropolitan Museum of Art')).toBeTruthy();
    expect(screen.getByText('Ponto antigo')).toBeTruthy();
    expect(screen.getByText('Indisponível')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Remover Ponto antigo dos favoritos' }));
    expect(screen.queryByText('Ponto antigo')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Remover dos favoritos: The Metropolitan Museum of Art' }));
    expect(store.get().favorites).toEqual([]);
  });

  it('com armazenamento cheio mostra erro e não favorita', () => {
    const { content, storage, store } = setup();
    storage.failWrites = true;
    render(<PointDetail content={content} pointId="ny-met" />);
    fireEvent.click(screen.getByRole('button', { name: /Favoritar/ }));
    expect(screen.getByRole('alert').textContent).toBe('Não foi possível salvar: armazenamento cheio.');
    expect(store.get().favorites).toEqual([]);
  });
});
