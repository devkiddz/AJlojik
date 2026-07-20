'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type UIEvent
} from 'react';

import {
  usePathname
} from 'next/navigation';

import {
  ChevronRight,
  PanelRightOpen
} from 'lucide-react';

import ActiveProductWidget from '@/components/ActiveProductWidget';

import {
  discoveryRegistry
} from '@/data/discoveryHubData';

import {
  resolveDiscoveryExperience,
  resolveDiscoveryPageMode
} from '@/features/feed-experience/discovery';

import {
  useFeedExperience
} from '@/features/feed-experience';

import { cn } from '@/lib/utils';

import {
  DiscoveryHubProvider
} from '@/providers/DiscoveryHubProvider';

import CompactDiscoveryRail from './components/CompactDiscoveryRail';

import DiscoveryHubPanel from './DiscoveryHubPanel';

import {
  DiscoveryHubRenderer
} from './DiscoveryHubRenderer';

import type {
  CompactDiscoveryItem,
  DiscoveryRegistry,
  HubGroup,
  HubGroupId,
  HubWidget
} from './discoveryHubTypes';

type DesktopDiscoveryRailProps = {
  /**
   * Compatibility props.
   *
   * Existing callers may still pass groups and widgets.
   * The dynamic registry is now the source of truth.
   */
  groups?: HubGroup[];
  widgets?: HubWidget[];

  registry?: DiscoveryRegistry;

  collapsed: boolean;

  onCollapsedChange: (
    collapsed: boolean
  ) => void;
};

type HubView =
  | 'discovery'
  | 'product';

export default function DesktopDiscoveryRail({
  registry =
    discoveryRegistry,
  collapsed,
  onCollapsedChange
}: DesktopDiscoveryRailProps) {
  const pathname =
    usePathname();

  const {
    intent,
    context
  } = useFeedExperience();

  const pageMode =
    resolveDiscoveryPageMode(
      pathname
    );

  const [
    activeHubGroupId,
    setActiveHubGroupId
  ] =
    useState<HubGroupId>('');

  const [
    viewPreference,
    setViewPreference
  ] = useState<{
    productId: string;
    view: HubView;
  } | null>(null);

  const lastExpandedProductIdRef =
    useRef<string | null>(
      null
    );

  const lastResolutionFocusRef =
    useRef<string>('');

  const discoveryScrollRef =
    useRef<HTMLDivElement>(
      null
    );

  const discoveryScrollTopRef =
    useRef(0);

  const resolution =
    useMemo(
      () =>
        resolveDiscoveryExperience({
          pageMode,

          intent,

          context,

          registry,

          previousActiveGroupId:
            activeHubGroupId ||
            undefined
        }),
      [
        activeHubGroupId,
        context,
        intent,
        pageMode,
        registry
      ]
    );

  const resolutionFocusKey =
    `${pageMode}:${intent.id}`;

  useEffect(() => {
    const activeGroupStillExists =
      resolution.groups.some(
        group =>
          group.id ===
          activeHubGroupId
      );

    const experienceChanged =
      lastResolutionFocusRef.current !==
      resolutionFocusKey;

    if (
      experienceChanged ||
      !activeGroupStillExists
    ) {
      lastResolutionFocusRef.current =
        resolutionFocusKey;

      setActiveHubGroupId(
        resolution.primaryGroupId ??
          resolution.groups[0]?.id ??
          ''
      );
    }
  }, [
    activeHubGroupId,
    resolution.groups,
    resolution.primaryGroupId,
    resolutionFocusKey
  ]);

  const activeProductId =
    intent.type === 'product'
      ? intent.targetId ??
        null
      : null;

  const hubView: HubView =
    !activeProductId
      ? 'discovery'
      : viewPreference
            ?.productId ===
          activeProductId
        ? viewPreference.view
        : 'product';

  const productMode =
    Boolean(
      activeProductId
    );

  const showProductPanel =
    productMode &&
    hubView === 'product';

  useEffect(() => {
    if (!activeProductId) {
      lastExpandedProductIdRef.current =
        null;

      return;
    }

    if (
      lastExpandedProductIdRef.current ===
      activeProductId
    ) {
      return;
    }

    lastExpandedProductIdRef.current =
      activeProductId;

    onCollapsedChange(false);
  }, [
    activeProductId,
    onCollapsedChange
  ]);

  useEffect(() => {
    if (
      hubView !==
      'discovery'
    ) {
      return;
    }

    const frameId =
      window.requestAnimationFrame(
        () => {
          if (
            discoveryScrollRef.current
          ) {
            discoveryScrollRef.current.scrollTop =
              discoveryScrollTopRef.current;
          }
        }
      );

    return () => {
      window.cancelAnimationFrame(
        frameId
      );
    };
  }, [hubView]);

  const handleNavigatorGroupSelect =
    (
      groupId: HubGroupId
    ) => {
      setActiveHubGroupId(
        groupId
      );

      setViewPreference(
        activeProductId
          ? {
              productId:
                activeProductId,

              view:
                'discovery'
            }
          : null
      );
    };

  const handleSelectItem = (
    item: CompactDiscoveryItem
  ) => {
    if (item.groupId) {
      setActiveHubGroupId(
        item.groupId
      );
    }

    setViewPreference(
      activeProductId
        ? {
            productId:
              activeProductId,

            view:
              'discovery'
          }
        : null
    );

    onCollapsedChange(false);
  };

  const handleBackToDiscovery =
    () => {
      setViewPreference(
        activeProductId
          ? {
              productId:
                activeProductId,

              view:
                'discovery'
            }
          : null
      );
    };

  const handleShowProductDetails =
    () => {
      if (!activeProductId) {
        return;
      }

      setViewPreference({
        productId:
          activeProductId,

        view:
          'product'
      });

      onCollapsedChange(false);
    };

  const handleDiscoveryScroll = (
    event:
      UIEvent<HTMLDivElement>
  ) => {
    discoveryScrollTopRef.current =
      event.currentTarget.scrollTop;
  };

  return (
    <aside
      className={cn(
        'relative hidden min-w-0 overflow-hidden transition-all duration-300',
        'lg:block lg:h-[calc(100dvh-6.5rem)]',

        collapsed
          ? 'lg:col-span-2'
          : 'lg:col-span-4'
      )}
    >
      <DiscoveryHubProvider
        groups={
          resolution.groups
        }
        widgets={
          resolution.widgets
        }
        activeGroupId={
          activeHubGroupId
        }
        onActiveGroupIdChange={
          setActiveHubGroupId
        }
      >
        <div className="absolute inset-0 min-h-0 overflow-hidden">
          {collapsed ? (
            <CompactDiscoveryRail
              items={
                resolution.compactItems
              }
              onExpand={() =>
                onCollapsedChange(
                  false
                )
              }
              onSelectItem={
                handleSelectItem
              }
            />
          ) : (
            <div className="relative h-full min-h-0 w-full overflow-hidden">
              <DiscoveryHubPanel
                onGroupSelect={
                  handleNavigatorGroupSelect
                }
              >
                <div className="h-full min-h-0 overflow-hidden">
                  <div
                    className={cn(
                      'h-full min-h-0',

                      showProductPanel
                        ? 'hidden'
                        : 'block'
                    )}
                  >
                    <div
                      ref={
                        discoveryScrollRef
                      }
                      onScroll={
                        handleDiscoveryScroll
                      }
                      className="h-full overflow-x-hidden overflow-y-auto overscroll-y-contain [scrollbar-gutter:stable]"
                    >
                      <div className="w-full p-3 pb-24 md:p-4">
                        <DiscoveryHubRenderer />
                      </div>
                    </div>
                  </div>

                  {showProductPanel ? (
                    <div className="h-full min-h-0 overflow-hidden">
                      <ActiveProductWidget
                        onBackToDiscovery={
                          handleBackToDiscovery
                        }
                      />
                    </div>
                  ) : null}
                </div>
              </DiscoveryHubPanel>

              <button
                type="button"
                onClick={() =>
                  onCollapsedChange(
                    true
                  )
                }
                aria-label="Collapse Discovery Hub"
                className="absolute right-3 top-3 z-[70] grid size-9 place-items-center rounded-full border border-border bg-background/90 text-muted-foreground shadow-sm backdrop-blur-xl transition hover:bg-muted hover:text-foreground"
              >
                <ChevronRight className="size-4" />
              </button>

              {productMode &&
              !showProductPanel ? (
                <button
                  type="button"
                  onClick={
                    handleShowProductDetails
                  }
                  className="absolute bottom-4 right-4 z-[70] inline-flex h-10 items-center gap-2 rounded-full border border-primary/20 bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xl shadow-primary/25 transition hover:-translate-y-0.5 hover:bg-primary/90"
                >
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
