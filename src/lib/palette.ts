export const GLYPHS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ' as const;
export type Glyph = (typeof GLYPHS)[number];

export type Palette = Record<Glyph, string>;

export const PALETTE_VERSION = 1;

export function isGlyph(ch: string): ch is Glyph {
  return ch.length === 1 && GLYPHS.includes(ch);
}

export function normalizeGlyph(ch: string): Glyph | null {
  if (ch.length !== 1) return null;
  if (ch >= '0' && ch <= '9') return ch as Glyph;
  if (ch >= 'A' && ch <= 'Z') return ch as Glyph;
  if (ch >= 'a' && ch <= 'z') return ch.toUpperCase() as Glyph;
  return null;
}

function hslToHex(h: number, s: number, l: number): string {
  const sN = s / 100;
  const lN = l / 100;
  const c = (1 - Math.abs(2 * lN - 1)) * sN;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lN - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60)       { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function defaultPalette(): Palette {
  const out = {} as Palette;
  for (let i = 0; i < GLYPHS.length; i++) {
    const glyph = GLYPHS[i] as Glyph;
    const hue = Math.round((i * 360) / GLYPHS.length);
    out[glyph] = hslToHex(hue, 80, 47);
  }
  return out;
}

export function isValidColor(s: unknown): s is string {
  return typeof s === 'string' && /^#[0-9a-fA-F]{6}$/.test(s);
}

export function sanitizePalette(input: unknown): Palette {
  const base = defaultPalette();
  if (!input || typeof input !== 'object') return base;
  const obj = input as Record<string, unknown>;
  for (const glyph of GLYPHS) {
    const v = obj[glyph];
    if (isValidColor(v)) base[glyph as Glyph] = v.toLowerCase();
  }
  return base;
}
