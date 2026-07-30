import type {
  ComponentType
} from 'react';

import CartSummaryWidget from './widgets/CartSummaryWidget';

import ContinueShoppingWidget from './widgets/ContinueShoppingWidget';

import HubWishlistWidget from './widgets/HubWishlistWidget';

import RecentlyViewedWidget from './widgets/RecentlyViewedWidget';

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
    ]
  ]);
