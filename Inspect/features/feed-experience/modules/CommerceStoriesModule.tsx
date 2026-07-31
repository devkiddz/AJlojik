'use client';

import { CommerceStoryRail } from '@/features/commerce-stories';

import type { CommerceStoriesModuleDefinition, FeedActions } from '../contracts';

type CommerceStoriesModuleProps = {
  module: CommerceStoriesModuleDefinition;

  actions: FeedActions;
};

export function CommerceStoriesModule({ module, actions }: CommerceStoriesModuleProps) {
  const { title, stories, viewAllHref } = module.data;

  if (!stories.length) {
    return null;
  }

  return <CommerceStoryRail title={title} stories={stories} viewAllHref={viewAllHref} actions={actions} />;
}
