'use client';

import { useCallback, useMemo, useState } from 'react';

import type { ProductType } from '@/types/types';

type VariantSelection = {
  productId: string;
  variantId: string;
};

export function useProductVariant(product: ProductType) {
  const defaultVariantId = String(product.variants[0]?.id ?? '');

  const [selection, setSelection] = useState<VariantSelection | null>(null);

  const selectedVariantId =
    selection?.productId === product.id ? selection.variantId : defaultVariantId;

  const selectedVariant = useMemo(
    () =>
      product.variants.find(variant => String(variant.id) === selectedVariantId) ??
      product.variants[0] ??
      null,
    [product.variants, selectedVariantId]
  );

  const selectVariant = useCallback(
    (value: string | null): void => {
      if (value !== null) {
        setSelection({
          productId: product.id,
          variantId: value
        });
      }
    },
    [product.id]
  );

  return {
    selectedVariant,
    selectedVariantId,
    setSelectedVariantId: selectVariant
  };
}
