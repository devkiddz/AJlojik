import type {
  CompactDiscoveryItem,
  CompactDiscoveryItemTone
} from '@/components/discovery-hub-panel/discoveryHubTypes';

import type {
  FeedContext
} from '@/features/feed-experience/contracts';

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
  const { user, activity } = context;

  const cartProductCount = new Set(
    user.cartProductIds
  ).size;

  const wishlistCount = new Set(
    user.wishlistProductIds
  ).size;

  const recentCount = new Set(
    user.recentProductIds
  ).size;

  const preferredCategory =
    activity.viewedCategorySlugs.at(-1);

  const items: CompactDiscoveryItem[] = [
    /*
     * Cart remains visible even when empty so the collapsed
     * Discovery Rail always provides access to commerce.
     *
     * This count represents distinct products, not total units.
     */
    {
      id: 'compact-cart',
      label: 'Cart',
      value:
        cartProductCount > 0
          ? `${cartProductCount} ${
              cartProductCount === 1
                ? 'selection'
                : 'selections'
            }`
          : 'Empty',

      description:
        cartProductCount > 0
          ? 'Continue your order'
          : 'Start adding products',

      icon: 'cart',
      tone:
        cartProductCount > 0
          ? 'primary'
          : 'default',

      priority: 100,

      /*
       * cart-summary belongs to the Home Hub group.
       */
      groupId: 'home',

      active: cartProductCount > 0
    }
  ];

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
      groupId: 'shopping',
      active: true
    });
  }

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