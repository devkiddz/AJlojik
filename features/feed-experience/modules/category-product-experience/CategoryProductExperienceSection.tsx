'use client';

import { useMemo } from 'react';

import type { FeedActions, FeaturedProductsModule } from '@/features/feed-experience/contracts';

import type { ProductType } from '@/types/types';

import FeaturedProductExperienceCard from './FeaturedProductExperienceCard';
import ProductExperienceSlider from './ProductExperienceSlider';

type CategoryProductExperienceSectionProps = {
  module: FeaturedProductsModule;
  actions: FeedActions;
};

function uniqueProducts(products: ProductType[]): ProductType[] {
  return Array.from(new Map(products.map(product => [product.id, product])).values());
}

export default function CategoryProductExperienceSection({
  module,
  actions
}: CategoryProductExperienceSectionProps) {
  const { title, subtitle, categorySlug, featuredProduct, featuredProducts, products, locale, currency } =
    module.data;

  const resolvedProducts = useMemo(() => {
    return uniqueProducts([
      ...(products ?? []),
      ...(featuredProduct ? [featuredProduct] : []),
      ...featuredProducts
    ]);
  }, [featuredProduct, featuredProducts, products]);

  const resolvedFeaturedProduct =
    featuredProduct ?? resolvedProducts.find(product => product.featured) ?? resolvedProducts[0];

  const sliderProducts = useMemo(() => {
    if (!resolvedFeaturedProduct) {
      return resolvedProducts;
    }

    return resolvedProducts.filter(product => product.id !== resolvedFeaturedProduct.id);
  }, [resolvedFeaturedProduct, resolvedProducts]);

  if (!resolvedFeaturedProduct) {
    return null;
  }

  const resolvedTitle =
    title ??
    (categorySlug && categorySlug !== 'all' ? `Featured in ${categorySlug}` : 'Featured across AJ Logik');

  const resolvedSubtitle =
    subtitle ?? 'A premium product story supported by more selections from the same experience.';

  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-background/70 p-3 shadow-sm sm:p-4">
      <header className="mb-4 flex items-end justify-between gap-4 px-1">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Product experience
          </p>

          <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">{resolvedTitle}</h2>

          <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground sm:text-sm">
            {resolvedSubtitle}
          </p>
        </div>
      </header>

      <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(16rem,0.85fr)_minmax(0,1.5fr)]">
        <FeaturedProductExperienceCard
          product={resolvedFeaturedProduct}
          actions={actions}
          locale={locale}
          currency={currency}
        />

        <ProductExperienceSlider
          products={sliderProducts}
          actions={actions}
          locale={locale}
          currency={currency}
          title={categorySlug && categorySlug !== 'all' ? `More from ${resolvedTitle}` : 'Continue exploring'}
          subtitle="Select an option, preview quickly, add to cart, or open the complete product experience."
        />
      </div>
    </section>
  );
}
