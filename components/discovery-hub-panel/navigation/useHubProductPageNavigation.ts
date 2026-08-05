'use client';

/* AJ_HUB_TO_PRODUCT_PAGE_AUTHORITY_V1 */

import {
  useCallback
} from 'react';

import {
  useRouter
} from 'next/navigation';

import {
  previewProductInHub
} from '@/features/product-experience-state/hubProductPreviewBridge';

import {
  selectProductVariant
} from '@/features/product-experience-state';

import type {
  ProductType
} from '@/types/types';

export function useHubProductPageNavigation() {
  const router =
    useRouter();

  return useCallback(
    (
      product:
        ProductType,
      preferredVariantId?:
        string |
        null
    ): void => {
      const preferredVariant =
        preferredVariantId
          ? product.variants.find(
              variant =>
                variant.id ===
                  preferredVariantId &&
                variant.stockLeft >
                  0
            )
          : undefined;

      const variant =
        preferredVariant ??
        product.variants.find(
          candidate =>
            candidate.stockLeft >
            0
        ) ??
        product.variants[0];

      if (variant) {
        selectProductVariant({
          productId:
            product.id,

          variantId:
            variant.id,

          source:
            'hub'
        });
      }

      previewProductInHub({
        productId:
          product.id,

        variantId:
          variant?.id ??
          null,

        source:
          'hub',

        reveal:
          false
      });

      router.push(
        `/products/${encodeURIComponent(product.slug)}`
      );
    },
    [
      router
    ]
  );
}
