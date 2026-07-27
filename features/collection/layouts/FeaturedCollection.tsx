'use client';

import CollectionProductRail from '@/features/collection/components/CollectionProductRail';

import type { ResolvedCollection } from '@/features/feed-experience/contracts';

import type { ProductType, ProductVariantType } from '@/types/types';

type FeaturedCollectionProps = {
  experience: ResolvedCollection;

  onPreview?: (product: ProductType) => void;

  onOpenExperience?: (product: ProductType) => void;

  onAddToCart?: (product: ProductType, variant: ProductVariantType) => void;
};

export default function FeaturedCollection({
  experience,
  onPreview,
  onOpenExperience,
  onAddToCart
}: FeaturedCollectionProps) {
  const { collection, products, featuredProduct, presentation } = experience;

  if (products.length === 0) {
    return null;
  }

  const featuredProductId = presentation.featured.visible && featuredProduct ? featuredProduct.id : undefined;

  return (
    <section className="min-w-0">
      {/* ============================================
          COLLECTION HEADER
      ============================================ */}

      <header className="flex min-w-0 items-end justify-between gap-4 px-1">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary/60">
            Curated collection
          </p>

          <h2 className="mt-1 truncate text-xl font-bold tracking-tight text-foreground">
            {collection.title}
          </h2>

          {collection.subtitle ? (
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{collection.subtitle}</p>
          ) : null}
        </div>

        <span className="shrink-0 text-xs font-medium text-muted-foreground">
          {products.length} {products.length === 1 ? 'product' : 'products'}
        </span>
      </header>

      {/* ============================================
          FULL-WIDTH PRODUCT SHELF
      ============================================ */}

      <div className="mt-4 min-w-0">
        <CollectionProductRail
          title={collection.title}
          subtitle={collection.subtitle}
          showHeader={false}
          products={products}
          featuredProductId={featuredProductId}
          onPreview={onPreview}
          onOpenExperience={onOpenExperience}
          onAddToCart={onAddToCart}
        />
      </div>
    </section>
  );
}
