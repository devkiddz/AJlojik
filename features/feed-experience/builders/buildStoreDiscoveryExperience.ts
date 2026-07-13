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
/**
 * Builds the Store Discovery Experience.
 * 
 * Pattern: "Composition over Configuration"
 * Instead of hard-coding the order, we define "Candidates" with business 
 * rules, then use the `composeExperienceModules` function to resolve 
 * which modules are actually displayed based on the data.
 */
export function buildStoreDiscoveryExperience(
  intent: FeedIntent,
  context: FeedContext
): FeedExperience {
  const selectedCategory = intent.categorySlug ?? 'all';
  const { catalog } = context;

  // ============================================================
  // 1. CORE DATA RESOLUTION
  // We extract and process raw data from the catalog before
  // passing it to the UI modules.
  // ============================================================

  const filteredProducts = selectFilteredProducts(catalog.products, selectedCategory);
  const featuredProducts = selectFeaturedProducts(filteredProducts);
  const featuredProduct = selectPrimaryFeaturedProduct(featuredProducts, filteredProducts);
  const resolvedCollections = resolveCollections(catalog.collections, catalog.products);
  const activePromotions = selectActivePromotions(catalog.promotions, new Date(context.environment.now));

  // ============================================================
  // 2. USER EXPERIENCE & LOGIC
  // Logic here handles personalization and feature availability.
  // ============================================================

  const shoppingJourneyItems = buildShoppingJourneyItems({
    context,
    products: catalog.products
  });

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

  // Determines the UI "feel" based on user status
  const journeyTone = context.user.tier === 'guest' 
    ? ('default' as const) 
    : context.user.tier;

  // ============================================================
  // 3. EXPERIENCE COMPOSITION
  // We define "Candidates"—modules that might be rendered.
  // 'enabled' handles conditional logic, 'priority' determines order.
  // ============================================================

  const candidates: ExperienceModuleCandidate[] = [
    {
      module: {
        id: 'store-category-rail',
        type: 'category-rail',
        priority: 100,
        data: { categories: catalog.categories, selectedCategory }
      },
      reason: 'Store navigation is always required for discovery.'
    },
    {
      module: {
        id: 'shopping-journey',
        type: 'shopping-journey',
        priority: 98,
        data: {
          title: 'Your Shopping Journey',
          subtitle: 'Continue from where you stopped or revisit something you saved.',
          items: shoppingJourneyItems,
          tone: journeyTone
        }
      },
      enabled: shoppingJourneyItems.length > 0,
      reason: 'Shopping Journey requires cart, wishlist or recent activity.'
    },
    {
      module: {
        id: 'user-recommendations',
        type: 'product-rail',
        priority: 92,
        data: {
          title: context.user.tier === 'premium' ? 'Premium Picks for You' : 'Recommended for You',
          subtitle: context.user.tier === 'premium' 
            ? 'Luxury selections inspired by your recent activity.' 
            : 'Selected from the categories you explore most.',
          products: recommendedProducts,
          source: context.user.tier === 'premium' ? 'premium' : 'recommended'
        }
      },
      enabled: context.user.tier !== 'guest' && recommendedProducts.length > 0,
      reason: 'Recommendations require an identified customer and resolved products.'
    },
    {
      module: {
        id: 'store-promotions',
        type: 'promotion',
        priority: 90,
        data: { promotions: activePromotions, products: filteredProducts }
      },
      enabled: activePromotions.length > 0,
      reason: 'Promotion module requires at least one active promotion.'
    },
    {
      module: {
        id: 'store-collections',
        type: 'collection-feed',
        priority: 80,
        data: { collections: resolvedCollections, fallbackProducts: filteredProducts }
      },
      enabled: resolvedCollections.length > 0,
      reason: 'Collection feed requires resolved active collections.'
    },
    {
      module: {
        id: 'store-featured-products',
        type: 'featured-products',
        priority: 70,
        data: { featuredProduct, featuredProducts }
      },
      enabled: Boolean(featuredProduct || featuredProducts.length > 0),
      reason: 'Featured section requires a primary or supporting featured product.'
    },
    {
      module: {
        id: 'store-product-grid',
        type: 'product-grid',
        priority: 60,
        data: { products: filteredProducts }
      },
      enabled: filteredProducts.length > 0,
      reason: 'Product grid requires products matching the selected category.'
    }
  ];

  // Resolve candidates into a final list of active, sorted modules
  // ============================================================
// 4. COMPOSE ELIGIBLE MODULES
// The Composer removes disabled, empty and duplicate modules.
// ============================================================

// ============================================================
// 4. EXPERIENCE COMPOSITION
// Resolve eligible modules from the proposed candidates.
// ============================================================

const composition = composeExperienceModules({
  candidates
});

// ============================================================
// 5. EXPERIENCE PRIORITIZATION
// Apply contextual scoring to reorder modules.
// ============================================================

const prioritization = prioritizeExperienceModules({
  modules: composition.modules,
  context
});

const modules = prioritization.modules;

// ============================================================
// 6. DEVELOPMENT DIAGNOSTICS
// ============================================================

if (process.env.NODE_ENV === 'development') {
  console.table(
    prioritization.priorities.map(priority => ({
      moduleId: priority.moduleId,
      base: priority.basePriority,
      contextual: priority.contextualScore,
      final: priority.finalPriority,
      signals: priority.signals
        .map(signal => signal.id)
        .join(', ')
    }))
  );
}

  // ============================================================
  // 4. FINAL RESOLVED EXPERIENCE
  // Returns a state-driven object used by the rendering engine.
  // ============================================================

  return {
    id: `store-discovery-${intent.id}`,
    key: 'default-store-discovery',
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
    createdAt: new Date().toISOString()
  };
}