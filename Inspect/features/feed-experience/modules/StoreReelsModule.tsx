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
  module,
  actions
}: StoreReelsModuleProps) {
  if (!module.data.reels.length) {
    return null;
  }

  return (
    <StoreReelsRail
      title={module.data.title}
      reels={module.data.reels}
      actions={actions}
    />
  );
}
