// Junta content/ em public/data/content.json, validando antes (npm run content [--strict]).
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Content, FullDay, FullItinerary, Photo, Point } from '../src/content/types';
import { validateContent } from './content-schema';
import { validateFullItinerary } from './full-itinerary-schema';

const root = join(import.meta.dirname, '..');
const contentDir = join(root, 'content');
const publicDir = join(root, 'public');

/** Formato de cada ponto em content/points/*.json: foto referenciada, créditos vêm do script de fotos. */
export type PointSource = Omit<Point, 'photos'> & { photos: { ref: string; alt: string }[] };
export type PhotoCredit = Omit<Photo, 'alt'> & { ref: string };

function readJson<T>(path: string, fallback: T): T {
  return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as T) : fallback;
}

export function photoKey(pointId: string, index: number): string {
  return `${pointId}-${index + 1}`;
}

function dirBytes(dir: string): number {
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).reduce((sum, f) => {
    const s = statSync(join(dir, f));
    return sum + (s.isDirectory() ? dirBytes(join(dir, f)) : s.size);
  }, 0);
}

export function assembleContent(): Content {
  const { cities, trip } = readJson<Pick<Content, 'cities' | 'trip'>>(join(contentDir, 'trip.json'), {
    cities: [],
    trip: [],
  });
  const categories = readJson<Content['categories']>(join(contentDir, 'categories.json'), []);
  const credits = readJson<Record<string, PhotoCredit>>(join(contentDir, 'photo-credits.json'), {});
  const pointsDir = join(contentDir, 'points');
  const sources: PointSource[] = existsSync(pointsDir)
    ? readdirSync(pointsDir)
        .filter((f) => f.endsWith('.json'))
        .sort()
        .flatMap((f) => readJson<PointSource[]>(join(pointsDir, f), []))
    : [];
  const points: Point[] = sources.map((p) => ({
    ...p,
    photos: p.photos.flatMap((ph, i) => {
      const credit = credits[photoKey(p.id, i)];
      // Sem crédito (foto ainda não baixada), a foto fica de fora; o modo --strict acusa.
      if (!credit || credit.ref !== ph.ref) return [];
      const { ref: _ref, ...rest } = credit;
      return [{ ...rest, alt: ph.alt }];
    }),
  }));
  const suggestedItineraries = readJson<Content['suggestedItineraries']>(join(contentDir, 'itineraries.json'), []);
  return {
    version: new Date().toISOString(),
    cities,
    trip,
    categories,
    points,
    suggestedItineraries,
    fullItineraries: readFullItineraries(),
  };
}

/** content/full/<cidade>/meta.json + um AAAA-MM-DD.json por dia → FullItinerary (fonte única, FR-025a). */
export function readFullItineraries(): FullItinerary[] {
  const fullDir = join(contentDir, 'full');
  if (!existsSync(fullDir)) return [];
  return readdirSync(fullDir)
    .filter((d) => statSync(join(fullDir, d)).isDirectory() && existsSync(join(fullDir, d, 'meta.json')))
    .sort()
    .map((d) => {
      const meta = readJson<Omit<FullItinerary, 'days'>>(join(fullDir, d, 'meta.json'), {} as Omit<FullItinerary, 'days'>);
      const days = readdirSync(join(fullDir, d))
        .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
        .sort()
        .map((f) => readJson<FullDay>(join(fullDir, d, f), {} as FullDay));
      return { ...meta, days };
    });
}

function main() {
  const strict = process.argv.includes('--strict');
  const content = assembleContent();
  const pointIds = new Set(content.points.map((p) => p.id));
  const errors = [
    ...validateContent(content, {
      strict,
      photoExists: (src) => existsSync(join(publicDir, src)),
      totalBytes: dirBytes(join(publicDir, 'photos')) + Buffer.byteLength(JSON.stringify(content)),
    }),
    ...content.fullItineraries.flatMap((it) => validateFullItinerary(it, { strict, pointIds })),
  ];
  if (errors.length) {
    console.error(`Conteúdo inválido (${errors.length} erro(s)):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  mkdirSync(join(publicDir, 'data'), { recursive: true });
  writeFileSync(join(publicDir, 'data', 'content.json'), JSON.stringify(content));
  console.log(
    `content.json gerado${strict ? ' (strict)' : ''}: ${content.points.length} pontos, ` +
      `${content.points.reduce((n, p) => n + p.photos.length, 0)} fotos, ` +
      `${content.suggestedItineraries.length} roteiros sugeridos`,
  );
  for (const it of content.fullItineraries) {
    console.log(`roteiro FULL ${it.id}: ${it.days.length} dias, ${it.days.reduce((n, d) => n + d.activities.length, 0)} atividades`);
  }
}

if (process.argv[1] && import.meta.filename === process.argv[1]) main();
