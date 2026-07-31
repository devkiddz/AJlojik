'use client';

import { StoreBanner } from '@/features/store-studio/components';

import type {
  FeedActions,
  StoreBannerModuleDefinition
} from '../contracts';

type StoreBannerModuleProps = {
  module: StoreBannerModuleDefinition;
  actions: FeedActions;
};

export function StoreBannerModule({
  module
}: StoreBannerModuleProps) {
  if (!module.data.slides.length) {
    return null;
  }

  return <StoreBanner slides={module.data.slides} />;
}
