'use client';

import StoreProductGridCard from '@/features/product/StoreProductGridCard';

import type { FeedActions, RecentlyViewedModule as RecentlyViewedModuleType } from '../contracts';

type RecentlyViewedModuleProps = {
  module: RecentlyViewedModuleType;
  actions: FeedActions;
};

export function RecentlyViewedModule({ module, actions }: RecentlyViewedModuleProps) {
  const { title, subtitle, products } = module.data;

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>

        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </header>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {products.map(product => (
          <div
            key={product.id}
            role="button"
            tabIndex={0}
            className="w-44 shrink-0 cursor-pointer"
            onClick={() =>
              actions.openExperience({
                type: 'product',
                productId: product.id
              })
            }
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();

                actions.openExperience({
                  type: 'product',
                  productId: product.id
                });
              }
            }}>
            <StoreProductGridCard
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
