"use client";

import StoreFeaturedProductCard from "@/components/store/StoreFeaturedProductCard";
import StoreFeaturedProductsSlide from "@/components/store/StoreFeaturedProductsSlide";
import type { FeedActions, FeaturedProductsModule as FeaturedProductsModuleType } from "../contracts";

type Props = { module: FeaturedProductsModuleType; actions: FeedActions };
export function FeaturedProductsModule({ module, actions }: Props) {
  const { featuredProduct, featuredProducts } = module.data;
  if (!featuredProduct && featuredProducts.length === 0) return null;
  return <section><div className="grid grid-cols-12 gap-6"><div className="col-span-12 lg:col-span-4">{featuredProduct ? <StoreFeaturedProductCard product={featuredProduct} onPreview={actions.previewProduct} onToggleLike={actions.toggleLike} onAddToCart={actions.addToCart} /> : null}</div><div className="col-span-12 min-w-0 lg:col-span-8"><StoreFeaturedProductsSlide products={featuredProducts} onPreview={actions.previewProduct} onAddToCart={actions.addToCart} onLike={(product) => actions.toggleLike(product.id)} /></div></div></section>;
}
