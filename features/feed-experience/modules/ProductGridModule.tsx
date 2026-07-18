'use client';

import { ProductCard } from '@/features/products/cards';

import type { FeedActions, ProductGridModule as ProductGridModuleType } from '../contracts';

type ProductGridModuleProps = {
  module: ProductGridModuleType;
  actions: FeedActions;
};

export function ProductGridModule({ module, actions }: ProductGridModuleProps) {
  const { products } = module.data;

  if (!products.length) {
    return (
      <section className="rounded-2xl border bg-card p-8 text-center">
        <h3 className="text-sm font-semibold">No products found</h3>

        <p className="mt-1 text-xs text-muted-foreground">Try another category or collection.</p>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onPreview={actions.previewProduct}
          onToggleLike={actions.toggleLike}
          onAddToCart={actions.addToCart}
        />
      ))}
    </section>
  );
}
