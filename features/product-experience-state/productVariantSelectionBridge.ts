'use client';

/* AJ_SHARED_PRODUCT_VARIANT_SELECTION_V1 */

import {
  useSyncExternalStore
} from 'react';

export type ProductVariantSelectionSource =
  | 'route'
  | 'product-page'
  | 'hub'
  | 'feed'
  | 'deep-insight';

export type ProductVariantSelection = {
  productId: string;
  variantId: string;
  source: ProductVariantSelectionSource;
  updatedAt: string;
  requestId: string;
};

type ProductVariantSelectionSnapshot = {
  revision: number;
  selections: Readonly<
    Record<
      string,
      ProductVariantSelection
    >
  >;
};

type ProductVariantSelectionListener =
  () => void;

type SelectProductVariantInput = {
  productId: string;
  variantId: string;
  source: ProductVariantSelectionSource;
};

const listeners =
  new Set<
    ProductVariantSelectionListener
  >();

const serverSnapshot:
  ProductVariantSelectionSnapshot = {
    revision: 0,
    selections: {}
  };

let snapshot:
  ProductVariantSelectionSnapshot = {
    revision: 0,
    selections: {}
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
  ProductVariantSelectionSnapshot {
  return snapshot;
}

function readServerSnapshot():
  ProductVariantSelectionSnapshot {
  return serverSnapshot;
}

function subscribe(
  listener:
    ProductVariantSelectionListener
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

export function selectProductVariant({
  productId,
  variantId,
  source
}: SelectProductVariantInput): void {
  const normalizedProductId =
    normalizeId(
      productId
    );

  const normalizedVariantId =
    normalizeId(
      variantId
    );

  if (
    !normalizedProductId ||
    !normalizedVariantId
  ) {
    return;
  }

  const current =
    snapshot.selections[
      normalizedProductId
    ];

  if (
    current?.variantId ===
      normalizedVariantId &&
    current.source === source
  ) {
    return;
  }

  const nextSelection:
    ProductVariantSelection = {
      productId:
        normalizedProductId,

      variantId:
        normalizedVariantId,

      source,

      updatedAt:
        new Date()
          .toISOString(),

      requestId:
        createRequestId()
    };

  const nextSelections = {
    ...snapshot.selections,
    [normalizedProductId]:
      nextSelection
  };

  const selectionIds =
    Object.keys(
      nextSelections
    );

  if (
    selectionIds.length >
    100
  ) {
    const oldestProductId =
      selectionIds
        .map(
          id =>
            nextSelections[
              id
            ]
        )
        .sort(
          (
            firstSelection,
            secondSelection
          ) =>
            firstSelection
              .updatedAt
              .localeCompare(
                secondSelection
                  .updatedAt
              )
        )[0]
        ?.productId;

    if (
      oldestProductId &&
      oldestProductId !==
        normalizedProductId
    ) {
      delete nextSelections[
        oldestProductId
      ];
    }
  }

  snapshot = {
    revision:
      snapshot.revision + 1,

    selections:
      nextSelections
  };

  emit();
}

export function clearProductVariantSelection(
  productIdInput?: string | null
): void {
  const productId =
    normalizeId(
      productIdInput
    );

  if (!productId) {
    if (
      Object.keys(
        snapshot.selections
      ).length === 0
    ) {
      return;
    }

    snapshot = {
      revision:
        snapshot.revision + 1,

      selections: {}
    };

    emit();

    return;
  }

  if (
    !snapshot.selections[
      productId
    ]
  ) {
    return;
  }

  const remainingSelections = {
    ...snapshot.selections
  };

  delete remainingSelections[
    productId
  ];

  snapshot = {
    revision:
      snapshot.revision + 1,

    selections:
      remainingSelections
  };

  emit();
}

export function readProductVariantSelection(
  productIdInput:
    | string
    | null
    | undefined
): ProductVariantSelection | null {
  const productId =
    normalizeId(
      productIdInput
    );

  if (!productId) {
    return null;
  }

  return (
    snapshot.selections[
      productId
    ] ??
    null
  );
}

export function useProductVariantSelection(
  productIdInput:
    | string
    | null
    | undefined
): ProductVariantSelection | null {
  const currentSnapshot =
    useSyncExternalStore(
      subscribe,
      readSnapshot,
      readServerSnapshot
    );

  const productId =
    normalizeId(
      productIdInput
    );

  if (!productId) {
    return null;
  }

  return (
    currentSnapshot
      .selections[
        productId
      ] ??
    null
  );
}
