export const STORE_STUDIO_REFRESH_EVENT =
  'rcentz:store-studio-refresh';

export function requestStoreStudioRefresh(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new Event(STORE_STUDIO_REFRESH_EVENT)
  );
}
