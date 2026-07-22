'use client';

import Image from 'next/image';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { ProductType } from '@/types/types';

type ProductVariantScrollerProps = {
  product: ProductType;
  priceFormatter: Intl.NumberFormat;
};

export function ProductVariantScroller({ product, priceFormatter }: ProductVariantScrollerProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollFrameRef = useRef<number | null>(null);

  const [activeSlide, setActiveSlide] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollerState = useCallback(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const maximumScrollLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth);

    setCanScrollLeft(scroller.scrollLeft > 8);
    setCanScrollRight(scroller.scrollLeft < maximumScrollLeft - 8);

    const slides = Array.from(scroller.querySelectorAll<HTMLElement>('[data-variant-slide]'));

    if (slides.length === 0) {
      setActiveSlide(0);
      return;
    }

    const scrollerBounds = scroller.getBoundingClientRect();
    const viewportCenter = scrollerBounds.left + scrollerBounds.width / 2;

    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    slides.forEach((slide, index) => {
      const slideBounds = slide.getBoundingClientRect();
      const slideCenter = slideBounds.left + slideBounds.width / 2;

      const distance = Math.abs(viewportCenter - slideCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveSlide(closestIndex);
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollFrameRef.current !== null) {
      window.cancelAnimationFrame(scrollFrameRef.current);
    }

    scrollFrameRef.current = window.requestAnimationFrame(() => {
      scrollFrameRef.current = null;
      updateScrollerState();
    });
  }, [updateScrollerState]);

  const scrollToVariant = useCallback((requestedIndex: number) => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const slides = Array.from(scroller.querySelectorAll<HTMLElement>('[data-variant-slide]'));

    if (slides.length === 0) {
      return;
    }

    const nextIndex = Math.min(slides.length - 1, Math.max(0, requestedIndex));

    slides[nextIndex]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });

    setActiveSlide(nextIndex);
  }, []);

  const showPreviousVariant = useCallback(() => {
    scrollToVariant(activeSlide - 1);
  }, [activeSlide, scrollToVariant]);

  const showNextVariant = useCallback(() => {
    scrollToVariant(activeSlide + 1);
  }, [activeSlide, scrollToVariant]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showPreviousVariant();
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        showNextVariant();
      }
    },
    [showNextVariant, showPreviousVariant]
  );

  useEffect(() => {
    const scroller = scrollerRef.current;

    setActiveSlide(0);

    if (scroller) {
      scroller.scrollLeft = 0;
    }

    const frameId = window.requestAnimationFrame(updateScrollerState);

    const resizeObserver = new ResizeObserver(updateScrollerState);

    if (scroller) {
      resizeObserver.observe(scroller);
    }

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();

      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);

        scrollFrameRef.current = null;
      }
    };
  }, [product.id, product.variants.length, updateScrollerState]);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-xl backdrop-blur-md">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Complete selection
          </p>

          <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-50">
            Variants, prices and availability
          </h3>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <p className="text-xs text-slate-400">
            {product.variants.length > 0 ? `${activeSlide + 1} of ${product.variants.length}` : 'No variants'}
          </p>

          {product.variants.length > 1 ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Show previous product variant"
                disabled={!canScrollLeft}
                onClick={showPreviousVariant}
                className="
                  grid size-9 place-items-center rounded-full
                  border border-slate-700 bg-slate-950/70
                  text-slate-200 transition
                  hover:border-slate-500 hover:bg-slate-800
                  disabled:cursor-not-allowed disabled:opacity-35
                ">
                <ChevronLeft className="size-4" />
              </button>

              <button
                type="button"
                aria-label="Show next product variant"
                disabled={!canScrollRight}
                onClick={showNextVariant}
                className="
                  grid size-9 place-items-center rounded-full
                  border border-slate-700 bg-slate-950/70
                  text-slate-200 transition
                  hover:border-slate-500 hover:bg-slate-800
                  disabled:cursor-not-allowed disabled:opacity-35
                ">
                <ChevronRight className="size-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative mt-4">
        <div
          aria-hidden="true"
          className={cn(
            `
              pointer-events-none absolute inset-y-0 left-0
              z-10 w-10 bg-gradient-to-r
              from-slate-900 to-transparent
              transition-opacity
            `,
            canScrollLeft ? 'opacity-100' : 'opacity-0'
          )}
        />

        <div
          aria-hidden="true"
          className={cn(
            `
              pointer-events-none absolute inset-y-0 right-0
              z-10 w-10 bg-gradient-to-l
              from-slate-900 to-transparent
              transition-opacity
            `,
            canScrollRight ? 'opacity-100' : 'opacity-0'
          )}
        />

        <div
          ref={scrollerRef}
          role="region"
          aria-label={`${product.name} variants`}
          tabIndex={0}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          className="
            flex snap-x snap-mandatory gap-4
            overflow-x-auto overscroll-x-contain
            scroll-smooth pb-4 pr-4
            outline-none scrollbar-none touch-pan-x
            focus-visible:ring-2 focus-visible:ring-slate-500
            focus-visible:ring-offset-2
            focus-visible:ring-offset-slate-900
          ">
          {product.variants.map(variant => {
            const outOfStock = variant.stockLeft <= 0;

            const lowStock = variant.stockLeft > 0 && variant.stockLeft <= 5;

            return (
              <article
                key={variant.id}
                data-variant-slide
                className="
                  flex w-72 shrink-0 snap-center
                  items-center overflow-hidden rounded-3xl
                  border border-slate-700 bg-slate-950/65
                  p-2 shadow-sm transition
                  hover:border-slate-500 sm:w-80
                ">
                <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-muted sm:size-28">
                  <Image
                    src={variant.image}
                    alt={`${product.name} — ${variant.label}`}
                    fill
                    sizes="(max-width: 640px) 96px, 112px"
                    className="object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <span
                    className={cn(
                      `
                        absolute bottom-1.5 left-1.5
                        rounded-full px-2 py-0.5
                        text-[9px] font-semibold backdrop-blur
                      `,
                      outOfStock
                        ? 'bg-black/60 text-white'
                        : lowStock
                          ? 'bg-amber-500/90 text-black'
                          : 'bg-emerald-500/90 text-black'
                    )}>
                    {outOfStock
                      ? 'Out of stock'
                      : lowStock
                        ? `${variant.stockLeft} left`
                        : `${variant.stockLeft} avail.`}
                  </span>
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-center px-4">
                  <p className="truncate text-sm font-semibold text-slate-100">{variant.label}</p>

                  <p className="mt-1 truncate text-base font-bold tracking-tight text-slate-50 sm:text-lg">
                    {priceFormatter.format(Number(variant.price))}
                  </p>

                  <p
                    className={cn(
                      'mt-2 text-[10px] font-medium',
                      outOfStock ? 'text-rose-300' : lowStock ? 'text-amber-300' : 'text-emerald-300'
                    )}>
                    {outOfStock ? 'Unavailable' : lowStock ? 'Limited availability' : 'Ready to order'}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {product.variants.length > 1 ? (
        <div className="mt-1 flex items-center justify-center gap-2" aria-label="Product variant slides">
          {product.variants.map((variant, index) => (
            <button
              key={variant.id}
              type="button"
              aria-label={`Show ${variant.label}`}
              aria-current={index === activeSlide ? 'true' : undefined}
              onClick={() => scrollToVariant(index)}
              className={cn(
                'h-1.5 rounded-full transition-all',
                index === activeSlide ? 'w-7 bg-slate-200' : 'w-1.5 bg-slate-600 hover:bg-slate-400'
              )}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
