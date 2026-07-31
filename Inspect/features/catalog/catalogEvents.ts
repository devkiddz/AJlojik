export const CATALOG_REFRESH_EVENT = 'rcentz:catalog-refresh';
export const CATALOG_REFRESH_STORAGE_KEY = 'rcentz:catalog-refresh-at';

export function requestCatalogRefresh(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(CATALOG_REFRESH_EVENT));

  try {
    window.localStorage.setItem(CATALOG_REFRESH_STORAGE_KEY, String(Date.now()));
  } catch {
    // Catalog refresh must still work when browser storage is unavailable.
  }
}
