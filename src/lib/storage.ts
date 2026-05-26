import { type Palette, defaultPalette, sanitizePalette, PALETTE_VERSION } from './palette';

const KEY_PALETTE = 'palette';
const KEY_VERSION = 'paletteVersion';

type Area = chrome.storage.StorageArea;

function area(): Area {
  return chrome.storage.sync ?? chrome.storage.local;
}

export async function loadPalette(): Promise<Palette> {
  const raw = await area().get([KEY_PALETTE, KEY_VERSION]);
  if (raw[KEY_VERSION] !== PALETTE_VERSION || !raw[KEY_PALETTE]) {
    const p = defaultPalette();
    await savePalette(p);
    return p;
  }
  return sanitizePalette(raw[KEY_PALETTE]);
}

export async function savePalette(palette: Palette): Promise<void> {
  await area().set({
    [KEY_PALETTE]: palette,
    [KEY_VERSION]: PALETTE_VERSION,
  });
}

export type PaletteListener = (palette: Palette) => void;

export function subscribePalette(listener: PaletteListener): () => void {
  const handler = (
    changes: Record<string, chrome.storage.StorageChange>,
    _areaName: string,
  ) => {
    const change = changes[KEY_PALETTE];
    if (!change) return;
    listener(sanitizePalette(change.newValue));
  };
  chrome.storage.onChanged.addListener(handler);
  return () => chrome.storage.onChanged.removeListener(handler);
}
