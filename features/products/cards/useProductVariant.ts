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

  const [selection, setSelection] =
    useState<VariantSelection | null>(
      null
    );

  const requestedVariantId =
    selection?.productId === product.id
      ? selection.variantId
      : null;

  const selectedVariant =
    useMemo(
      () =>
        product.variants.find(
          variant =>
            String(variant.id) ===
            requestedVariantId
        ) ??
        defaultVariant,
      [
        defaultVariant,
        product.variants,
        requestedVariantId
      ]
    );

  const selectedVariantId =
    selectedVariant
      ? String(selectedVariant.id)
      : '';

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

    availableVariant,

    soldOut:
      availableVariant === null
  };
}
