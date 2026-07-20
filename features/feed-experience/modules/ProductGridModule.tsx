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
    <section className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-4 scrollbar-none">
      {products.map(product => (
        <div key={product.id} className="w-[48vw] max-w-56 shrink-0 snap-start md:w-56 xl:w-60"><ProductCard product={product} onPreview={actions.previewProduct} onToggleLike={actions.toggleLike} onAddToCart={actions.addToCart} /></div>
      ))}
    </section>
  );
}
