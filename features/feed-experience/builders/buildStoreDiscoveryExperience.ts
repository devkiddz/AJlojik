import type { CollectionType } from '@/data/collections';

import type {
  ProductType
} from '@/types/types';

import type {
  FeedContext,
  FeedExperience,
  FeedIntent
} from '../contracts';

import {
  composeExperienceModules,
  type ExperienceModuleCandidate
} from '../composer';

import {
  prioritizeExperienceModules
} from '../priorities';

import {
  resolveCollections,
  selectActivePromotions,
  selectFeaturedProducts,
  selectFilteredProducts,
  selectPrimaryFeaturedProduct,
  selectRecommendedProducts
} from '../selectors';

import {
  buildShoppingJourneyItems
} from './buildShoppingJourneyItems';

type FeaturedProductResolutionSource =
  | 'explicit'
  | 'best-selling'
  | 'featured-flag'
  | 'in-stock-fallback'
  | 'stable-fallback'
  | 'disabled'
  | 'unavailable';

type CollectionWithPresentationControls =
  CollectionType & {
    /**
     * Undefined retains the existing enabled behaviour.
     * False is an intentional manager decision.
     */
    bannerEnabled?: boolean;

    /**
     * Undefined retains the existing enabled behaviour.
     * False prevents the engine from inventing a featured product.
     */
    featuredEnabled?: boolean;
  };

type FeaturedProductResolution = {
  product?: ProductType;
  source: FeaturedProductResolutionSource;
};

function resolveStableFallbackProduct(
  collectionId: string,
  products: ProductType[]
): ProductType | undefined {
  if (products.length === 0) {
    return undefined;
  }

  const seed = Array.from(collectionId).reduce(
    (total, character) => {
      return total + character.charCodeAt(0);
    },
    0
  );

  return products[seed % products.length];
}

function resolveCollectionFeaturedProduct({
  collection,
  products,
  enabled
}: {
  collection: CollectionType;
  products: ProductType[];
  enabled: boolean;
}): FeaturedProductResolution {
  /**
   * An explicit manager decision must always win.
   *
   * When disabled, no fallback featured product is created.
   */
  if (!enabled) {
    return {
      source: 'disabled'
    };
  }

  if (products.length === 0) {
    return {
      source: 'unavailable'
    };
  }

  /**
   * First preference:
   * the product deliberately selected by the manager.
   */
  const explicitProduct = collection.featuredProductId
    ? products.find(
        product =>
          product.id === collection.featuredProductId
      )
    : undefined;

  if (explicitProduct) {
    return {
      product: explicitProduct,
      source: 'explicit'
    };
  }

  /**
   * Second preference:
   * the strongest-selling eligible product.
   */
  const bestSellingProduct = [...products]
    .filter(product => product.soldCount > 0)
    .sort((firstProduct, secondProduct) => {
      const soldDifference =
        secondProduct.soldCount -
        firstProduct.soldCount;

      if (soldDifference !== 0) {
        return soldDifference;
      }

      return firstProduct.id.localeCompare(
        secondProduct.id
      );
    })[0];

  if (bestSellingProduct) {
    return {
      product: bestSellingProduct,
      source: 'best-selling'
    };
  }

  /**
   * Third preference:
   * an existing catalog-level featured flag.
   */
  const flaggedProduct = products.find(
    product => product.featured
  );

  if (flaggedProduct) {
    return {
      product: flaggedProduct,
      source: 'featured-flag'
    };
  }

  /**
   * Fourth preference:
   * the first product with at least one purchasable variant.
   */
  const inStockProduct = products.find(
    product =>
      product.variants.some(
        variant => variant.stockLeft > 0
      )
  );

  if (inStockProduct) {
    return {
      product: inStockProduct,
      source: 'in-stock-fallback'
    };
  }

  /**
   * Final forgiving fallback:
   * use a deterministic selection instead of Math.random().
   *
   * This keeps the assembled experience stable between renders.
   */
  const stableFallback =
    resolveStableFallbackProduct(
      collection.id,
      products
    );

  if (stableFallback) {
    return {
      product: stableFallback,
      source: 'stable-fallback'
    };
  }

  return {
    source: 'unavailable'
  };
}

export function buildStoreDiscoveryExperience(
  intent: FeedIntent,
  context: FeedContext
): FeedExperience {
  const selectedCategory =
    intent.categorySlug ?? 'all';

  const { catalog } = context;

  // ============================================================
  // CORE CATALOG RESOLUTION
  // ============================================================

  const filteredProducts =
    selectFilteredProducts(
      catalog.products,
      selectedCategory
    );

  const filteredProductIds = new Set(
    filteredProducts.map(
      product => product.id
    )
  );

  const featuredProducts =
    selectFeaturedProducts(
      filteredProducts
    );

  const featuredProduct =
    selectPrimaryFeaturedProduct(
      featuredProducts,
      filteredProducts
    );

  const allResolvedCollections =
    resolveCollections(
      catalog.collections,
      catalog.products
    );

  /**
   * Each collection is converted into a resolved experience column.
   *
   * The engine decides:
   * - whether the banner role is visible;
   * - whether the featured role is enabled;
   * - which product forgives a missing featured selection;
   * - whether the rail occupies partial or full width.
   */
  const resolvedCollections =
    allResolvedCollections
      .map(resolvedCollection => {
        const { collection } =
          resolvedCollection;

        const scopedProducts =
          selectedCategory === 'all'
            ? resolvedCollection.products
            : resolvedCollection.products.filter(
                product =>
                  filteredProductIds.has(
                    product.id
                  )
              );

        const controlledCollection =
          collection as CollectionWithPresentationControls;

        const bannerEnabled =
          controlledCollection.bannerEnabled !== false;

        const featuredEnabled =
          controlledCollection.featuredEnabled !== false;

        const featuredResolution =
          resolveCollectionFeaturedProduct({
            collection,
            products: scopedProducts,
            enabled: featuredEnabled
          });

        const bannerVisible =
          bannerEnabled &&
          Boolean(collection.banner);

        const featuredVisible =
          featuredEnabled &&
          Boolean(featuredResolution.product);

        return {
          collection,

          products: scopedProducts,

          featuredProduct:
            featuredResolution.product,

          presentation: {
            banner: {
              enabled: bannerEnabled,
              visible: bannerVisible
            },

            featured: {
              enabled: featuredEnabled,
              visible: featuredVisible,
              source: featuredResolution.source
            },

            rail: {
              span: featuredVisible
                ? ('partial' as const)
                : ('full' as const)
            }
          }
        };
      })
      .filter(
        resolvedCollection =>
          resolvedCollection.products.length > 0
      );

  /**
   * Once at least one collection is resolved, the collection feed
   * owns the composite product-experience layout.
   *
   * This avoids rendering a second standalone featured-products
   * section beneath the collections.
   */
  const collectionFeedOwnsProductExperience =
    resolvedCollections.length > 0;

  const activePromotions =
    selectActivePromotions(
      catalog.promotions,
      new Date(
        context.environment.now
      )
    );

  const selectedCategoryRecord =
    catalog.categories.find(
      category =>
        category.slug ===
        selectedCategory
    );

  const categoryExperienceTitle =
    selectedCategory === 'all'
      ? 'Featured across AJ Logik'
      : selectedCategoryRecord?.label ??
        'Featured products';

  const categoryExperienceSubtitle =
    selectedCategory === 'all'
      ? 'A premium mix of standout products from across the AJ Logik experience.'
      : selectedCategoryRecord?.shortDescription ??
        selectedCategoryRecord?.description ??
        `Explore standout products from ${categoryExperienceTitle}.`;

  // ============================================================
  // USER EXPERIENCE RESOLUTION
  // ============================================================

  const shoppingJourneyItems =
    buildShoppingJourneyItems({
      context,
      products: catalog.products
    });

  const excludedRecommendationIds = [
    ...context.user.cartProductIds,
    ...context.user.wishlistProductIds,
    ...context.user.recentProductIds
  ];

  const recommendedProducts =
    selectRecommendedProducts({
      products: catalog.products,

      preferredCategorySlugs:
        context.activity.viewedCategorySlugs,

      excludedProductIds:
        excludedRecommendationIds,

      limit: 8
    });

  const journeyTone =
    context.user.tier === 'guest'
      ? ('default' as const)
      : context.user.tier;

  // ============================================================
  // EXPERIENCE MODULE CANDIDATES
  // ============================================================

  const candidates: ExperienceModuleCandidate[] = [
    {
      module: {
        id: 'store-category-rail',

        type: 'category-rail',

        priority: 100,

        data: {
          categories:
            catalog.categories,

          selectedCategory
        }
      },

      reason:
        'Store navigation is always required for discovery.'
    },

    {
      module: {
        id: 'shopping-journey',

        type: 'shopping-journey',

        priority: 98,

        data: {
          title:
            'Your Shopping Journey',

          subtitle:
            'Continue from where you stopped or revisit something you saved.',

          items:
            shoppingJourneyItems,

          tone:
            journeyTone
        }
      },

      enabled:
        shoppingJourneyItems.length > 0,

      reason:
        'Shopping Journey requires cart, wishlist or recent activity.'
    },

    {
      module: {
        id: 'user-recommendations',

        type: 'product-rail',

        priority: 92,

        data: {
          title:
            context.user.tier === 'premium'
              ? 'Premium Picks for You'
              : 'Recommended for You',

          subtitle:
            context.user.tier === 'premium'
              ? 'Luxury selections inspired by your recent activity.'
              : 'Selected from the categories you explore most.',

          products:
            recommendedProducts,

          source:
            context.user.tier === 'premium'
              ? 'premium'
              : 'recommended'
        }
      },

      enabled:
        context.user.tier !== 'guest' &&
        recommendedProducts.length > 0,

      reason:
        'Recommendations require an identified customer and resolved products.'
    },

    {
      module: {
        id: 'store-promotions',

        type: 'promotion',

        priority: 90,

        data: {
          promotions:
            activePromotions,

          products:
            filteredProducts
        }
      },

      enabled:
        activePromotions.length > 0,

      reason:
        'Promotion module requires at least one active promotion.'
    },

    {
      module: {
        id: 'store-collections',

        type: 'collection-feed',

        priority: 80,

        data: {
          collections:
            resolvedCollections,

          fallbackProducts:
            filteredProducts
        }
      },

      enabled:
        resolvedCollections.length > 0,

      reason:
        'Collection feed requires resolved collections containing products from the active category.'
    },

    /**
     * The standalone category experience is a true fallback.
     *
     * It appears only when no collection can own the composite
     * banner, featured-product and product-slider experience.
     */
    {
      module: {
        id:
          'store-category-product-experience',

        type:
          'featured-products',

        priority: 70,

        data: {
          title:
            categoryExperienceTitle,

          subtitle:
            categoryExperienceSubtitle,

          categorySlug:
            selectedCategory,

          featuredProduct,

          featuredProducts,

          products:
            filteredProducts,

          locale:
            context.environment.locale,

          currency:
            context.environment.currency
        }
      },

      enabled:
        !collectionFeedOwnsProductExperience &&
        filteredProducts.length > 0,

      reason:
        collectionFeedOwnsProductExperience
          ? 'The collection feed owns the complete product-experience layout.'
          : 'Category Product Experience provides a fallback when no resolved collection is available.'
    }
  ];

  // ============================================================
  // MODULE COMPOSITION
  // ============================================================

  const composition =
    composeExperienceModules({
      candidates
    });

  // ============================================================
  // CONTEXTUAL PRIORITIZATION
  // ============================================================

  const prioritization =
    prioritizeExperienceModules({
      modules:
        composition.modules,

      context
    });

  const modules =
    prioritization.modules;

  // ============================================================
  // FINAL EXPERIENCE
  // ============================================================

  return {
    id:
      `store-discovery-${intent.id}`,

    key:
      `store-discovery:${selectedCategory}`,

    intent,

    context,

    modules,

    status:
      modules.length > 0
        ? 'resolved'
        : 'empty',

    resolution: {
      registryKey:
        'default-store-discovery',

      reason:
        `Resolved store discovery for category "${selectedCategory}".`,

      usedFallback:
        false
    },

    version: 1,

    createdAt:
      new Date().toISOString()
  };
}