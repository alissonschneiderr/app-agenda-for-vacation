// Junta content/ em public/data/content.json, validando antes (npm run content [--strict]).
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Content, Photo, Point } from '../src/content/types';
import { validateContent } from './content-schema';

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
  return { version: new Date().toISOString(), cities, trip, categories, points, suggestedItineraries };
}

function main() {
  const strict = process.argv.includes('--strict');
  const content = assembleContent();
  const errors = validateContent(content, {
    strict,
    photoExists: (src) => existsSync(join(publicDir, src)),
    totalBytes: dirBytes(join(publicDir, 'photos')) + Buffer.byteLength(JSON.stringify(content)),
  });
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
}

if (process.argv[1] && import.meta.filename === process.argv[1]) main();
