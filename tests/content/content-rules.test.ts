import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ORLANDO_PARKS, validateContent } from '../../scripts/content-schema';
import { assembleContent } from '../../scripts/build-content';
import type { Content } from '../../src/content/types';
import { fixtureContent } from '../fixtures/content';
import { fixtureFullItinerary } from '../fixtures/full-itinerary';

const loose = { strict: false };

function mutate(fn: (c: Content) => void): Content {
  const c = fixtureContent();
  fn(c);
  return c;
}

/** Conteúdo completo mínimo que passa no modo strict: 19 dias, 7 parques. */
function completeContent(): Content {
  const c = fixtureContent();
  c.points = c.points.filter((p) => p.id !== 'orl-magic-kingdom');
  for (const id of ORLANDO_PARKS) {
    c.points.push({ ...fixtureContent().points[4]!, id, name: id, photos: fixtureContent().points[4]!.photos });
  }
  const orlando = ['2026-11-08', '2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15', '2026-11-16', '2026-11-17'];
  const ny = ['2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06'];
  c.suggestedItineraries = [
    ...ny.map((date) => ({ id: `sug-${date}`, date, title: 'NY', pointIds: ['ny-met'] })),
    ...orlando.map((date, i) => ({ id: `sug-${date}`, date, title: 'Orlando', pointIds: [ORLANDO_PARKS[i] ?? 'orl-magic-kingdom'] })),
    ...['2026-11-19', '2026-11-20'].map((date) => ({ id: `sug-${date}`, date, title: 'Miami', pointIds: ['mia-south-beach'] })),
  ];
  // 3 dias restantes de Orlando sem parque: troca por outro ponto da cidade.
  const extra = { ...c.points.find((p) => p.cityId === 'orlando')!, id: 'orl-disney-springs', name: 'Disney Springs' };
  c.points.push(extra);
  for (const it of c.suggestedItineraries.slice(14, 17)) it.pointIds = ['orl-disney-springs'];
  return c;
}

describe('regras de conteúdo', () => {
  it('fixture válida passa no modo normal', () => {
    expect(validateContent(fixtureContent(), loose)).toEqual([]);
  });

  it('regra 1: schema', () => {
    const errors = validateContent(mutate((c) => ((c.points[0] as { name: string }).name = '')), loose);
    expect(errors.join()).toMatch(/schema: points\.ny-met\.name/);
    expect(validateContent(mutate((c) => ((c.points[0] as { verifiedAt: string }).verifiedAt = '20/10/2026')), loose)).not.toEqual([]);
  });

  it('regra 2: ponto sem foto falha no strict (SC-008)', () => {
    const c = mutate((c) => (c.points[0]!.photos = []));
    expect(validateContent(c, loose)).toEqual([]);
    expect(validateContent(c, { strict: true }).join()).toMatch(/ny-met: sem foto/);
  });

  it('regra 3: arquivo de foto ausente', () => {
    expect(validateContent(completeContent(), { strict: true, photoExists: () => false }).join()).toMatch(/arquivo de foto ausente/);
  });

  it('regra 4: licença não permitida', () => {
    const c = mutate((c) => (c.points[0]!.photos[0]!.license = 'Fair use'));
    expect(validateContent(c, loose).join()).toMatch(/licença não permitida/);
    for (const ok of ['CC0', 'Public domain', 'CC BY 2.0', 'CC BY-SA 3.0']) {
      expect(validateContent(mutate((c) => (c.points[0]!.photos[0]!.license = ok)), loose)).toEqual([]);
    }
  });

  it('regra 5: roteiros sugeridos', () => {
    const travel = mutate((c) => c.suggestedItineraries.push({ id: 'sug-2026-11-07', date: '2026-11-07', title: 'x', pointIds: ['ny-met'] }));
    expect(validateContent(travel, loose).join()).toMatch(/locomoção/);
    const missing = mutate((c) => c.suggestedItineraries[0]!.pointIds.push('nao-existe'));
    expect(validateContent(missing, loose).join()).toMatch(/inexistente/);
    const repeated = mutate((c) => c.suggestedItineraries[0]!.pointIds.push('ny-met'));
    expect(validateContent(repeated, loose).join()).toMatch(/repetido/);
    const otherCity = mutate((c) => c.suggestedItineraries[0]!.pointIds.push('mia-south-beach'));
    expect(validateContent(otherCity, loose).join()).toMatch(/não da cidade do dia/);
    expect(validateContent(fixtureContent(), { strict: true }).join()).toMatch(/falta roteiro sugerido ou roteiro FULL para 2026-10-31/);
  });

  it('regra 5 (002): dia coberto pelo roteiro FULL não precisa de sugerido, mas não pode ter os dois', () => {
    const c = completeContent();
    const nyDates = ['2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06'];
    c.suggestedItineraries = c.suggestedItineraries.filter((s) => !nyDates.includes(s.date));
    expect(validateContent(c, { strict: true }).join()).toMatch(/falta roteiro sugerido ou roteiro FULL/);
    c.fullItineraries = [fixtureFullItinerary()];
    expect(validateContent(c, { strict: true })).toEqual([]);
    c.suggestedItineraries.push({ id: 'sug-2026-11-01', date: '2026-11-01', title: 'x', pointIds: ['ny-met'] });
    expect(validateContent(c, { strict: true }).join()).toMatch(/tem roteiro sugerido e roteiro FULL/);
  });

  it('regra 6: os 7 parques com dia próprio', () => {
    expect(validateContent(completeContent(), { strict: true })).toEqual([]);
    const c = completeContent();
    c.suggestedItineraries[7]!.pointIds = ['orl-disney-springs'];
    expect(validateContent(c, { strict: true }).join()).toMatch(/orl-magic-kingdom sem dia próprio/);
  });

  it('003: foto de destaque da cidade (heroPointId)', () => {
    expect(validateContent(mutate((c) => (c.cities[0]!.heroPointId = 'nao-existe')), loose).join()).toMatch(/heroPointId inexistente/);
    expect(validateContent(mutate((c) => (c.cities[0]!.heroPointId = 'mia-south-beach')), loose).join()).toMatch(/é de outra cidade/);
    const noPhoto = mutate((c) => (c.points.find((p) => p.id === 'ny-central-park')!.photos = []));
    expect(validateContent(noPhoto, { strict: true }).join()).toMatch(/ny-central-park sem foto/);
  });

  it('regra 7: orçamento de 40 MB', () => {
    expect(validateContent(completeContent(), { strict: true, totalBytes: 41 * 1024 * 1024 }).join()).toMatch(/limite 40 MB/);
  });

  it('o conteúdo real em content/ é válido e completo (strict)', () => {
    const real = assembleContent();
    expect(
      validateContent(real, {
        strict: true,
        photoExists: (src) => existsSync(join(import.meta.dirname, '..', '..', 'public', src)),
      }),
    ).toEqual([]);
  });
});

describe('tipos de dia (feature 006)', () => {
  it('todo dia da viagem precisa de tipo em dayKinds', () => {
    const c = fixtureContent();
    delete (c.dayKinds as Record<string, string>)['2026-11-03'];
    expect(validateContent(c, { strict: false }).join('\n')).toMatch(/dia 2026-11-03 sem tipo em dayKinds/);
  });

  it('tipo fora da lista é recusado', () => {
    const c = fixtureContent();
    (c.dayKinds as Record<string, string>)['2026-11-03'] = 'montanha';
    expect(validateContent(c, { strict: false }).join('\n')).toMatch(/dayKinds/);
  });
});

describe('país das cidades (feature 008)', () => {
  it('toda cidade precisa de country', () => {
    const c = fixtureContent();
    delete (c.cities[1] as { country?: string }).country;
    expect(validateContent(c, { strict: false }).join('\n')).toMatch(/cities\.orlando\.country/);
  });
});
