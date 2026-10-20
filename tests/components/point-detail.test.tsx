import { fireEvent, render, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PointDetail } from '../../src/pages/PointDetail';
import { setOnline, setup } from './helpers';

afterEach(() => {
  vi.useRealTimers();
  setOnline(true);
});

describe('PointDetail (US1)', () => {
  it('mostra todos os campos de FR-003 e o crédito da foto', () => {
    const { content } = setup('2026-11-02T16:00:00Z'); // segunda 11:00 em NY
    render(<PointDetail content={content} pointId="ny-met" />);
    expect(screen.getByRole('heading', { name: 'The Metropolitan Museum of Art' })).toBeTruthy();
    expect(screen.getByText(/Museu · Nova York/)).toBeTruthy();
    expect(screen.getByAltText('Foto de The Metropolitan Museum of Art')).toBeTruthy();
    expect(screen.getByText(/Foto: Fulano/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'CC BY-SA 4.0' })).toBeTruthy();
    expect(screen.getByText('Descrição de The Metropolitan Museum of Art.')).toBeTruthy();
    expect(screen.getByText('Endereço de The Metropolitan Museum of Art')).toBeTruthy();
    expect(screen.getByText('Hoje: 10:00–17:00')).toBeTruthy();
    expect(screen.getByText('Aberto agora')).toBeTruthy();
    expect(screen.getByText('US$ 30 adulto')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'example.org' })).toBeTruthy();
    expect(screen.getByText(/Informações verificadas em 20\/10\/2026/).textContent).toContain(
      'Confirme horário e preço no site oficial antes da visita.',
    );
  });

  it('"Como chegar" abre o app de mapas quando online', () => {
    const { content } = setup();
    setOnline(true);
    render(<PointDetail content={content} pointId="ny-met" />);
    const link = screen.getByRole('link', { name: 'Como chegar' }) as HTMLAnchorElement;
    expect(link.href).toBe('https://www.google.com/maps/dir/?api=1&destination=40.7794,-73.9632');
  });

  it('offline avisa sobre dados possivelmente desatualizados e sobre a navegação', () => {
    const { content } = setup();
    setOnline(false);
    render(<PointDetail content={content} pointId="ny-met" />);
    expect(screen.getByText(/Você está offline\. Informações verificadas em 20\/10\/2026/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Como chegar' }));
    expect(screen.getByRole('alert').textContent).toBe(
      'A navegação precisa de internet. Endereço: Endereço de The Metropolitan Museum of Art.',
    );
  });

  it('foto que falha ao carregar vira marcador', () => {
    const { content } = setup();
    render(<PointDetail content={content} pointId="ny-met" />);
    fireEvent.error(screen.getByAltText('Foto de The Metropolitan Museum of Art'));
    expect(screen.getByText('Foto indisponível')).toBeTruthy();
  });

  it('ponto inexistente', () => {
    const { content } = setup();
    render(<PointDetail content={content} pointId="nao-existe" />);
    expect(screen.getByRole('heading', { name: 'Ponto não encontrado' })).toBeTruthy();
  });
});
