import type { ComponentType } from 'react';

import CartSummaryWidget from './widgets/CartSummaryWidget';

import type { HubWidgetId } from './discoveryHubTypes';

export type HubWidgetComponent = ComponentType;

export const discoveryHubRegistry = new Map<
  HubWidgetId,
  HubWidgetComponent
>([
  ['cart-summary', CartSummaryWidget]
]);