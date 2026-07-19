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

  const trackRef = useRef<HTMLDivElement | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);

  const [canScrollRight, setCanScrollRight] = useState(false);

  const [controlsVisible, setControlsVisible] = useState(false);

  const updateScrollState = useCallback(() => {
    const viewport = viewportRef.current;

    const track = trackRef.current;

    if (!viewport || !track) {
      return;
    }

    const viewportWidth = viewport.clientWidth;

    const contentWidth = Math.max(
      viewport.scrollWidth,
      track.scrollWidth,
      track.getBoundingClientRect().width
    );

    const maximumScroll = Math.max(0, contentWidth - viewportWidth);

    const currentScroll = Math.max(0, viewport.scrollLeft);

    setCanScrollLeft(currentScroll > 2);

    setCanScrollRight(maximumScroll - currentScroll > 2);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;

    const track = trackRef.current;

    if (!viewport || !track) {
      return;
    }

    let secondFrame = 0;

    const firstFrame = window.requestAnimationFrame(() => {
      updateScrollState();

      secondFrame = window.requestAnimationFrame(updateScrollState);
    });

    const resizeObserver = new ResizeObserver(() => {
      updateScrollState();
    });

    resizeObserver.observe(viewport);
    resizeObserver.observe(track);

    viewport.addEventListener('scroll', updateScrollState, {
      passive: true
    });

    window.addEventListener('resize', updateScrollState);

    return () => {
      window.cancelAnimationFrame(firstFrame);

      window.cancelAnimationFrame(secondFrame);

      resizeObserver.disconnect();

      viewport.removeEventListener('scroll', updateScrollState);

      window.removeEventListener('resize', updateScrollState);
    };
  }, [products.length, updateScrollState]);

  const scrollRail = (direction: 'left' | 'right') => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const firstProduct = viewport.querySelector<HTMLElement>('[data-collection-product]');

    const productWidth = firstProduct?.getBoundingClientRect().width ?? 192;

    const gap = 12;

    viewport.scrollBy({
      left: direction === 'left' ? -(productWidth + gap) : productWidth + gap,

      behavior: 'smooth'
    });
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="w-full min-w-0 max-w-full">
      {/* ============================================
          OPTIONAL INTERNAL HEADER
      ============================================ */}

      {showHeader ? (
        <header className="mb-3 min-w-0">
          <h3 className="truncate text-sm font-semibold tracking-tight text-card-foreground">{title}</h3>

          {subtitle ? <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{subtitle}</p> : null}
        </header>
      ) : null}

      {/* ============================================
          SLIDER CONTAINER
      ============================================ */}

      <div
        className={cn('relative isolate w-full min-w-0 max-w-full', 'overflow-hidden rounded-2xl')}
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
        {/* ==========================================
            SCROLLABLE VIEWPORT
        ========================================== */}

        <div
          id={railId}
          ref={viewportRef}
          role="region"
          aria-label={`${title} products`}
          tabIndex={0}
          className={cn(
            'relative z-0 w-full min-w-0 max-w-full',
            'overflow-x-auto overflow-y-hidden',
            'overscroll-x-contain',
            'snap-x snap-mandatory',
            'scroll-smooth scrollbar-none',
            'focus-visible:outline-none'
          )}>
          <div ref={trackRef} className={cn('flex w-max min-w-full items-start gap-3', 'pb-1 pr-8')}>
            {products.map(product => (
              <div
                key={product.id}
                data-collection-product
                className={cn('shrink-0 snap-start', 'w-48 sm:w-52 lg:w-52 xl:w-56')}>
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

        {/* ==========================================
            LEFT EDGE OVERLAY
        ========================================== */}

        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-y-0 left-0 z-40 w-16',
            'bg-gradient-to-r from-background/95 via-background/55 to-transparent',
            'transition-opacity duration-200',

            controlsVisible && canScrollLeft ? 'opacity-100' : 'opacity-0'
          )}
        />

        {/* ==========================================
            RIGHT EDGE OVERLAY
        ========================================== */}

        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-y-0 right-0 z-40 w-16',
            'bg-gradient-to-l from-background/95 via-background/55 to-transparent',
            'transition-opacity duration-200',

            controlsVisible && canScrollRight ? 'opacity-100' : 'opacity-0'
          )}
        />

        {/* ==========================================
            LEFT CONTROL
        ========================================== */}

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

        {/* ==========================================
            RIGHT CONTROL
        ========================================== */}

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
        'absolute top-1/2 z-[100]',
        'grid size-10 -translate-y-1/2 place-items-center',
        'rounded-full border border-white/20',
        'bg-black/75 text-white',
        'shadow-xl backdrop-blur-md',
        'transition-all duration-200',

        controlIsVisible
          ? 'pointer-events-auto scale-100 opacity-100'
          : 'pointer-events-none scale-95 opacity-0',

        'hover:scale-105 hover:bg-black/90',
        'focus-visible:pointer-events-auto',
        'focus-visible:scale-100',
        'focus-visible:opacity-100',
        'focus-visible:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-white/70',

        className
      )}>
      <Icon className="size-5" />
    </button>
  );
}
