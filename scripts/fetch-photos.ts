// Baixa as fotos dos pontos da Wikimedia Commons, gera WebP de 1200 px e grava os créditos
// (npm run photos). Cada foto de content/points/*.json tem `ref`:
//   "File:Nome.jpg"   → arquivo da Commons
//   "wiki:Artigo"     → foto principal livre do artigo da Wikipédia em inglês (ou outra foto livre do artigo)
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { ALLOWED_LICENSE } from './content-schema';
import { photoKey, type PhotoCredit, type PointSource } from './build-content';

const root = join(import.meta.dirname, '..');
const pointsDir = join(root, 'content', 'points');
const creditsPath = join(root, 'content', 'photo-credits.json');
const photosDir = join(root, 'public', 'photos');
const UA = 'city-tourist-help-app/0.1 (personal travel PWA; photo credits shown in app)';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function getJson(url: string): Promise<any> {
  for (let attempt = 0; attempt < 6; attempt++) {
    await sleep(400); // a API da Wikimedia limita requisições em sequência
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (r.status === 429 || r.status >= 500) {
      const retryAfter = Number(r.headers.get('retry-after'));
      await sleep(retryAfter > 0 ? retryAfter * 1000 : 2000 * 2 ** attempt);
      continue;
    }
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return r.json();
  }
  throw new Error(`muitas tentativas: ${url}`);
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

interface FileInfo {
  title: string;
  thumbUrl: string;
  width: number;
  author: string;
  license: string;
  licenseUrl: string | null;
  sourceUrl: string;
}

async function commonsInfo(fileTitle: string): Promise<FileInfo | null> {
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo' +
    `&iiprop=url|extmetadata|size&iiurlwidth=1200&titles=${encodeURIComponent(fileTitle)}`;
  const data = await getJson(url);
  const page: any = Object.values(data.query?.pages ?? {})[0];
  const info = page?.imageinfo?.[0];
  if (!info) return null;
  const meta = info.extmetadata ?? {};
  const license = stripHtml(meta.LicenseShortName?.value ?? '');
  if (!ALLOWED_LICENSE.test(license)) return null;
  const author = stripHtml(meta.Artist?.value ?? meta.Credit?.value ?? '') || 'Autor desconhecido';
  return {
    title: page.title,
    thumbUrl: info.thumburl ?? info.url,
    width: info.width,
    author: author.slice(0, 120),
    license,
    licenseUrl: meta.LicenseUrl?.value ?? null,
    sourceUrl: info.descriptionurl,
  };
}

async function articleCandidates(article: string): Promise<string[]> {
  const base = 'https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1';
  const lead = await getJson(`${base}&prop=pageimages&piprop=name&pilicense=free&titles=${encodeURIComponent(article)}`);
  const leadPage: any = Object.values(lead.query?.pages ?? {})[0];
  const names: string[] = leadPage?.pageimage ? [`File:${leadPage.pageimage}`] : [];
  const imgs = await getJson(`${base}&prop=images&imlimit=40&titles=${encodeURIComponent(article)}`);
  const imgPage: any = Object.values(imgs.query?.pages ?? {})[0];
  for (const im of imgPage?.images ?? []) {
    if (/\.(jpe?g)$/i.test(im.title) && !names.includes(im.title)) names.push(im.title);
  }
  return names;
}

async function resolve(ref: string, exclude: Set<string>): Promise<FileInfo | null> {
  const candidates = ref.startsWith('wiki:') ? await articleCandidates(ref.slice(5)) : [ref];
  for (const title of candidates) {
    if (exclude.has(title)) continue;
    const info = await commonsInfo(title);
    if (info && info.width >= 640) return info;
  }
  return null;
}

async function main() {
  mkdirSync(photosDir, { recursive: true });
  const credits: Record<string, PhotoCredit> = existsSync(creditsPath)
    ? JSON.parse(readFileSync(creditsPath, 'utf8'))
    : {};
  const points = readdirSync(pointsDir)
    .filter((f) => f.endsWith('.json'))
    .flatMap((f) => JSON.parse(readFileSync(join(pointsDir, f), 'utf8')) as PointSource[]);

  const jobs: { key: string; ref: string; pointId: string; index: number }[] = [];
  for (const p of points) {
    p.photos.forEach((ph, i) => {
      const key = photoKey(p.id, i);
      const c = credits[key];
      if (c && c.ref === ph.ref && existsSync(join(root, 'public', c.src))) return; // idempotente
      jobs.push({ key, ref: ph.ref, pointId: p.id, index: i });
    });
  }
  console.log(`${jobs.length} foto(s) para baixar`);

  const failures: string[] = [];
  let next = 0;
  async function worker() {
    while (next < jobs.length) {
      const job = jobs[next++]!;
      try {
        // Não repetir o mesmo arquivo em duas fotos do mesmo ponto.
        const used = new Set(
          Object.entries(credits)
            .filter(([k]) => k.startsWith(`${job.pointId}-`) && k !== job.key)
            .map(([, c]) => c.sourceUrl.replace('https://commons.wikimedia.org/wiki/', '').replace(/_/g, ' ')),
        );
        const info = await resolve(job.ref, used);
        if (!info) throw new Error('nenhuma foto com licença livre encontrada');
        const r = await fetch(info.thumbUrl, { headers: { 'User-Agent': UA } });
        if (!r.ok) throw new Error(`download ${r.status}`);
        const src = `photos/${job.key}.webp`;
        await sharp(Buffer.from(await r.arrayBuffer()))
          .rotate()
          .resize({ width: 1200, withoutEnlargement: true })
          .webp({ quality: 72 })
          .toFile(join(root, 'public', src));
        credits[job.key] = {
          ref: job.ref,
          src,
          author: info.author,
          license: info.license,
          licenseUrl: info.licenseUrl,
          sourceUrl: info.sourceUrl,
        };
        console.log(`✓ ${job.key} ← ${info.title} (${info.license})`);
      } catch (e) {
        failures.push(`${job.key} (${job.ref}): ${(e as Error).message}`);
        console.error(`✗ ${job.key} (${job.ref}): ${(e as Error).message}`);
      }
    }
  }
  await worker();
  const sorted = Object.fromEntries(Object.entries(credits).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(creditsPath, JSON.stringify(sorted, null, 2) + '\n');
  if (failures.length) {
    console.error(`\n${failures.length} falha(s). Troque o ref dessas fotos e rode de novo.`);
    process.exit(1);
  }
}

void main();
