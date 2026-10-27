// Feature 009 (T004): card inteiro clicável — um único link por card, nome acessível = título, seta decorativa.
import { fireEvent, render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { CardChevron, CardLink, installCardClicks } from '../../src/components/CardLink';

describe('CardLink (feature 009)', () => {
  it('um único link com o título como nome; a seta é decorativa', () => {
    const { container } = render(
      <article class="click-card">
        <h3>
          <CardLink href="#/cidade/orlando">Orlando</CardLink>
        </h3>
        <p>07/11 a 18/11</p>
        <CardChevron />
      </article>,
    );
    expect(container.querySelectorAll('a')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Orlando' }).getAttribute('href')).toBe('#/cidade/orlando');
    expect(container.querySelector('.card-chevron')!.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('toque em qualquer ponto do card (feature 009, FR-006/FR-007)', () => {
  it('aciona o link do card; botões dentro do card não navegam', () => {
    const off = installCardClicks();
    const clicks: string[] = [];
    render(
      <article class="click-card">
        <p class="body">Texto do card</p>
        <h3>
          <CardLink href="#/dia/2026-11-01">Domingo</CardLink>
        </h3>
        <button type="button" onClick={() => clicks.push('botão')}>
          Marcar
        </button>
      </article>,
    );
    const link = screen.getByRole('link', { name: 'Domingo' });
    link.addEventListener('click', (e) => {
      e.preventDefault();
      clicks.push('link');
    });
    fireEvent.click(document.querySelector('.body')!);
    fireEvent.click(screen.getByRole('button', { name: 'Marcar' }));
    expect(clicks).toEqual(['link', 'botão']);
    off();
  });
});
