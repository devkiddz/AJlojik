import type {
  ProductType
} from '@/types/types';

import type {
  ContinuityProduct,
  ContinuitySource,
  ResolveContinuityProductsInput
} from './continuityTypes';

const SOURCE_LABELS: Record<
  ContinuitySource,
  string
> = {
  similar:
    'Similar',
  recent:
    'Recently viewed',
  'shopping-list':
    'From your list',
  wishlist:
    'Wishlist',
  activity:
    'From your activity',
  catalog:
    'Keep discovering'
};

const SOURCE_ORDER:
  ContinuitySource[] = [
    'similar',
    'recent',
    'shopping-list',
    'wishlist',
    'activity',
    'catalog'
  ];

function available(
  product: ProductType
) {
  return product.variants.some(
    variant =>
      variant.stockLeft >
      0
  );
}

function hash(
  value: string
) {
  let result =
    2166136261;

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    result ^=
      value.charCodeAt(
        index
      );

    result =
      Math.imul(
        result,
        16777619
      );
  }

  return result >>> 0;
}

function productIdentity(
  product: ProductType
) {
  return String(
    product.id
  );
}

function sourceScore(
  source: ContinuitySource
) {
  switch (
    source
  ) {
    case 'similar':
      return 600;

    case 'recent':
      return 500;

    case 'shopping-list':
      return 420;

    case 'wishlist':
      return 360;

    case 'activity':
      return 280;

    default:
      return 100;
  }
}

function similarityScore(
  product: ProductType,
  current: ProductType | null
) {
  if (!current) {
    return 0;
  }

  let score =
    product.category ===
    current.category
      ? 180
      : 0;

  const currentTags =
    new Set(
      current.tags.map(
        tag =>
          tag.toLowerCase()
      )
    );

  score +=
    product.tags.reduce(
      (
        total,
        tag
      ) =>
        total +
        (
          currentTags.has(
            tag.toLowerCase()
          )
            ? 30
            : 0
        ),
      0
    );

  return score;
}

function uniqueIds(
  values: string[]
) {
  return [
    ...new Set(
      values.map(
        value =>
          String(
            value
          )
      )
    )
  ];
}

export function resolveContinuityProducts({
  products,
  currentProductId =
    null,
  recentProductIds,
  activityProductIds,
  wishlistProductIds,
  shoppingListProductIds,
  stableSeed,
  limit =
    10
}: ResolveContinuityProductsInput): ContinuityProduct[] {
  const currentId =
    currentProductId
      ? String(
          currentProductId
        )
      : null;

  const currentProduct =
    currentId
      ? products.find(
          product =>
            productIdentity(
              product
            ) ===
            currentId
        ) ??
        null
      : null;

  const availableProducts =
    products.filter(
      product =>
        available(
          product
        ) &&
        productIdentity(
          product
        ) !==
          currentId
    );

  const productById =
    new Map(
      availableProducts.map(
        product => [
          productIdentity(
            product
          ),
          product
        ]
      )
    );

  const buckets =
    new Map<
      ContinuitySource,
      ContinuityProduct[]
    >();

  function add(
    source: ContinuitySource,
    candidates: ProductType[],
    extraScore = 0
  ) {
    const resolved =
      candidates
        .filter(
          product =>
            productById.has(
              productIdentity(
                product
              )
            )
        )
        .map(
          product => ({
            product,
            source,
            sourceLabel:
              SOURCE_LABELS[
                source
              ],
            score:
              sourceScore(
                source
              ) +
              extraScore +
              similarityScore(
                product,
                currentProduct
              ) +
              Math.round(
                product.rating *
                10
              ) +
              Math.min(
                product.soldCount,
                100
              ),
            stableOrder:
              hash(
                `${stableSeed}:${source}:${productIdentity(
                  product
                )}`
              )
          })
        )
        .sort(
          (
            first,
            second
          ) =>
            second.score -
              first.score ||
            first.stableOrder -
              second.stableOrder
        )
        .map(
          candidate => {
            const {
              stableOrder,
              ...item
            } = candidate;

            void stableOrder;

            return item;
          }
        );

    buckets.set(
      source,
      resolved
    );
  }

  if (
    currentProduct
  ) {
    add(
      'similar',
      availableProducts.filter(
        product =>
          product.category ===
            currentProduct.category ||
          product.tags.some(
            tag =>
              currentProduct.tags.some(
                currentTag =>
                  currentTag.toLowerCase() ===
                  tag.toLowerCase()
              )
          )
      ),
      80
    );
  } else {
    add(
      'similar',
      []
    );
  }

  const productsFromIds = (
    ids: string[]
  ) =>
    uniqueIds(
      ids
    )
      .map(
        id =>
          productById.get(
            id
          )
      )
      .filter(
        (
          product
        ): product is ProductType =>
          Boolean(
            product
          )
      );

  add(
    'recent',
    productsFromIds(
      recentProductIds
    )
  );

  add(
    'shopping-list',
    productsFromIds(
      shoppingListProductIds
    )
  );

  add(
    'wishlist',
    productsFromIds(
      wishlistProductIds
    )
  );

  add(
    'activity',
    productsFromIds(
      activityProductIds
    )
  );

  add(
    'catalog',
    availableProducts
  );

  const selected:
    ContinuityProduct[] = [];

  const seen =
    new Set<string>();

  let madeProgress =
    true;

  while (
    selected.length <
      limit &&
    madeProgress
  ) {
    madeProgress =
      false;

    for (
      const source of
      SOURCE_ORDER
    ) {
      const bucket =
        buckets.get(
          source
        ) ??
        [];

      while (
        bucket.length
      ) {
        const candidate =
          bucket.shift();

        if (!candidate) {
          break;
        }

        const id =
          productIdentity(
            candidate.product
          );

        if (
          seen.has(
            id
          )
        ) {
          continue;
        }

        seen.add(
          id
        );

        selected.push(
          candidate
        );

        madeProgress =
          true;

        break;
      }

      if (
        selected.length >=
        limit
      ) {
        break;
      }
    }
  }

  return selected;
}
