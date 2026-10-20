// Orçamento de tamanho (npm run budget, depois do build): JS inicial < 100 KB gzip e conteúdo ≤ 40 MB.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { MAX_TOTAL_BYTES } from './content-schema';

const root = join(import.meta.dirname, '..');
const dist = join(root, 'dist');
const MAX_INITIAL_JS_GZIP = 100 * 1024;

function dirBytes(dir: string): number {
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).reduce((sum, f) => {
    const s = statSync(join(dir, f));
    return sum + (s.isDirectory() ? dirBytes(join(dir, f)) : s.size);
  }, 0);
}

const html = readFileSync(join(dist, 'index.html'), 'utf8');
// JS inicial = scripts e modulepreloads referenciados pelo index.html (Leaflet é carregado sob demanda).
const initial = [...html.matchAll(/(?:src|href)="([^"]+\.js)"/g)].map((m) => m[1]!.replace(/^.*?assets\//, 'assets/'));
const jsGzip = initial.reduce((sum, f) => sum + gzipSync(readFileSync(join(dist, f))).length, 0);
const contentBytes = dirBytes(join(dist, 'photos')) + dirBytes(join(dist, 'data'));

console.log(`JS inicial: ${(jsGzip / 1024).toFixed(1)} KB gzip (limite 100 KB) — ${initial.join(', ')}`);
console.log(`Conteúdo (fotos + dados): ${(contentBytes / 1048576).toFixed(1)} MB (limite 40 MB)`);

const errors: string[] = [];
if (jsGzip > MAX_INITIAL_JS_GZIP) errors.push('JS inicial acima de 100 KB gzip');
if (contentBytes > MAX_TOTAL_BYTES) errors.push('conteúdo acima de 40 MB');
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
