'use client';

import { useEffect, useMemo, useRef, useState, type UIEvent } from 'react';

import { PanelRightOpen } from 'lucide-react';

import ActiveProductWidget from '@/components/ActiveProductWidget';

import { hubGroups, hubWidgets } from '@/data/discoveryHubData';

import { useFeedExperience } from '@/features/feed-experience';

import { selectDiscoveryHubWidgets } from '@/features/feed-experience/selectors';

import { cn } from '@/lib/utils';

import DiscoveryHubPanel from './DiscoveryHubPanel';

import { DiscoveryHubProvider } from '../../providers/DiscoveryHubProvider';

import { DiscoveryHubRenderer } from './DiscoveryHubRenderer';

import type { HubGroupId } from './discoveryHubTypes';

type MobileHubView = 'discovery' | 'product';

export default function DiscoverExperienceShell() {
  const { intent, context } = useFeedExperience();

  const [activeGroupId, setActiveGroupId] = useState<HubGroupId>('home');

  const [viewPreference, setViewPreference] = useState<{
    productId: string;
    view: MobileHubView;
  } | null>(null);

  const discoveryScrollRef = useRef<HTMLDivElement>(null);

  const discoveryScrollTopRef = useRef(0);

  const activeProductId = intent.type === 'product' ? (intent.targetId ?? null) : null;

  const activeView: MobileHubView = !activeProductId
    ? 'discovery'
    : viewPreference?.productId === activeProductId
      ? viewPreference.view
      : 'product';

  const showProduct = Boolean(activeProductId) && activeView === 'product';

  const resolvedWidgets = useMemo(
    () =>
      selectDiscoveryHubWidgets({
        widgets: hubWidgets,
        context
      }),
    [context]
  );

  useEffect(() => {
    if (activeView !== 'discovery') {
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
  }, [activeView]);

  const handleDiscoveryScroll = (event: UIEvent<HTMLDivElement>) => {
    discoveryScrollTopRef.current = event.currentTarget.scrollTop;
  };

  const handleGroupSelect = (groupId: HubGroupId) => {
    setActiveGroupId(groupId);

    setViewPreference(
      activeProductId
        ? {
            productId: activeProductId,

            view: 'discovery'
          }
        : null
    );
  };

  const handleContinueDiscovery = () => {
    setViewPreference(
      activeProductId
        ? {
            productId: activeProductId,

            view: 'discovery'
          }
        : null
    );
  };

  const handleShowProduct = () => {
    if (!activeProductId) {
      return;
    }

    setViewPreference({
      productId: activeProductId,

      view: 'product'
    });
  };

  return (
    <DiscoveryHubProvider
      groups={hubGroups}
      widgets={resolvedWidgets}
      activeGroupId={activeGroupId}
      onActiveGroupIdChange={setActiveGroupId}>
      <div className="relative h-full min-h-0 w-full overflow-hidden">
        <DiscoveryHubPanel className="h-full" onGroupSelect={handleGroupSelect}>
          <div className="h-full min-h-0 overflow-hidden">
            {/* Preserved Discovery Hub */}

            <div
              aria-hidden={showProduct}
              className={cn(
                'h-full min-h-0',

                showProduct ? 'hidden' : 'block'
              )}>
              <div
                ref={discoveryScrollRef}
                onScroll={handleDiscoveryScroll}
                className="h-full overflow-x-hidden overflow-y-auto overscroll-y-contain [scrollbar-gutter:stable]">
                <div className="w-full p-3 pb-28 md:p-4">
                  <DiscoveryHubRenderer />
                </div>
              </div>
            </div>

            {/* Active product information */}

            {showProduct ? (
              <div className="h-full min-h-0 overflow-hidden">
                <ActiveProductWidget onBackToDiscovery={handleContinueDiscovery} />
              </div>
            ) : null}
          </div>
        </DiscoveryHubPanel>

        {activeProductId && !showProduct ? (
          <button
            type="button"
            onClick={handleShowProduct}
            className="absolute bottom-4 right-4 z-[70] inline-flex h-11 items-center gap-2 rounded-full border border-primary/20 bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xl shadow-primary/25 transition hover:-translate-y-0.5 hover:bg-primary/90">
            <PanelRightOpen className="size-4" />
            Product details
          </button>
        ) : null}
      </div>
    </DiscoveryHubProvider>
  );
}
