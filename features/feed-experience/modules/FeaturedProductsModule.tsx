'use client';

import { FeaturedProductCard, ProductCard } from '@/features/products/cards';

import type { FeedActions, FeaturedProductsModule as FeaturedProductsModuleType } from '../contracts';

type FeaturedProductsModuleProps = {
  module: FeaturedProductsModuleType;
  actions: FeedActions;
};

export function FeaturedProductsModule({ module, actions }: FeaturedProductsModuleProps) {
  const { featuredProduct, featuredProducts } = module.data;

  if (!featuredProduct && !featuredProducts.length) {
    return null;
  }

  const remainingProducts = featuredProduct
    ? featuredProducts.filter(product => product.id !== featuredProduct.id)
    : featuredProducts;

  return (
    <section className="space-y-5">
      {featuredProduct ? (
        <FeaturedProductCard
          product={featuredProduct}
          onPreview={actions.previewProduct}
          onToggleLike={actions.toggleLike}
          onAddToCart={actions.addToCart}
        />
      ) : null}

      {remainingProducts.length ? (
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 scrollbar-none">
          {remainingProducts.map(product => (
            <div key={product.id} className="w-60 shrink-0 snap-start md:w-64">
              <ProductCard
                product={product}
                onPreview={actions.previewProduct}
                onToggleLike={actions.toggleLike}
                onAddToCart={actions.addToCart}
              />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
