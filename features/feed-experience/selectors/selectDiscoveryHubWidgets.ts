import type { HubWidget } from '@/components/discovery-hub-panel/discoveryHubTypes';

import type { FeedContext } from '../contracts';

type SelectDiscoveryHubWidgetsInput = {
  widgets: HubWidget[];
  context: FeedContext;
};

export function selectDiscoveryHubWidgets({
  widgets,
  context
}: SelectDiscoveryHubWidgetsInput): HubWidget[] {
  const experience = context.experience;

  if (!experience) {
    return widgets
      .filter(widget => widget.enabled)
      .sort(
        (firstWidget, secondWidget) =>
          firstWidget.order -
          secondWidget.order
      );
  }

  const {
    user,
    activity
  } = context;

  const {
    orders,
    rewards,
    coupons,
    intelligence
  } = experience;

  const cartCount =
    user.cartProductIds.length;

  const wishlistCount =
    user.wishlistProductIds.length;

  const recentCount =
    user.recentProductIds.length;

  const activeDelivery =
    orders.activeDelivery;

  const recentOrders =
    orders.recent;

  const resolvedWidgets = widgets.map(widget => {
    switch (widget.id) {
      case 'cart-summary':
        return {
          ...widget,

          enabled: cartCount > 0,

          badge: `${cartCount} ${
            cartCount === 1
              ? 'item'
              : 'items'
          }`,

          description:
            cartCount > 0
              ? 'Your current cart is ready for checkout.'
              : 'Your cart is currently empty.'
        };

      case 'wishlist-alert':
        return {
          ...widget,

          enabled: wishlistCount > 0,

          badge:
            `${wishlistCount} saved`,

          description:
            wishlistCount > 0
              ? 'Saved products are ready to revisit.'
              : 'You currently have no saved products.'
        };

      case 'continue-shopping':
      case 'recently-viewed':
        return {
          ...widget,

          enabled: recentCount > 0,

          badge:
            recentCount > 0
              ? `${recentCount} recent`
              : undefined,

          description:
            recentCount > 0
              ? 'Continue exactly where you stopped.'
              : widget.description
        };

      case 'delivery-tracker':
      case 'active-delivery':
        return {
          ...widget,

          enabled: Boolean(activeDelivery),

          badge: activeDelivery
            ? `${activeDelivery.etaMinutes} min`
            : undefined,

          description: activeDelivery
            ? `Order #${activeDelivery.orderId} is ${activeDelivery.status.replace('-', ' ')}.`
            : widget.description,

          location:
            activeDelivery?.location,

          progress: activeDelivery
            ? {
                label: 'Delivery progress',
                value:
                  activeDelivery.progress,

                helper:
                  activeDelivery.status
                    .replace('-', ' ')
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
                  value:
                    `${activeDelivery.etaMinutes} mins`
                },

                {
                  label: 'Order',
                  value:
                    `#${activeDelivery.orderId}`
                }
              ]
            : widget.stats
        };

      case 'recent-orders':
        return {
          ...widget,

          enabled:
            recentOrders.length > 0,

          badge:
            `${recentOrders.length} ${
              recentOrders.length === 1
                ? 'order'
                : 'orders'
            }`,

          stats: [
            {
              label: 'Completed',
              value:
                recentOrders.filter(
                  order =>
                    order.status ===
                    'delivered'
                ).length
            },

            {
              label: 'Active',
              value:
                recentOrders.filter(
                  order =>
                    order.status !==
                    'delivered'
                ).length
            }
          ]
        };

      case 'rewards-summary':
      case 'reward-points':
        return {
          ...widget,

          enabled:
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
              value:
                rewards.coupons
            }
          ],

          progress: {
            label: rewards.nextTier
              ? `To ${rewards.nextTier}`
              : 'Membership progress',

            value:
              rewards.progressToNextTier,

            helper: rewards.nextTier
              ? `${100 - rewards.progressToNextTier}% remaining`
              : undefined
          },

          insight:
            rewards.expiringPoints
              ? `${rewards.expiringPoints} points will expire soon.`
              : widget.insight
        };

      case 'coupons':
        return {
          ...widget,

          enabled: coupons.length > 0,

          badge:
            `${coupons.length} active`,

          slides: coupons.map(coupon => ({
            id: coupon.id,
            title: coupon.title,
            subtitle:
              coupon.description,
            badge: coupon.badge,
            image: coupon.image
          }))
        };

      case 'suggested-picks':
      case 'ai-suggestions':
        return {
          ...widget,

          enabled:
            intelligence
              .suggestedProductIds
              .length > 0,

          title:
            context.user.tier ===
            'premium'
              ? 'Premium Intelligence'
              : 'AJ AI Suggestions',

          description:
            intelligence.headline,

          insight:
            intelligence.insight,

          badge:
            context.user.tier ===
            'premium'
              ? 'Exclusive'
              : 'Smart'
        };

      case 'pairing-assistant':
        return {
          ...widget,

          enabled:
            intelligence
              .pairingProductIds
              .length > 0,

          insight:
            intelligence.insight
        };

      case 'shopping-promos':
      case 'home-deals':
        return {
          ...widget,

          description:
            experience.promotions
              .bannerMessage,

          badge:
            context.user.tier ===
            'premium'
              ? 'Reserved'
              : widget.badge
        };

      default:
        return widget;
    }
  });

  return resolvedWidgets
    .filter(widget => widget.enabled)
    .sort(
      (firstWidget, secondWidget) =>
        firstWidget.order -
        secondWidget.order
    );
}