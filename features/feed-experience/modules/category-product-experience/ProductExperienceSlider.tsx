'use client';

import {
  EXPERIENCE_PRODUCT_ITEM_CLASS,
  EXPERIENCE_PRODUCT_RAIL_CLASS
} from '@/features/products/productRailPresentation';
import { cn } from '@/lib/utils';

import type { FeedActions } from '@/features/feed-experience/contracts';
import type { ProductType } from '@/types/types';

import ProductExperienceCard from './ProductExperienceCard';

type ProductExperienceSliderProps = {
  products: ProductType[];
  actions: FeedActions;
  locale?: string;
  currency?: string;
  title?: string;
  subtitle?: string;
  minimumSlidesPerView?: number;
  preferredSlideWidth?: number;
};

export default function ProductExperienceSlider({
  products,
  actions,
  locale,
  currency,
  title = 'More to explore',
  subtitle = 'Continue discovering products from this experience.'
}: ProductExperienceSliderProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="flex h-full min-w-0 flex-col rounded-2xl border border-border/70 bg-card/60 p-3 shadow-sm sm:p-4">
      <header className="min-w-0">
        <h3 className="text-base font-bold tracking-tight md:text-lg">
          {title}
        </h3>

        {subtitle ? (
          <p className="mt-1 line-clamp-2 max-w-xl text-xs leading-5 text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </header>

      <div
        role="region"
        aria-label={`${title} products`}
        data-product-count={products.length}
        className={cn(EXPERIENCE_PRODUCT_RAIL_CLASS, 'mt-4')}>
        {products.map(product => (
          <div
            key={product.id}
            data-product-experience-slide
            data-experience-product-item
            className={cn(
              EXPERIENCE_PRODUCT_ITEM_CLASS,
              '[&>*]:h-full [&>*]:w-full [&>*]:min-w-0 [&>*]:max-w-none'
            )}>
            <ProductExperienceCard
              product={product}
              actions={actions}
              locale={locale}
              currency={currency}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
