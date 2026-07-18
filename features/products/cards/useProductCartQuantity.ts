'use client';

import { useMemo } from 'react';

import { useCart } from '@/features/cart';

export function useProductCartQuantity(
  productId: string
) {
  const {
    items,
    mutating
  } = useCart();

  const quantity = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          String(item.productId) ===
          String(productId)
            ? total + item.quantity
            : total,
        0
      ),
    [
      items,
      productId
    ]
  );

  return {
    quantity,
    cartMutating: mutating
  };
}