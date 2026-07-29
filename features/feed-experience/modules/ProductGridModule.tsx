'use client';

import { ProductCard } from '@/features/products/cards';
import {
  EXPERIENCE_PRODUCT_ITEM_CLASS,
  EXPERIENCE_PRODUCT_RAIL_CLASS
} from '@/features/products/productRailPresentation';

import type {
  FeedActions,
  ProductGridModule as ProductGridModuleType
} from '../contracts';

type ProductGridModuleProps = {
  module: ProductGridModuleType;
  actions: FeedActions;
};

export function ProductGridModule({
  module,
  actions
}: ProductGridModuleProps) {
  const { products } = module.data;

  if (!products.length) {
    return (
      <section className="rounded-2xl border bg-card p-8 text-center">
        <h3 className="text-sm font-semibold">No products found</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Try another category or collection.
        </p>
      </section>
    );
  }

  return (
    <section className={EXPERIENCE_PRODUCT_RAIL_CLASS}>
      {products.map(product => (
        <div
          key={product.id}
          data-experience-product-item
          className={EXPERIENCE_PRODUCT_ITEM_CLASS}>
          <ProductCard
            product={product}
            onPreview={actions.previewProduct}
            onToggleLike={actions.toggleLike}
            onAddToCart={actions.addToCart}
            className="h-full"
          />
        </div>
      ))}
    </section>
  );
}
