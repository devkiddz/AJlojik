import type {
  ComponentType
} from 'react';

import { NotificationHubWidget } from '@/features/notifications';

import ActiveDeliveryWidget from './widgets/ActiveDeliveryWidget';

import AIIntelligenceWidget from './widgets/AIIntelligenceWidget';

import CartSummaryWidget from './widgets/CartSummaryWidget';

import ContinueShoppingWidget from './widgets/ContinueShoppingWidget';

import HubWishlistWidget from './widgets/HubWishlistWidget';

import RecentlyViewedWidget from './widgets/RecentlyViewedWidget';

import RecentOrdersWidget from './widgets/RecentOrdersWidget';

import ShoppingListsWidget from './widgets/ShoppingListsWidget';

import type {
  DiscoveryComponentKey
} from './discoveryHubTypes';

export type HubWidgetComponent =
  ComponentType;

export const discoveryHubRegistry =
  new Map<
    DiscoveryComponentKey,
    HubWidgetComponent
  >([
    [
      'cart-summary',
      CartSummaryWidget
    ],
    [
      'wishlist-products',
      HubWishlistWidget
    ],
    [
      'continue-shopping',
      ContinueShoppingWidget
    ],
    [
      'recently-viewed',
      RecentlyViewedWidget
    ],
    [
      'recent-orders',
      RecentOrdersWidget
    ],
    [
      'active-delivery',
      ActiveDeliveryWidget
    ],
    [
      'delivery-tracker',
      ActiveDeliveryWidget
    ],
    [
      'shopping-lists-runtime',
      ShoppingListsWidget
    ],
    [
      'notification-runtime',
      NotificationHubWidget
    ],
    [
      'ai-intelligence-runtime',
      AIIntelligenceWidget
    ]
  ]);
