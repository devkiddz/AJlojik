'use client';

import { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { flushSync } from 'react-dom';
import { useFeedExperience } from '@/features/feed-experience';
import { selectCompactDiscoveryItems } from '@/features/feed-experience/selectors';
import { cn } from '@/lib/utils';

import CompactDiscoveryRail from './components/CompactDiscoveryRail';
import DiscoveryHubPanel from './DiscoveryHubPanel';
import { DiscoveryHubProvider, useDiscoveryHub } from './DiscoveryHubProvider';

import type { CompactDiscoveryItem, HubGroup, HubWidget } from './discoveryHubTypes';

type DesktopDiscoveryRailProps = {
  groups: HubGroup[];
  widgets: HubWidget[];
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
};

type RailContentProps = {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
};

function DesktopDiscoveryRailContent({ collapsed, onCollapsedChange }: RailContentProps) {
  const { context } = useFeedExperience();
  const { setActiveGroupId } = useDiscoveryHub();

  const compactItems = useMemo(() => selectCompactDiscoveryItems(context), [context]);

  const handleSelectItem = (item: CompactDiscoveryItem) => {
    if (!item.groupId) return;

    flushSync(() => {
      setActiveGroupId(item.groupId!);
    });

    onCollapsedChange(false);
  };
  return (
    <aside
      className={cn(
        'sticky top-0 hidden max-h-[calc(100vh-5rem)] self-start overflow-hidden transition-all duration-300 lg:block',
        collapsed ? 'lg:col-span-2' : 'lg:col-span-4'
      )}>
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
            className="absolute right-3 top-3 z-20 grid size-9 place-items-center rounded-full border border-border bg-background/85 text-muted-foreground">
            <ChevronRight className="size-4" />
          </button>

          <DiscoveryHubPanel />
        </div>
      )}
    </aside>
  );
}

export default function DesktopDiscoveryRail({
  groups,
  widgets,
  collapsed,
  onCollapsedChange
}: DesktopDiscoveryRailProps) {
  return (
    <DiscoveryHubProvider groups={groups} widgets={widgets}>
      <DesktopDiscoveryRailContent collapsed={collapsed} onCollapsedChange={onCollapsedChange} />
    </DiscoveryHubProvider>
  );
}
