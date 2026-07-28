'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { ProductCard } from '@/features/products/cards';

import {
  EXPERIENCE_PRODUCT_ITEM_CLASS,
  EXPERIENCE_PRODUCT_RAIL_CLASS,
  getProductRailScrollStep
} from '@/features/products/productRailPresentation';

import { cn } from '@/lib/utils';

import type { ProductType, ProductVariantType } from '@/types/types';

type CollectionProductRailProps = {
  title: string;
  subtitle?: string;
  showHeader?: boolean;

  products: ProductType[];

  featuredProductId?: string;

  onPreview?: (product: ProductType) => void;

  onOpenExperience?: (product: ProductType) => void;

  onAddToCart?: (product: ProductType, variant: ProductVariantType) => void;
};

export default function CollectionProductRail({
  title,
  subtitle,
  showHeader = false,
  products,
  featuredProductId,
  onPreview,
  onOpenExperience,
  onAddToCart
}: CollectionProductRailProps) {
  const railId = useId();

  const viewportRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    updateScrollState();

    const resizeObserver = new ResizeObserver(() => {
      updateScrollState();
    });

    resizeObserver.observe(viewport);

    viewport.addEventListener('scroll', updateScrollState, {
      passive: true
    });

    return () => {
      resizeObserver.disconnect();

      viewport.removeEventListener('scroll', updateScrollState);
    };
  }, [products.length, updateScrollState]);

  if (products.length === 0) {
    return null;
  }

  const scrollRail = (direction: 'left' | 'right'): void => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const distance = getProductRailScrollStep(viewport);

    viewport.scrollBy({
      left: direction === 'left' ? -distance : distance,

      behavior: 'smooth'
    });
  };

  const hasOverflow = canScrollLeft || canScrollRight;

  return (
    <div className="w-full min-w-0 max-w-full">
      {showHeader ? (
        <header className="mb-4 min-w-0">
          <h3 className="truncate text-lg font-bold tracking-tight text-card-foreground">{title}</h3>

          {subtitle ? <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        </header>
      ) : null}

      <div
        className="
          relative isolate
          w-full min-w-0 max-w-full
          overflow-hidden
        "
        onPointerEnter={event => {
          if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
            setControlsVisible(true);
          }
        }}
        onPointerLeave={() => {
          setControlsVisible(false);
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
          data-product-rail="experience"
          className={cn(
            EXPERIENCE_PRODUCT_RAIL_CLASS,

            `
              relative z-0
              max-w-full
              focus-visible:outline-none
            `,

            hasOverflow ? 'pr-6' : 'pr-0'
          )}>
          {products.map(product => {
            const featured = product.id === featuredProductId;

            return (
              <div
                key={product.id}
                data-collection-product
                data-experience-product-item
                data-featured-product={featured || undefined}
                className={EXPERIENCE_PRODUCT_ITEM_CLASS}>
                <ProductCard
                  product={product}
                  presentation={featured ? 'featured' : 'standard'}
                  onPreview={onPreview}
                  onOpenExperience={onOpenExperience}
                  onAddToCart={onAddToCart}
                  className="h-full"
                />
              </div>
            );
          })}
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
