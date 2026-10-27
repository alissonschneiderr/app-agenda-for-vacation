// Feature 008 (T006): componentes de base do caderno de viagem.
import { render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { Chip } from '../../src/components/Chip';
import { Cover } from '../../src/components/Cover';
import { PageHeader } from '../../src/components/PageHeader';
import { ProgressRing } from '../../src/components/ProgressRing';
import { SectionTitle } from '../../src/components/SectionTitle';

const photo = { src: 'photos/x.webp', alt: 'SoHo', author: 'Fulano', license: 'CC BY-SA 4.0', licenseUrl: null, sourceUrl: 'https://commons.wikimedia.org/wiki/File:x.jpg' };

describe('componentes de base (feature 008)', () => {
  it('Cover: foto com véu e crédito; sem foto, degradê da cidade com ícone', () => {
    const { container, rerender } = render(<Cover photo={photo} cityId="nova-york" lazy><h2>SoHo</h2></Cover>);
    const img = container.querySelector('img.cover-img')!;
    expect(img.getAttribute('alt')).toBe('SoHo');
    expect(img.getAttribute('title')).toBe('Foto: Fulano · CC BY-SA 4.0');
    expect(img.getAttribute('loading')).toBe('lazy');
    expect(container.querySelector('.cover-veil')).toBeTruthy();
    rerender(<Cover cityId="orlando"><h2>Sem foto</h2></Cover>);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('.cover-icon svg')).toBeTruthy();
    expect((container.querySelector('.cover') as HTMLElement).style.background).toContain('--cover-orlando');
  });

  it('ProgressRing: valores acessíveis e porcentagem', () => {
    render(<ProgressRing progress={{ done: 3, total: 12 }} scope="Nova York" />);
    const ring = screen.getByRole('progressbar', { name: 'Nova York: 3 de 12 feitas' });
    expect(ring.getAttribute('aria-valuenow')).toBe('3');
    expect(ring.textContent).toBe('25%');
  });

  it('Chip: variante e link', () => {
    render(<Chip variant="accent" href="#/perto/x">Comer</Chip>);
    const a = screen.getByRole('link', { name: 'Comer' });
    expect(a.getAttribute('href')).toBe('#/perto/x');
    expect(a.className).toContain('chip2-accent');
  });

  it('SectionTitle e PageHeader', () => {
    render(
      <>
        <PageHeader back="#/" label="Estados Unidos" title="Nova York" progress={{ done: 1, total: 4 }} />
        <SectionTitle icon="pin" title="Destinos" sub="Toque numa cidade" />
      </>,
    );
    expect(screen.getByRole('link', { name: 'Voltar' }).getAttribute('href')).toBe('#/');
    expect(screen.getByRole('heading', { level: 1, name: 'Nova York' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: 'Destinos' })).toBeTruthy();
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('1');
  });
});
