'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import type { FeedActions } from '@/features/feed-experience/contracts';

import type { CommerceStory } from '../contracts';

import { getViewedStoryIds, markStoryAsViewed } from '../services';

import { CommerceStoryCard } from './CommerceStoryCard';

import { CommerceStoryViewer } from './CommerceStoryViewer';

type CommerceStoryRailProps = {
  title: string;
  viewAllHref?: string;

  stories: CommerceStory[];

  actions: FeedActions;
};

export function CommerceStoryRail({ title, viewAllHref, stories, actions }: CommerceStoryRailProps) {
  const [viewedStoryIds, setViewedStoryIds] = useState<string[]>([]);

  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);

  useEffect(() => {
    setViewedStoryIds(getViewedStoryIds());
  }, []);

  const viewedStoryIdSet = useMemo(() => new Set(viewedStoryIds), [viewedStoryIds]);

  const firstUnviewedStoryId = useMemo(
    () => stories.find(story => !viewedStoryIdSet.has(story.id))?.id,
    [stories, viewedStoryIdSet]
  );

  const handleViewed = useCallback((storyId: string) => {
    markStoryAsViewed(storyId);

    setViewedStoryIds(currentIds => (currentIds.includes(storyId) ? currentIds : [...currentIds, storyId]));
  }, []);

  if (!stories.length) {
    return null;
  }

  return (
    <>
      <section aria-labelledby="commerce-stories-title" className="min-w-0">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2
            id="commerce-stories-title"
            className="text-sm font-bold tracking-tight text-foreground sm:text-base">
            {title}
          </h2>

          {viewAllHref ? (
            <Link
              href={viewAllHref}
              className="shrink-0 text-[11px] font-semibold text-muted-foreground transition hover:text-foreground">
              View all
            </Link>
          ) : null}
        </div>

        <div className="-mx-1 overflow-x-auto overscroll-x-contain px-1 pb-2 scrollbar-hide">
          <div className="mx-auto flex w-max min-w-full snap-x snap-mandatory justify-center gap-3 sm:gap-4">
            {stories.map(story => (
              <CommerceStoryCard
                key={story.id}
                story={story}
                viewed={viewedStoryIdSet.has(story.id)}
                emphasized={story.id === firstUnviewedStoryId}
                onOpen={selectedStory => setActiveStoryId(selectedStory.id)}
              />
            ))}
          </div>
        </div>
      </section>

      <CommerceStoryViewer
        stories={stories}
        activeStoryId={activeStoryId}
        actions={actions}
        onActiveStoryChange={setActiveStoryId}
        onViewed={handleViewed}
        onClose={() => setActiveStoryId(null)}
      />
    </>
  );
}
