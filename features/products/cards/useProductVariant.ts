'use client';

import {
  useCallback,
  useMemo,
  useState
} from 'react';

import type {
  ProductType
} from '@/types/types';

type VariantSelection = {
  productId: string;
  variantId: string;
};

export function useProductVariant(
  product: ProductType
) {
  /**
   * The first variant with available stock becomes the
   * default commerce variant.
   *
   * When every variant is unavailable, the first variant
   * remains available for imagery and preview purposes.
   */
  const availableVariant =
    useMemo(
      () =>
        product.variants.find(
          variant =>
            variant.stockLeft > 0
        ) ?? null,
      [product.variants]
    );

  const defaultVariant =
    availableVariant ??
    product.variants[0] ??
    null;

  const [
    selection,
    setSelection
  ] = useState<VariantSelection | null>(
    null
  );

  const selectedVariantId =
    selection?.productId === product.id
      ? selection.variantId
      : defaultVariant
        ? String(defaultVariant.id)
        : '';

  const selectedVariant =
    useMemo(
      () =>
        product.variants.find(
          variant =>
            String(variant.id) ===
            selectedVariantId
        ) ??
        defaultVariant,
      [
        defaultVariant,
        product.variants,
        selectedVariantId
      ]
    );

  const setSelectedVariantId =
    useCallback(
      (
        variantId: string | null
      ): void => {
        if (!variantId) {
          return;
        }

        const variantExists =
          product.variants.some(
            variant =>
              String(variant.id) ===
              variantId
          );

        if (!variantExists) {
          return;
        }

        setSelection({
          productId: product.id,
          variantId
        });
      },
      [
        product.id,
        product.variants
      ]
    );

  return {
    selectedVariant,
    selectedVariantId,
    setSelectedVariantId,

    /**
     * Used by compact commerce surfaces that do not expose
     * variant selection.
     */
    availableVariant,

    /**
     * A product is sold out only when none of its variants
     * has available stock.
     */
    soldOut:
      availableVariant === null
  };
}