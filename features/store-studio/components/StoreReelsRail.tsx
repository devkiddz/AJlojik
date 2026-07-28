'use client';

import {
  useCallback,
  useEffect,
  useId,
  useState
} from 'react';

import type { FeedActions } from '@/features/feed-experience/contracts';
import {
  MEDIA_EXPERIENCE_STATE_EVENT,
  publishMediaExperienceState,
  type MediaExperienceStateDetail
} from '@/lib/mediaExperienceEvents';

import type { StoreStudioReelProjection } from '../contracts';
import { StoreReelPlaybackProvider } from '../runtime';
import { StoreReelCard } from './StoreReelCard';
import { StoreReelViewer } from './StoreReelViewer';

type StoreReelsRailProps = {
  title: string;
  reels: StoreStudioReelProjection[];
  actions: FeedActions;
};

export function StoreReelsRail({
  title,
  reels,
  actions
}: StoreReelsRailProps) {
  const headingId = useId();
  const viewerOwnerId = useId();

  const [expandedReelId, setExpandedReelId] =
    useState<string | null>(null);

  const closeViewer = useCallback(() => {
    setExpandedReelId(null);

    publishMediaExperienceState({
      ownerId: viewerOwnerId,
      kind: 'store-reel',
      open: false
    });
  }, [viewerOwnerId]);

  const openViewer = useCallback(
    (reelId: string) => {
      publishMediaExperienceState({
        ownerId: viewerOwnerId,
        kind: 'store-reel',
        open: true
      });

      setExpandedReelId(reelId);
    },
    [viewerOwnerId]
  );

  useEffect(() => {
    const closeForCompetingMedia = (event: Event) => {
      const mediaEvent = event as CustomEvent<
        MediaExperienceStateDetail
      >;

      if (
        mediaEvent.detail?.open &&
        mediaEvent.detail.ownerId !== viewerOwnerId
      ) {
        closeViewer();
      }
    };

    window.addEventListener(
      MEDIA_EXPERIENCE_STATE_EVENT,
      closeForCompetingMedia
    );

    return () => {
      window.removeEventListener(
        MEDIA_EXPERIENCE_STATE_EVENT,
        closeForCompetingMedia
      );
    };
  }, [closeViewer, viewerOwnerId]);

  useEffect(() => {
    return () => {
      publishMediaExperienceState({
        ownerId: viewerOwnerId,
        kind: 'store-reel',
        open: false
      });
    };
  }, [viewerOwnerId]);

  if (!reels.length) {
    return null;
  }

  return (
    <StoreReelPlaybackProvider>
      <section
        aria-labelledby={headingId}
        className="min-w-0 overflow-hidden rounded-3xl border border-border/50 bg-card/45 py-4 shadow-sm backdrop-blur-sm sm:py-5"
      >
        <div className="flex items-end justify-between gap-3 px-3 sm:px-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Store Studio
            </p>

            <h2
              id={headingId}
              className="mt-1 text-sm font-bold tracking-tight text-foreground sm:text-base"
            >
              {title}
            </h2>
          </div>

          <p className="max-w-52 text-right text-[10px] leading-4 text-muted-foreground">
            Play in the Feed or expand any Reel for a larger preview.
          </p>
        </div>

        <div className="mt-3 overflow-x-auto overscroll-x-contain px-3 pb-1 scrollbar-hide sm:px-5">
          <div className="flex w-max snap-x snap-mandatory gap-3 sm:gap-4">
            {reels.map((reel, index) => (
              <StoreReelCard
                key={reel.id}
                reel={reel}
                order={index}
                actions={actions}
                onExpand={openViewer}
              />
            ))}
          </div>
        </div>
      </section>

      <StoreReelViewer
        reels={reels}
        activeReelId={expandedReelId}
        actions={actions}
        onActiveReelChange={setExpandedReelId}
        onClose={closeViewer}
      />
    </StoreReelPlaybackProvider>
  );
}
