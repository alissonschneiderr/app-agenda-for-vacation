// Validação do conteúdo (contracts/content-schema.md, "Regras que fazem o build falhar").
// Zod só é usado aqui, no build e nos testes; não entra no bundle do app.
import { z } from 'zod';
import type { Content } from '../src/content/types';
import { citiesForDate, isTravelDay, sightseeingDays } from '../src/domain/trip';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'data deve ser YYYY-MM-DD');
const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'hora deve ser HH:MM');
const latLng = z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) });
const interval = z.object({ open: hhmm, close: hhmm });
const nonEmpty = z.string().trim().min(1, 'não pode ser vazio');
const url = z.url();

const weeklyHours = z.object({
  mon: z.array(interval),
  tue: z.array(interval),
  wed: z.array(interval),
  thu: z.array(interval),
  fri: z.array(interval),
  sat: z.array(interval),
  sun: z.array(interval),
  exceptions: z.record(date, z.union([z.array(interval), z.literal('closed')])).optional(),
});

export const ALLOWED_LICENSE = /^(CC0|Public domain|PD\b|CC BY(-SA)? \d(\.\d)?)/i;

const photo = z.object({
  src: z.string().regex(/^photos\/[a-z0-9-]+\.webp$/),
  alt: nonEmpty,
  author: nonEmpty,
  license: nonEmpty.refine((l) => ALLOWED_LICENSE.test(l), 'licença não permitida'),
  licenseUrl: url.nullable(),
  sourceUrl: url,
});

const cityId = z.enum(['nova-york', 'orlando', 'miami']);

const point = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'id deve ser slug'),
  cityId,
  categoryId: nonEmpty,
  name: nonEmpty,
  summary: nonEmpty,
  description: nonEmpty,
  address: nonEmpty,
  location: latLng,
  openingHours: z.union([weeklyHours, z.literal('24h'), z.literal('see-official')]),
  price: nonEmpty,
  officialUrl: url.nullable(),
  photos: z.array(photo),
  status: z.enum(['active', 'temporarily-closed']),
  verifiedAt: date,
});

export const contentSchema = z.object({
  version: nonEmpty,
  cities: z.array(z.object({ id: cityId, name: nonEmpty, timeZone: nonEmpty, center: latLng })).length(3),
  trip: z.array(z.object({ cityId, arrive: date, depart: date })).min(1),
  categories: z.array(z.object({ id: nonEmpty, name: nonEmpty })).min(1),
  points: z.array(point),
  suggestedItineraries: z.array(
    z.object({
      id: z.string().regex(/^sug-\d{4}-\d{2}-\d{2}$/),
      date,
      title: nonEmpty,
      notes: z.string().optional(),
      pointIds: z.array(nonEmpty).min(1),
    }),
  ),
});

/** Os 7 parques de FR-024, cada um com um dia próprio em Orlando. */
export const ORLANDO_PARKS = [
  'orl-magic-kingdom',
  'orl-epcot',
  'orl-hollywood-studios',
  'orl-animal-kingdom',
  'orl-universal-studios',
  'orl-islands-of-adventure',
  'orl-epic-universe',
];

export const MAX_TOTAL_BYTES = 40 * 1024 * 1024;

export interface ValidateOptions {
  /** Regras de completude (19 roteiros, 7 parques, foto por ponto, orçamento). Ativadas no CI. */
  strict: boolean;
  /** Retorna true se o arquivo de foto existe em public/. */
  photoExists?: (src: string) => boolean;
  /** Tamanho total de public/data + public/photos, em bytes. */
  totalBytes?: number;
}

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export function validateContent(input: unknown, opts: ValidateOptions): string[] {
  const parsed = contentSchema.safeParse(input);
  if (!parsed.success) {
    return parsed.error.issues.map((i) => `schema: ${describePath(input, i.path)}: ${i.message}`);
  }
  const content = parsed.data as Content;
  const errors: string[] = [];
  const pointsById = new Map(content.points.map((p) => [p.id, p]));
  const categoryIds = new Set(content.categories.map((c) => c.id));
  const citiesById = new Map(content.cities.map((c) => [c.id, c]));

  if (pointsById.size !== content.points.length) {
    const seen = new Set<string>();
    for (const p of content.points) {
      if (seen.has(p.id)) errors.push(`ponto ${p.id}: id duplicado`);
      seen.add(p.id);
    }
  }

  for (const p of content.points) {
    if (!categoryIds.has(p.categoryId)) errors.push(`ponto ${p.id}: categoria inexistente "${p.categoryId}"`);
    const city = citiesById.get(p.cityId);
    if (city && distanceKm(city.center, p.location) > 120) {
      errors.push(`ponto ${p.id}: localização a mais de 120 km do centro de ${city.name}`);
    }
    if (opts.strict && p.photos.length === 0) errors.push(`ponto ${p.id}: sem foto (SC-008)`);
    if (opts.strict && opts.photoExists) {
      for (const ph of p.photos) {
        if (!opts.photoExists(ph.src)) errors.push(`ponto ${p.id}: arquivo de foto ausente ${ph.src}`);
      }
    }
  }

  const byDate = new Map<string, string>();
  for (const it of content.suggestedItineraries) {
    if (it.id !== `sug-${it.date}`) errors.push(`roteiro ${it.id}: id deve ser sug-${it.date}`);
    if (byDate.has(it.date)) errors.push(`roteiro ${it.id}: mais de um roteiro sugerido em ${it.date}`);
    byDate.set(it.date, it.id);
    if (isTravelDay(content.trip, it.date)) errors.push(`roteiro ${it.id}: dia de locomoção não pode ter roteiro sugerido`);
    const allowed = citiesForDate(content.trip, it.date);
    if (allowed.length === 0) errors.push(`roteiro ${it.id}: data fora da viagem`);
    const seen = new Set<string>();
    for (const pid of it.pointIds) {
      if (seen.has(pid)) errors.push(`roteiro ${it.id}: ponto repetido ${pid}`);
      seen.add(pid);
      const p = pointsById.get(pid);
      if (!p) errors.push(`roteiro ${it.id}: ponto inexistente ${pid}`);
      else if (allowed.length && !allowed.includes(p.cityId)) {
        errors.push(`roteiro ${it.id}: ponto ${pid} é de ${p.cityId}, não da cidade do dia`);
      }
    }
  }

  if (opts.strict) {
    const days = sightseeingDays(content.trip);
    for (const d of days) {
      if (!byDate.has(d.date)) errors.push(`roteiros: falta roteiro sugerido para ${d.date}`);
    }
    if (content.suggestedItineraries.length !== days.length) {
      errors.push(`roteiros: esperados ${days.length} roteiros sugeridos, há ${content.suggestedItineraries.length}`);
    }
    const parkDays = new Map<string, string>();
    for (const it of content.suggestedItineraries) {
      const parks = it.pointIds.filter((id) => ORLANDO_PARKS.includes(id));
      if (parks.length > 1) errors.push(`roteiro ${it.id}: mais de um parque no mesmo dia (${parks.join(', ')})`);
      for (const park of parks) parkDays.set(park, it.date);
    }
    for (const park of ORLANDO_PARKS) {
      if (!pointsById.has(park)) errors.push(`parques: ponto ${park} não existe`);
      if (!parkDays.has(park)) errors.push(`parques: ${park} sem dia próprio nos roteiros sugeridos`);
    }
    if (opts.totalBytes !== undefined && opts.totalBytes > MAX_TOTAL_BYTES) {
      errors.push(`orçamento: conteúdo tem ${(opts.totalBytes / 1048576).toFixed(1)} MB, limite 40 MB`);
    }
  }

  return errors;
}

function describePath(input: unknown, path: PropertyKey[]): string {
  // Mostra o id do ponto/roteiro em vez do índice, para mensagens legíveis.
  let node: unknown = input;
  const parts: string[] = [];
  for (const key of path) {
    node = (node as Record<PropertyKey, unknown> | undefined)?.[key];
    const id = (node as { id?: unknown } | undefined)?.id;
    parts.push(typeof key === 'number' && typeof id === 'string' ? id : String(key));
  }
  return parts.join('.');
}
