'use client';

import { ProductCard } from '@/features/products/cards';

import type { FeedActions, RecentlyViewedModule as RecentlyViewedModuleType } from '../contracts';

type RecentlyViewedModuleProps = {
  module: RecentlyViewedModuleType;
  actions: FeedActions;
};

export function RecentlyViewedModule({ module, actions }: RecentlyViewedModuleProps) {
  const { title, subtitle, products } = module.data;

  if (!products.length) {
    return null;
  }

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold">{title}</h2>

        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </header>

      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 scrollbar-none">
        {products.map(product => (
          <div key={product.id} className="w-56 shrink-0 snap-start md:w-60">
            <ProductCard
              product={product}
              onPreview={actions.previewProduct}
              onToggleLike={actions.toggleLike}
              onAddToCart={actions.addToCart}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
