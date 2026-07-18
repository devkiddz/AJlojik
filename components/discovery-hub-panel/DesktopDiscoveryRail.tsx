'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { ChevronRight, PanelRightOpen } from 'lucide-react';

import { useFeedExperience } from '@/features/feed-experience';

import { selectCompactDiscoveryItems, selectDiscoveryHubWidgets } from '@/features/feed-experience/selectors';

import { cn } from '@/lib/utils';

import ActiveProductWidget from '@/components/ActiveProductWidget';
import CompactDiscoveryRail from './components/CompactDiscoveryRail';
import DiscoveryHubPanel from './DiscoveryHubPanel';
import { DiscoveryHubRenderer } from './DiscoveryHubRenderer';
import { DiscoveryHubProvider } from './DiscoveryHubProvider';

import type { CompactDiscoveryItem, HubGroup, HubGroupId, HubWidget } from './discoveryHubTypes';

type DesktopDiscoveryRailProps = {
  groups: HubGroup[];
  widgets: HubWidget[];
  collapsed: boolean;

  onCollapsedChange: (collapsed: boolean) => void;
};

type HubView = 'discovery' | 'product';

export default function DesktopDiscoveryRail({
  groups,
  widgets,
  collapsed,
  onCollapsedChange
}: DesktopDiscoveryRailProps) {
  const { intent, context } = useFeedExperience();

  const [activeHubGroupId, setActiveHubGroupId] = useState<HubGroupId>('home');

  const [viewPreference, setViewPreference] = useState<{
    productId: string;
    view: HubView;
  } | null>(null);

  const lastExpandedProductIdRef = useRef<string | null>(null);

  /*
   * Preserve the exact Discovery Hub scroll position.
   */
  const discoveryScrollRef = useRef<HTMLDivElement>(null);

  const discoveryScrollTopRef = useRef(0);

  const activeProductId = intent.type === 'product' ? (intent.targetId ?? null) : null;

  const hubView: HubView = !activeProductId
    ? 'discovery'
    : viewPreference?.productId === activeProductId
      ? viewPreference.view
      : 'product';

  const productMode = Boolean(activeProductId);

  const showProductPanel = productMode && hubView === 'product';

  /*
   * A new product experience expands the rail once. The visible
   * view itself is derived from the active product and the user's
   * explicit preference, so no state reset effect is required.
   */
  useEffect(() => {
    if (!activeProductId) {
      lastExpandedProductIdRef.current = null;
      return;
    }

    if (lastExpandedProductIdRef.current === activeProductId) {
      return;
    }

    lastExpandedProductIdRef.current = activeProductId;
    onCollapsedChange(false);
  }, [activeProductId, onCollapsedChange]);

  /*
   * Restore the original Hub scroll position when
   * Discovery becomes visible again.
   */
  useEffect(() => {
    if (hubView !== 'discovery') {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      if (discoveryScrollRef.current) {
        discoveryScrollRef.current.scrollTop = discoveryScrollTopRef.current;
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [hubView]);

  const compactItems = useMemo(() => selectCompactDiscoveryItems(context), [context]);

  const resolvedWidgets = useMemo(
    () =>
      selectDiscoveryHubWidgets({
        widgets,
        context
      }),
    [widgets, context]
  );

  /*
   * Selecting a Hub tab intentionally changes the
   * Discovery experience and exposes the preserved Hub.
   */
  const handleNavigatorGroupSelect = (groupId: HubGroupId) => {
    setActiveHubGroupId(groupId);

    setViewPreference(
      activeProductId
        ? { productId: activeProductId, view: 'discovery' }
        : null
    );
  };

  const handleSelectItem = (item: CompactDiscoveryItem) => {
    if (item.groupId) {
      setActiveHubGroupId(item.groupId);
    }

    setViewPreference(
      activeProductId
        ? { productId: activeProductId, view: 'discovery' }
        : null
    );

    onCollapsedChange(false);
  };

  /*
   * Return to the exact Discovery Hub instance.
   *
   * The renderer was never unmounted, so widget state,
   * selected group and scroll position remain available.
   */
  const handleBackToDiscovery = () => {
    setViewPreference(
      activeProductId
        ? { productId: activeProductId, view: 'discovery' }
        : null
    );
  };

  const handleShowProductDetails = () => {
    if (!activeProductId) {
      return;
    }

    setViewPreference({
      productId: activeProductId,
      view: 'product'
    });

    onCollapsedChange(false);
  };

  const handleDiscoveryScroll = (event: React.UIEvent<HTMLDivElement>) => {
    discoveryScrollTopRef.current = event.currentTarget.scrollTop;
  };

  return (
    <aside
      className={cn(
        'relative hidden min-w-0 overflow-hidden transition-all duration-300',
        'lg:block lg:h-[calc(100dvh-6.5rem)]',

        collapsed ? 'lg:col-span-2' : 'lg:col-span-4'
      )}>
      <DiscoveryHubProvider
        groups={groups}
        widgets={resolvedWidgets}
        activeGroupId={activeHubGroupId}
        onActiveGroupIdChange={setActiveHubGroupId}>
        <div className="absolute inset-0 min-h-0 overflow-hidden">
          {collapsed ? (
            <CompactDiscoveryRail
              items={compactItems}
              onExpand={() => onCollapsedChange(false)}
              onSelectItem={handleSelectItem}
            />
          ) : (
            <div className="relative h-full min-h-0 w-full overflow-hidden">
              <DiscoveryHubPanel onGroupSelect={handleNavigatorGroupSelect}>
                <div className="h-full min-h-0 overflow-hidden">
                  {/*
                   * PRESERVED DISCOVERY HUB
                   *
                   * This remains mounted even while hidden.
                   * Product details do not replace its state.
                   */}

                  <div
                    className={cn(
                      'h-full min-h-0',

                      showProductPanel ? 'hidden' : 'block'
                    )}>
                    <div
                      ref={discoveryScrollRef}
                      onScroll={handleDiscoveryScroll}
                      className="h-full overflow-x-hidden overflow-y-auto overscroll-y-contain [scrollbar-gutter:stable]">
                      <div className="w-full p-3 pb-24 md:p-4">
                        <DiscoveryHubRenderer />
                      </div>
                    </div>
                  </div>

                  {/*
                   * PRODUCT PANEL
                   *
                   * Rendered only when active, so there are not
                   * two scrolling panels competing for control.
                   */}

                  {showProductPanel ? (
                    <div className="h-full min-h-0 overflow-hidden">
                      <ActiveProductWidget onBackToDiscovery={handleBackToDiscovery} />
                    </div>
                  ) : null}
                </div>
              </DiscoveryHubPanel>

              {/* Collapse rail */}

              <button
                type="button"
                onClick={() => onCollapsedChange(true)}
                aria-label="Collapse Discovery Hub"
                className="absolute right-3 top-3 z-[70] grid size-9 place-items-center rounded-full border border-border bg-background/90 text-muted-foreground shadow-sm backdrop-blur-xl transition hover:bg-muted hover:text-foreground">
                <ChevronRight className="size-4" />
              </button>

              {/* Reopen active product details */}

              {productMode && !showProductPanel ? (
                <button
                  type="button"
                  onClick={handleShowProductDetails}
                  className="absolute bottom-4 right-4 z-[70] inline-flex h-10 items-center gap-2 rounded-full border border-primary/20 bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xl shadow-primary/25 transition hover:-translate-y-0.5 hover:bg-primary/90">
                  <PanelRightOpen className="size-4" />
                  Product details
                </button>
              ) : null}
            </div>
          )}
        </div>
      </DiscoveryHubProvider>
    </aside>
  );
}
