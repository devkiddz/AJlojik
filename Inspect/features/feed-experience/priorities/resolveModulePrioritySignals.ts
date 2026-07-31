import type {
  FeedContext,
  FeedModule
} from '../contracts';

import type {
  ExperiencePrioritySignal
} from './experiencePriority.types';

type ResolveModulePrioritySignalsInput = {
  module: FeedModule;
  context: FeedContext;
};

export function resolveModulePrioritySignals({
  module,
  context
}: ResolveModulePrioritySignalsInput): ExperiencePrioritySignal[] {
  const signals: ExperiencePrioritySignal[] = [];

  const {
    user,
    activity,
    experience
  } = context;

  const cartCount =
    user.cartProductIds.length;

  const wishlistCount =
    user.wishlistProductIds.length;

  const recentCount =
    user.recentProductIds.length;

  const activitySignalCount =
    activity.viewedProductIds.length +
    activity.viewedCategorySlugs.length +
    activity.searchedTerms.length +
    activity.clickedCollectionIds.length;

  const hasActiveDelivery =
    Boolean(
      experience?.orders.activeDelivery
    );

  const isPremium =
    user.tier === 'premium';

  switch (module.type) {
    case 'category-rail': {
      signals.push({
        id: 'category-focus',
        score: 0,
        reason:
          'Category navigation remains structurally fixed after the Store Showcase.'
      });

      break;
    }

    case 'shopping-journey': {
      const journeySignalCount =
        cartCount +
        wishlistCount +
        recentCount;

      if (journeySignalCount > 0) {
        signals.push({
          id: 'shopping-journey',
          score: Math.min(
            18,
            journeySignalCount * 2
          ),
          reason:
            `${journeySignalCount} active shopping signals were detected.`
        });
      }

      if (cartCount > 0) {
        signals.push({
          id: 'active-cart',
          score: 14,
          reason:
            `${cartCount} cart ${
              cartCount === 1
                ? 'item is'
                : 'items are'
            } waiting for completion.`
        });
      }

      break;
    }

    case 'product-rail': {
      if (
        module.data.source ===
        'premium'
      ) {
        signals.push({
          id: 'premium-membership',
          score: isPremium ? 18 : 0,
          reason: isPremium
            ? 'Premium recommendations are highly relevant to this member.'
            : 'The user does not have premium status.'
        });
      }

      if (
        module.data.source ===
          'recommended' ||
        module.data.source ===
          'premium'
      ) {
        signals.push({
          id: 'recommendation-readiness',
          score: Math.min(
            16,
            activitySignalCount * 2
          ),
          reason:
            `${activitySignalCount} activity signals support personalized recommendations.`
        });
      }

      if (
        module.data.source ===
        'recently-viewed'
      ) {
        signals.push({
          id: 'recent-activity',
          score: Math.min(
            14,
            recentCount * 3
          ),
          reason:
            `${recentCount} recently viewed products can continue the user's journey.`
        });
      }

      break;
    }

    case 'recently-viewed': {
      signals.push({
        id: 'recent-activity',
        score: Math.min(
          14,
          recentCount * 3
        ),
        reason:
          `${recentCount} recently viewed products were detected.`
      });

      break;
    }

    case 'promotion': {
      const featuredPromoCount =
        experience?.promotions
          .featuredPromoIds.length ?? 0;

      signals.push({
        id: 'promotion-relevance',
        score:
          featuredPromoCount > 0
            ? Math.min(
                14,
                featuredPromoCount * 5
              )
            : 2,
        reason:
          featuredPromoCount > 0
            ? `${featuredPromoCount} profile-aware promotions are available.`
            : 'Only general promotions are available.'
      });

      break;
    }

    case 'collection-feed': {
      const clickedCollectionCount =
        activity
          .clickedCollectionIds
          .length;

      signals.push({
        id: 'category-focus',
        score: Math.min(
          10,
          clickedCollectionCount * 4
        ),
        reason:
          `${clickedCollectionCount} collection interactions were detected.`
      });

      break;
    }

    case 'featured-products': {
      signals.push({
        id: 'recommendation-readiness',
        score:
          activitySignalCount > 0
            ? 6
            : 2,
        reason:
          activitySignalCount > 0
            ? 'Featured products can reflect existing user interest.'
            : 'Featured products provide general discovery.'
      });

      break;
    }

    case 'product-grid': {
      signals.push({
        id: 'catalog-fallback',
        score: 0,
        reason:
          'The product grid remains the dependable catalogue fallback.'
      });

      break;
    }

    default:
      break;
  }

  /**
   * Active delivery should become one of the strongest
   * signals once delivery modules are introduced into the Feed.
   */
  if (
    hasActiveDelivery &&
    module.type === 'shopping-journey'
  ) {
    signals.push({
      id: 'active-delivery',
      score: 20,
      reason:
        'The user has an active delivery requiring immediate attention.'
    });
  }

  return signals;
}