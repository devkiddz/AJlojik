'use client';

import type { CollectionType } from '@/data/collections';

import { FeaturedProductCard } from '@/features/products/cards';

import ProductShelf from '@/features/products/components/ProductShelf';

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
        'grid min-w-0 items-stretch gap-4',

        hasSupportingProducts && 'xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]'
      )}>
      {/* ============================================
          FEATURED PRODUCT
      ============================================ */}

      <div className="min-w-0">
        <FeaturedProductCard
          product={featuredProduct}
          className="h-full"
          onPreview={onPreview}
          onOpenExperience={onOpenExperience}
          onAddToCart={onAddToCart}
        />
      </div>

      {/* ============================================
          SUPPORTING PRODUCT SLIDES
      ============================================ */}

      {hasSupportingProducts ? (
        <div
          className={cn(
            'flex h-full min-w-0 flex-col overflow-hidden rounded-3xl',
            'border border-border/60 bg-card/40 p-4 shadow-sm',
            'md:p-5'
          )}>
          <header className="mb-4 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/55">
                More in this collection
              </p>

              <h3 className="mt-2 truncate text-lg font-semibold tracking-tight text-card-foreground">
                {collection.title}
              </h3>

              {collection.subtitle ? (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {collection.subtitle}
                </p>
              ) : null}
            </div>

            <span className="hidden shrink-0 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground sm:inline-flex">
              {supportingProducts.length} {supportingProducts.length === 1 ? 'product' : 'products'}
            </span>
          </header>

          <ProductShelf
            products={supportingProducts}
            ariaLabel={`${collection.title} products`}
            onPreview={onPreview}
            onOpenExperience={onOpenExperience}
            onAddToCart={onAddToCart}
            className="mt-auto"
            itemClassName="w-44 sm:w-48 xl:w-52"
          />
        </div>
      ) : null}
    </section>
  );
}
