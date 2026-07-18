'use client';

import { useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import type { CollectionType } from '@/data/collections';

import {
  FeaturedProductCard,
  ProductCard
} from '@/features/products/cards';

import type {
  ProductType,
  ProductVariantType
} from '@/types/types';

type FeaturedCollectionProps = {
  collection: CollectionType;
  products: ProductType[];
  featuredProduct?: ProductType;

  onPreview?: (product: ProductType) => void;

  onToggleLike?: (
    productId: string
  ) => void;

  onAddToCart?: (
    product: ProductType,
    variant: ProductVariantType
  ) => void;
};

export default function FeaturedCollection({
  products,
  featuredProduct,
  onPreview,
  onToggleLike,
  onAddToCart
}: FeaturedCollectionProps) {
  const scrollRef =
    useRef<HTMLDivElement | null>(null);

  if (!featuredProduct) {
    return null;
  }

  const supportingProducts = products.filter(
    product =>
      product.id !== featuredProduct.id
  );

  const displayProducts =
    supportingProducts.length > 0
      ? supportingProducts
      : products;

  const scrollShelf = (
    direction: 'left' | 'right'
  ) => {
    scrollRef.current?.scrollBy({
      left: direction === 'left' ? -640 : 640,
      behavior: 'smooth'
    });
  };

  return (
    <section className="space-y-5">
      <FeaturedProductCard
        product={featuredProduct}
        onPreview={onPreview}
        onToggleLike={onToggleLike}
        onAddToCart={onAddToCart}
      />

      {displayProducts.length > 0 ? (
        <div className="group/shelf relative min-w-0">
          <button
            type="button"
            aria-label="Scroll collection left"
            onClick={() =>
              scrollShelf('left')
            }
            className="absolute left-2 top-1/2 z-30 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background/90 opacity-0 shadow-lg backdrop-blur-md transition hover:scale-105 group-hover/shelf:opacity-100 md:flex"
          >
            <ChevronLeft className="size-5" />
          </button>

          <button
            type="button"
            aria-label="Scroll collection right"
            onClick={() =>
              scrollShelf('right')
            }
            className="absolute right-2 top-1/2 z-30 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background/90 opacity-0 shadow-lg backdrop-blur-md transition hover:scale-105 group-hover/shelf:opacity-100 md:flex"
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-8 bg-gradient-to-r from-card to-transparent" />

          <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-8 bg-gradient-to-l from-card to-transparent" />

          <div
            ref={scrollRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 scrollbar-none"
          >
            {displayProducts.map(product => (
              <div
                key={product.id}
                className="w-60 shrink-0 snap-start md:w-64"
              >
                <ProductCard
                  product={product}
                  onPreview={onPreview}
                  onToggleLike={onToggleLike}
                  onAddToCart={onAddToCart}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}