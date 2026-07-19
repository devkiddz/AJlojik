'use client';

import type { CollectionType } from '@/data/collections';

import CollectionProductRail from '@/features/collection/components/CollectionProductRail';

import { CollectionFeatureProductCard } from '@/features/products/cards/CollectionFeatureProductCard';

import { cn } from '@/lib/utils';

import type { ProductType, ProductVariantType } from '@/types/types';

type FeaturedCollectionProps = {
  collection: CollectionType;

  products: ProductType[];

  featuredProduct?: ProductType;

  onPreview?: (product: ProductType) => void;

  onOpenExperience?: (product: ProductType) => void;

  onAddToCart?: (product: ProductType, variant: ProductVariantType) => void;
};

export default function FeaturedCollection({
  collection,
  products,
  featuredProduct,
  onPreview,
  onOpenExperience,
  onAddToCart
}: FeaturedCollectionProps) {
  if (!featuredProduct) {
    return null;
  }

  const supportingProducts = products.filter(product => product.id !== featuredProduct.id);

  const hasSupportingProducts = supportingProducts.length > 0;

  return (
    <section
      className={cn(
        'grid min-w-0 grid-cols-1 gap-4',

        hasSupportingProducts && 'lg:h-50 lg:grid-cols-12 lg:items-stretch'
      )}>
      {/* ============================================
          FEATURED PRODUCT — EQUAL LEFT GRID
      ============================================ */}

      <div
        className={cn(
          'min-w-0',

          hasSupportingProducts ? 'lg:col-span-5' : 'lg:col-span-12'
        )}>
        <CollectionFeatureProductCard
          product={featuredProduct}
          className="h-full"
          onPreview={onPreview}
          onOpenExperience={onOpenExperience}
          onAddToCart={onAddToCart}
        />
      </div>

      {/* ============================================
          PRODUCT RAIL — EQUAL RIGHT GRID
      ============================================ */}

      {hasSupportingProducts ? (
        <div className="min-w-0 lg:col-span-6">
          <div
            className={cn(
              'h-full min-h-0 min-w-0 overflow-hidden rounded-3xl',
              'border border-border/60 bg-card/40 p-4 shadow-sm'
            )}>
            <CollectionProductRail
              title={collection.title}
              subtitle={collection.subtitle}
              products={supportingProducts}
              onPreview={onPreview}
              onOpenExperience={onOpenExperience}
              onAddToCart={onAddToCart}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
