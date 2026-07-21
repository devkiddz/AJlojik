'use client';

import type {
  FeedActions
} from '@/features/feed-experience/contracts';

import {
  FeaturedProductCard
} from '@/features/products/cards';

import type {
  ProductType
} from '@/types/types';

type FeaturedProductExperienceCardProps = {
  product: ProductType;
  actions: FeedActions;

  locale?: string;
  currency?: string;

  title?: string;
};

export default function FeaturedProductExperienceCard({
  product,
  actions,
  locale = 'en-NG',
  currency = 'NGN',
  title
}: FeaturedProductExperienceCardProps) {
  return (
    <FeaturedProductCard
      product={product}
      presentation="hero"
      title={title}
      locale={locale}
      currency={currency}
      onOpenExperience={
        actions.previewProduct
      }
      onAddToCart={
        actions.addToCart
      }
    />
  );
}
