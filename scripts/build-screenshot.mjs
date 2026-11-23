import sharp from 'sharp';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const outDir = join(root, 'store-assets');
mkdirSync(outDir, { recursive: true });

// --- palette generation, mirrors src/lib/palette.ts (S=80, L=47) ---
const GLYPHS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function hslToHex(h, s, l) {
  const sN = s / 100;
  const lN = l / 100;
  const c = (1 - Math.abs(2 * lN - 1)) * sN;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lN - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const palette = {};
for (let i = 0; i < GLYPHS.length; i++) {
  palette[GLYPHS[i]] = hslToHex(Math.round((i * 360) / GLYPHS.length), 80, 47);
}

function colorFor(ch) {
  if (ch >= '0' && ch <= '9') return palette[ch];
  if (ch >= 'A' && ch <= 'Z') return palette[ch];
  if (ch >= 'a' && ch <= 'z') return palette[ch.toUpperCase()];
  return '#2a2a2a';
}

function esc(ch) {
  if (ch === '&') return '&amp;';
  if (ch === '<') return '&lt;';
  if (ch === '>') return '&gt;';
  return ch;
}

function recoloredLine(text, x, y, size) {
  const spans = [...text]
    .map((ch) => `<tspan fill="${colorFor(ch)}">${esc(ch)}</tspan>`)
    .join('');
  return `<text x="${x}" y="${y}" font-family="sans-serif" font-size="${size}" font-weight="700" xml:space="preserve">${spans}</text>`;
}

// --- canvas ---
const W = 1280;
const H = 800;
const parts = [];

parts.push(`<rect width="${W}" height="${H}" fill="#ece9e3"/>`);

// title + subtitle
parts.push(
  `<text x="${W / 2}" y="96" text-anchor="middle" font-family="sans-serif" font-size="48" font-weight="700" fill="#2a2a2a">Type Color</text>`,
);
parts.push(
  `<text x="${W / 2}" y="138" text-anchor="middle" font-family="sans-serif" font-size="21" fill="#6b6b6b">Every letter and number in your own colors.</text>`,
);

// --- left card: recolored text demo ---
const lc = { x: 72, y: 200, w: 560, h: 540 };
// faux shadow
parts.push(`<rect x="${lc.x + 4}" y="${lc.y + 6}" width="${lc.w}" height="${lc.h}" rx="16" fill="#00000014"/>`);
parts.push(`<rect x="${lc.x}" y="${lc.y}" width="${lc.w}" height="${lc.h}" rx="16" fill="#ffffff" stroke="#e2e0db"/>`);

const lines = [
  'The quick brown fox',
  'jumps over 13 lazy dogs.',
  'Order #4096 ships',
  'on May 27, 2026.',
  'Call 555-0123 for',
  'tracking details.',
];
let ty = lc.y + 86;
const tx = lc.x + 48;
for (const line of lines) {
  parts.push(recoloredLine(line, tx, ty, 34));
  ty += 72;
}

// --- right side: popup mock ---
const pw = 452;
const ph = 312;
const px = 760 + ((1280 - 760 - pw) / 2);
const py = lc.y + (lc.h - ph) / 2;
const pad = 22;

parts.push(`<rect x="${px + 4}" y="${py + 6}" width="${pw}" height="${ph}" rx="14" fill="#00000018"/>`);
parts.push(`<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="14" fill="#f7f6f3" stroke="#d8d6d2"/>`);

// popup header
parts.push(
  `<text x="${px + pad}" y="${py + pad + 16}" font-family="sans-serif" font-size="17" font-weight="600" fill="#2a2a2a">Type Color</text>`,
);
parts.push(
  `<text x="${px + pad}" y="${py + pad + 38}" font-family="sans-serif" font-size="12.5" fill="#6b6b6b">Click a letter or number to set its color.</text>`,
);

// grid
const cols = 10;
const gap = 6;
const gx = px + pad;
const gy = py + pad + 54;
const cell = (pw - pad * 2 - gap * (cols - 1)) / cols;
for (let i = 0; i < GLYPHS.length; i++) {
  const g = GLYPHS[i];
  const col = i % cols;
  const row = Math.floor(i / cols);
  const cx = gx + col * (cell + gap);
  const cy = gy + row * (cell + gap);
  parts.push(`<rect x="${cx}" y="${cy}" width="${cell}" height="${cell}" rx="5" fill="#ffffff" stroke="#d8d6d2"/>`);
  parts.push(
    `<text x="${cx + cell / 2}" y="${cy + cell / 2 + 6}" text-anchor="middle" font-family="Georgia, serif" font-size="18" font-weight="500" fill="${palette[g]}">${g}</text>`,
  );
}

// footer links
const fy = gy + 4 * cell + 3 * gap + 26;
parts.push(
  `<text x="${px + pad}" y="${fy}" font-family="sans-serif" font-size="12" fill="#6b6b6b">Import</text>`,
);
parts.push(
  `<text x="${px + pad + 58}" y="${fy}" font-family="sans-serif" font-size="12" fill="#6b6b6b">Export</text>`,
);
parts.push(
  `<text x="${px + pw - pad}" y="${fy}" text-anchor="end" font-family="sans-serif" font-size="12" fill="#6b6b6b">Reset palette</text>`,
);

const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${parts.join('')}</svg>`;

const out = join(outDir, 'screenshot-1.png');
await sharp(Buffer.from(svg), { density: 144 })
  .resize(W, H, { fit: 'fill' })
  .png()
  .toFile(out);
console.log(`wrote ${out}`);

// --- small promo tile, 440x280 ---
const TW = 440;
const TH = 280;
const iconSvg = readFileSync(join(root, 'assets', 'icon.svg'), 'utf8');
const iconInner = iconSvg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const tile = [
  `<rect width="${TW}" height="${TH}" fill="#ece9e3"/>`,
  `<g transform="translate(40 76)">${iconInner}</g>`,
  `<text x="196" y="128" font-family="sans-serif" font-size="34" font-weight="700" fill="#2a2a2a">Type Color</text>`,
  recoloredLine('Aa Bb 123', 196, 180, 34),
].join('');
const tileSvg = `<svg width="${TW}" height="${TH}" xmlns="http://www.w3.org/2000/svg">${tile}</svg>`;
const tileOut = join(outDir, 'promo-small-440x280.png');
await sharp(Buffer.from(tileSvg), { density: 144 })
  .resize(TW, TH, { fit: 'fill' })
  .png()
  .toFile(tileOut);
console.log(`wrote ${tileOut}`);
