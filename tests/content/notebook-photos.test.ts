// Feature 008 (T040, SC-003): fotos nos cartões do caderno de viagem — paradas, capas de cidade, dia e
// bairro de Nova York e Orlando. Só foto do próprio lugar (stopThumb nunca usa a da cidade).
import { describe, expect, it } from 'vitest';
import { assembleContent } from '../../scripts/build-content';
import { indexContent } from '../../src/content/load';
import { cityCard, dayCard, neighborhoods, stopThumb } from '../../src/domain/notebook';
import { dayKind } from '../../src/domain/now';
import { destinationDates } from '../../src/domain/trip-view';
import { emptyState } from '../../src/storage/user-store';

const content = indexContent(assembleContent());
const state = emptyState();
const ratio = (ok: number, total: number) => (total ? ok / total : 1);

describe.each(['nova-york', 'orlando'] as const)('fotos nos cartões de %s (SC-003)', (cityId) => {
  const dates = destinationDates(content, cityId).filter((d) => dayKind(content, d) !== 'transit');

  it('≥ 90% das paradas marcáveis com miniatura do próprio lugar', () => {
    let total = 0;
    const missing: string[] = [];
    for (const d of dates) {
      const view = dayCard(content, state, d).view;
      for (const s of view.groups.flatMap((g) => g.activities).filter((a) => a.trackable)) {
        total++;
        if (!stopThumb(s, view.areas.find((a) => a.id === s.areaId))) missing.push(`${d} ${s.title}`);
      }
    }
    expect(ratio(total - missing.length, total), `sem foto: ${missing.join('; ')}`).toBeGreaterThanOrEqual(0.9);
  });

  it('≥ 90% das capas e cartões de cidade, dia e bairro com foto', () => {
    const covers = [
      !!cityCard(content, state, cityId).photo,
      ...dates.map((d) => !!dayCard(content, state, d).photo),
      ...neighborhoods(content, state, cityId).filter((n) => n.name !== 'Manhã livre').map((n) => !!n.photo),
    ];
    expect(ratio(covers.filter(Boolean).length, covers.length)).toBeGreaterThanOrEqual(0.9);
  });
});
