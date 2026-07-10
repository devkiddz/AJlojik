'use client';

import { useMemo } from 'react';

import HubCard from './components/HubCard';
import { useDiscoveryHub } from './DiscoveryHubProvider';
import { discoveryHubRegistry } from './discoveryHubRegistry';

export function DiscoveryHubRenderer() {
  const { widgets, activeGroupId } = useDiscoveryHub();

  const activeWidgets = useMemo(() => {
    return widgets.filter(widget => widget.groupId === activeGroupId);
  }, [widgets, activeGroupId]);

  if (!activeWidgets.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-background/[0.03] p-4 text-sm text-primary/60">
        No widgets available for this section yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activeWidgets.map(widget => {
        const WidgetComponent = discoveryHubRegistry.get(widget.id);

        if (WidgetComponent) {
          return <WidgetComponent key={widget.id} />;
        }

        return <HubCard key={widget.id} widget={widget} />;
      })}
    </div>
  );
}
