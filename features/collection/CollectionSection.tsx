'use client';

import type { ResolvedCollection } from '@/features/feed-experience/contracts';

import { cn } from '@/lib/utils';

import type { ProductType, ProductVariantType } from '@/types/types';

import CollectionBanner from './CollectionBanner';

import FeaturedCollection from './layouts/FeaturedCollection';

type CollectionSectionProps = {
  experience: ResolvedCollection;

  onPreview?: (product: ProductType) => void;

  onOpenExperience?: (product: ProductType) => void;

  onAddToCart?: (product: ProductType, variant: ProductVariantType) => void;
};

export default function CollectionSection({
  experience,
  onPreview,
  onOpenExperience,
  onAddToCart
}: CollectionSectionProps) {
  const { collection, products, featuredProduct } = experience;

  if (!collection.active || products.length === 0) {
    return null;
  }

  const presentation = experience.presentation ?? {
    banner: {
      enabled: Boolean(collection.banner),
      visible: Boolean(collection.banner)
    },

    featured: {
      enabled: Boolean(featuredProduct),
      visible: Boolean(featuredProduct),
      source: featuredProduct ? ('explicit' as const) : ('unavailable' as const)
    },

    rail: {
      span: 'full' as const
    }
  };

  const showBanner = presentation.banner.visible && Boolean(collection.banner);

  return (
    <section
      className={cn(
        'relative min-w-0 max-w-full overflow-hidden',
        'rounded-3xl border border-border/60',
        'bg-card shadow-lg'
      )}>
      {showBanner && collection.banner ? (
        <CollectionBanner banner={collection.banner} title={collection.title} />
      ) : null}

      <div className="min-w-0 px-3 py-4 sm:px-4">
        <FeaturedCollection
          experience={{
            ...experience,
            presentation
          }}
          onPreview={onPreview}
          onOpenExperience={onOpenExperience}
          onAddToCart={onAddToCart}
        />
      </div>
    </section>
  );
}
