import { ComponentType } from "react";

import { HubWidgetId } from "./discoveryHubTypes";

export type HubWidgetComponent = ComponentType;

export const discoveryHubRegistry = new Map<
  HubWidgetId,
  HubWidgetComponent
>();