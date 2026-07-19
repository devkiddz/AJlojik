'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { ProductCard } from '@/features/products/cards';

import { cn } from '@/lib/utils';

import type { ProductType, ProductVariantType } from '@/types/types';

type CollectionProductRailProps = {
  title: string;

  subtitle?: string;

  products: ProductType[];

  onPreview?: (product: ProductType) => void;

  onOpenExperience?: (product: ProductType) => void;

  onAddToCart?: (product: ProductType, variant: ProductVariantType) => void;
};

export default function CollectionProductRail({
  title,
  subtitle,
  products,
  onPreview,
  onOpenExperience,
  onAddToCart
}: CollectionProductRailProps) {
  const railId = useId();

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);

  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    const maximumScroll = element.scrollWidth - element.clientWidth;

    setCanScrollLeft(element.scrollLeft > 2);

    setCanScrollRight(maximumScroll - element.scrollLeft > 2);
  }, []);

  useEffect(() => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    updateScrollState();

    const resizeObserver = new ResizeObserver(updateScrollState);

    resizeObserver.observe(element);

    element.addEventListener('scroll', updateScrollState, {
      passive: true
    });

    return () => {
      resizeObserver.disconnect();

      element.removeEventListener('scroll', updateScrollState);
    };
  }, [products.length, updateScrollState]);

  const scrollRail = (direction: 'left' | 'right') => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    const firstProduct = element.querySelector<HTMLElement>('[data-collection-product]');

    const productWidth = firstProduct?.getBoundingClientRect().width ?? 160;

    const gap = 12;

    element.scrollBy({
      left: direction === 'left' ? -(productWidth + gap) : productWidth + gap,

      behavior: 'smooth'
    });
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      {/* ============================================
          COMPACT RAIL HEADER
      ============================================ */}

      <header className="flex shrink-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/55">
            More in this collection
          </p>

          <h3 className="mt-1 truncate text-lg font-semibold tracking-tight text-card-foreground">{title}</h3>

          {subtitle ? (
            <p className="mt-1 line-clamp-1 text-xs leading-5 text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <RailControl
            direction="left"
            railId={railId}
            disabled={!canScrollLeft}
            onClick={() => {
              scrollRail('left');
            }}
          />

          <RailControl
            direction="right"
            railId={railId}
            disabled={!canScrollRight}
            onClick={() => {
              scrollRail('right');
            }}
          />
        </div>
      </header>

      {/* ============================================
          FLEXIBLE DISCOVERY RAIL
      ============================================ */}

      <div className="mt-3 min-h-0 min-w-0 flex-1 overflow-hidden">
        <div
          id={railId}
          ref={scrollRef}
          role="region"
          aria-label={`${title} products`}
          className={cn(
            'flex min-w-0 items-start gap-3',
            'overflow-x-auto overflow-y-hidden',
            'overscroll-x-contain',
            'snap-x snap-mandatory scroll-smooth',
            'pb-2 pr-8 scrollbar-none'
          )}>
          {products.map(product => (
            <div
              key={product.id}
              data-collection-product
              className={cn(
                'min-w-0 shrink-0 snap-start',

                /**
                 * Flexible widths allow the next product
                 * to remain partially visible.
                 */
                'w-48 sm:w-52 lg:w-52 xl:w-56'
              )}>
              <ProductCard
                product={product}
                onPreview={onPreview}
                onOpenExperience={onOpenExperience}
                onAddToCart={onAddToCart}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type RailControlProps = {
  direction: 'left' | 'right';

  railId: string;

  disabled: boolean;

  onClick: () => void;
};

function RailControl({ direction, railId, disabled, onClick }: RailControlProps) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      aria-label={`Scroll products ${direction}`}
      aria-controls={railId}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'grid size-8 place-items-center rounded-full',
        'border border-border/70 bg-background/80 text-foreground',
        'shadow-sm backdrop-blur transition',
        'hover:border-primary/30 hover:bg-background',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-30'
      )}>
      <Icon className="size-4" />
    </button>
  );
}
