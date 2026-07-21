'use client';

import type { FeedActions } from '@/features/feed-experience/contracts';

import { FeaturedProductCard } from '@/features/products/cards';

import type { ProductType } from '@/types/types';

type FeaturedProductExperienceCardProps = {
  product: ProductType;
  actions: FeedActions;

  /*
   * Retained for compatibility with the parent module.
   * The simplified featured card no longer displays price.
   */
  locale?: string;
  currency?: string;

  title?: string;
};

export default function FeaturedProductExperienceCard({
  product,
  actions,
  title
}: FeaturedProductExperienceCardProps) {
  return (
    <FeaturedProductCard
      product={product}
      presentation="hero"
      title={title}
      onOpenExperience={actions.previewProduct}
    />
  );
}
