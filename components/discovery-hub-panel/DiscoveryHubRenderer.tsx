'use client';

import { useMemo } from 'react';

import { useDiscoveryHub } from '@/providers/DiscoveryHubProvider';

import HubCard from './components/HubCard';

import { discoveryHubRegistry } from './discoveryHubRegistry';

export function DiscoveryHubRenderer() {
  const { widgets, activeGroupId } = useDiscoveryHub();

  const activeWidgets = useMemo(
    () =>
      widgets
        .filter(widget => widget.enabled && widget.groupId === activeGroupId)
        .sort((firstWidget, secondWidget) => firstWidget.order - secondWidget.order),
    [widgets, activeGroupId]
  );

  if (!activeWidgets.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5">
        <p className="text-sm font-semibold text-foreground">Nothing needs your attention here</p>

        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          This section will update as your commerce activity changes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activeWidgets.map(widget => {
        const componentKey = widget.componentKey ?? widget.id;

        const WidgetComponent = discoveryHubRegistry.get(componentKey);

        if (WidgetComponent) {
          return <WidgetComponent key={widget.id} />;
        }

        return <HubCard key={widget.id} widget={widget} />;
      })}
    </div>
  );
}
