// Junta content/ em public/data/content.json, validando antes (npm run content [--strict]).
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Content, FullDay, FullItinerary, Photo, Point } from '../src/content/types';
import { validateContent } from './content-schema';
import { validateFullItinerary } from './full-itinerary-schema';
import { checkFidelity, parseNycDoc } from './doc-parser';

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
  const { cities, trip, dayKinds } = readJson<Pick<Content, 'cities' | 'trip' | 'dayKinds'>>(join(contentDir, 'trip.json'), {
    cities: [],
    trip: [],
    dayKinds: {},
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
  guidePhotos = new Map(points.filter((p) => p.photos[0]).map((p) => [p.id, p.photos[0]!]));
  const suggestedItineraries = readJson<Content['suggestedItineraries']>(join(contentDir, 'itineraries.json'), []);
  return {
    version: new Date().toISOString(),
    cities,
    trip,
    dayKinds,
    categories,
    points,
    suggestedItineraries,
    fullItineraries: readFullItineraries(),
  };
}

/** Fotos dos pontos do guia, por id, para reaproveitar no roteiro. */
let guidePhotos: Map<string, Photo> = new Map();

/**
 * Feature 006: foto offline de cada região e lugar do roteiro — primeiro a do próprio roteiro
 * (doc-photos.json → photo-credits.json); senão, a do ponto do guia ligado pelo nome.
 */
function attachDocPhotos(dir: string, days: FullDay[], pointLinks: Record<string, string>): void {
  const credits = readJson<Record<string, PhotoCredit>>(join(dir, 'photo-credits.json'), {});
  const photoFor = (name: string): Photo | undefined => {
    const c = credits[name];
    if (c && existsSync(join(publicDir, c.src))) {
      const { ref: _ref, ...rest } = c;
      return { ...rest, alt: name };
    }
    const pid = pointLinks[name];
    return pid ? guidePhotos.get(pid) : undefined;
  };
  for (const d of days) {
    for (const a of d.areas ?? []) {
      const ph = photoFor(a.name);
      if (ph) a.photo = ph;
    }
    for (const p of d.places ?? []) {
      const ph = photoFor(p.name);
      if (ph) p.photo = ph;
    }
  }
}

/** Erros do leitor do documento (roteiro.md), acumulados por readFullItineraries(). */
export const docErrors: string[] = [];

/**
 * content/full/<cidade>/meta.json + roteiro.md (documento do casal, feature 004) → FullItinerary.
 * Sem roteiro.md, usa um AAAA-MM-DD.json por dia (formato da feature 002).
 */
export function readFullItineraries(): FullItinerary[] {
  const fullDir = join(contentDir, 'full');
  if (!existsSync(fullDir)) return [];
  docErrors.length = 0;
  // Feature 012: na ordem da viagem (NY → Orlando → Miami), não na ordem alfabética das pastas.
  const legs = readJson<{ trip: { cityId: string }[] }>(join(contentDir, 'trip.json'), { trip: [] }).trip.map((l) => l.cityId);
  const order = (d: string) => (legs.indexOf(d) === -1 ? legs.length : legs.indexOf(d));
  return readdirSync(fullDir)
    .filter((d) => statSync(join(fullDir, d)).isDirectory() && existsSync(join(fullDir, d, 'meta.json')))
    .sort((a, b) => order(a) - order(b) || a.localeCompare(b))
    .map((d) => {
      const dir = join(fullDir, d);
      const meta = readJson<Omit<FullItinerary, 'days'>>(join(dir, 'meta.json'), {} as Omit<FullItinerary, 'days'>);
      const docPath = join(dir, 'roteiro.md');
      if (existsSync(docPath)) {
        const markdown = readFileSync(docPath, 'utf8');
        const pointLinks = readJson<Record<string, string>>(join(dir, 'point-links.json'), {});
        const { doc, errors } = parseNycDoc(markdown, {
          year: Number(meta.arrival.date.slice(0, 4)),
          pointLinks,
          commitments: meta.commitments,
          checklistOverrides: meta.checklistOverrides,
          idPrefix: meta.idPrefix,
          arrivalDay: meta.arrivalDay,
          arrivalInDay: meta.arrivalInDay,
          departure: meta.departure,
          stepsUseAreaPoint: meta.stepsUseAreaPoint,
          tipsCityId: meta.cityId,
        });
        docErrors.push(...errors, ...checkFidelity(markdown, doc, meta.commitments, meta.checklistOverrides));
        attachDocPhotos(dir, doc.days, pointLinks);
        return {
          ...meta,
          title: doc.title || meta.title,
          source: { title: doc.title, byline: doc.byline },
          days: doc.days,
          // Feature 007: cada item a reservar ganha um id para a marca de "reservado" (ck:<cidade>:<n>).
          checklist: doc.checklist.map((c, i) => ({ id: `ck:${meta.cityId}:${i + 1}`, ...c })),
          docHtml: doc.docHtml,
          dayNotes: doc.dayNotes,
          departures: doc.departures,
          ...(doc.arrivals ? { arrivals: doc.arrivals } : {}),
          ...(doc.tips ? { tips: doc.tips } : {}),
        };
      }
      const days = readdirSync(dir)
        .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
        .sort()
        .map((f) => readJson<FullDay>(join(dir, f), {} as FullDay));
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
    ...docErrors,
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
    const acts = it.days.flatMap((d) => d.activities);
    const places = it.days.flatMap((d) => d.places ?? []);
    const tracked = acts.filter((a) => a.type !== 'transit' && a.type !== 'free').length;
    console.log(
      `roteiro FULL ${it.id}: ${it.days.length} dias, ${it.days.reduce((n, d) => n + (d.areas?.length ?? 0), 0)} áreas, ` +
        `${acts.length} atividades (${tracked} com Feito/Pendente), ${places.length} lugares, ` +
        `${places.reduce((n, p) => n + (p.photoUrls?.length ?? 0), 0)} links de fotos, ${places.reduce((n, p) => n + p.mapsUrls.length, 0)} links de mapa nos lugares`,
    );
    const dates = (r?: Record<string, unknown[]>) => Object.entries(r ?? {}).map(([d, items]) => `${d} (${items.length})`).join(', ') || 'nenhuma';
    console.log(
      `  chegadas: ${dates(Object.fromEntries(Object.entries(it.arrivals ?? {}).map(([d, a]) => [d, a.items])))}; ` +
        `partidas: ${dates(it.departures)}; reservas: ${it.checklist.length}; dicas: ${(it.tips ?? []).map((t) => `${t.title} (${t.category})`).join(', ') || 'nenhuma'}`,
    );
  }
}

if (process.argv[1] && import.meta.filename === process.argv[1]) main();
