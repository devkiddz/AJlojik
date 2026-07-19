'use client';

import CollectionProductRail from '@/features/collection/components/CollectionProductRail';

import type { ResolvedCollection } from '@/features/feed-experience/contracts';

import { CollectionFeatureProductCard } from '@/features/products/cards/CollectionFeatureProductCard';

import { cn } from '@/lib/utils';

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

  const activeFeaturedProduct =
    presentation.featured.visible && featuredProduct ? featuredProduct : undefined;

  const supportingProducts = activeFeaturedProduct
    ? products.filter(product => product.id !== activeFeaturedProduct.id)
    : products;

  const hasFeaturedProduct = Boolean(activeFeaturedProduct);

  const hasSupportingProducts = supportingProducts.length > 0;

  const isSplitLayout = hasFeaturedProduct && hasSupportingProducts;

  if (!hasFeaturedProduct && !hasSupportingProducts) {
    return null;
  }

  return (
    <section
      className={cn(
        /**
         * Mobile:
         * Featured card
         * Product slider
         *
         * Desktop:
         * Featured card = 5 / 12
         * Product slider = 7 / 12
         */
        'grid min-w-0 grid-cols-1 items-start gap-4',

        isSplitLayout && 'lg:grid-cols-12'
      )}>
      {/* ============================================
          FEATURED PRODUCT
      ============================================ */}

      {activeFeaturedProduct ? (
        <div
          className={cn(
            'min-w-0',

            isSplitLayout ? 'lg:col-span-5' : 'lg:col-span-12'
          )}>
          <CollectionFeatureProductCard
            product={activeFeaturedProduct}
            className="w-full"
            onPreview={onPreview}
            onOpenExperience={onOpenExperience}
            onAddToCart={onAddToCart}
          />
        </div>
      ) : null}

      {/* ============================================
          PRODUCT SLIDER
      ============================================ */}

      {hasSupportingProducts ? (
        <div
          className={cn(
            'min-w-0 overflow-hidden',

            isSplitLayout ? 'lg:col-span-7' : 'lg:col-span-12'
          )}>
          <div
            className={cn(
              'min-w-0 overflow-hidden',
              'rounded-3xl border border-border/60',
              'bg-card/40 p-2 shadow-sm',
              'sm:p-3'
            )}>
            <CollectionProductRail
              title={collection.title}
              subtitle={collection.subtitle}
              showHeader={false}
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
