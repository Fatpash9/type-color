import sharp from 'sharp';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const svgPath = join(root, 'assets', 'icon.svg');
const outDir = join(root, 'public', 'icons');
const sizes = [16, 32, 48, 128];

mkdirSync(outDir, { recursive: true });
const svg = readFileSync(svgPath);

await Promise.all(
  sizes.map(async (size) => {
    const out = join(outDir, `icon-${size}.png`);
    await sharp(svg, { density: 384 })
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile(out);
    console.log(`wrote ${out}`);
  }),
);
