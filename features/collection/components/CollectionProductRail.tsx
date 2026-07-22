'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { ProductCard } from '@/features/products/cards';

import { cn } from '@/lib/utils';

import type { ProductType, ProductVariantType } from '@/types/types';

type CollectionProductRailProps = {
  title: string;
  subtitle?: string;
  showHeader?: boolean;
  products: ProductType[];

  onPreview?: (product: ProductType) => void;

  onOpenExperience?: (product: ProductType) => void;

  onAddToCart?: (product: ProductType, variant: ProductVariantType) => void;
};

/**
 * Mobile displays two complete cards and part of a third.
 * This keeps discovery visible without making cards too narrow.
 */
const MOBILE_CARDS_PER_VIEW = 2.5;

/**
 * Tablet and desktop rails display at least three complete cards.
 */
const MINIMUM_CARDS_PER_VIEW = 3;

const MOBILE_RAIL_BREAKPOINT = 640;
const PREFERRED_CARD_WIDTH = 160;
const CARD_GAP = 12;

export default function CollectionProductRail({
  title,
  subtitle,
  showHeader = false,
  products,
  onPreview,
  onOpenExperience,
  onAddToCart
}: CollectionProductRailProps) {
  const railId = useId();

  const viewportRef = useRef<HTMLDivElement | null>(null);

  const [cardsPerView, setCardsPerView] = useState(MOBILE_CARDS_PER_VIEW);

  const [canScrollLeft, setCanScrollLeft] = useState(false);

  const [canScrollRight, setCanScrollRight] = useState(false);

  const [controlsVisible, setControlsVisible] = useState(false);

  const updateScrollState = useCallback((): void => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const maximumScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);

    const currentScroll = Math.max(0, viewport.scrollLeft);

    setCanScrollLeft(currentScroll > 2);

    setCanScrollRight(maximumScroll - currentScroll > 2);
  }, []);

  const updateCardsPerView = useCallback((): void => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const availableWidth = viewport.clientWidth;

    if (availableWidth <= 0) {
      return;
    }

    const calculatedCount = Math.floor((availableWidth + CARD_GAP) / (PREFERRED_CARD_WIDTH + CARD_GAP));

    const nextCount =
      availableWidth < MOBILE_RAIL_BREAKPOINT
        ? MOBILE_CARDS_PER_VIEW
        : Math.max(MINIMUM_CARDS_PER_VIEW, calculatedCount);

    setCardsPerView(current => (current === nextCount ? current : nextCount));
  }, []);
  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const updateRail = (): void => {
      updateCardsPerView();
      updateScrollState();
    };

    updateRail();

    const resizeObserver = new ResizeObserver(updateRail);

    resizeObserver.observe(viewport);

    viewport.addEventListener('scroll', updateScrollState, {
      passive: true
    });

    return () => {
      resizeObserver.disconnect();

      viewport.removeEventListener('scroll', updateScrollState);
    };
  }, [products.length, updateCardsPerView, updateScrollState]);

  if (products.length === 0) {
    return null;
  }

  const visibleCardCount = Math.max(1, Math.min(cardsPerView, products.length));

  const visibleGapCount = Math.max(Math.ceil(visibleCardCount) - 1, 0);

  const occupiedGapSpace = CARD_GAP * visibleGapCount;

  const productSlideWidth = `calc((100% - ${occupiedGapSpace}px) / ${visibleCardCount})`;

  const scrollRail = (direction: 'left' | 'right'): void => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const firstProduct = viewport.querySelector<HTMLElement>('[data-collection-product]');

    const productWidth = firstProduct?.getBoundingClientRect().width ?? PREFERRED_CARD_WIDTH;

    const distance = productWidth + CARD_GAP;

    viewport.scrollBy({
      left: direction === 'left' ? -distance : distance,

      behavior: 'smooth'
    });
  };

  return (
    <div className="w-full min-w-0 max-w-full">
      {showHeader ? (
        <header className="mb-3 min-w-0">
          <h3 className="truncate text-sm font-semibold tracking-tight text-card-foreground">{title}</h3>

          {subtitle ? <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{subtitle}</p> : null}
        </header>
      ) : null}

      <div
        className="
          relative isolate
          w-full min-w-0 max-w-full
          overflow-hidden rounded-2xl
        "
        onPointerEnter={event => {
          if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
            setControlsVisible(true);
          }
        }}
        onPointerLeave={() => {
          setControlsVisible(false);
        }}
        onPointerDown={() => {
          setControlsVisible(true);
        }}
        onFocusCapture={() => {
          setControlsVisible(true);
        }}
        onBlurCapture={event => {
          const nextTarget = event.relatedTarget as Node | null;

          if (!event.currentTarget.contains(nextTarget)) {
            setControlsVisible(false);
          }
        }}>
        <div
          id={railId}
          ref={viewportRef}
          role="region"
          aria-label={`${title} products`}
          tabIndex={0}
          data-cards-per-view={visibleCardCount}
          className="
            relative z-0
            flex w-full min-w-0
            max-w-full items-stretch
            gap-3 overflow-x-auto
            overflow-y-hidden
            overscroll-x-contain
            snap-x snap-mandatory
            scroll-smooth
            pb-1 pr-6
            scrollbar-none
            focus-visible:outline-none
          ">
          {products.map(product => (
            <div
              key={product.id}
              data-collection-product
              className="
                min-w-0 shrink-0
                snap-start
              "
              style={{
                width: productSlideWidth,

                flexBasis: productSlideWidth
              }}>
              <ProductCard
                product={product}
                onPreview={onPreview}
                onOpenExperience={onOpenExperience}
                onAddToCart={onAddToCart}
                className="h-full"
              />
            </div>
          ))}
        </div>

        <div
          aria-hidden="true"
          className={cn(
            `
              pointer-events-none
              absolute inset-y-0
              left-0 z-40 w-12
              bg-gradient-to-r
              from-background/90
              to-transparent
              transition-opacity
              duration-200
            `,

            controlsVisible && canScrollLeft ? 'opacity-100' : 'opacity-0'
          )}
        />

        <div
          aria-hidden="true"
          className={cn(
            `
              pointer-events-none
              absolute inset-y-0
              right-0 z-40 w-12
              bg-gradient-to-l
              from-background/90
              to-transparent
              transition-opacity
              duration-200
            `,

            controlsVisible && canScrollRight ? 'opacity-100' : 'opacity-0'
          )}
        />

        <RailControl
          direction="left"
          railId={railId}
          available={canScrollLeft}
          visible={controlsVisible}
          onClick={() => {
            scrollRail('left');
          }}
          className="left-2"
        />

        <RailControl
          direction="right"
          railId={railId}
          available={canScrollRight}
          visible={controlsVisible}
          onClick={() => {
            scrollRail('right');
          }}
          className="right-2"
        />
      </div>
    </div>
  );
}

type RailControlProps = {
  direction: 'left' | 'right';
  railId: string;
  available: boolean;
  visible: boolean;
  onClick: () => void;
  className?: string;
};

function RailControl({ direction, railId, available, visible, onClick, className }: RailControlProps) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;

  const controlIsVisible = visible && available;

  return (
    <button
      type="button"
      aria-label={`Scroll products ${direction}`}
      aria-controls={railId}
      disabled={!available}
      onClick={onClick}
      className={cn(
        `
          absolute top-1/2
          z-[100]
          grid size-9
          -translate-y-1/2
          place-items-center
          rounded-full
          border border-white/20
          bg-black/75
          text-white
          shadow-xl
          backdrop-blur-md
          transition-all
          duration-200
        `,

        controlIsVisible
          ? `
              pointer-events-auto
              scale-100 opacity-100
            `
          : `
              pointer-events-none
              scale-95 opacity-0
            `,

        `
          hover:scale-105
          hover:bg-black/90
          focus-visible:pointer-events-auto
          focus-visible:scale-100
          focus-visible:opacity-100
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-white/70
        `,

        className
      )}>
      <Icon className="size-4" />
    </button>
  );
}
