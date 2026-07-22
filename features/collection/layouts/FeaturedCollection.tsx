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
        'grid min-w-0 grid-cols-1 items-stretch gap-4',

        isSplitLayout && 'md:grid-cols-12'
      )}>
      {/* ============================================
          FEATURED PRODUCT
      ============================================ */}

      {activeFeaturedProduct ? (
        <div
          className={cn(
            'min-w-0',

            isSplitLayout ? 'md:col-span-5' : 'md:col-span-12'
          )}>
          <CollectionFeatureProductCard
            product={activeFeaturedProduct}
            className="justify-center h-full w-full"
            onPreview={onPreview}
            onOpenExperience={onOpenExperience}
          />
        </div>
      ) : null}

      {/* ============================================
          COLLECTION HEADER AND PRODUCT RAIL
      ============================================ */}

      {hasSupportingProducts ? (
        <div
          className={cn(
            'flex min-w-0 flex-col',

            isSplitLayout ? 'md:col-span-7 md:h-full' : 'md:col-span-12'
          )}>
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

          <div
            className="
              mt-3 min-h-0 min-w-0
              flex-1 overflow-hidden
              rounded-3xl
              border border-border/60
              bg-card/40
              p-2 shadow-sm
              sm:p-3
            ">
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
