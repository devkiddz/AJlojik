'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState
} from 'react';

import Link from 'next/link';

import type { FeedActions } from '@/features/feed-experience/contracts';

import { cn } from '@/lib/utils';

import type { CommerceStory } from '../contracts';

import {
  getViewedStoryIds,
  markStoryAsViewed
} from '../services';

import { CommerceStoryCard } from './CommerceStoryCard';
import { CommerceStoryViewer } from './CommerceStoryViewer';

const COMMERCE_STORY_VIEWER_OPEN_EVENT =
  'rcentz:commerce-story-viewer-open';

type CommerceStoryViewerOpenDetail = {
  ownerId: string;
};

type CommerceStoryRailProps = {
  title: string;
  viewAllHref?: string;
  stories: CommerceStory[];
  actions: FeedActions;
  presentation?: 'standalone' | 'showcase';
};

export function CommerceStoryRail({
  title,
  viewAllHref,
  stories,
  actions,
  presentation = 'standalone'
}: CommerceStoryRailProps) {
  const viewerOwnerId = useId();
  const headingId = useId();

  const [viewedStoryIds, setViewedStoryIds] =
    useState<string[]>([]);

  const [activeStoryId, setActiveStoryId] =
    useState<string | null>(null);

  useEffect(() => {
    setViewedStoryIds(getViewedStoryIds());
  }, []);

  useEffect(() => {
    const closeCompetingViewer = (event: Event) => {
      const viewerEvent = event as CustomEvent<
        CommerceStoryViewerOpenDetail
      >;

      if (viewerEvent.detail?.ownerId !== viewerOwnerId) {
        setActiveStoryId(null);
      }
    };

    window.addEventListener(
      COMMERCE_STORY_VIEWER_OPEN_EVENT,
      closeCompetingViewer
    );

    return () => {
      window.removeEventListener(
        COMMERCE_STORY_VIEWER_OPEN_EVENT,
        closeCompetingViewer
      );
    };
  }, [viewerOwnerId]);

  const viewedStoryIdSet = useMemo(
    () => new Set(viewedStoryIds),
    [viewedStoryIds]
  );

  const firstUnviewedStoryId = useMemo(
    () =>
      stories.find(
        story => !viewedStoryIdSet.has(story.id)
      )?.id,
    [stories, viewedStoryIdSet]
  );

  const handleViewed = useCallback(
    (storyId: string) => {
      markStoryAsViewed(storyId);

      setViewedStoryIds(currentIds =>
        currentIds.includes(storyId)
          ? currentIds
          : [...currentIds, storyId]
      );
    },
    []
  );

  const handleOpenStory = useCallback(
    (story: CommerceStory) => {
      window.dispatchEvent(
        new CustomEvent<CommerceStoryViewerOpenDetail>(
          COMMERCE_STORY_VIEWER_OPEN_EVENT,
          {
            detail: {
              ownerId: viewerOwnerId
            }
          }
        )
      );

      setActiveStoryId(story.id);
    },
    [viewerOwnerId]
  );

  if (!stories.length) {
    return null;
  }

  const showcase = presentation === 'showcase';

  return (
    <>
      <section
        aria-labelledby={headingId}
        className={cn(
          'min-w-0',
          showcase
            ? 'bg-transparent'
            : 'overflow-hidden rounded-3xl border border-border/50 bg-card/45 px-3 py-4 shadow-sm backdrop-blur-sm sm:px-5 sm:py-5'
        )}
      >
        <div
          className={cn(
            'flex items-center justify-between gap-3',
            showcase ? 'sr-only' : 'mb-3'
          )}
        >
          <h2
            id={headingId}
            className="text-sm font-bold tracking-tight text-foreground sm:text-base"
          >
            {title}
          </h2>

          {!showcase && viewAllHref ? (
            <Link
              href={viewAllHref}
              className="shrink-0 text-[11px] font-semibold text-muted-foreground transition hover:text-foreground"
            >
              View all
            </Link>
          ) : null}
        </div>

        <div
          className={cn(
            'overflow-x-auto overscroll-x-contain scrollbar-hide',
            showcase
              ? 'px-2 py-0.5 sm:px-5 sm:py-1'
              : '-mx-3 px-3 pb-1 sm:-mx-5 sm:px-5'
          )}
        >
          <div className="mx-auto flex w-max min-w-full snap-x snap-mandatory justify-center gap-2.5 sm:gap-4">
            {stories.map(story => (
              <CommerceStoryCard
                key={story.id}
                story={story}
                viewed={viewedStoryIdSet.has(story.id)}
                emphasized={story.id === firstUnviewedStoryId}
                showLabel={!showcase}
                compact={showcase}
                onOpen={handleOpenStory}
              />
            ))}
          </div>
        </div>
      </section>

      {activeStoryId ? (
        <CommerceStoryViewer
          stories={stories}
          activeStoryId={activeStoryId}
          actions={actions}
          onActiveStoryChange={setActiveStoryId}
          onViewed={handleViewed}
          onClose={() => setActiveStoryId(null)}
        />
      ) : null}
    </>
  );
}
