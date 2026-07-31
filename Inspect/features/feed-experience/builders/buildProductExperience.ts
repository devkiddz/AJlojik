import { resolveReviewsModuleData } from '@/features/reviews/reviewResolver';

import type { ProductType } from '@/types/types';

import type {
  FeedContext,
  FeedExperience,
  FeedIntent,
  FeedModule,
  ProductExperienceCategoryPresentation
} from '../contracts';

import { selectActivePromotions } from '../selectors';

const PAIRING_PREFIXES = new Set([
  'pairing',
  'pairs-with',
  'pair-with',
  'complements'
]);

function normalizeToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatLabel(value: string): string {
  return normalizeToken(value)
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function uniqueProducts(products: ProductType[]): ProductType[] {
  return Array.from(
    new Map(
      products.map(product => [
        product.id,
        product
      ])
    ).values()
  );
}

function resolveContextDate(value: string): Date {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? new Date()
    : date;
}

function parsePairingToken(rawTag: string): string | null {
  const separatorIndex = rawTag.indexOf(':');

  if (separatorIndex < 0) {
    return null;
  }

  const prefix = normalizeToken(
    rawTag.slice(0, separatorIndex)
  );

  if (!PAIRING_PREFIXES.has(prefix)) {
    return null;
  }

  return (
    normalizeToken(
      rawTag.slice(separatorIndex + 1)
    ) || null
  );
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

function getProductIdentityTokens(
  product: ProductType
): Set<string> {
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
  const selectedPairingTokens =
    getPairingTokens(selectedProduct);

  const candidatePairingTokens =
    getPairingTokens(candidateProduct);

  const selectedIdentityTokens =
    getProductIdentityTokens(selectedProduct);

  const candidateIdentityTokens =
    getProductIdentityTokens(candidateProduct);

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
  limit = 8
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

      score +=
        countSharedGeneralTags(
          selectedProduct,
          product
        ) * 3;

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
  limit = 6
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

      pairingSignals:
        countMatchingPairingSignals(
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
  limit = 12
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
        firstProduct.category === selectedProduct.category
          ? 1
          : 0;

      const secondCategoryScore =
        secondProduct.category === selectedProduct.category
          ? 1
          : 0;

      return (
        secondCategoryScore - firstCategoryScore ||
        secondProduct.rating - firstProduct.rating
      );
    })
    .slice(0, limit);
}

export function buildProductExperience(
  intent: FeedIntent,
  context: FeedContext
): FeedExperience {
  if (intent.type !== 'product' || !intent.targetId) {
    throw new Error(
      'A valid product intent is required.'
    );
  }

  const { catalog } = context;

  const selectedProduct = catalog.products.find(
    product => product.id === intent.targetId
  );

  if (!selectedProduct) {
    throw new Error(
      `Product "${intent.targetId}" could not be resolved.`
    );
  }

  const selectedCategory = catalog.categories.find(
    category =>
      category.slug === selectedProduct.category
  );

  const categoryCoverImage =
    selectedCategory?.coverImages?.[0] ??
    selectedCategory?.image ??
    selectedProduct.variants[0]?.image;

  const categoryPresentation:
    ProductExperienceCategoryPresentation = {
      slug: selectedProduct.category,

      label:
        selectedCategory?.label ??
        formatLabel(selectedProduct.category),

      ...(categoryCoverImage
        ? {
            coverImage: categoryCoverImage
          }
        : {}),

      ...(selectedCategory?.accentColor
        ? {
            accentColor: selectedCategory.accentColor
          }
        : {})
    };

  const categoryDescription =
    selectedCategory?.description?.trim() ||
    selectedCategory?.shortDescription?.trim() ||
    undefined;

  const similarProducts = selectSimilarProducts(
    selectedProduct,
    catalog.products
  );

  const pairingProducts = selectPairingProducts(
    selectedProduct,
    catalog.products,
    similarProducts.map(product => product.id)
  );

  const contextDate = resolveContextDate(
    context.environment.now
  );

  const activePromotions = selectActivePromotions(
    catalog.promotions,
    contextDate
  );

  const excludedDiscoveryIds = [
    selectedProduct.id,
    ...similarProducts.map(product => product.id),
    ...pairingProducts.map(product => product.id)
  ];

  const continueDiscoveryProducts =
    selectContinueDiscoveryProducts(
      selectedProduct,
      catalog.products,
      excludedDiscoveryIds
    );

  const shortDescription =
    selectedProduct.shortDescription?.trim() ||
    undefined;

  const initialVariantId =
    selectedProduct.variants[0]?.id;

  const reviews = resolveReviewsModuleData({
    targetType: 'product',
    targetId: String(selectedProduct.id),
    targetName: selectedProduct.name,
    averageRating: selectedProduct.rating,
    reviewCount: selectedProduct.reviews,
    locale: context.environment.locale,
    now: context.environment.now,
    canWriteReview: context.user.authenticated
  });

  const modules: FeedModule[] = [
    {
      id: `product-experience-banner:${selectedProduct.id}`,
      type: 'product-experience-banner',
      priority: 1000,

      data: {
        product: selectedProduct,
        category: categoryPresentation,
        title: selectedProduct.name,
        locale: context.environment.locale,
        currency: context.environment.currency,
        showCommerceActions: true,
        showViewDetailsAction: true,

        ...(initialVariantId
          ? {
              initialVariantId
            }
          : {}),

        ...(shortDescription
          ? {
              description: shortDescription
            }
          : {}),

        ...(categoryPresentation.label
          ? {
              eyebrow: categoryPresentation.label
            }
          : {})
      }
    },

    {
      id: `product-details:${selectedProduct.id}`,
      type: 'product-details',
      priority: 900,

      data: {
        product: selectedProduct,
        category: categoryPresentation,
        reviews,
        locale: context.environment.locale,
        currency: context.environment.currency,

        ...(categoryDescription
          ? {
              categoryDescription
            }
          : {})
      }
    }
  ];

  if (pairingProducts.length > 0) {
    modules.push({
      id: `product-pairings:${selectedProduct.id}`,
      type: 'product-rail',
      priority: 800,

      data: {
        title: 'Perfect Pairings',
        subtitle:
          `Selections explicitly matched with ${selectedProduct.name}.`,
        products: pairingProducts,
        source: 'pairing'
      }
    });
  }

  if (similarProducts.length > 0) {
    modules.push({
      id: `similar-products:${selectedProduct.id}`,
      type: 'product-rail',
      priority: 700,

      data: {
        title: 'Similar Products',
        subtitle:
          'More selections from the same category with a related style or character.',
        products: similarProducts,
        source: 'similar'
      }
    });
  }

  if (activePromotions.length > 0) {
    modules.push({
      id: `product-promotions:${selectedProduct.id}`,
      type: 'promotion',
      priority: 500,

      data: {
        promotions: activePromotions,

        products: uniqueProducts([
          selectedProduct,
          ...similarProducts,
          ...pairingProducts
        ])
      }
    });
  }

  if (continueDiscoveryProducts.length > 0) {
    modules.push({
      id: `continue-discovery:${selectedProduct.id}`,
      type: 'product-rail',
      priority: 400,

      data: {
        title: 'Continue Discovering',
        subtitle:
          'Keep exploring selections across AJ Logik.',
        products: continueDiscoveryProducts,
        source: 'continue-discovery'
      }
    });
  }

  return {
    id: `product-experience-${intent.id}`,
    key: 'product-experience',
    intent,
    context,

    modules: modules.sort(
      (firstModule, secondModule) =>
        secondModule.priority -
        firstModule.priority
    ),

    status: 'resolved',

    resolution: {
      registryKey: 'product-experience',
      reason:
        `Resolved Product Experience for "${selectedProduct.name}".`,
      usedFallback: false
    },

    version: 1,
    createdAt: contextDate.toISOString()
  };
}