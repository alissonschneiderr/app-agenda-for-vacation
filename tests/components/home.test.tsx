import { fireEvent, render, screen, within } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Guide as Home } from '../../src/pages/Guide';
import { setup } from './helpers';

afterEach(() => vi.useRealTimers());

const names = () => screen.queryAllByRole('listitem').map((li) => li.querySelector('.title')?.textContent);

describe('Home (US1)', () => {
  it('abre na cidade do dia (03/11 → Nova York)', () => {
    const { content } = setup('2026-11-03T15:00:00Z');
    render(<Home content={content} />);
    expect(screen.getByRole('heading', { name: 'Guia de Nova York' })).toBeTruthy();
    expect(names()).toContain('Central Park');
    expect(names()).not.toContain('South Beach');
  });

  it('em dia de locomoção abre no destino e avisa (07/11)', () => {
    const { content } = setup('2026-11-07T15:00:00Z');
    render(<Home content={content} />);
    expect(screen.getByRole('heading', { name: 'Guia de Orlando' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('Dia de locomoção: Nova York → Orlando');
  });

  it('fora do período abre em Nova York', () => {
    const { content } = setup('2026-10-20T15:00:00Z');
    render(<Home content={content} />);
    expect(screen.getByRole('heading', { name: 'Guia de Nova York' })).toBeTruthy();
  });

  it('mostra outra cidade quando escolhida', () => {
    const { content } = setup();
    render(<Home content={content} cityId="miami" />);
    expect(screen.getByRole('heading', { name: 'Guia de Miami' })).toBeTruthy();
    expect(names()).toEqual(['South Beach']);
  });

  it('filtra por categoria e busca sem acento', () => {
    const { content } = setup();
    render(<Home content={content} />);
    fireEvent.click(within(screen.getByRole('group', { name: 'Categoria' })).getByRole('button', { name: 'Museu' }));
    expect(names()).toEqual(['Museum of Modern Art (MoMA)', 'The Metropolitan Museum of Art']);
    fireEvent.input(screen.getByPlaceholderText('Buscar pelo nome'), { target: { value: 'metropolitan' } });
    expect(names()).toEqual(['The Metropolitan Museum of Art']);
  });

  it('sem resultado mostra mensagem e limpa filtros', () => {
    const { content } = setup();
    render(<Home content={content} />);
    fireEvent.input(screen.getByPlaceholderText('Buscar pelo nome'), { target: { value: 'xyz' } });
    expect(screen.getByText('Nenhum ponto encontrado.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(names()).toHaveLength(4);
  });

  it('mostra status aberto/fechado e fechado temporariamente', () => {
    const { content } = setup('2026-11-03T15:00:00Z'); // terça 10:00 em NY
    render(<Home content={content} />);
    expect(screen.getAllByText('Aberto agora').length).toBeGreaterThan(0);
    expect(screen.getByText('Fechado temporariamente')).toBeTruthy();
  });
});
