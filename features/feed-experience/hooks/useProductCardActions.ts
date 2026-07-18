'use client';

import {
  useCallback,
  useMemo
} from 'react';

import type {
  FeedActions
} from '../contracts';

import type {
  ProductType,
  ProductVariantType
} from '@/types/types';

export type ProductCardActionAdapter = {
  onPreview: (
    product: ProductType
  ) => void;

  onOpenExperience: (
    product: ProductType
  ) => void;

  onAddToCart: (
    product: ProductType,
    variant: ProductVariantType
  ) => void;
};

export function useProductCardActions(
  actions: FeedActions
): ProductCardActionAdapter {
  const onPreview = useCallback(
    (product: ProductType) => {
      actions.previewProduct(product);
    },
    [actions]
  );

  const onOpenExperience = useCallback(
    (product: ProductType) => {
      actions.openExperience({
        type: 'product',
        productId: product.id
      });
    },
    [actions]
  );

  const onAddToCart = useCallback(
    (
      product: ProductType,
      variant: ProductVariantType
    ) => {
      actions.addToCart(
        product,
        variant
      );
    },
    [actions]
  );

  return useMemo(
    () => ({
      onPreview,
      onOpenExperience,
      onAddToCart
    }),
    [
      onPreview,
      onOpenExperience,
      onAddToCart
    ]
  );
}