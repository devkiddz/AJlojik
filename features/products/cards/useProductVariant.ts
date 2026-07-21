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

  const [
    selection,
    setSelection
  ] =
    useState<VariantSelection | null>(
      null
    );

  const selectedVariantId =
    selection?.productId ===
    product.id
      ? selection.variantId
      : defaultVariant
        ? String(
            defaultVariant.id
          )
        : '';

  const selectedVariant =
    useMemo(
      () =>
        product.variants.find(
          variant =>
            String(
              variant.id
            ) ===
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
        variantId:
          string | null
      ): void => {
        if (!variantId) {
          return;
        }

        const variantExists =
          product.variants.some(
            variant =>
              String(
                variant.id
              ) ===
              variantId
          );

        if (!variantExists) {
          return;
        }

        setSelection({
          productId:
            product.id,

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
