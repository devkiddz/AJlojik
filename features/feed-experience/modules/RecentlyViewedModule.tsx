'use client';

import { ProductCard } from '@/features/products/cards';
import {
  EXPERIENCE_PRODUCT_ITEM_CLASS,
  EXPERIENCE_PRODUCT_RAIL_CLASS
} from '@/features/products/productRailPresentation';

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

      <div className={EXPERIENCE_PRODUCT_RAIL_CLASS}>
        {products.map(product => (
          <div
            key={product.id}
            data-experience-product-item
            className={EXPERIENCE_PRODUCT_ITEM_CLASS}
          >
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
