/* AJ_PRODUCT_RELATIONSHIP_RESOLVER_V1 */

import type {
  ProductType
} from '@/types/types';

const PAIRING_PREFIXES =
  new Set([
    'pairing',
    'pairs-with',
    'pair-with',
    'complements'
  ]);

export type ProductRelationshipResolution = {
  similarProducts: ProductType[];
  pairingProducts: ProductType[];
  continueDiscoveryProducts: ProductType[];
};

type ProductRelationshipLimits = {
  similar?: number;
  pairing?: number;
  continueDiscovery?: number;
};

function normalizeToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parsePairingToken(rawTag: string): string | null {
  const separatorIndex = rawTag.indexOf(':');

  if (separatorIndex < 0) {
    return null;
  }

  const prefix = normalizeToken(rawTag.slice(0, separatorIndex));

  if (!PAIRING_PREFIXES.has(prefix)) {
    return null;
  }

  return normalizeToken(rawTag.slice(separatorIndex + 1)) || null;
}

function getGeneralTags(product: ProductType): Set<string> {
  return new Set(
    (product.tags ?? [])
      .filter(tag => parsePairingToken(tag) === null)
      .map(normalizeToken)
      .filter(Boolean)
  );
}

function getPairingTokens(product: ProductType): Set<string> {
  const tokens = new Set<string>();

  for (const tag of product.tags ?? []) {
    const token = parsePairingToken(tag);

    if (token) {
      tokens.add(token);
    }
  }

  return tokens;
}

function getProductIdentityTokens(product: ProductType): Set<string> {
  const tokens = new Set<string>();

  const identityValues = [
    product.id,
    product.slug,
    product.name,
    product.category,
    product.subcategory
  ];

  for (const value of identityValues) {
    if (!value) {
      continue;
    }

    const token = normalizeToken(value);

    if (token) {
      tokens.add(token);
    }
  }

  for (const tag of getGeneralTags(product)) {
    tokens.add(tag);
  }

  return tokens;
}

function countSharedGeneralTags(
  selectedProduct: ProductType,
  candidateProduct: ProductType
): number {
  const selectedTags = getGeneralTags(selectedProduct);

  return [...getGeneralTags(candidateProduct)].filter(tag =>
    selectedTags.has(tag)
  ).length;
}

function countMatchingPairingSignals(
  selectedProduct: ProductType,
  candidateProduct: ProductType
): number {
  const selectedPairingTokens = getPairingTokens(selectedProduct);
  const candidatePairingTokens = getPairingTokens(candidateProduct);
  const selectedIdentityTokens = getProductIdentityTokens(selectedProduct);
  const candidateIdentityTokens = getProductIdentityTokens(candidateProduct);

  let signalCount = 0;

  for (const token of selectedPairingTokens) {
    if (candidateIdentityTokens.has(token)) {
      signalCount += 1;
    }
  }

  for (const token of candidatePairingTokens) {
    if (selectedIdentityTokens.has(token)) {
      signalCount += 1;
    }
  }

  return signalCount;
}

function selectSimilarProducts(
  selectedProduct: ProductType,
  products: ProductType[],
  limit: number
): ProductType[] {
  return products
    .filter(
      product =>
        product.id !== selectedProduct.id &&
        product.category === selectedProduct.category
    )
    .map(product => {
      let score = 20;

      if (
        product.subcategory &&
        selectedProduct.subcategory &&
        product.subcategory === selectedProduct.subcategory
      ) {
        score += 10;
      }

      score += countSharedGeneralTags(selectedProduct, product) * 3;

      if (product.featured) {
        score += 2;
      }

      score += Math.min(product.rating, 5);

      return {
        product,
        score
      };
    })
    .sort(
      (firstResult, secondResult) =>
        secondResult.score - firstResult.score
    )
    .slice(0, limit)
    .map(result => result.product);
}

function selectPairingProducts(
  selectedProduct: ProductType,
  products: ProductType[],
  excludedProductIds: string[],
  limit: number
): ProductType[] {
  const excludedIds = new Set(excludedProductIds);

  return products
    .filter(
      product =>
        product.id !== selectedProduct.id &&
        !excludedIds.has(product.id) &&
        product.category !== selectedProduct.category
    )
    .map(product => ({
      product,
      pairingSignals: countMatchingPairingSignals(
        selectedProduct,
        product
      )
    }))
    .filter(result => result.pairingSignals > 0)
    .map(({ product, pairingSignals }) => ({
      product,
      score:
        pairingSignals * 20 +
        (product.featured ? 2 : 0) +
        Math.min(product.rating, 5)
    }))
    .sort(
      (firstResult, secondResult) =>
        secondResult.score - firstResult.score
    )
    .slice(0, limit)
    .map(result => result.product);
}

function selectContinueDiscoveryProducts(
  selectedProduct: ProductType,
  products: ProductType[],
  excludedProductIds: string[],
  limit: number
): ProductType[] {
  const excludedIds = new Set(excludedProductIds);

  return products
    .filter(
      product =>
        product.id !== selectedProduct.id &&
        !excludedIds.has(product.id)
    )
    .sort((firstProduct, secondProduct) => {
      const firstCategoryScore =
        firstProduct.category === selectedProduct.category ? 1 : 0;

      const secondCategoryScore =
        secondProduct.category === selectedProduct.category ? 1 : 0;

      return (
        secondCategoryScore - firstCategoryScore ||
        secondProduct.rating - firstProduct.rating
      );
    })
    .slice(0, limit);
}

export function resolveProductRelationships(
  selectedProduct: ProductType,
  products: ProductType[],
  limits: ProductRelationshipLimits = {}
): ProductRelationshipResolution {
  const similarProducts = selectSimilarProducts(
    selectedProduct,
    products,
    limits.similar ?? 8
  );

  const pairingProducts = selectPairingProducts(
    selectedProduct,
    products,
    similarProducts.map(product => product.id),
    limits.pairing ?? 6
  );

  const excludedProductIds = [
    selectedProduct.id,
    ...similarProducts.map(product => product.id),
    ...pairingProducts.map(product => product.id)
  ];

  const continueDiscoveryProducts = selectContinueDiscoveryProducts(
    selectedProduct,
    products,
    excludedProductIds,
    limits.continueDiscovery ?? 12
  );

  return {
    similarProducts,
    pairingProducts,
    continueDiscoveryProducts
  };
}
