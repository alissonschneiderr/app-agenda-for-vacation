// Feature 014 (R6): telas de abertura do iPhone instalado — o ícone do app sobre o papel (#faf8f5).
// Rodar com `npm run splash` quando o ícone mudar; os PNGs ficam em public/splash/.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const root = join(import.meta.dirname, '..');
const out = join(root, 'public', 'splash');
const SIZES: [number, number][] = [
  [1206, 2622], // iPhone 17 (402 × 874 @3)
  [1320, 2868], // iPhone 17 Pro Max / Air (440 × 956 @3)
];

mkdirSync(out, { recursive: true });
for (const [w, h] of SIZES) {
  const icon = Math.round(w * 0.3);
  const logo = await sharp(join(root, 'public', 'icons', 'icon-512.png')).resize(icon, icon).png().toBuffer();
  await sharp({ create: { width: w, height: h, channels: 4, background: '#faf8f5' } })
    .composite([{ input: logo, left: Math.round((w - icon) / 2), top: Math.round((h - icon) / 2) }])
    .png({ compressionLevel: 9 })
    .toFile(join(out, `iphone-${w}x${h}.png`));
  console.log(`splash/iphone-${w}x${h}.png`);
}
