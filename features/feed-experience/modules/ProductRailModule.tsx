'use client';

import { useEffect, useRef, useState } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { ProductCard } from '@/features/products/cards';

import type { FeedActions, ProductRailModuleDefinition } from '../contracts';

type ProductRailModuleProps = {
  module: ProductRailModuleDefinition;
  actions: FeedActions;
};

/**
 * Three cards must remain visible even on small screens.
 */
const MINIMUM_CARDS_PER_VIEW = 3;

/**
 * Preferred desktop card width.
 *
 * The rail adds more cards whenever enough space exists,
 * rather than stretching a fixed number of cards.
 */
const PREFERRED_CARD_WIDTH = 176;

/**
 * Equivalent to Tailwind's gap-3.
 */
const CARD_GAP = 12;

export function ProductRailModule({ module, actions }: ProductRailModuleProps) {
  const { title, subtitle, products } = module.data;

  const railRef = useRef<HTMLDivElement>(null);

  const [cardsPerView, setCardsPerView] = useState(MINIMUM_CARDS_PER_VIEW);

  useEffect(() => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    const updateCardsPerView = (): void => {
      const availableWidth = rail.clientWidth;

      if (availableWidth <= 0) {
        return;
      }

      /**
       * Determine how many preferred-width cards can fit.
       *
       * On narrow screens, the result is forced to at least
       * three cards. Wider containers automatically receive
       * four, five, six, or more equal-width cards.
       */
      const calculatedCount = Math.floor((availableWidth + CARD_GAP) / (PREFERRED_CARD_WIDTH + CARD_GAP));

      setCardsPerView(Math.max(MINIMUM_CARDS_PER_VIEW, calculatedCount));
    };

    updateCardsPerView();

    const resizeObserver = new ResizeObserver(updateCardsPerView);

    resizeObserver.observe(rail);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  if (!products.length) {
    return null;
  }

  const scrollRail = (direction: 'left' | 'right'): void => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    const firstSlide = rail.querySelector<HTMLElement>('[data-product-slide]');

    const slideWidth = firstSlide?.getBoundingClientRect().width ?? PREFERRED_CARD_WIDTH;

    /**
     * Move one complete visible group.
     */
    const distance = (slideWidth + CARD_GAP) * cardsPerView;

    rail.scrollBy({
      left: direction === 'left' ? -distance : distance,

      behavior: 'smooth'
    });
  };

  const occupiedGapSpace = CARD_GAP * (cardsPerView - 1);

  const productSlideWidth = `calc((100% - ${occupiedGapSpace}px) / ${cardsPerView})`;

  return (
    <section className="min-w-0 space-y-4">
      {/* ==================================================
          MODULE HEADER
      ================================================== */}

      <header className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>

          {subtitle ? <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={`Scroll ${title} left`}
            onClick={() => {
              scrollRail('left');
            }}
            className="size-9 rounded-full">
            <ChevronLeft className="size-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={`Scroll ${title} right`}
            onClick={() => {
              scrollRail('right');
            }}
            className="size-9 rounded-full">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </header>

      {/* ==================================================
          RESPONSIVE PRODUCT RAIL
      ================================================== */}

      <div
        ref={railRef}
        role="region"
        aria-label={`${title} products`}
        data-cards-per-view={cardsPerView}
        className="
          flex w-full min-w-0
          snap-x snap-mandatory
          items-stretch gap-3
          overflow-x-auto
          overscroll-x-contain
          scroll-smooth
          pb-3
          scrollbar-none
        ">
        {products.map(product => (
          <div
            key={product.id}
            data-product-slide
            className="
              min-w-0 shrink-0
              snap-start
            "
            style={{
              flexBasis: productSlideWidth,

              width: productSlideWidth
            }}>
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
    </section>
  );
}
