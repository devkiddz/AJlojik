'use client';

import { CommerceStoryRail } from '@/features/commerce-stories';
import { StoreBanner } from '@/features/store-studio/components';

import { cn } from '@/lib/utils';

import type {
  FeedActions,
  StoreShowcaseModuleDefinition
} from '../contracts';

type StoreShowcaseModuleProps = {
  module: StoreShowcaseModuleDefinition;
  actions: FeedActions;
};

export function StoreShowcaseModule({
  module,
  actions
}: StoreShowcaseModuleProps) {
  const {
    title,
    storyViewAllHref,
    stories,
    banners
  } = module.data;

  const hasStories = stories.length > 0;
  const hasBanners = banners.length > 0;

  if (!hasStories && !hasBanners) {
    return null;
  }

  if (!hasBanners) {
    return (
      <section
        aria-label="Store showcase"
        className="relative isolate min-w-0"
      >
        <CommerceStoryRail
          title={title}
          stories={stories}
          viewAllHref={storyViewAllHref}
          actions={actions}
          presentation="standalone"
        />
      </section>
    );
  }

  return (
    <section
      aria-label="Store showcase"
      className={cn(
        'relative isolate min-w-0',
        hasStories && 'pb-9 sm:pb-12'
      )}
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-24 rounded-full bg-gradient-brand opacity-10 blur-3xl" />

      <div className="relative z-10">
        <StoreBanner slides={banners} />

        {hasStories ? (
          <div className="absolute inset-x-0 bottom-3 z-20 translate-y-1/2 sm:bottom-1">
            <CommerceStoryRail
              title={title}
              stories={stories}
              viewAllHref={storyViewAllHref}
              actions={actions}
              presentation="showcase"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
