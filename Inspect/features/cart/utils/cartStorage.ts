import type { CartItem } from '../cartTypes';

const GUEST_CART_STORAGE_KEY =
  'aj_logik_guest_cart';

export function readGuestCartStorage(): CartItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(
      GUEST_CART_STORAGE_KEY
    );

    if (!storedValue) {
      return [];
    }

    const parsedValue: unknown =
      JSON.parse(storedValue);

    return Array.isArray(parsedValue)
      ? (parsedValue as CartItem[])
      : [];
  } catch {
    return [];
  }
}

export function writeGuestCartStorage(
  items: CartItem[]
): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    GUEST_CART_STORAGE_KEY,
    JSON.stringify(items)
  );
}

export function clearGuestCartStorage(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(
    GUEST_CART_STORAGE_KEY
  );
}