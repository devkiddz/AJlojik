'use client';

import PromoSection from '@/components/promos/PromoSection';

import type { FeedActions, PromotionModule as PromotionModuleType } from '../contracts';

type PromotionModuleProps = {
  module: PromotionModuleType;
  actions: FeedActions;
};

export function PromotionModule({ module, actions }: PromotionModuleProps) {
  return (
    <PromoSection
      promos={module.data.promotions}
      products={module.data.products}
      onSelect={actions.previewPromotion}
    />
  );
}
