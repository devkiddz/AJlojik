import type { CartItem } from '../cartTypes';

export function calculateCartItemCount(
  items: CartItem[]
): number {
  return items.length;
}

export function calculateCartQuantity(
  items: CartItem[]
): number {
  return items.reduce(
    (total, item) => total + item.quantity,
    0
  );
}

export function calculateCartSubtotal(
  items: CartItem[]
): number {
  return items.reduce(
    (total, item) =>
      total +
      Number(item.variant.price) * item.quantity,
    0
  );
}