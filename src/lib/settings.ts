const KEY_DISABLED = 'disabledOrigins';

function area(): chrome.storage.StorageArea {
  return chrome.storage.sync ?? chrome.storage.local;
}

export async function loadDisabledOrigins(): Promise<Set<string>> {
  const raw = await area().get([KEY_DISABLED]);
  const list = raw[KEY_DISABLED];
  if (!Array.isArray(list)) return new Set();
  return new Set(list.filter((s): s is string => typeof s === 'string'));
}

export async function isOriginDisabled(origin: string): Promise<boolean> {
  const set = await loadDisabledOrigins();
  return set.has(origin);
}

export async function setOriginDisabled(origin: string, disabled: boolean): Promise<void> {
  const set = await loadDisabledOrigins();
  if (disabled) set.add(origin);
  else set.delete(origin);
  await area().set({ [KEY_DISABLED]: [...set] });
}
