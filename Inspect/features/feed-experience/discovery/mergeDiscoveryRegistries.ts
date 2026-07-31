import type {
  DiscoveryGroupDefinition,
  DiscoveryRegistry,
  DiscoveryWidgetDefinition
} from '@/components/discovery-hub-panel/discoveryHubTypes';

/**
 * Merges Discovery capability layers from least specific to
 * most specific. Later definitions replace earlier definitions
 * with the same ID.
 *
 * Recommended order:
 * RCENTZ core -> product blueprint -> business/workspace.
 */
export function mergeDiscoveryRegistries(
  ...registries: DiscoveryRegistry[]
): DiscoveryRegistry {
  const groups = new Map<
    string,
    DiscoveryGroupDefinition
  >();

  const widgets = new Map<
    string,
    DiscoveryWidgetDefinition
  >();

  registries.forEach(registry => {
    registry.groups.forEach(group => {
      groups.set(group.id, group);
    });

    registry.widgets.forEach(widget => {
      widgets.set(widget.id, widget);
    });
  });

  return {
    groups: [...groups.values()],
    widgets: [...widgets.values()]
  };
}
