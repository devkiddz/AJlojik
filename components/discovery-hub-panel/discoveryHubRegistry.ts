import type {
  ComponentType
} from 'react';

import CartSummaryWidget from './widgets/CartSummaryWidget';

import HubWishlistWidget from './widgets/HubWishlistWidget';

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
    ]
  ]);