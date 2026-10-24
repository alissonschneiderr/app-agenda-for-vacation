import { fireEvent, render, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it } from 'vitest';
import { PlaceCard } from '../../src/components/PlaceCard';
import type { DocPlace } from '../../src/content/types';
import { setOnline } from './helpers';

afterEach(() => setOnline(true));

const MAP = (q: string) => `https://www.google.com/maps/search/?api=1&query=${q}`;
const PH = (q: string) => `https://www.google.com/search?tbm=isch&q=${q}`;

const laCabra: DocPlace = {
  id: 'food-la-cabra',
  kind: 'food',
  name: 'La Cabra SoHo',
  address: '284 Lafayette St',
  level: '☕',
  price: '💵',
  queue: 'Fila no fim de semana; confiram o horário.',
  mapsUrls: [{ label: 'Mapa', url: MAP('LaCabra') }],
  photoUrls: [],
  fields: [{ label: '', text: 'o café coado das 10h. Peçam um coado de origem única.' }],
};

describe('PlaceCard (feature 005)', () => {
  it('comida: nível ☕ com rótulo, preço com legenda, texto, fila e mapa', () => {
    render(<PlaceCard place={laCabra} />);
    expect(screen.getByRole('heading', { name: 'La Cabra SoHo' })).toBeTruthy();
    expect(screen.getByText('Café coado')).toBeTruthy();
    expect(screen.getByTitle(/💵 até USD 20/).textContent).toContain('💵');
    expect(screen.getByText('284 Lafayette St')).toBeTruthy();
    expect(screen.getByText('o café coado das 10h. Peçam um coado de origem única.')).toBeTruthy();
    expect(screen.getByText(/Fila no fim de semana/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Abrir no mapa' }).getAttribute('href')).toBe(MAP('LaCabra'));
    expect(screen.queryByRole('link', { name: /Ver fotos/ })).toBeNull();
  });

  it('dois links do mesmo tipo levam o rótulo do doc', () => {
    render(
      <PlaceCard
        place={{
          ...laCabra,
          mapsUrls: [
            { label: 'Google Maps (770 Third Ave)', url: MAP('770') },
            { label: 'Google Maps (831 Third Ave)', url: MAP('831') },
          ],
        }}
      />,
    );
    expect(screen.getByRole('link', { name: /770 Third Ave/ }).getAttribute('href')).toBe(MAP('770'));
    expect(screen.getByRole('link', { name: /831 Third Ave/ }).getAttribute('href')).toBe(MAP('831'));
  });

  it('loja (tipo, estilo, preço), locação (obra, foto) e atração (ingresso, fotos)', () => {
    render(
      <PlaceCard
        place={{
          id: 'shop-kith',
          kind: 'shop',
          name: 'Kith',
          address: '337 Lafayette St',
          price: '💵💵💵',
          mapsUrls: [],
          fields: [
            { label: 'Tipo', text: 'marca autoral' },
            { label: 'Estilo', text: 'streetwear premium' },
            { label: '', text: 'A flagship de Ronnie Fieg.' },
          ],
        }}
      />,
    );
    expect(screen.getByText('Tipo')).toBeTruthy();
    expect(screen.getByText('streetwear premium')).toBeTruthy();
    expect(screen.getByText('A flagship de Ronnie Fieg.')).toBeTruthy();

    render(
      <PlaceCard
        place={{ id: 'screen-x', kind: 'screen', name: '102 Prince St', mapsUrls: [], fields: [], works: 'Ghost (1990): o loft.', photoTip: 'da esquina oposta.' }}
      />,
    );
    expect(screen.getByText('Ghost (1990): o loft.')).toBeTruthy();
    expect(screen.getByText('da esquina oposta.')).toBeTruthy();

    render(
      <PlaceCard
        place={{
          id: 'attraction-top',
          kind: 'attraction',
          name: 'Top of the Rock',
          mapsUrls: [{ label: 'Mapa', url: MAP('Top') }],
          photoUrls: [{ label: '📷 fotos', url: PH('Top') }],
          fields: [{ label: '', text: 'O mirante.' }],
          access: 'ingresso com horário marcado — comprem antes',
        }}
      />,
    );
    expect(screen.getByText(/ingresso com horário marcado/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Ver fotos' }).getAttribute('href')).toBe(PH('Top'));
  });

  it('aviso do doc para conferir aparece em destaque no cartão completo', () => {
    const { container } = render(
      <PlaceCard place={{ ...laCabra, fields: [{ label: '', text: 'Hambúrguer clássico desde 1972. Peçam o cheeseburger; confirmem a forma de pagamento.' }] }} />,
    );
    expect(container.querySelector('.notice')!.textContent!.trim()).toBe('confirmem a forma de pagamento.');
  });

  it('offline: fotos e mapa avisam que precisam de internet e mostram o endereço', () => {
    setOnline(false);
    render(<PlaceCard place={{ ...laCabra, photoUrls: [{ label: '📷 fotos', url: PH('x') }] }} />);
    expect(screen.queryByRole('link', { name: /Abrir no mapa|Ver fotos/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Abrir no mapa/ }));
    expect(screen.getByRole('alert').textContent).toBe('Fotos e mapa precisam de internet. Endereço: 284 Lafayette St.');
  });
});
