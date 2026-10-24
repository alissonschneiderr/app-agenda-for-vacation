// Fotos offline dos roteiros do casal (features 006 e 007, FR-026/SC-009/SC-010), por cidade.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { assembleContent } from '../../scripts/build-content';
import { ALLOWED_LICENSE } from '../../scripts/content-schema';

const fullDir = join(import.meta.dirname, '../../content/full');
const content = assembleContent();
const cities = readdirSync(fullDir).filter((c) => existsSync(join(fullDir, c, 'doc-photos.json')));

describe.each(cities)('fotos do roteiro de %s', (city) => {
  const dir = join(fullDir, city);
  const refs: Record<string, string> = JSON.parse(readFileSync(join(dir, 'doc-photos.json'), 'utf8'));
  const credits: Record<string, { src: string; license: string; author: string; sourceUrl: string }> = JSON.parse(
    readFileSync(join(dir, 'photo-credits.json'), 'utf8'),
  );
  const it_ = content.fullItineraries.find((f) => f.id === city)!;

  it('cada entrada de doc-photos.json é o nome de uma região ou de um lugar do roteiro', () => {
    const names = new Set(it_.days.flatMap((d) => [...(d.areas ?? []).map((a) => a.name), ...(d.places ?? []).map((p) => p.name)]));
    for (const n of Object.keys(refs)) expect(names.has(n), n).toBe(true);
  });

  it('toda foto baixada tem arquivo, autor, licença livre e link da fonte', () => {
    for (const [name, c] of Object.entries(credits)) {
      expect(existsSync(join(import.meta.dirname, '../../public', c.src)), name).toBe(true);
      expect(c.license, name).toMatch(ALLOWED_LICENSE);
      expect(c.author, name).toBeTruthy();
      expect(c.sourceUrl, name).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
    }
  });

  it('≥ 90% das regiões e dos passos marcáveis têm foto offline do próprio lugar (SC-009, SC-010)', () => {
    let total = 0;
    const missing: string[] = [];
    for (const d of it_.days) {
      for (const a of d.areas ?? []) {
        // "Manhã livre" é a piscina do hotel: não há lugar a fotografar.
        if (a.kind !== 'bairro' || /^Manhã livre$/.test(a.name)) continue;
        total++;
        if (!a.photo) missing.push(`região ${a.name}`);
      }
      for (const s of d.activities) {
        if (s.type === 'transit' || s.type === 'free') continue;
        total++;
        const place = d.places?.find((p) => p.id === s.placeIds?.[0]);
        const area = d.areas?.find((x) => x.id === s.areaId);
        const has = !!place?.photo || (s.type === 'shopping' && !!area?.photo);
        if (!has) missing.push(`${d.date} ${s.title}`);
      }
    }
    const coverage = (total - missing.length) / total;
    expect(coverage, `sem foto: ${missing.join('; ')}`).toBeGreaterThanOrEqual(0.9);
  });
});
