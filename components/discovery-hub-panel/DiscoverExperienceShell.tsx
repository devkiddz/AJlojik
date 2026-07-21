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
  PanelRightOpen
} from 'lucide-react';

import ActiveProductWidget from '@/components/ActiveProductWidget';

import {
  useMobileDiscovery
} from '@/components/layout/MobileApplicationShell';

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

import DiscoveryHubPanel from './DiscoveryHubPanel';

import {
  DiscoveryHubRenderer
} from './DiscoveryHubRenderer';

import type {
  HubGroupId
} from './discoveryHubTypes';

type MobileHubView =
  | 'discovery'
  | 'product';

export default function DiscoverExperienceShell() {
  const pathname =
    usePathname();

  const {
    closeDiscovery
  } = useMobileDiscovery();

  const {
    intent,
    context,
    continueDiscovery
  } = useFeedExperience();

  const pageMode =
    resolveDiscoveryPageMode(
      pathname
    );

  const [
    activeGroupId,
    setActiveGroupId
  ] =
    useState<HubGroupId>('');

  const [
    viewPreference,
    setViewPreference
  ] = useState<{
    productId: string;
    view: MobileHubView;
  } | null>(null);

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

          registry:
            discoveryRegistry,

          previousActiveGroupId:
            activeGroupId ||
            undefined
        }),
      [
        activeGroupId,
        context,
        intent,
        pageMode
      ]
    );

  const resolutionFocusKey =
    `${pageMode}:${intent.id}`;

  useEffect(() => {
    const activeGroupStillExists =
      resolution.groups.some(
        group =>
          group.id ===
          activeGroupId
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

      setActiveGroupId(
        resolution.primaryGroupId ??
          resolution.groups[0]?.id ??
          ''
      );
    }
  }, [
    activeGroupId,
    resolution.groups,
    resolution.primaryGroupId,
    resolutionFocusKey
  ]);

  const activeProductId =
    intent.type === 'product'
      ? intent.targetId ??
        null
      : null;

  const activeView: MobileHubView =
    !activeProductId
      ? 'discovery'
      : viewPreference
            ?.productId ===
          activeProductId
        ? viewPreference.view
        : 'product';

  const showProduct =
    Boolean(
      activeProductId
    ) &&
    activeView === 'product';

  useEffect(() => {
    if (
      activeView !==
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
  }, [activeView]);

  const handleDiscoveryScroll = (
    event:
      UIEvent<HTMLDivElement>
  ) => {
    discoveryScrollTopRef.current =
      event.currentTarget.scrollTop;
  };

  const handleGroupSelect = (
    groupId: HubGroupId
  ) => {
    setActiveGroupId(
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

  const handleContinueDiscovery =
    () => {
      /**
       * Restore the captured pre-product intent rather than
       * merely swapping the Hub's local panel. The Hub stays
       * open on mobile and continues from its preserved group
       * and scroll position while the Feed returns to discovery.
       */
      setViewPreference(null);

      continueDiscovery();
    };

  const handleShowProduct =
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
    };

  return (
    <DiscoveryHubProvider
      groups={resolution.groups}
      widgets={
        resolution.widgets
      }
      activeGroupId={
        activeGroupId
      }
      onActiveGroupIdChange={
        setActiveGroupId
      }
    >
      <div className="relative h-full min-h-0 w-full overflow-hidden">
        <DiscoveryHubPanel
          className="h-full"
          onGroupSelect={
            handleGroupSelect
          }
        >
          <div className="h-full min-h-0 overflow-hidden">
            <div
              aria-hidden={
                showProduct
              }
              className={cn(
                'h-full min-h-0',

                showProduct
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
                <div className="w-full p-3 pb-28 md:p-4">
                  <DiscoveryHubRenderer />
                </div>
              </div>
            </div>

            {showProduct ? (
              <div className="h-full min-h-0 overflow-hidden">
                <ActiveProductWidget
                  onBackToDiscovery={
                    handleContinueDiscovery
                  }
                  onRevealInFeed={
                    closeDiscovery
                  }
                />
              </div>
            ) : null}
          </div>
        </DiscoveryHubPanel>

        {activeProductId &&
        !showProduct ? (
          <button
            type="button"
            onClick={
              handleShowProduct
            }
            className="absolute bottom-4 right-4 z-[70] inline-flex h-11 items-center gap-2 rounded-full border border-primary/20 bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xl shadow-primary/25 transition hover:-translate-y-0.5 hover:bg-primary/90"
          >
            <PanelRightOpen className="size-4" />

            Product details
          </button>
        ) : null}
      </div>
    </DiscoveryHubProvider>
  );
}
