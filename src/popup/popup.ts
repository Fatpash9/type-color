import { GLYPHS, defaultPalette, isValidColor, type Glyph, type Palette } from '../lib/palette';
import { loadPalette, savePalette } from '../lib/storage';

let palette: Palette;

function buildGrid(): void {
  const grid = document.getElementById('grid');
  if (!grid) return;
  grid.replaceChildren();
  for (const g of GLYPHS) {
    const glyphKey = g as Glyph;
    const color = palette[glyphKey] ?? '#000000';
    const cell = document.createElement('label');
    cell.className = 'cell';
    cell.style.setProperty('--color', color);
    cell.dataset.glyph = g;

    const glyph = document.createElement('span');
    glyph.textContent = g;
    glyph.setAttribute('aria-hidden', 'true');

    const input = document.createElement('input');
    input.type = 'color';
    input.value = color;
    input.dataset.glyph = g;
    input.setAttribute('aria-label', `Color for ${g}`);

    cell.append(glyph, input);
    grid.appendChild(cell);
  }
}

function onColorChange(e: Event): void {
  const target = e.target as HTMLInputElement;
  const glyph = target.dataset.glyph as Glyph | undefined;
  if (!glyph || !isValidColor(target.value)) return;
  const next = target.value.toLowerCase();
  palette[glyph] = next;
  const cell = target.closest('.cell') as HTMLElement | null;
  cell?.style.setProperty('--color', next);
  void savePalette(palette);
}

async function onReset(): Promise<void> {
  palette = defaultPalette();
  await savePalette(palette);
  buildGrid();
}

async function init(): Promise<void> {
  palette = await loadPalette();
  buildGrid();
  document.getElementById('grid')?.addEventListener('change', onColorChange);
  document.getElementById('reset')?.addEventListener('click', () => {
    void onReset();
  });
}

void init();
