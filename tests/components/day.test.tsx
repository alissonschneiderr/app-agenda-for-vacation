// Feature 008 (US1): página do dia no formato do design — capa com foto, "Sobre este dia" e as
// paradas em cartões com miniatura e círculo de marcar. Conteúdo real do app.
import { fireEvent, render, screen, within } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { seedSuggested } from '../../src/domain/itineraries';
import { Day } from '../../src/pages/Day';
import { setupReal } from './companion-helpers';

afterEach(() => vi.useRealTimers());

// Novembro em Nova York: UTC−5.
const at = (local: string) => new Date(`${local}:00-05:00`).toISOString();

describe('Dia (features 008 e 009)', () => {
  it('01/11 13h30: capa com a foto de SoHo, "01/11" e "Domingo"; menu com as seções na ordem', () => {
    const { content } = setupReal(at('2026-11-01T13:30'));
    const { container } = render(<Day content={content} date="2026-11-01" />);
    const cover = container.querySelector('.cover')!;
    const soho = content.fullItineraries[0]!.days.find((d) => d.date === '2026-11-01')!.areas!.find((a) => a.name === 'SoHo')!;
    expect(cover.querySelector('img.cover-img')!.getAttribute('src')).toContain(soho.photo!.src);
    // Feature 013: a data no lugar de "Dia 2" e só o dia da semana no lugar de "dom, 01/11".
    expect(cover.textContent).toContain('Domingo');
    expect(cover.textContent).toContain('01/11');
    expect(cover.textContent).not.toMatch(/Dia 2|dom, 01\/11/);
    const menu = screen.getByRole('navigation', { name: 'Seções do dia' });
    expect(within(menu).getAllByRole('link').map((a) => a.textContent)).toEqual(['Paradas', 'Restaurantes e Cafés', 'Brechós e Lojas', 'Curiosidades', 'Bairros', 'Transporte', 'Dicas']);
    expect(screen.queryByRole('region', { name: 'Sobre este dia' })).toBeNull();
    expect(container.querySelector('#dicas')!.textContent).toContain('Maratona');
  });

  it('a marca "agora · 13h30" fica antes do cartão de Mott Street', () => {
    const { content } = setupReal(at('2026-11-01T13:30'));
    const { container } = render(<Day content={content} date="2026-11-01" />);
    const now = container.querySelector('.tl-now')!;
    expect(now.textContent).toBe('agora · 13h30');
    const after = [...container.querySelectorAll('.tl-now ~ .stop-card')][0]!;
    expect(after.querySelector('.tl-name')!.textContent).toBe('Mott Street');
  });

  it('paradas: cartão com miniatura, horário, nome, chip de tipo e círculo; intervalos sem círculo', () => {
    const { content } = setupReal(at('2026-11-01T09:00'));
    const { container } = render(<Day content={content} date="2026-11-01" />);
    const cards = [...container.querySelectorAll('.stop-card')];
    expect(cards.length).toBeGreaterThan(5);
    for (const c of cards) {
      expect(c.querySelector('.tl-time')!.textContent).toBeTruthy();
      expect(c.querySelector('.chip2-type')).toBeTruthy();
      expect(c.querySelector('[role="checkbox"]')).toBeTruthy();
    }
    expect(cards.filter((c) => c.querySelector('.stop-thumb img')).length).toBeGreaterThan(cards.length / 2);
    for (const line of container.querySelectorAll('.tl-free, .tl-move')) expect(line.querySelector('[role="checkbox"]')).toBeNull();
  });

  it('09/11: Tower of Terror com fila e Multi Pass; almoço como linha', () => {
    const { content } = setupReal(at('2026-11-09T08:00'));
    const { container } = render(<Day content={content} date="2026-11-09" />);
    const tower = [...container.querySelectorAll('.stop-card')].find((e) => e.textContent!.includes('Tower of Terror'))!;
    expect(tower.querySelector('.tl-sub')!.textContent).toBe('~5 min · Multi Pass');
    expect([...container.querySelectorAll('.tl-free')].some((e) => e.textContent!.includes('Almoço'))).toBe(true);
  });

  it('expandir mostra o resumo e Detalhes, Motorista e "Ver onde comer perto"', () => {
    const { content } = setupReal(at('2026-11-01T09:00'));
    const { container } = render(<Day content={content} date="2026-11-01" />);
    const card = [...container.querySelectorAll('.stop-card')].find((e) => e.querySelector('.tl-name')!.textContent === 'Mott Street')!;
    fireEvent.click(within(card as HTMLElement).getByRole('button', { name: 'Abrir Mott Street' }));
    expect(within(card as HTMLElement).getByRole('link', { name: /Detalhes/ }).getAttribute('href')).toMatch(/^#\/dia\/2026-11-01\/ny3-2026-11-01-\d+$/);
    expect(within(card as HTMLElement).getByRole('link', { name: /Motorista/ }).getAttribute('href')).toMatch(/^#\/motorista\/2026-11-01\//);
    expect(within(card as HTMLElement).getByRole('link', { name: /Ver onde comer perto/ }).getAttribute('href')).toBe('#comer');
  });

  it('marcar no círculo: feito, contador da capa sobe e "Desfazer" volta', () => {
    const { content } = setupReal(at('2026-11-01T13:30'));
    const { container } = render(<Day content={content} date="2026-11-01" />);
    const ring = screen.getAllByRole('progressbar')[0]!;
    const before = Number(ring.getAttribute('aria-valuenow'));
    const card = [...container.querySelectorAll('.stop-card')].find((e) => e.querySelector('.tl-name')!.textContent === 'Mott Street')!;
    fireEvent.click(within(card as HTMLElement).getByRole('checkbox'));
    expect(within(card as HTMLElement).getByRole('checkbox').getAttribute('aria-checked')).toBe('true');
    expect(Number(screen.getAllByRole('progressbar')[0]!.getAttribute('aria-valuenow'))).toBe(before + 1);
    fireEvent.click(screen.getByRole('button', { name: 'Desfazer' }));
    expect(within(card as HTMLElement).getByRole('checkbox').getAttribute('aria-checked')).toBe('false');
  });

  it('07/11: rota na capa e os três blocos da transição', () => {
    const { content } = setupReal(at('2026-11-07T09:00'));
    const { container } = render(<Day content={content} date="2026-11-07" />);
    expect(container.querySelector('.cover h2')!.textContent).toBe('Nova York → Orlando');
    expect(screen.getByRole('heading', { name: '1. Antes de sair' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'A chegada' })).toBeTruthy();
  });

  it('cabeçalho: voltar para a cidade; anterior/seguinte; "Voltar para hoje" fora de hoje', () => {
    const { content } = setupReal(at('2026-11-01T13:30'));
    render(<Day content={content} date="2026-11-03" />);
    expect(screen.getByRole('link', { name: 'Voltar' }).getAttribute('href')).toBe('#/cidade/nova-york');
    expect(screen.getByRole('link', { name: /Dia anterior/ }).getAttribute('href')).toBe('#/dia/2026-11-02');
    expect(screen.getByRole('link', { name: /Próximo dia/ }).getAttribute('href')).toBe('#/dia/2026-11-04');
    expect(screen.getByRole('link', { name: 'Voltar para hoje' }).getAttribute('href')).toBe('#/dia');
  });
});

describe('seções do dia (feature 009, US2)', () => {
  it('01/11: 24 restaurantes e cafés e 17 lojas, cada card com 1 link para o detalhe', () => {
    const { content } = setupReal(at('2026-11-01T09:00'));
    const { container } = render(<Day content={content} date="2026-11-01" />);
    const food = [...container.querySelectorAll('#comer article')];
    const shops = [...container.querySelectorAll('#lojas article')];
    expect(food).toHaveLength(24);
    expect(shops).toHaveLength(17);
    for (const c of [...food, ...shops]) {
      const links = [...c.querySelectorAll('a.card-link')];
      expect(links).toHaveLength(1);
      expect(links[0]!.getAttribute('href')).toMatch(/^#\/perto\/2026-11-01\/[a-z-]+\/(food|shop)-/);
    }
  });

  it('09/11 sem "Brechós e Lojas"; 19/11 de Miami com o roteiro do casal; 07/11 Transporte com os três blocos; nada de "Sem informações"', () => {
    const { content, store } = setupReal(at('2026-11-01T09:00'));
    store.update((s) => seedSuggested(content, s));
    const menu = (d: string) => {
      const r = render(<Day content={content} date={d} />);
      const nav = r.container.querySelector('nav[aria-label="Seções do dia"]');
      const out = { labels: nav ? [...nav.querySelectorAll('a')].map((a) => a.textContent) : [], text: r.container.textContent! };
      r.unmount();
      return out;
    };
    expect(menu('2026-11-09').labels).not.toContain('Brechós e Lojas');
    // Feature 012: 19/11 tem o roteiro de Miami (Sawgrass), sem Curiosidades nem Dicas.
    const miami = menu('2026-11-19');
    expect(miami.labels).toEqual(['Paradas', 'Restaurantes e Cafés', 'Brechós e Lojas', 'Transporte']); // feature 013: Sawgrass não é bairro
    const transit = render(<Day content={content} date="2026-11-07" />);
    expect(transit.container.querySelector('#transporte')).toBeTruthy();
    expect(screen.getByRole('heading', { name: '1. Antes de sair' })).toBeTruthy();
    transit.unmount();
    for (const d of ['2026-11-01', '2026-11-09', '2026-11-19', '2026-11-07', '2026-11-21']) expect(menu(d).text, d).not.toMatch(/Sem informações|Sem orientações/);
  });

  it('o card de parada inteiro abre o detalhe; o círculo marca sem navegar', () => {
    const { content } = setupReal(at('2026-11-01T13:30'));
    const { container } = render(<Day content={content} date="2026-11-01" />);
    const card = [...container.querySelectorAll('.stop-card')].find((e) => e.querySelector('.tl-name')!.textContent === 'Mott Street')!;
    expect(card.classList.contains('click-card')).toBe(true);
    expect([...card.querySelectorAll('a.card-link')]).toHaveLength(1);
    expect(card.querySelector('.stop-thumb a')).toBeNull();
  });
});

describe('grupos por bairro no dia (feature 010, US1)', () => {
  const heads = (root: Element, id: string) => [...root.querySelectorAll(`#${id} h3.hood-group-head`)].map((h) => h.textContent);

  it('01/11: comer em 6 grupos na ordem; lojas em 4; curiosidades com 5; cabeçalho só com o nome', () => {
    const { content } = setupReal(at('2026-11-01T09:00'));
    const { container } = render(<Day content={content} date="2026-11-01" />);
    expect(heads(container, 'comer')).toEqual(['SoHo', 'Nolita', 'Chinatown', 'Little Italy', 'Lower East Side', 'East Village']);
    expect(container.querySelectorAll('#comer article')).toHaveLength(24);
    expect(heads(container, 'lojas')).toEqual(['SoHo', 'Nolita', 'Lower East Side', 'East Village']);
    expect(container.querySelectorAll('#lojas article')).toHaveLength(17);
    expect(container.querySelectorAll('#curiosidades article')).toHaveLength(5);
    for (const h of container.querySelectorAll('h3.hood-group-head')) {
      expect(h.querySelector('img, p')).toBeNull();
      expect(h.textContent).not.toMatch(/\d/);
    }
    for (const c of container.querySelectorAll('#comer article, #lojas article, #curiosidades article')) expect(c.querySelectorAll('a.card-link')).toHaveLength(1);
  });

  it('05/11: sem curiosidades, nem a seção nem o item do menu', () => {
    const { content } = setupReal(at('2026-11-01T09:00'));
    const { container } = render(<Day content={content} date="2026-11-05" />);
    expect(container.querySelector('#curiosidades')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Curiosidades' })).toBeNull();
  });
});

describe('Transporte enxuto (feature 010, US2)', () => {
  it('01/11 só com o metrô 6, sem trechos a pé; 31/10 sem a seção; 07/11 com os blocos', () => {
    const { content } = setupReal(at('2026-11-01T09:00'));
    const a = render(<Day content={content} date="2026-11-01" />);
    const t = a.container.querySelector('#transporte')!;
    expect(t.querySelectorAll('.move-list li')).toHaveLength(1);
    expect(t.textContent).toContain('metrô 6');
    expect(t.textContent).not.toContain('a pé pela Prince Street');
    a.unmount();
    const b = render(<Day content={content} date="2026-10-31" />);
    expect(b.container.querySelector('#transporte')).toBeNull();
    b.unmount();
    render(<Day content={content} date="2026-11-07" />);
    expect(screen.getByRole('heading', { name: '1. Antes de sair' })).toBeTruthy();
  });
});

describe('rótulos do dia (feature 013, US2)', () => {
  it('01/11: cabeçalho "01/11 · …"; botões de dia com a data por extenso, como antes', () => {
    const { content } = setupReal(at('2026-11-01T09:00'));
    render(<Day content={content} date="2026-11-01" />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/^01\/11 · /);
    expect(screen.queryByText(/^Dia \d+/)).toBeNull();
    expect(screen.getByRole('link', { name: 'Dia anterior, sábado, 31/10' })).toBeTruthy();
  });
});

describe('"Bairros" só com bairros (feature 013, US3)', () => {
  it('03/11: Upper West Side e Upper East Side, sem Central Park; as paradas do parque continuam', () => {
    const { content } = setupReal(at('2026-11-03T09:00'));
    const { container } = render(<Day content={content} date="2026-11-03" />);
    const hoods = [...container.querySelectorAll('#bairros article')].map((a) => a.getAttribute('aria-label'));
    expect(hoods).toEqual(['Upper West Side', 'Upper East Side']);
    expect(container.querySelector('#paradas')!.textContent).toMatch(/Central Park/);
  });

  it('11/11: sem "Bairros"; "Manhã livre" na linha do tempo sem o alfinete', () => {
    const { content } = setupReal(at('2026-11-03T09:00'));
    const { container } = render(<Day content={content} date="2026-11-11" />);
    expect(container.querySelector('#bairros')).toBeNull();
    const free = [...container.querySelectorAll('.tl-area')].find((e) => e.textContent!.includes('Manhã livre'))!;
    expect(free.querySelector('svg')).toBeNull();
  });

  it('18/11: "Bairros" com South Beach (Art Deco District), não mais vazio', () => {
    const { content } = setupReal(at('2026-11-03T09:00'));
    const { container } = render(<Day content={content} date="2026-11-18" />);
    expect([...container.querySelectorAll('#bairros article')].map((a) => a.getAttribute('aria-label'))).toEqual(['South Beach (Art Deco District)']);
  });
});
