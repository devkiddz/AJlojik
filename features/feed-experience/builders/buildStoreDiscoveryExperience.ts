import type { CollectionType } from '@/data/collections';
import type { ProductType } from '@/types/types';
import type {
  FeedContext,
  FeedExperience,
  FeedIntent
} from '../contracts';

import {
  composeExperienceModules,
  type ExperienceModuleCandidate
} from '../composer';

import { prioritizeExperienceModules } from '../priorities';

import {
  resolveCollections,
  selectActivePromotions,
  selectFeaturedProducts,
  selectFilteredProducts,
  selectPrimaryFeaturedProduct,
  selectRecommendedProducts
} from '../selectors';

import { commerceStories } from '@/features/commerce-stories/data';
import { buildShoppingJourneyItems } from './buildShoppingJourneyItems';

// ============================================================
// TYPES
// ============================================================

type FeaturedProductResolutionSource =
  | 'explicit'
  | 'best-selling'
  | 'featured-flag'
  | 'in-stock-fallback'
  | 'stable-fallback'
  | 'disabled'
  | 'unavailable';

type CollectionWithPresentationControls = CollectionType & {
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

// ============================================================
// LIMITS
// ============================================================

const COLLECTION_PRODUCT_LIMIT = 10;
const CATEGORY_PRODUCT_LIMIT = 16;
const MORE_DISCOVERY_PRODUCT_LIMIT = 12;
const RECENT_PRODUCT_LIMIT = 8;
const SPECIAL_PICK_PRODUCT_LIMIT = 8;
const CATEGORY_SHELF_PRODUCT_LIMIT = 12;

const CATEGORY_SHELF_ORDER = [
  'wines',
  'spirits',
  'kitchen',
  'confectioneries',
  'party-plans'
] as const;

// ============================================================
// PRODUCT HELPERS
// ============================================================

function uniqueProducts(products: ProductType[]): ProductType[] {
  return Array.from(
    new Map(
      products.map(product => [product.id, product])
    ).values()
  );
}

function resolveProductsInIdOrder(
  productIds: string[],
  products: ProductType[]
): ProductType[] {
  const productMap = new Map(
    products.map(product => [String(product.id), product])
  );

  return uniqueProducts(
    productIds
      .map(productId => productMap.get(String(productId)))
      .filter((product): product is ProductType => Boolean(product))
  );
}

function formatCategoryLabel(categorySlug: string): string {
  return categorySlug
    .split('-')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ============================================================
// COLLECTION FEATURED PRODUCT RESOLUTION
// ============================================================

function resolveStableFallbackProduct(
  collectionId: string,
  products: ProductType[]
): ProductType | undefined {
  if (products.length === 0) {
    return undefined;
  }

  const seed = Array.from(collectionId).reduce(
    (total, character) => total + character.charCodeAt(0),
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

  const explicitProduct = collection.featuredProductId
    ? products.find(product => product.id === collection.featuredProductId)
    : undefined;

  if (explicitProduct) {
    return {
      product: explicitProduct,
      source: 'explicit'
    };
  }

  const bestSellingProduct = [...products]
    .filter(product => product.soldCount > 0)
    .sort((firstProduct, secondProduct) => {
      const soldDifference = secondProduct.soldCount - firstProduct.soldCount;

      if (soldDifference !== 0) {
        return soldDifference;
      }

      return firstProduct.id.localeCompare(secondProduct.id);
    })[0];

  if (bestSellingProduct) {
    return {
      product: bestSellingProduct,
      source: 'best-selling'
    };
  }

  const flaggedProduct = products.find(product => product.featured);

  if (flaggedProduct) {
    return {
      product: flaggedProduct,
      source: 'featured-flag'
    };
  }

  const inStockProduct = products.find(product =>
    product.variants.some(variant => variant.stockLeft > 0)
  );

  if (inStockProduct) {
    return {
      product: inStockProduct,
      source: 'in-stock-fallback'
    };
  }

  const stableFallback = resolveStableFallbackProduct(
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

// ============================================================
// STORE DISCOVERY EXPERIENCE
// ============================================================

export function buildStoreDiscoveryExperience(
  intent: FeedIntent,
  context: FeedContext
): FeedExperience {
  const selectedCategory = intent.categorySlug ?? 'all';
  const { catalog } = context;
  const contextDate = new Date(context.environment.now);

  // ============================================================
  // COMMERCE STORIES RESOLUTION
  // ============================================================

  const activeCommerceStories = commerceStories
    .filter(story => {
      if (!story.active) {
        return false;
      }

      if (story.startsAt && new Date(story.startsAt) > contextDate) {
        return false;
      }

      if (story.endsAt && new Date(story.endsAt) < contextDate) {
        return false;
      }

      return true;
    })
    .sort((firstStory, secondStory) => secondStory.priority - firstStory.priority);

  // ============================================================
  // CORE CATALOG RESOLUTION
  // ============================================================

  const filteredProducts = selectFilteredProducts(
    catalog.products,
    selectedCategory
  );

  const filteredProductIds = new Set(
    filteredProducts.map(product => product.id)
  );

  const featuredProducts = selectFeaturedProducts(filteredProducts);

  const featuredProduct = selectPrimaryFeaturedProduct(
    featuredProducts,
    filteredProducts
  );

  // ============================================================
  // COLLECTION RESOLUTION
  // ============================================================

  const allResolvedCollections = resolveCollections(
    catalog.collections,
    catalog.products
  );

  const resolvedCollections = allResolvedCollections
    .map(resolvedCollection => {
      const { collection } = resolvedCollection;

      const scopedProducts =
        selectedCategory === 'all'
          ? resolvedCollection.products
          : resolvedCollection.products.filter(product =>
              filteredProductIds.has(product.id)
            );

      const collectionCategorySlugs = new Set(
        scopedProducts.map(product => product.category)
      );

      const enrichmentPool =
        scopedProducts.length === 0
          ? []
          : selectedCategory === 'all'
            ? catalog.products.filter(product =>
                collectionCategorySlugs.has(product.category)
              )
            : filteredProducts;

      const collectionProducts = uniqueProducts([
        ...scopedProducts,
        ...enrichmentPool
      ]).slice(0, COLLECTION_PRODUCT_LIMIT);

      const controlledCollection =
        collection as CollectionWithPresentationControls;

      const bannerEnabled = controlledCollection.bannerEnabled !== false;
      const featuredEnabled = controlledCollection.featuredEnabled !== false;

      const featuredResolution = resolveCollectionFeaturedProduct({
        collection,
        products: collectionProducts,
        enabled: featuredEnabled
      });

      const bannerVisible = bannerEnabled && Boolean(collection.banner);
      const featuredVisible =
        featuredEnabled && Boolean(featuredResolution.product);

      return {
        collection,
        products: collectionProducts,
        featuredProduct: featuredResolution.product,
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
    .filter(resolvedCollection => resolvedCollection.products.length > 0);

  const collectionFeedOwnsProductExperience = resolvedCollections.length > 0;

  // ============================================================
  // PROMOTION RESOLUTION
  // ============================================================

  const activePromotions = selectActivePromotions(
    catalog.promotions,
    contextDate
  );

  // ============================================================
  // CATEGORY RESOLUTION
  // ============================================================

  const selectedCategoryRecord = catalog.categories.find(
    category => category.slug === selectedCategory
  );

  const categoryExperienceTitle =
    selectedCategory === 'all'
      ? 'Featured across AJ Logik'
      : selectedCategoryRecord?.label ?? 'Featured products';

  const categoryExperienceSubtitle =
    selectedCategory === 'all'
      ? 'A premium mix of standout products from across the AJ Logik experience.'
      : selectedCategoryRecord?.shortDescription ??
        selectedCategoryRecord?.description ??
        `Explore standout products from ${categoryExperienceTitle}.`;

  // ============================================================
  // SHOPPING JOURNEY RESOLUTION
  // ============================================================

  const shoppingJourneyItems = buildShoppingJourneyItems({
    context,
    products: catalog.products
  });

  const journeyTone =
    context.user.tier === 'guest'
      ? ('default' as const)
      : context.user.tier;

  // ============================================================
  // RECOMMENDATION RESOLUTION
  // ============================================================

  const excludedRecommendationIds = [
    ...context.user.cartProductIds,
    ...context.user.wishlistProductIds,
    ...context.user.recentProductIds
  ];

  const recommendedProducts = selectRecommendedProducts({
    products: catalog.products,
    preferredCategorySlugs: context.activity.viewedCategorySlugs,
    excludedProductIds: excludedRecommendationIds,
    limit: 8
  });

  const recentlyViewedProducts = resolveProductsInIdOrder(
    context.user.recentProductIds,
    catalog.products
  )
    .filter(
      product =>
        selectedCategory === 'all' || product.category === selectedCategory
    )
    .slice(0, RECENT_PRODUCT_LIMIT);

  const collectionProductIds = new Set(
    resolvedCollections.flatMap(resolvedCollection =>
      resolvedCollection.products.map(product => product.id)
    )
  );

  const recentProductIds = new Set(
    recentlyViewedProducts.map(product => product.id)
  );

  const categoryProducts =
    selectedCategory === 'all'
      ? []
      : uniqueProducts([
          ...filteredProducts.filter(
            product =>
              !collectionProductIds.has(product.id) &&
              !recentProductIds.has(product.id) &&
              product.id !== featuredProduct?.id
          ),
          ...filteredProducts
        ]).slice(0, CATEGORY_PRODUCT_LIMIT);

  const categoryProductIds = new Set(
    categoryProducts.map(product => product.id)
  );

  const primaryDiscoveryProducts = filteredProducts.filter(
    product =>
      !collectionProductIds.has(product.id) &&
      !categoryProductIds.has(product.id) &&
      !recentProductIds.has(product.id) &&
      product.id !== featuredProduct?.id
  );

  const moreDiscoveryProducts = uniqueProducts([
    ...primaryDiscoveryProducts,
    ...filteredProducts.filter(
      product =>
        !categoryProductIds.has(product.id) &&
        !recentProductIds.has(product.id)
    ),
    ...filteredProducts.filter(
      product => !recentProductIds.has(product.id)
    )
  ]).slice(0, MORE_DISCOVERY_PRODUCT_LIMIT);

  const moreDiscoveryProductIds = new Set(
    moreDiscoveryProducts.map(product => product.id)
  );

  const specialPickPreferredCategories =
    selectedCategory === 'all'
      ? context.activity.viewedCategorySlugs
      : [selectedCategory, ...context.activity.viewedCategorySlugs];

  const specialRecommendationPool = selectRecommendedProducts({
    products:
      selectedCategory === 'all' ? catalog.products : filteredProducts,
    preferredCategorySlugs: specialPickPreferredCategories,
    excludedProductIds: [
      ...excludedRecommendationIds,
      ...categoryProductIds,
      ...moreDiscoveryProductIds
    ],
    limit: SPECIAL_PICK_PRODUCT_LIMIT * 2
  });

  const strictSpecialPicks = uniqueProducts([
    ...specialRecommendationPool,
    ...featuredProducts,
    ...filteredProducts
  ]).filter(
    product =>
      !collectionProductIds.has(product.id) &&
      !categoryProductIds.has(product.id) &&
      !recentProductIds.has(product.id) &&
      !moreDiscoveryProductIds.has(product.id)
  );

  const specialPickProducts = uniqueProducts([
    ...strictSpecialPicks,
    ...specialRecommendationPool.filter(
      product =>
        !categoryProductIds.has(product.id) &&
        !recentProductIds.has(product.id)
    ),
    ...recommendedProducts.filter(
      product =>
        (selectedCategory === 'all' ||
          product.category === selectedCategory) &&
        !categoryProductIds.has(product.id) &&
        !recentProductIds.has(product.id)
    ),
    ...specialRecommendationPool.filter(
      product => !recentProductIds.has(product.id)
    )
  ]).slice(0, SPECIAL_PICK_PRODUCT_LIMIT);

  // ============================================================
  // SECTION PRESENTATION
  // ============================================================

  const discoverySectionTitle =
    selectedCategory === 'all'
      ? 'More Discoveries'
      : `More in ${categoryExperienceTitle}`;

  const discoverySectionSubtitle =
    selectedCategory === 'all'
      ? 'More products and moments from across the AJ Logik experience.'
      : `Continue exploring products selected from ${categoryExperienceTitle}.`;

  const specialPickTitle =
    context.user.tier === 'premium'
      ? 'Premium Special Picks'
      : 'Special Picks for You';

  const specialPickSubtitle =
    selectedCategory === 'all'
      ? 'A considered mix shaped by your activity and the strongest products in the catalog.'
      : `A more personal selection from ${categoryExperienceTitle}.`;

  // ============================================================
  // CATEGORY EXPERIENCE CANDIDATE
  // ============================================================

  const categoryExperienceCandidate: ExperienceModuleCandidate | null =
    selectedCategory !== 'all' &&
    Boolean(selectedCategoryRecord) &&
    categoryProducts.length > 0
      ? {
          module: {
            id: `store-category-experience-${selectedCategory}`,
            type: 'category-experience',
            priority: 75,
            data: {
              category: selectedCategoryRecord!,
              title: `Explore ${categoryExperienceTitle}`,
              subtitle: categoryExperienceSubtitle,
              products: categoryProducts
            }
          },
          reason:
            'Category Experience requires a selected category and resolved category products.'
        }
      : null;

  // ============================================================
  // CATEGORY SHELVES
  // ============================================================

  const previouslySurfacedProductIds = new Set<string>([
    ...(featuredProduct ? [featuredProduct.id] : []),
    ...collectionProductIds,
    ...categoryProductIds,
    ...recentProductIds,
    ...moreDiscoveryProductIds,
    ...specialPickProducts.map(product => product.id)
  ]);

  const catalogCategorySlugs = Array.from(
    new Set([
      ...CATEGORY_SHELF_ORDER,
      ...catalog.products.map(product => product.category)
    ])
  );

  const categoryShelfCandidates: ExperienceModuleCandidate[] =
    selectedCategory === 'all'
      ? catalogCategorySlugs
          .map(categorySlug => {
            const categoryRecord = catalog.categories.find(
              category => category.slug === categorySlug
            );

            const categoryProducts = catalog.products.filter(
              product => product.category === categorySlug
            );

            /**
             * Spotify-style shelves may reintroduce products,
             * but unseen products are presented first.
             */
            const shelfProducts = uniqueProducts([
              ...categoryProducts.filter(
                product => !previouslySurfacedProductIds.has(product.id)
              ),
              ...categoryProducts
            ]).slice(0, CATEGORY_SHELF_PRODUCT_LIMIT);

            const categoryLabel =
              categoryRecord?.label ?? formatCategoryLabel(categorySlug);

            return {
              module: {
                id: `store-category-shelf-${categorySlug}`,
                type: 'product-rail',
                priority: 30,
                data: {
                  title: categoryLabel,
                  subtitle:
                    categoryRecord?.shortDescription ??
                    categoryRecord?.description ??
                    `Explore more from ${categoryLabel}.`,
                  products: shelfProducts,
                  source: 'continue-discovery'
                }
              },
              enabled: shelfProducts.length > 0,
              reason: `Category shelf requires products from "${categorySlug}".`
            } satisfies ExperienceModuleCandidate;
          })
          .filter(candidate => candidate.enabled !== false)
      : [];

  // ============================================================
  // EXPERIENCE MODULE CANDIDATES
  // ============================================================

  const candidates: ExperienceModuleCandidate[] = [
    // ----------------------------------------------------------
    // 1. COMMERCE STORIES
    // ----------------------------------------------------------
    {
      module: {
        id: 'store-commerce-stories',
        type: 'commerce-stories',
        priority: 100,
        data: {
          title: 'Stories',
          viewAllHref: '/store/stories',
          stories: activeCommerceStories
        }
      },
      enabled: activeCommerceStories.length > 0,
      reason:
        'Commerce Stories require at least one active image or video Story.'
    },

    // ----------------------------------------------------------
    // 2. CATEGORIES
    // ----------------------------------------------------------
    {
      module: {
        id: 'store-category-rail',
        type: 'category-rail',
        priority: 99,
        data: {
          categories: catalog.categories,
          selectedCategory
        }
      },
      reason: 'Store navigation is always required for discovery.'
    },

    // ----------------------------------------------------------
    // 3. SHOPPING JOURNEY
    // ----------------------------------------------------------
    {
      module: {
        id: 'shopping-journey',
        type: 'shopping-journey',
        priority: 98,
        data: {
          title: 'Your Shopping Journey',
          subtitle:
            'Continue from where you stopped or revisit something you saved.',
          items: shoppingJourneyItems,
          tone: journeyTone
        }
      },
      enabled: shoppingJourneyItems.length > 0,
      reason:
        'Shopping Journey requires cart, wishlist or recent activity.'
    },

    // ----------------------------------------------------------
    // 4. PROMOTIONS
    // ----------------------------------------------------------
    {
      module: {
        id: 'store-promotions',
        type: 'promotion',
        priority: 90,
        data: {
          promotions: activePromotions,
          products: filteredProducts
        }
      },
      enabled: activePromotions.length > 0,
      reason:
        'Promotion module requires at least one active promotion.'
    },

    // ----------------------------------------------------------
    // 5. COLLECTIONS
    // ----------------------------------------------------------
    {
      module: {
        id: 'store-collections',
        type: 'collection-feed',
        priority: 80,
        data: {
          collections: resolvedCollections,
          fallbackProducts: filteredProducts
        }
      },
      enabled: resolvedCollections.length > 0,
      reason:
        'Collection feed requires resolved collections containing products from the active category.'
    },

    // ----------------------------------------------------------
    // 6. SELECTED CATEGORY EXPERIENCE
    // ----------------------------------------------------------
    ...(categoryExperienceCandidate
      ? [categoryExperienceCandidate]
      : []),

    // ----------------------------------------------------------
    // 7. CATEGORY PRODUCT FALLBACK
    // ----------------------------------------------------------
    {
      module: {
        id: 'store-category-product-experience',
        type: 'featured-products',
        priority: 70,
        data: {
          title: categoryExperienceTitle,
          subtitle: categoryExperienceSubtitle,
          categorySlug: selectedCategory,
          featuredProduct,
          featuredProducts,
          products: filteredProducts,
          locale: context.environment.locale,
          currency: context.environment.currency
        }
      },
      enabled:
        !collectionFeedOwnsProductExperience &&
        filteredProducts.length > 0,
      reason: collectionFeedOwnsProductExperience
        ? 'The collection feed owns the complete product-experience layout.'
        : 'Category Product Experience provides a fallback when no resolved collection is available.'
    },

    // ----------------------------------------------------------
    // 8. MORE DISCOVERIES
    // ----------------------------------------------------------
    {
      module: {
        id: `store-more-discoveries-${selectedCategory}`,
        type: 'product-rail',
        priority: 60,
        data: {
          title: discoverySectionTitle,
          subtitle: discoverySectionSubtitle,
          products: moreDiscoveryProducts,
          source: 'recommended'
        }
      },
      enabled: moreDiscoveryProducts.length > 0,
      reason:
        'More Discoveries requires products from the active category or catalog fallback pool.'
    },

    // ----------------------------------------------------------
    // 9. RECENTLY VIEWED
    // ----------------------------------------------------------
    {
      module: {
        id: `store-recently-viewed-${selectedCategory}`,
        type: 'recently-viewed',
        priority: 50,
        data: {
          title: 'Recently Viewed',
          subtitle: 'Return to products you explored earlier.',
          products: recentlyViewedProducts
        }
      },
      enabled: recentlyViewedProducts.length > 0,
      reason:
        'Recently Viewed requires resolved product activity for the active category.'
    },

    // ----------------------------------------------------------
    // 10. SPECIAL PICKS
    // ----------------------------------------------------------
    {
      module: {
        id: `store-special-picks-${selectedCategory}`,
        type: 'product-rail',
        priority: 40,
        data: {
          title: specialPickTitle,
          subtitle: specialPickSubtitle,
          products: specialPickProducts,
          source:
            context.user.tier === 'premium'
              ? 'premium'
              : 'recommended'
        }
      },
      enabled: specialPickProducts.length > 0,
      reason:
        'Special Picks requires recommended, featured or category-compatible products.'
    },

    // ----------------------------------------------------------
    // 11. CATEGORY SHELVES
    // ----------------------------------------------------------
    ...categoryShelfCandidates
  ];

  // ============================================================
  // MODULE COMPOSITION
  // ============================================================

  const composition = composeExperienceModules({
    candidates
  });

  // ============================================================
  // CONTEXTUAL PRIORITIZATION
  // ============================================================

  const prioritization = prioritizeExperienceModules({
    modules: composition.modules,
    context
  });

  const STORE_MODULE_ORDER: Record<string, number> = {
    'store-banner': 1100,
    'commerce-stories': 1000,
    'category-rail': 990,
    'shopping-journey': 980
  };

  const modules = [...prioritization.modules].sort(
    (firstModule, secondModule) => {
      const firstPinnedPriority = STORE_MODULE_ORDER[firstModule.type];
      const secondPinnedPriority = STORE_MODULE_ORDER[secondModule.type];

      if (
        firstPinnedPriority !== undefined ||
        secondPinnedPriority !== undefined
      ) {
        return (
          (secondPinnedPriority ?? secondModule.priority) -
          (firstPinnedPriority ?? firstModule.priority)
        );
      }

      return secondModule.priority - firstModule.priority;
    }
  );

  // ============================================================
  // FINAL EXPERIENCE
  // ============================================================

  return {
    id: `store-discovery-${intent.id}`,
    key: `store-discovery:${selectedCategory}`,
    intent,
    context,
    modules,
    status: modules.length > 0 ? 'resolved' : 'empty',
    resolution: {
      registryKey: 'default-store-discovery',
      reason: `Resolved store discovery for category "${selectedCategory}".`,
      usedFallback: false
    },
    version: 1,
    createdAt: contextDate.toISOString()
  };
}