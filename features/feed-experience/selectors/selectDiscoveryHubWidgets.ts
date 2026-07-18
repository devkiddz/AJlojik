import type {
  HubWidget
} from '@/components/discovery-hub-panel/discoveryHubTypes';

import type {
  FeedContext
} from '../contracts';

type SelectDiscoveryHubWidgetsInput = {
  widgets: HubWidget[];
  context: FeedContext;
};

export function selectDiscoveryHubWidgets({
  widgets,
  context
}: SelectDiscoveryHubWidgetsInput): HubWidget[] {
  const { user, experience } = context;

  const cartCount = new Set(
    user.cartProductIds
  ).size;

  const wishlistCount = new Set(
    user.wishlistProductIds
  ).size;

  const recentCount = new Set(
    user.recentProductIds
  ).size;

  /*
   * Commerce and activity widgets must still resolve when
   * optional mock experience data is unavailable.
   *
   * This is important for the standalone mobile Hub shell.
   */
  const resolvedWidgets = widgets.map(
    widget => {
      switch (widget.id) {
        case 'cart-summary':
          return {
            ...widget,

            /*
             * Keep the cart widget mounted while empty so its
             * custom component can render an empty state.
             */
            enabled: widget.enabled,

            badge:
              cartCount > 0
                ? `${cartCount} ${
                    cartCount === 1
                      ? 'selection'
                      : 'selections'
                  }`
                : undefined,

            description:
              cartCount > 0
                ? 'Your current cart is ready to continue.'
                : 'Your cart is currently empty.'
          };

        case 'wishlist-alert':
        case 'wishlisted-products':
          return {
            ...widget,

            enabled:
              widget.enabled &&
              wishlistCount > 0,

            badge:
              wishlistCount > 0
                ? `${wishlistCount} saved`
                : undefined,

            description:
              wishlistCount > 0
                ? 'Saved products are ready to revisit.'
                : 'You currently have no saved products.'
          };

        case 'continue-shopping':
        case 'recently-viewed':
          return {
            ...widget,

            enabled:
              widget.enabled &&
              recentCount > 0,

            badge:
              recentCount > 0
                ? `${recentCount} recent`
                : undefined,

            description:
              recentCount > 0
                ? 'Continue exactly where you stopped.'
                : widget.description
          };

        /*
         * Everything below this point requires the optional
         * experience dataset.
         *
         * When it is unavailable, preserve the configured
         * widget instead of exiting before commerce resolution.
         */
        case 'delivery-tracker':
        case 'active-delivery': {
          if (!experience) {
            return widget;
          }

          const activeDelivery =
            experience.orders.activeDelivery;

          return {
            ...widget,

            enabled:
              widget.enabled &&
              Boolean(activeDelivery),

            badge: activeDelivery
              ? `${activeDelivery.etaMinutes} min`
              : undefined,

            description: activeDelivery
              ? `Order #${activeDelivery.orderId} is ${activeDelivery.status.replace(
                  /-/g,
                  ' '
                )}.`
              : widget.description,

            location:
              activeDelivery?.location,

            progress: activeDelivery
              ? {
                  label: 'Delivery progress',
                  value:
                    activeDelivery.progress,
                  helper:
                    activeDelivery.status.replace(
                      /-/g,
                      ' '
                    )
                }
              : widget.progress,

            timeline:
              activeDelivery?.timeline,

            conditions:
              activeDelivery?.conditions,

            stats: activeDelivery
              ? [
                  {
                    label: 'ETA',
                    value: `${activeDelivery.etaMinutes} mins`
                  },
                  {
                    label: 'Order',
                    value: `#${activeDelivery.orderId}`
                  }
                ]
              : widget.stats
          };
        }

  case 'recent-orders': {
  const recentOrders =
    experience?.orders.recent ?? [];

  const completedOrderCount =
    recentOrders.filter(
      order => order.status === 'delivered'
    ).length;

  const activeOrderCount =
    recentOrders.filter(
      order => order.status !== 'delivered'
    ).length;

  const hasActiveCart = cartCount > 0;

  /*
   * A cart is one active purchase journey,
   * regardless of how many products it contains.
   */
  const inProgressCount =
    activeOrderCount +
    (hasActiveCart ? 1 : 0);

  return {
    ...widget,

    enabled: widget.enabled,

    badge:
      inProgressCount > 0
        ? `${inProgressCount} in progress`
        : undefined,

    description:
      hasActiveCart
        ? `${cartCount} ${
            cartCount === 1
              ? 'cart selection is'
              : 'cart selections are'
          } waiting alongside your active orders.`
        : recentOrders.length > 0
          ? 'Your latest AJ Logik order activity.'
          : 'You have no active shopping activity yet.',

    stats: [
      {
        label: 'Completed',
        value: completedOrderCount
      },
      {
        label: 'In progress',
        value: inProgressCount
      },
      {
        label: 'Cart items',
        value: cartCount
      }
    ]
  };
}
        case 'rewards-summary':
        case 'reward-points': {
          if (!experience) {
            return widget;
          }

          const rewards = experience.rewards;

          return {
            ...widget,

            enabled:
              widget.enabled &&
              rewards.tier !== 'guest',

            badge:
              rewards.tier === 'premium'
                ? 'Premium'
                : 'Member',

            stats: [
              {
                label: 'Points',
                value:
                  rewards.points.toLocaleString()
              },
              {
                label: 'Coupons',
                value: rewards.coupons
              }
            ],

            progress: {
              label: rewards.nextTier
                ? `To ${rewards.nextTier}`
                : 'Membership progress',

              value:
                rewards.progressToNextTier,

              helper: rewards.nextTier
                ? `${
                    100 -
                    rewards.progressToNextTier
                  }% remaining`
                : undefined
            },

            insight:
              rewards.expiringPoints
                ? `${rewards.expiringPoints} points will expire soon.`
                : widget.insight
          };
      }

        case 'coupons': {
          if (!experience) {
            return widget;
          }

          const coupons = experience.coupons;

          return {
            ...widget,

            enabled:
              widget.enabled &&
              coupons.length > 0,

            badge:
              coupons.length > 0
                ? `${coupons.length} active`
                : undefined,

            slides: coupons.map(coupon => ({
              id: coupon.id,
              title: coupon.title,
              subtitle: coupon.description,
              badge: coupon.badge,
              image: coupon.image
            }))
          };
        }

        case 'suggested-picks':
        case 'ai-suggestions': {
          if (!experience) {
            return widget;
          }

          const intelligence =
            experience.intelligence;

          return {
            ...widget,

            enabled:
              widget.enabled &&
              intelligence.suggestedProductIds
                .length > 0,

            title:
              user.tier === 'premium'
                ? 'Premium Intelligence'
                : 'AJ AI Suggestions',

            description:
              intelligence.headline,

            insight:
              intelligence.insight,

            badge:
              user.tier === 'premium'
                ? 'Exclusive'
                : 'Smart'
          };
        }

        case 'pairing-assistant': {
          if (!experience) {
            return widget;
          }

          const intelligence =
            experience.intelligence;

          return {
            ...widget,

            enabled:
              widget.enabled &&
              intelligence.pairingProductIds
                .length > 0,

            insight:
              intelligence.insight
          };
        }

        case 'shopping-promos':
        case 'home-deals':
          if (!experience) {
            return widget;
          }

          return {
            ...widget,

            description:
              experience.promotions
                .bannerMessage,

            badge:
              user.tier === 'premium'
                ? 'Reserved'
                : widget.badge
          };

        default:
          return widget;
      }
    }
  );

  return resolvedWidgets
    .filter(widget => widget.enabled)
    .sort(
      (firstWidget, secondWidget) =>
        firstWidget.order -
        secondWidget.order
    );
}