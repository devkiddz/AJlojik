'use client';

/* AJ_HUB_PRODUCT_DEEP_INSIGHT_V1 */

import {
  useSyncExternalStore
} from 'react';

export type ProductDeepInsightSource =
  | 'active-product'
  | 'product-card'
  | 'product-page';

export type ProductDeepInsightRequest = {
  requestId: string;
  productId: string;
  variantId: string | null;
  source: ProductDeepInsightSource;
  openedAt: string;
};

type OpenProductDeepInsightInput = {
  productId: string;
  variantId?: string | null;
  source: ProductDeepInsightSource;
};

type ProductDeepInsightListener =
  () => void;

let currentRequest:
  ProductDeepInsightRequest |
  null =
    null;

const listeners =
  new Set<
    ProductDeepInsightListener
  >();

function emit(): void {
  for (
    const listener of
      listeners
  ) {
    listener();
  }
}

function createRequestId(): string {
  const randomPart =
    typeof crypto !==
      'undefined' &&
    'randomUUID' in
      crypto
      ? crypto.randomUUID()
      : Math.random()
          .toString(36)
          .slice(2);

  return `${Date.now()}:${randomPart}`;
}

export function openProductDeepInsight({
  productId,
  variantId,
  source
}: OpenProductDeepInsightInput): void {
  const normalizedProductId =
    String(
      productId
    ).trim();

  if (
    !normalizedProductId
  ) {
    return;
  }

  currentRequest = {
    requestId:
      createRequestId(),

    productId:
      normalizedProductId,

    variantId:
      variantId
        ? String(
            variantId
          ).trim() ||
          null
        : null,

    source,

    openedAt:
      new Date()
        .toISOString()
  };

  emit();
}

export function clearProductDeepInsight(): void {
  if (
    currentRequest ===
    null
  ) {
    return;
  }

  currentRequest =
    null;

  emit();
}

export function readProductDeepInsight():
  ProductDeepInsightRequest |
  null {
  return currentRequest;
}

export function subscribeProductDeepInsight(
  listener:
    ProductDeepInsightListener
): () => void {
  listeners.add(
    listener
  );

  return () => {
    listeners.delete(
      listener
    );
  };
}

export function useProductDeepInsight():
  ProductDeepInsightRequest |
  null {
  return useSyncExternalStore(
    subscribeProductDeepInsight,
    readProductDeepInsight,
    () => null
  );
}
