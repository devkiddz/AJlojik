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

  /**
   * Runtime compatibility for collection objects still arriving
   * in the older source shape without `presentation`.
   *
   * The builder should ultimately provide this object, but the
   * renderer must not crash while legacy data is still present.
   */
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
      span:
        featuredProduct && products.some(product => product.id !== featuredProduct.id)
          ? ('partial' as const)
          : ('full' as const)
    }
  };

  const showBanner = presentation.banner.visible && Boolean(collection.banner);

  const showFeatured = presentation.featured.visible && Boolean(featuredProduct);

  const supportingProducts =
    showFeatured && featuredProduct
      ? products.filter(product => product.id !== featuredProduct.id)
      : products;

  const productCount = supportingProducts.length;

  return (
    <section
      className={cn(
        'relative min-w-0 max-w-full overflow-hidden',
        'rounded-3xl border border-border/60',
        'bg-card shadow-lg'
      )}>
      {/* ============================================
          OPTIONAL COLLECTION BANNER
      ============================================ */}

      {showBanner && collection.banner ? (
        <CollectionBanner banner={collection.banner} title={collection.title} count={productCount} />
      ) : null}

      {/* ============================================
          COLLECTION CONTENT
      ============================================ */}

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
