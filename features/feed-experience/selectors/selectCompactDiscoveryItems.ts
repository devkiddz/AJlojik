import type { FeedContext } from '@/features/feed-experience/contracts';

import type {
  CompactDiscoveryItem,
  CompactDiscoveryItemTone
} from '@/components/discovery-hub-panel/discoveryHubTypes'

function getMembershipTone(
  tier: FeedContext['user']['tier']
): CompactDiscoveryItemTone {
  switch (tier) {
    case 'premium':
      return 'amber';

    case 'member':
      return 'primary';

    case 'returning':
      return 'violet';

    default:
      return 'default';
  }
}

function formatMembershipTier(
  tier: FeedContext['user']['tier']
): string {
  switch (tier) {
    case 'premium':
      return 'Premium';

    case 'member':
      return 'Member';

    case 'returning':
      return 'Returning';

    default:
      return 'Guest';
  }
}

export function selectCompactDiscoveryItems(
  context: FeedContext
): CompactDiscoveryItem[] {
  const items: CompactDiscoveryItem[] = [];

  const {
    user,
    activity
  } = context;

  const cartCount = user.cartProductIds.length;
  const wishlistCount =
    user.wishlistProductIds.length;
  const recentCount =
    user.recentProductIds.length;

  const preferredCategory =
    activity.viewedCategorySlugs.at(-1);

  /*
   * Cart has the highest priority because it represents
   * the closest activity to purchase.
   */
  if (cartCount > 0) {
    items.push({
      id: 'compact-cart',
      label: 'Cart',
      value: `${cartCount} ${
        cartCount === 1 ? 'item' : 'items'
      }`,
      description: 'Continue your order',
      icon: 'cart',
      tone: 'primary',
      priority: 100,
      groupId: 'shopping',
      active: true
    });
  }

  /*
   * Wishlist represents saved customer interest.
   */
  if (wishlistCount > 0) {
    items.push({
      id: 'compact-wishlist',
      label: 'Saved',
      value: `${wishlistCount} ${
        wishlistCount === 1
          ? 'product'
          : 'products'
      }`,
      description: 'Ready to revisit',
      icon: 'wishlist',
      tone: 'rose',
      priority: 90,
      groupId: 'shopping'
    });
  }

  /*
   * Recently viewed items prove that the customer
   * already has an active discovery journey.
   */
  if (recentCount > 0) {
    items.push({
      id: 'compact-recent',
      label: 'Recent',
      value: `${recentCount} viewed`,
      description: 'Continue exploring',
      icon: 'recent',
      tone: 'emerald',
      priority: 80,
      groupId: 'shopping'
    });
  }

  /*
   * Category activity becomes a lightweight
   * recommendation signal.
   */
  if (preferredCategory) {
    items.push({
      id: 'compact-recommendation',
      label: 'For You',
      value: preferredCategory,
      description: 'Based on your activity',
      icon: 'recommendation',
      tone: 'violet',
      priority: 70,
      groupId: 'shopping'
    });
  }

  /*
   * Membership is always useful, including for guests.
   */
  items.push({
    id: 'compact-membership',
    label: 'Status',
    value: formatMembershipTier(user.tier),
    description:
      user.tier === 'guest'
        ? 'Join AJ Rewards'
        : 'Benefits are active',
    icon: 'membership',
    tone: getMembershipTone(user.tier),
    priority: 60,
    groupId: 'rewards'
  });

  /*
   * AI becomes active only when enough user signals exist.
   * This is still deterministic mock intelligence.
   */
  const activitySignalCount =
    activity.viewedProductIds.length +
    activity.searchedTerms.length +
    activity.clickedCollectionIds.length;

  if (activitySignalCount > 2) {
    items.push({
      id: 'compact-ai',
      label: 'AJ AI',
      value: 'New insight',
      description: 'A suggestion is ready',
      icon: 'ai',
      tone: 'violet',
      priority: 50,
      groupId: 'ai',
      active: true
    });
  }

  return items
    .sort(
      (firstItem, secondItem) =>
        secondItem.priority -
        firstItem.priority
    )
    .slice(0, 5);
}