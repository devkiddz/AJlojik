'use client';

/* AJ_HUB_PRODUCT_PREVIEW_AUTHORITY_V1 */

import {
  useSyncExternalStore
} from 'react';

export type HubProductPreviewSource =
  | 'feed'
  | 'hub'
  | 'product-page'
  | 'legacy-route'
  | 'route'
  | 'deep-insight';

export type HubProductPreview = {
  productId: string;
  variantId: string | null;
  source: HubProductPreviewSource;
  reveal: boolean;
  updatedAt: string;
  requestId: string;
};

type HubProductPreviewSnapshot = {
  revision: number;
  preview: HubProductPreview | null;
};

type HubProductPreviewListener =
  () => void;

type PreviewProductInHubInput = {
  productId: string;
  variantId?: string | null;
  source: HubProductPreviewSource;
  reveal?: boolean;
};

const listeners =
  new Set<
    HubProductPreviewListener
  >();

const serverSnapshot:
  HubProductPreviewSnapshot = {
    revision: 0,
    preview: null
  };

let snapshot:
  HubProductPreviewSnapshot = {
    revision: 0,
    preview: null
  };

function normalizeId(
  value: unknown
): string {
  return String(
    value ?? ''
  ).trim();
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

function emit(): void {
  for (
    const listener of
      listeners
  ) {
    listener();
  }
}

function readSnapshot():
  HubProductPreviewSnapshot {
  return snapshot;
}

function readServerSnapshot():
  HubProductPreviewSnapshot {
  return serverSnapshot;
}

function subscribe(
  listener:
    HubProductPreviewListener
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

export function previewProductInHub({
  productId,
  variantId = null,
  source,
  reveal = true
}: PreviewProductInHubInput): void {
  const normalizedProductId =
    normalizeId(
      productId
    );

  if (!normalizedProductId) {
    return;
  }

  const normalizedVariantId =
    normalizeId(
      variantId
    ) ||
    null;

  snapshot = {
    revision:
      snapshot.revision + 1,

    preview: {
      productId:
        normalizedProductId,

      variantId:
        normalizedVariantId,

      source,

      reveal,

      updatedAt:
        new Date()
          .toISOString(),

      requestId:
        createRequestId()
    }
  };

  emit();
}

export function clearHubProductPreview(): void {
  if (!snapshot.preview) {
    return;
  }

  snapshot = {
    revision:
      snapshot.revision + 1,

    preview:
      null
  };

  emit();
}

export function readHubProductPreview():
  HubProductPreview | null {
  return snapshot.preview;
}

export function useHubProductPreview():
  HubProductPreview | null {
  return useSyncExternalStore(
    subscribe,
    readSnapshot,
    readServerSnapshot
  ).preview;
}
