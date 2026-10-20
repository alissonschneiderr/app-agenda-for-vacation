import { fireEvent, render, screen, within } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createItinerary, seedSuggested } from '../../src/domain/itineraries';
import { ItineraryDetail } from '../../src/pages/ItineraryDetail';
import { Itineraries } from '../../src/pages/Itineraries';
import { PointDetail } from '../../src/pages/PointDetail';
import { fixtureContent } from '../fixtures/content';
import { setup } from './helpers';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function seeded() {
  const ctx = setup();
  ctx.store.update((s) => seedSuggested(fixtureContent(), s));
  return ctx;
}

describe('Roteiros (US3)', () => {
  it('agrupa por dia com cidade/locomoção e "Sem dia" por último, com selo Sugerido', () => {
    const { content, store } = seeded();
    store.update((s) => {
      const a = createItinerary(s, 'Sem dia', null);
      const b = a.ok ? createItinerary(a.state, 'Viagem', '2026-11-07') : a;
      return b.ok ? b.state : s;
    });
    render(<Itineraries content={content} />);
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual([
      'domingo, 01/11 · Nova York',
      'sábado, 07/11 · Locomoção Nova York → Orlando',
      'domingo, 08/11 · Orlando',
      'Sem dia',
    ]);
    expect(screen.getAllByText('Sugerido')).toHaveLength(2);
  });

  it('cria roteiro com nome e dia e valida nome vazio', () => {
    const { content, store } = setup();
    render(<Itineraries content={content} />);
    fireEvent.click(screen.getByRole('button', { name: '+ Novo roteiro' }));
    fireEvent.click(screen.getByRole('button', { name: 'Criar' }));
    expect(screen.getByRole('alert').textContent).toBe('Dê um nome ao roteiro.');
    fireEvent.input(screen.getByLabelText('Nome'), { target: { value: 'Brooklyn' } });
    fireEvent.change(screen.getByLabelText('Dia da viagem'), { target: { value: '2026-11-04' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar' }));
    expect(store.get().itineraries.map((i) => [i.name, i.date])).toEqual([['Brooklyn', '2026-11-04']]);
  });

  it('detalhe mostra pontos numerados, reordena, remove e exclui com confirmação', () => {
    const { content, store } = seeded();
    const it = store.get().itineraries[0]!;
    render(<ItineraryDetail content={content} id={it.id} />);
    expect(screen.getByText('domingo, 01/11 · Nova York', { selector: 'p' })).toBeTruthy();
    expect(screen.getByText('Comece cedo.')).toBeTruthy();
    const titles = () => [...document.querySelectorAll('ol .title')].map((e) => e.textContent);
    expect(titles()).toEqual(['The Metropolitan Museum of Art', 'Central Park']);
    fireEvent.click(screen.getByRole('button', { name: 'Subir Central Park' }));
    expect(titles()).toEqual(['Central Park', 'The Metropolitan Museum of Art']);
    fireEvent.click(screen.getByRole('button', { name: 'Remover Central Park do roteiro' }));
    expect(titles()).toEqual(['The Metropolitan Museum of Art']);

    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false);
    fireEvent.click(screen.getByRole('button', { name: 'Excluir roteiro' }));
    expect(confirm).toHaveBeenCalled();
    expect(store.get().itineraries).toHaveLength(2);
    confirm.mockReturnValueOnce(true);
    fireEvent.click(screen.getByRole('button', { name: 'Excluir roteiro' }));
    expect(store.get().itineraries).toHaveLength(1);
  });

  it('renomeia', () => {
    const { content, store } = seeded();
    const it = store.get().itineraries[0]!;
    render(<ItineraryDetail content={content} id={it.id} />);
    fireEvent.click(screen.getByRole('button', { name: 'Renomear' }));
    fireEvent.input(screen.getByLabelText('Nome do roteiro'), { target: { value: 'Upper East Side' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(screen.getByRole('heading', { name: 'Upper East Side' })).toBeTruthy();
  });

  it('dia de locomoção mostra origem e destino', () => {
    const { content, store } = setup();
    store.update((s) => {
      const r = createItinerary(s, 'Ida', '2026-11-07');
      return r.ok ? r.state : s;
    });
    render(<ItineraryDetail content={content} id={store.get().itineraries[0]!.id} />);
    expect(screen.getByText('sábado, 07/11 · Dia de locomoção: Nova York → Orlando', { selector: 'p' })).toBeTruthy();
  });

  it('adicionar ao roteiro: recusa duplicata e pede confirmação para outra cidade', () => {
    const { content, store } = seeded();
    const nyId = store.get().itineraries[0]!.id;
    const { unmount } = render(<PointDetail content={content} pointId="ny-met" />);
    fireEvent.click(screen.getByRole('button', { name: '+ Adicionar ao roteiro' }));
    const panel = screen.getByRole('region', { name: 'Adicionar ao roteiro' });
    fireEvent.change(within(panel).getByLabelText('Escolha um roteiro'), { target: { value: nyId } });
    expect(within(panel).getByRole('alert').textContent).toBe('Este ponto já está neste roteiro.');
    unmount();

    render(<PointDetail content={content} pointId="mia-south-beach" />);
    fireEvent.click(screen.getByRole('button', { name: '+ Adicionar ao roteiro' }));
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false);
    const select = screen.getByLabelText('Escolha um roteiro');
    fireEvent.change(select, { target: { value: nyId } });
    expect(confirm).toHaveBeenCalledWith(
      'Este ponto fica em Miami, e este roteiro é de Nova York. Adicionar mesmo assim?',
    );
    expect(store.get().itineraries[0]!.items).toHaveLength(2);
    confirm.mockReturnValueOnce(true);
    fireEvent.change(select, { target: { value: nyId } });
    expect(store.get().itineraries[0]!.items.map((i) => i.pointId)).toEqual(['ny-met', 'ny-central-park', 'mia-south-beach']);
  });

  it('cria roteiro novo a partir do detalhe do ponto', () => {
    const { content, store } = setup();
    render(<PointDetail content={content} pointId="ny-moma" />);
    fireEvent.click(screen.getByRole('button', { name: '+ Adicionar ao roteiro' }));
    fireEvent.input(screen.getByLabelText('Ou crie um novo roteiro'), { target: { value: 'Arte' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar' }));
    expect(store.get().itineraries.map((i) => [i.name, i.items.map((x) => x.pointId)])).toEqual([['Arte', ['ny-moma']]]);
  });
});
