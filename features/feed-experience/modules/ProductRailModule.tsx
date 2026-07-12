'use client';

import StoreProductGridCard from '@/features/product/StoreProductGridCard';

import type { FeedActions, ProductRailModuleDefinition } from '../contracts';

type ProductRailModuleProps = {
  module: ProductRailModuleDefinition;
  actions: FeedActions;
};

export function ProductRailModule({ module, actions }: ProductRailModuleProps) {
  const { title, subtitle, products } = module.data;

  if (!products.length) return null;

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
