'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { ProductCard } from '@/features/products/cards';

import { cn } from '@/lib/utils';

import type { ProductType, ProductVariantType } from '@/types/types';

type ProductShelfLayout = 'default' | 'three-up';

type ProductShelfProps = {
  products: ProductType[];

  onPreview?: (product: ProductType) => void;

  onOpenExperience?: (product: ProductType) => void;

  onAddToCart?: (product: ProductType, variant: ProductVariantType) => void;

  ariaLabel?: string;

  className?: string;

  itemClassName?: string;

  /**
   * default:
   * Standard fixed-width product cards.
   *
   * three-up:
   * Shows three equal product cards inside the available
   * desktop shelf width.
   */
  layout?: ProductShelfLayout;
};

export default function ProductShelf({
  products,
  onPreview,
  onOpenExperience,
  onAddToCart,
  ariaLabel = 'Products',
  className,
  itemClassName,
  layout = 'default'
}: ProductShelfProps) {
  const shelfId = useId();

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);

  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    const maxScrollLeft = element.scrollWidth - element.clientWidth;

    setCanScrollLeft(element.scrollLeft > 2);

    setCanScrollRight(maxScrollLeft - element.scrollLeft > 2);
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

  const scrollShelf = (direction: 'left' | 'right') => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    const distance = element.clientWidth * 0.95;

    element.scrollBy({
      left: direction === 'left' ? -distance : distance,

      behavior: 'smooth'
    });
  };

  if (products.length === 0) {
    return null;
  }

  const threeUp = layout === 'three-up';

  return (
    <div className={cn('group/shelf relative min-w-0', className)}>
      <button
        type="button"
        aria-label="Scroll products left"
        aria-controls={shelfId}
        disabled={!canScrollLeft}
        onClick={() => scrollShelf('left')}
        className={cn(
          'absolute left-2 top-1/2 z-40 hidden size-10 -translate-y-1/2 place-items-center rounded-full',
          'border border-border/70 bg-background/90 text-foreground shadow-lg backdrop-blur-xl',
          'transition duration-200 hover:scale-105 hover:border-primary/30',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'md:grid',

          canScrollLeft ? 'opacity-0 group-hover/shelf:opacity-100' : 'pointer-events-none opacity-0'
        )}>
        <ChevronLeft className="size-5" />
      </button>

      <button
        type="button"
        aria-label="Scroll products right"
        aria-controls={shelfId}
        disabled={!canScrollRight}
        onClick={() => scrollShelf('right')}
        className={cn(
          'absolute right-2 top-1/2 z-40 hidden size-10 -translate-y-1/2 place-items-center rounded-full',
          'border border-border/70 bg-background/90 text-foreground shadow-lg backdrop-blur-xl',
          'transition duration-200 hover:scale-105 hover:border-primary/30',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'md:grid',

          canScrollRight ? 'opacity-0 group-hover/shelf:opacity-100' : 'pointer-events-none opacity-0'
        )}>
        <ChevronRight className="size-5" />
      </button>

      {canScrollLeft ? (
        <div className="pointer-events-none absolute inset-y-0 left-0 z-30 hidden w-10 bg-gradient-to-r from-card via-card/70 to-transparent md:block" />
      ) : null}

      {canScrollRight ? (
        <div className="pointer-events-none absolute inset-y-0 right-0 z-30 hidden w-10 bg-gradient-to-l from-card via-card/70 to-transparent md:block" />
      ) : null}

      <div
        id={shelfId}
        ref={scrollRef}
        role="region"
        aria-label={ariaLabel}
        className={cn(
          'flex min-w-0 snap-x snap-mandatory gap-4',
          'overflow-x-auto overscroll-x-contain scroll-smooth',
          'px-1 pb-3 scrollbar-none'
        )}>
        {products.map(product => (
          <div
            key={product.id}
            className={cn(
              'shrink-0 snap-start',

              threeUp
                ? ['w-[82%]', 'sm:w-[calc((100%_-_1rem)/2)]', 'lg:w-[calc((100%_-_2rem)/3)]']
                : ['w-52', 'sm:w-56', 'md:w-60'],

              itemClassName
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
  );
}
