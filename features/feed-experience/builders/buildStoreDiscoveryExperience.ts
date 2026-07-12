import type {
  FeedContext,
  FeedExperience,
  FeedIntent,
  FeedModule
} from '../contracts';

import {
  resolveCollections,
  selectActivePromotions,
  selectFeaturedProducts,
  selectFilteredProducts,
  selectPrimaryFeaturedProduct,
  selectProductsByIds,
  selectRecommendedProducts
} from '../selectors';

import { buildShoppingJourneyItems } from './buildShoppingJourneyItems';

export function buildStoreDiscoveryExperience(
  intent: FeedIntent,
  context: FeedContext
): FeedExperience {
  const selectedCategory =
    intent.categorySlug ?? 'all';

  const { catalog } = context;

  // ============================================================
  // 1. CORE STORE DATA
  // ============================================================

  const filteredProducts = selectFilteredProducts(
    catalog.products,
    selectedCategory
  );

  const featuredProducts =
    selectFeaturedProducts(filteredProducts);

  const featuredProduct =
    selectPrimaryFeaturedProduct(
      featuredProducts,
      filteredProducts
    );

  const resolvedCollections = resolveCollections(
    catalog.collections,
    catalog.products
  );

  const activePromotions = selectActivePromotions(
    catalog.promotions,
    new Date(context.environment.now)
  );

  // ============================================================
  // 2. USER EXPERIENCE DATA
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

  // Guest users do not currently receive Shopping Journey,
  // but this keeps the tone contract completely safe.
  const journeyTone =
    context.user.tier === 'guest'
      ? ('default' as const)
      : context.user.tier;

  // ============================================================
  // 3. EXPERIENCE COMPOSITION
  // Every object below is an independent Feed module.
  // ============================================================

  const modules: FeedModule[] = [
    // Category navigation
    {
      id: 'store-category-rail',
      type: 'category-rail',
      priority: 100,

      data: {
        categories: catalog.categories,
        selectedCategory
      }
    },

    // Compact cart, wishlist and recent activity summary
    ...(shoppingJourneyItems.length > 0
      ? [
          {
            id: 'shopping-journey',
            type: 'shopping-journey' as const,
            priority: 98,

            data: {
              title: 'Your Shopping Journey',

              subtitle:
                'Continue from where you stopped or revisit something you saved.',

              items: shoppingJourneyItems,

              tone: journeyTone
            }
          }
        ]
      : []),

    // Personalized recommendations
    ...(recommendedProducts.length > 0 &&
    context.user.tier !== 'guest'
      ? [
          {
            id: 'user-recommendations',
            type: 'product-rail' as const,
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

              products: recommendedProducts,

              source:
                context.user.tier === 'premium'
                  ? ('premium' as const)
                  : ('recommended' as const)
            }
          }
        ]
      : []),

    // Active promotions
    ...(activePromotions.length > 0
      ? [
          {
            id: 'store-promotions',
            type: 'promotion' as const,
            priority: 90,

            data: {
              promotions: activePromotions,
              products: filteredProducts
            }
          }
        ]
      : []),

    // Curated collections
    ...(resolvedCollections.length > 0
      ? [
          {
            id: 'store-collections',
            type: 'collection-feed' as const,
            priority: 80,

            data: {
              collections: resolvedCollections,
              fallbackProducts: filteredProducts
            }
          }
        ]
      : []),

    // Featured products
    ...(featuredProduct ||
    featuredProducts.length > 0
      ? [
          {
            id: 'store-featured-products',
            type: 'featured-products' as const,
            priority: 70,

            data: {
              featuredProduct,
              featuredProducts
            }
          }
        ]
      : []),

    // General product catalogue
    {
      id: 'store-product-grid',
      type: 'product-grid',
      priority: 60,

      data: {
        products: filteredProducts
      }
    }
  ];

  // ============================================================
  // 4. FINAL RESOLVED EXPERIENCE
  // ============================================================

  return {
    id: `store-discovery-${intent.id}`,
    key: 'default-store-discovery',

    intent,
    context,

    modules: modules.sort(
      (a, b) => b.priority - a.priority
    ),

    status:
      modules.length > 0
        ? 'resolved'
        : 'empty',

    resolution: {
      registryKey: 'default-store-discovery',

      reason:
        `Resolved store discovery for category "${selectedCategory}".`,

      usedFallback: false
    },

    version: 1,
    createdAt: new Date().toISOString()
  };
}