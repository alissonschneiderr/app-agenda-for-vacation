import { act, fireEvent, render, screen, within } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Now } from '../../src/pages/Now';
import { Driver } from '../../src/pages/Driver';
import { setupCompanion } from './companion-helpers';

afterEach(() => vi.useRealTimers());

// 18:30 UTC em 01/11 = 13:30 em Nova York (já no horário de inverno).
const AT_1330 = '2026-11-01T18:30:00Z';

describe('Agora (feature 006, US1)', () => {
  it('cartão do próximo passo: horário, nome, região, como chegar e ações', () => {
    const { content } = setupCompanion(AT_1330);
    render(<Now content={content} />);
    const card = screen.getByRole('article', { name: 'Próximo passo: Mott Street' });
    expect(within(card).getByText('13h40')).toBeTruthy();
    expect(within(card).getByText('Chinatown')).toBeTruthy();
    expect(within(card).getAllByText(/10 minutos a pé, descendo a Mott Street/).length).toBeGreaterThan(0);
    expect(within(card).getByRole('link', { name: /Motorista/ }).getAttribute('href')).toBe('#/motorista/2026-11-01/ny3-2026-11-01-05');
    expect(screen.getByRole('heading', { name: 'Depois' })).toBeTruthy();
    expect(screen.getByText('Doyers Street')).toBeTruthy();
  });

  it('"Feito" avança e "Desfazer" volta ao passo anterior', () => {
    const { content } = setupCompanion(AT_1330);
    render(<Now content={content} />);
    fireEvent.click(screen.getByRole('button', { name: /Feito/ }));
    expect(screen.getByRole('article', { name: 'Próximo passo: Doyers Street' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('Feito: Mott Street');
    fireEvent.click(screen.getByRole('button', { name: 'Desfazer' }));
    expect(screen.getByRole('article', { name: 'Próximo passo: Mott Street' })).toBeTruthy();
  });

  it('ingresso com horário aparece no cartão', () => {
    const { content } = setupCompanion('2026-11-01T14:30:00Z'); // 09:30
    render(<Now content={content} />);
    const card = screen.getByRole('article', { name: 'Próximo passo: Greene Street' });
    expect(within(card).getByText('ingresso com horário — comprem antes')).toBeTruthy();
    expect(within(card).getAllByText(/metrô 6 até Bleecker St/).length).toBeGreaterThan(0);
  });

  it('intervalo livre oferece "Ver onde comer"', () => {
    const { content } = setupCompanion('2026-11-01T17:40:00Z'); // 12:40
    render(<Now content={content} />);
    expect(screen.getByRole('link', { name: /pausa livre agora · Ver onde comer/ }).getAttribute('href')).toMatch(/^#\/perto\/2026-11-01\//);
  });

  it('noite com evento mostra as orientações no cartão', () => {
    const { content } = setupCompanion('2026-11-01T23:00:00Z'); // 18:00
    render(<Now content={content} />);
    const card = screen.getByRole('article', { name: /Próximo passo: Knicks x Nets/ });
    expect(within(card).getByText('Como chegar')).toBeTruthy();
    expect(within(card).getByText('cheguem por volta das 18h30.')).toBeTruthy();
  });

  it('dia concluído mostra o fechamento e a prévia de amanhã', () => {
    const { content, store } = setupCompanion(AT_1330);
    store.update((s) => {
      const marks = { ...s.activityMarks };
      for (const d of content.fullItineraries[0]!.days.filter((x) => x.date === '2026-11-01'))
        for (const a of d.activities) if (a.type !== 'transit' && a.type !== 'free') marks[a.id] = { state: 'done', at: '2026-11-01T20:00:00Z' };
      return { ...s, activityMarks: marks };
    });
    render(<Now content={content} />);
    expect(screen.getByRole('heading', { name: 'Dia concluído' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Ver amanhã/ }).getAttribute('href')).toBe('#/dia/2026-11-02');
  });

  it('antes da viagem: contagem regressiva e ingressos pendentes', () => {
    const { content } = setupCompanion('2026-10-28T15:00:00Z');
    render(<Now content={content} />);
    expect(screen.getByRole('heading', { name: 'Faltam 3 dias' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Ver o primeiro dia/ }).getAttribute('href')).toBe('#/dia/2026-10-31');
  });

  it('aviso do dia: "Entendi" marca como lido e passa ao seguinte; depois não volta', () => {
    const { content } = setupCompanion(AT_1330);
    const { unmount } = render(<Now content={content} />);
    expect(screen.getByRole('complementary', { name: 'Aviso do dia' }).textContent).toContain('Maratona');
    fireEvent.click(screen.getByRole('button', { name: 'Entendi' }));
    expect(screen.getByRole('complementary', { name: 'Aviso do dia' }).textContent).toContain('Pôr do sol');
    fireEvent.click(screen.getByRole('button', { name: 'Entendi' }));
    expect(screen.queryByRole('complementary', { name: 'Aviso do dia' })).toBeNull();
    unmount();
    render(<Now content={content} />);
    expect(screen.queryByRole('complementary', { name: 'Aviso do dia' })).toBeNull();
  });

  it('dia de transição em "Agora" mostra os três blocos', () => {
    const { content } = setupCompanion('2026-11-07T13:00:00Z');
    render(<Now content={content} />);
    expect(screen.getByRole('heading', { name: '1. Antes de sair' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: '2. A viagem' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: '3. A chegada' })).toBeTruthy();
  });
});

describe('Mostrar ao motorista (FR-017)', () => {
  it('nome e endereço do roteiro; sem endereço, o texto do link de mapa do doc', () => {
    const { content } = setupCompanion(AT_1330);
    const { unmount } = render(<Driver content={content} date="2026-11-01" itemKey="ny3-2026-11-01-05" />);
    expect(screen.getByRole('dialog', { name: 'Mostrar ao motorista' }).textContent).toContain('Mott Street');
    expect(screen.getByText('Mott Street New York')).toBeTruthy();
    unmount();
    render(<Driver content={content} date="2026-11-01" itemKey="shop-kith" />);
    expect(screen.getByText('337 Lafayette St, Nova York')).toBeTruthy();
  });

  it('toque volta', () => {
    const { content } = setupCompanion(AT_1330);
    const back = vi.spyOn(history, 'back').mockImplementation(() => {});
    render(<Driver content={content} date="2026-11-01" itemKey="ny3-2026-11-01-06" />);
    act(() => {
      fireEvent.click(screen.getByRole('dialog'));
    });
    expect(back).toHaveBeenCalled();
  });
});
