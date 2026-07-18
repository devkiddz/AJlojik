'use client';

import { useRef } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

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
};

export default function ProductExperienceSlider({
  products,
  actions,
  locale,
  currency,
  title = 'More to explore',
  subtitle = 'Continue discovering products from this experience.'
}: ProductExperienceSliderProps) {
  const viewportRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right'): void => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const distance = Math.max(viewport.clientWidth * 0.8, 208);

    viewport.scrollBy({
      left: direction === 'right' ? distance : -distance,
      behavior: 'smooth'
    });
  };

  return (
    <div className="flex h-full min-w-0 flex-col rounded-2xl border border-border/70 bg-card/60 p-3 shadow-sm sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Category collection
          </p>

          <h3 className="mt-1 text-lg font-bold tracking-tight">{title}</h3>

          <p className="mt-1 line-clamp-2 max-w-xl text-xs leading-5 text-muted-foreground">{subtitle}</p>
        </div>

        <div className="flex shrink-0 gap-1.5">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => scroll('left')}
            aria-label="Previous products"
            className="size-8 rounded-full">
            <ChevronLeft className="size-4" />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => scroll('right')}
            aria-label="Next products"
            className="size-8 rounded-full">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="mt-4 flex min-w-0 snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 scrollbar-hide">
        {products.map(product => (
          <ProductExperienceCard
            key={product.id}
            product={product}
            actions={actions}
            locale={locale}
            currency={currency}
          />
        ))}
      </div>
    </div>
  );
}
