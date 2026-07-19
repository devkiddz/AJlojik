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

export function buildStoreDiscoveryExperience(
  intent: FeedIntent,
  context: FeedContext
): FeedExperience {
  const selectedCategory =
    intent.categorySlug ?? 'all';

  const {
    catalog
  } = context;

  // ============================================================
  // CORE CATALOG RESOLUTION
  // ============================================================

  const filteredProducts =
    selectFilteredProducts(
      catalog.products,
      selectedCategory
    );

  const filteredProductIds =
    new Set(
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
   * Collections are scoped to the currently selected category.
   *
   * For "all", every resolved collection remains available.
   *
   * For a specific category, only products belonging to that
   * category remain inside each collection.
   */
  const resolvedCollections =
    allResolvedCollections
      .map(resolvedCollection => {
        const scopedProducts =
          selectedCategory === 'all'
            ? resolvedCollection.products
            : resolvedCollection.products.filter(
                product =>
                  filteredProductIds.has(
                    product.id
                  )
              );

        const originalFeaturedProduct =
          resolvedCollection.featuredProduct;

        const featuredProductStillValid =
          originalFeaturedProduct
            ? scopedProducts.some(
                product =>
                  product.id ===
                  originalFeaturedProduct.id
              )
            : false;

        const scopedFeaturedProduct =
          featuredProductStillValid
            ? originalFeaturedProduct
            : scopedProducts.find(
                product =>
                  product.featured
              ) ??
              scopedProducts[0];

        return {
          ...resolvedCollection,

          products:
            scopedProducts,

          featuredProduct:
            scopedFeaturedProduct
        };
      })
      .filter(
        resolvedCollection =>
          resolvedCollection.products
            .length > 0
      );

  /**
   * When a featured collection is available, that collection owns:
   *
   * - the featured product
   * - the supporting product slides
   * - the horizontal 7 / 5 presentation
   *
   * The standalone featured-products module must not duplicate it.
   */
const hasFeaturedCollection =
  resolvedCollections.some(
    resolvedCollection =>
      resolvedCollection.collection.layout === 'featured' &&
      Boolean(resolvedCollection.featuredProduct)
  );

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
      : selectedCategoryRecord
          ?.label ??
        'Featured products';

  const categoryExperienceSubtitle =
    selectedCategory === 'all'
      ? 'A premium mix of standout products from across the AJ Logik experience.'
      : selectedCategoryRecord
          ?.shortDescription ??
        selectedCategoryRecord
          ?.description ??
        `Explore standout products from ${categoryExperienceTitle}.`;

  // ============================================================
  // USER EXPERIENCE RESOLUTION
  // ============================================================

  const shoppingJourneyItems =
    buildShoppingJourneyItems({
      context,
      products:
        catalog.products
    });

  const excludedRecommendationIds = [
    ...context.user.cartProductIds,
    ...context.user
      .wishlistProductIds,
    ...context.user
      .recentProductIds
  ];

  const recommendedProducts =
    selectRecommendedProducts({
      products:
        catalog.products,

      preferredCategorySlugs:
        context.activity
          .viewedCategorySlugs,

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

  const candidates: ExperienceModuleCandidate[] =
    [
      {
        module: {
          id:
            'store-category-rail',

          type:
            'category-rail',

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
          id:
            'shopping-journey',

          type:
            'shopping-journey',

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
          shoppingJourneyItems
            .length > 0,

        reason:
          'Shopping Journey requires cart, wishlist or recent activity.'
      },

      {
        module: {
          id:
            'user-recommendations',

          type:
            'product-rail',

          priority: 92,

          data: {
            title:
              context.user.tier ===
              'premium'
                ? 'Premium Picks for You'
                : 'Recommended for You',

            subtitle:
              context.user.tier ===
              'premium'
                ? 'Luxury selections inspired by your recent activity.'
                : 'Selected from the categories you explore most.',

            products:
              recommendedProducts,

            source:
              context.user.tier ===
              'premium'
                ? 'premium'
                : 'recommended'
          }
        },

        enabled:
          context.user.tier !==
            'guest' &&
          recommendedProducts.length >
            0,

        reason:
          'Recommendations require an identified customer and resolved products.'
      },

      {
        module: {
          id:
            'store-promotions',

          type:
            'promotion',

          priority: 90,

          data: {
            promotions:
              activePromotions,

            products:
              filteredProducts
          }
        },

        enabled:
          activePromotions.length >
          0,

        reason:
          'Promotion module requires at least one active promotion.'
      },

      {
        module: {
          id:
            'store-collections',

          type:
            'collection-feed',

          priority: 80,

          data: {
            collections:
              resolvedCollections,

            fallbackProducts:
              filteredProducts
          }
        },

        enabled:
          resolvedCollections.length >
          0,

        reason:
          'Collection feed requires resolved collections containing products from the active category.'
      },

      /**
       * This is now a fallback presentation.
       *
       * It appears only when the category has products but no
       * featured collection already owns the featured-product layout.
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
              context.environment
                .locale,

            currency:
              context.environment
                .currency
          }
        },

        enabled:
          !hasFeaturedCollection &&
          filteredProducts.length > 0,

        reason:
          hasFeaturedCollection
            ? 'A featured collection already owns the featured product and supporting product presentation.'
            : 'Category Product Experience provides a fallback when no featured collection is available.'
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
  // DEVELOPMENT DIAGNOSTICS
  // ============================================================

    if(process.env.NODE_ENV ===
    'development'){
      console.error( '[FeedExperienceRegistry] Resolver failed.', Error);
    }
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