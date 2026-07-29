'use client';

import { FeaturedProductCard, ProductCard } from '@/features/products/cards';
import {
  EXPERIENCE_PRODUCT_ITEM_CLASS,
  EXPERIENCE_PRODUCT_RAIL_CLASS
} from '@/features/products/productRailPresentation';

import type {
  FeedActions,
  FeaturedProductsModule as FeaturedProductsModuleType
} from '../contracts';

type FeaturedProductsModuleProps = {
  module: FeaturedProductsModuleType;
  actions: FeedActions;
};

export function FeaturedProductsModule({
  module,
  actions
}: FeaturedProductsModuleProps) {
  const { featuredProduct, featuredProducts } = module.data;

  const remainingProducts = featuredProduct
    ? featuredProducts.filter(product => product.id !== featuredProduct.id)
    : featuredProducts;

  if (!featuredProduct && !featuredProducts.length) {
    return null;
  }

  return (
    <section className="min-w-0 space-y-5">
      {featuredProduct ? (
        <FeaturedProductCard
          product={featuredProduct}
          onPreview={actions.previewProduct}
          onToggleLike={actions.toggleLike}
          onAddToCart={actions.addToCart}
        />
      ) : null}

      {remainingProducts.length ? (
        <div
          role="region"
          aria-label="Featured products"
          className={EXPERIENCE_PRODUCT_RAIL_CLASS}>
          {remainingProducts.map(product => (
            <div
              key={product.id}
              data-featured-product-slide
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
        </div>
      ) : null}
    </section>
  );
}
