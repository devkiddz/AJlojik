'use client';

import { useEffect, useRef, useState } from 'react';

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

const CARD_GAP = 12;

export default function ProductExperienceSlider({
  products,
  actions,
  locale,
  currency,
  title = 'More to explore',
  subtitle = 'Continue discovering products from this experience.',
  minimumSlidesPerView = 3,
  preferredSlideWidth = 144
}: ProductExperienceSliderProps) {
  const viewportRef = useRef<HTMLDivElement>(null);

  const [slidesPerView, setSlidesPerView] = useState(minimumSlidesPerView);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const updateSlidesPerView = (): void => {
      const availableWidth = viewport.clientWidth;

      if (availableWidth <= 0) {
        return;
      }

      const calculatedSlides = Math.floor((availableWidth + CARD_GAP) / (preferredSlideWidth + CARD_GAP));

      setSlidesPerView(Math.max(minimumSlidesPerView, calculatedSlides));
    };

    updateSlidesPerView();

    const resizeObserver = new ResizeObserver(updateSlidesPerView);

    resizeObserver.observe(viewport);

    return () => {
      resizeObserver.disconnect();
    };
  }, [minimumSlidesPerView, preferredSlideWidth]);

  if (products.length === 0) {
    return null;
  }

  /*
   * We cannot display more unique slides than the
   * number of products supplied by the parent.
   */
  const visibleSlidesPerView = Math.min(slidesPerView, products.length);

  const occupiedGapSpace = CARD_GAP * Math.max(visibleSlidesPerView - 1, 0);

  const slideWidth = `calc((100% - ${occupiedGapSpace}px) / ${visibleSlidesPerView})`;

  return (
    <section
      className="
        flex h-full min-w-0
        flex-col rounded-2xl
        border border-border/70
        bg-card/60
        p-3 shadow-sm
        sm:p-4
      ">
      <header className="min-w-0">
        <h3 className="text-base font-bold tracking-tight md:text-lg">{title}</h3>

        {subtitle ? (
          <p
            className="
              mt-1 line-clamp-2
              max-w-xl text-xs
              leading-5 text-muted-foreground
            ">
            {subtitle}
          </p>
        ) : null}
      </header>

      <div
        ref={viewportRef}
        role="region"
        aria-label={`${title} products`}
        data-product-count={products.length}
        data-slides-per-view={visibleSlidesPerView}
        className="
          mt-4 flex min-w-0
          snap-x snap-mandatory
          items-stretch gap-3
          overflow-x-auto
          overscroll-x-contain
          scroll-smooth pb-2
          scrollbar-hide
        ">
        {products.map(product => (
          <div
            key={product.id}
            data-product-experience-slide
            className="
              min-w-0 shrink-0
              snap-start
              [&>*]:h-full
              [&>*]:w-full
              [&>*]:min-w-0
              [&>*]:max-w-none
            "
            style={{
              width: slideWidth,
              flexBasis: slideWidth
            }}>
            <ProductExperienceCard product={product} actions={actions} locale={locale} currency={currency} />
          </div>
        ))}
      </div>
    </section>
  );
}
