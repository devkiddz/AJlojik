'use client';

import { useMemo, useState } from 'react';

import { ChevronRight } from 'lucide-react';

import { useFeedExperience } from '@/features/feed-experience';

import { cn } from '@/lib/utils';
import CompactDiscoveryRail from './components/CompactDiscoveryRail';
import DiscoveryHubPanel from './DiscoveryHubPanel';
import { DiscoveryHubProvider } from './DiscoveryHubProvider';
import { selectCompactDiscoveryItems, selectDiscoveryHubWidgets } from '@/features/feed-experience/selectors';

import type { CompactDiscoveryItem, HubGroup, HubGroupId, HubWidget } from './discoveryHubTypes';

type DesktopDiscoveryRailProps = {
  groups: HubGroup[];
  widgets: HubWidget[];

  collapsed: boolean;

  onCollapsedChange: (collapsed: boolean) => void;
};

export default function DesktopDiscoveryRail({
  groups,
  widgets,
  collapsed,
  onCollapsedChange
}: DesktopDiscoveryRailProps) {
  const { context } = useFeedExperience();

  /**
   * The rail now owns the selected Hub group.
   * It remains available whether the full panel is mounted or not.
   */
  const [activeHubGroupId, setActiveHubGroupId] = useState<HubGroupId>('home');

  const compactItems = useMemo(() => selectCompactDiscoveryItems(context), [context]);
  const resolvedWidgets = useMemo(() => selectDiscoveryHubWidgets({ widgets, context }), [widgets, context]);

  const handleSelectItem = (item: CompactDiscoveryItem) => {
    if (!item.groupId) {
      onCollapsedChange(false);
      return;
    }

    /**
     * First store the requested experience.
     * Then expand the Hub.
     */
    setActiveHubGroupId(item.groupId);

    onCollapsedChange(false);
  };

  return (
    <aside
      className={cn(
        'sticky top-0 hidden max-h-[calc(100vh-5rem)] self-start overflow-hidden transition-all duration-300 lg:block',

        collapsed ? 'lg:col-span-2' : 'lg:col-span-4'
      )}>
      <DiscoveryHubProvider
        groups={groups}
        widgets={resolvedWidgets}
        activeGroupId={activeHubGroupId}
        onActiveGroupIdChange={setActiveHubGroupId}>
        {collapsed ? (
          <CompactDiscoveryRail
            items={compactItems}
            onExpand={() => onCollapsedChange(false)}
            onSelectItem={handleSelectItem}
          />
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() => onCollapsedChange(true)}
              aria-label="Collapse Discovery Hub"
              className="absolute right-3 top-3 z-20 grid size-9 place-items-center rounded-full border border-border bg-background/85 text-muted-foreground shadow-sm backdrop-blur transition hover:text-foreground">
              <ChevronRight className="size-4" />
            </button>

            <DiscoveryHubPanel />
          </div>
        )}
      </DiscoveryHubProvider>
    </aside>
  );
}
