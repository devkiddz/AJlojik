'use client';

import { StoreReelsRail } from '@/features/store-studio/components';

import type {
  FeedActions,
  StoreReelsModuleDefinition
} from '../contracts';

type StoreReelsModuleProps = {
  module: StoreReelsModuleDefinition;
  actions: FeedActions;
};

export function StoreReelsModule({
  module
}: StoreReelsModuleProps) {
  if (!module.data.reels.length) {
    return null;
  }

  return (
    <section aria-labelledby={`${module.id}-title`}>
      <h2
        id={`${module.id}-title`}
        className="sr-only"
      >
        {module.data.title}
      </h2>

      <StoreReelsRail reels={module.data.reels} />
    </section>
  );
}
