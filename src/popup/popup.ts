import {
  GLYPHS,
  PALETTE_VERSION,
  defaultPalette,
  isValidColor,
  sanitizePalette,
  type Glyph,
  type Palette,
} from '../lib/palette';
import { loadPalette, savePalette } from '../lib/storage';
import { isOriginDisabled, setOriginDisabled } from '../lib/settings';

const PALETTE_FORMAT = 'type-color-palette';

let palette: Palette;
let statusTimer: number | undefined;

function $(id: string): HTMLElement | null {
  return document.getElementById(id);
}

function setStatus(text: string): void {
  const el = $('status');
  if (!el) return;
  el.textContent = text;
  if (statusTimer) clearTimeout(statusTimer);
  statusTimer = window.setTimeout(() => {
    el.textContent = '';
  }, 3000);
}

function buildGrid(): void {
  const grid = $('grid');
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
  setStatus('Palette reset.');
}

function exportPalette(): void {
  const data = {
    format: PALETTE_FORMAT,
    version: PALETTE_VERSION,
    palette,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'type-color-palette.json';
  a.click();
  URL.revokeObjectURL(url);
  setStatus('Palette exported.');
}

function showImport(): void {
  $('grid')!.hidden = true;
  $('site-row')!.hidden = true;
  $('import-panel')!.hidden = false;
  ($('import-text') as HTMLTextAreaElement).focus();
}

async function hideImport(): Promise<void> {
  ($('import-text') as HTMLTextAreaElement).value = '';
  $('grid')!.hidden = false;
  $('import-panel')!.hidden = true;
  await refreshSiteRow();
}

async function applyImport(): Promise<void> {
  const text = ($('import-text') as HTMLTextAreaElement).value.trim();
  if (!text) {
    setStatus('Paste palette JSON first.');
    return;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    setStatus('Could not parse JSON.');
    return;
  }
  if (!parsed || typeof parsed !== 'object') {
    setStatus('Not a palette file.');
    return;
  }
  const obj = parsed as Record<string, unknown>;
  if (obj.format !== PALETTE_FORMAT) {
    setStatus('Not a Type Color palette.');
    return;
  }
  palette = sanitizePalette(obj.palette);
  await savePalette(palette);
  buildGrid();
  await hideImport();
  setStatus('Palette imported.');
}

async function getActiveOrigin(): Promise<{ origin: string; hostname: string } | null> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (!tab?.url) return null;
  try {
    const u = new URL(tab.url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return { origin: u.origin, hostname: u.hostname };
  } catch {
    return null;
  }
}

async function refreshSiteRow(): Promise<void> {
  const info = await getActiveOrigin();
  const row = $('site-row');
  if (!row) return;
  if (!info) {
    row.hidden = true;
    return;
  }
  const toggle = $('site-toggle') as HTMLInputElement | null;
  const host = $('site-host');
  if (!toggle || !host) return;
  host.textContent = info.hostname;
  toggle.checked = !(await isOriginDisabled(info.origin));
  row.hidden = false;
  toggle.onchange = () => {
    void setOriginDisabled(info.origin, !toggle.checked);
  };
}

async function init(): Promise<void> {
  palette = await loadPalette();
  buildGrid();
  $('grid')?.addEventListener('change', onColorChange);
  $('reset')?.addEventListener('click', () => void onReset());
  $('export')?.addEventListener('click', exportPalette);
  $('import')?.addEventListener('click', showImport);
  $('import-apply')?.addEventListener('click', () => void applyImport());
  $('import-cancel')?.addEventListener('click', () => void hideImport());
  void refreshSiteRow();
}

void init();
