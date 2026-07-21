'use client';

import Image from 'next/image';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  BadgeCheck,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Layers3,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  TrendingUp
} from 'lucide-react';

import { cn } from '@/lib/utils';

import type { ProductDetailsModuleDefinition } from '../../contracts';

import { useFeedExperienceContext } from '../../providers/FeedExperienceProvider';

type ProductDetailsModuleProps = {
  module: ProductDetailsModuleDefinition;
};

function formatLabel(value: string): string {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

export function ProductDetailsModule({ module }: ProductDetailsModuleProps) {
  const { productDetailsDisclosure } = useFeedExperienceContext();

  const sectionRef = useRef<HTMLElement>(null);

  const variantScrollerRef = useRef<HTMLDivElement>(null);

  const variantScrollFrameRef = useRef<number | null>(null);

  const [activeVariantSlide, setActiveVariantSlide] = useState(0);

  const [canScrollVariantsLeft, setCanScrollVariantsLeft] = useState(false);

  const [canScrollVariantsRight, setCanScrollVariantsRight] = useState(false);

  const { product, category, categoryDescription, locale = 'en-NG', currency = 'NGN' } = module.data;

  const visible = productDetailsDisclosure.expanded && productDetailsDisclosure.productId === product.id;

  const priceFormatter = useMemo(() => {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',

        currency,

        maximumFractionDigits: 0
      });
    } catch {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',

        currency: 'NGN',

        maximumFractionDigits: 0
      });
    }
  }, [currency, locale]);

  const numberFormatter = useMemo(() => {
    try {
      return new Intl.NumberFormat(locale, {
        notation: 'compact',

        maximumFractionDigits: 1
      });
    } catch {
      return new Intl.NumberFormat('en-NG', {
        notation: 'compact',

        maximumFractionDigits: 1
      });
    }
  }, [locale]);

  const updateVariantScrollerState = useCallback(() => {
    const scroller = variantScrollerRef.current;

    if (!scroller) {
      return;
    }

    const maximumScrollLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth);

    setCanScrollVariantsLeft(scroller.scrollLeft > 8);

    setCanScrollVariantsRight(scroller.scrollLeft < maximumScrollLeft - 8);

    const slides = Array.from(scroller.querySelectorAll<HTMLElement>('[data-variant-slide]'));

    if (slides.length === 0) {
      setActiveVariantSlide(0);
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

    setActiveVariantSlide(closestIndex);
  }, []);

  const handleVariantScroll = useCallback(() => {
    if (variantScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(variantScrollFrameRef.current);
    }

    variantScrollFrameRef.current = window.requestAnimationFrame(() => {
      variantScrollFrameRef.current = null;

      updateVariantScrollerState();
    });
  }, [updateVariantScrollerState]);

  const scrollToVariant = useCallback((requestedIndex: number) => {
    const scroller = variantScrollerRef.current;

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

    setActiveVariantSlide(nextIndex);
  }, []);

  const showPreviousVariant = useCallback(() => {
    scrollToVariant(activeVariantSlide - 1);
  }, [activeVariantSlide, scrollToVariant]);

  const showNextVariant = useCallback(() => {
    scrollToVariant(activeVariantSlide + 1);
  }, [activeVariantSlide, scrollToVariant]);

  const handleVariantScrollerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
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
    if (!visible) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({
        behavior: 'smooth',

        block: 'start'
      });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [productDetailsDisclosure.requestId, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setActiveVariantSlide(0);

    const frameId = window.requestAnimationFrame(() => {
      const scroller = variantScrollerRef.current;

      if (scroller) {
        scroller.scrollLeft = 0;
      }

      updateVariantScrollerState();
    });

    const resizeObserver = new ResizeObserver(updateVariantScrollerState);

    if (variantScrollerRef.current) {
      resizeObserver.observe(variantScrollerRef.current);
    }

    return () => {
      window.cancelAnimationFrame(frameId);

      resizeObserver.disconnect();

      if (variantScrollFrameRef.current !== null) {
        window.cancelAnimationFrame(variantScrollFrameRef.current);

        variantScrollFrameRef.current = null;
      }
    };
  }, [product.id, product.variants.length, updateVariantScrollerState, visible]);

  if (!visible) {
    return null;
  }

  const longDescription = product.longDescription?.trim() || product.shortDescription?.trim();

  const visibleTags = (product.tags ?? []).filter(tag => !tag.includes(':'));

  const totalStock = product.variants.reduce(
    (total, variant) => total + Math.max(0, variant.stockLeft),

    0
  );

  const availableVariants = product.variants.filter(variant => variant.stockLeft > 0).length;

  return (
    <section
      ref={sectionRef}
      id={`product-details-${product.id}`}
      aria-label={`Full details for ${product.name}`}
      className="
        scroll-mt-24
        overflow-hidden rounded-3xl
        border border-primary/10
        bg-card/55 shadow-sm
      ">
      {/* ====================================================
          DETAILS INTRODUCTION
      ==================================================== */}

      <header className="relative overflow-hidden border-b border-primary/10 p-5 md:p-8">
        {category.coverImage ? (
          <Image src={category.coverImage} alt="" fill sizes="100vw" className="object-cover opacity-10" />
        ) : null}

        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/10" />

        <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="h-px w-8 bg-primary/30" />

              <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/60">
                Full product details
              </p>
            </div>

            <h2 className="mt-4 text-2xl font-black tracking-tight md:text-4xl">
              Everything about {product.name}
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
              Complete product information is now revealed inside your active Feed experience.
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <Sparkles className="size-4" />
            Revealed in Feed
          </span>
        </div>
      </header>

      <div className="space-y-8 p-5 md:p-8">
        {/* ==================================================
            PRODUCT STORY
        ================================================== */}

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-border bg-background/70 p-5 md:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Product story
            </p>

            <h3 className="mt-3 text-xl font-bold tracking-tight">About this selection</h3>

            {longDescription ? (
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                {longDescription}
              </p>
            ) : (
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Detailed editorial information has not yet been added for this product.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <article className="rounded-3xl border border-border bg-background/70 p-4">
              <Star className="size-5 fill-amber-400 text-amber-400" />

              <p className="mt-4 text-2xl font-bold">{product.rating.toFixed(1)}</p>

              <p className="mt-1 text-xs text-muted-foreground">
                {numberFormatter.format(product.reviews)} reviews
              </p>
            </article>

            <article className="rounded-3xl border border-border bg-background/70 p-4">
              <TrendingUp className="size-5 text-primary" />

              <p className="mt-4 text-2xl font-bold">{numberFormatter.format(product.soldCount)}</p>

              <p className="mt-1 text-xs text-muted-foreground">Products sold</p>
            </article>

            <article className="rounded-3xl border border-border bg-background/70 p-4">
              <Layers3 className="size-5 text-primary" />

              <p className="mt-4 text-2xl font-bold">{product.variants.length}</p>

              <p className="mt-1 text-xs text-muted-foreground">
                {product.variants.length === 1 ? 'Available option' : 'Available options'}
              </p>
            </article>

            <article className="rounded-3xl border border-border bg-background/70 p-4">
              <PackageCheck className="size-5 text-primary" />

              <p className="mt-4 text-2xl font-bold">{totalStock}</p>

              <p className="mt-1 text-xs text-muted-foreground">
                Units across {availableVariants} in-stock {availableVariants === 1 ? 'option' : 'options'}
              </p>
            </article>
          </div>
        </section>

        {/* ==================================================
            ALL VARIANTS
        ================================================== */}

        <section className="mx-auto overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-xl backdrop-blur-md">
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
                {product.variants.length > 0
                  ? `${activeVariantSlide + 1} of ${product.variants.length}`
                  : 'No variants'}
              </p>

              {product.variants.length > 1 ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Show previous product variant"
                    disabled={!canScrollVariantsLeft}
                    onClick={showPreviousVariant}
                    className="
                      grid size-9 place-items-center
                      rounded-full border border-slate-700
                      bg-slate-950/70 text-slate-200
                      transition
                      hover:border-slate-500 hover:bg-slate-800
                      disabled:cursor-not-allowed
                      disabled:opacity-35
                    ">
                    <ChevronLeft className="size-4" />
                  </button>

                  <button
                    type="button"
                    aria-label="Show next product variant"
                    disabled={!canScrollVariantsRight}
                    onClick={showNextVariant}
                    className="
                      grid size-9 place-items-center
                      rounded-full border border-slate-700
                      bg-slate-950/70 text-slate-200
                      transition
                      hover:border-slate-500 hover:bg-slate-800
                      disabled:cursor-not-allowed
                      disabled:opacity-35
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
                'pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-slate-900 to-transparent transition-opacity',

                canScrollVariantsLeft ? 'opacity-100' : 'opacity-0'
              )}
            />

            <div
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-slate-900 to-transparent transition-opacity',

                canScrollVariantsRight ? 'opacity-100' : 'opacity-0'
              )}
            />

            <div
              ref={variantScrollerRef}
              role="region"
              aria-label={`${product.name} variants`}
              tabIndex={0}
              onScroll={handleVariantScroll}
              onKeyDown={handleVariantScrollerKeyDown}
              className="
                flex snap-x snap-mandatory
                gap-4 overflow-x-auto
                scroll-smooth pb-4 pr-4
                outline-none scrollbar-none
                overscroll-x-contain touch-pan-x
                focus-visible:ring-2
                focus-visible:ring-slate-500
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
                        items-center overflow-hidden
                        rounded-3xl border border-slate-700
                        bg-slate-950/65 p-2
                        shadow-sm transition
                        hover:border-slate-500
                        sm:w-80
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
                          'absolute bottom-1.5 left-1.5 rounded-full px-2 py-0.5 text-[9px] font-semibold backdrop-blur',

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
                  aria-current={index === activeVariantSlide ? 'true' : undefined}
                  onClick={() => scrollToVariant(index)}
                  className={cn(
                    'h-1.5 rounded-full transition-all',

                    index === activeVariantSlide
                      ? 'w-7 bg-slate-200'
                      : 'w-1.5 bg-slate-600 hover:bg-slate-400'
                  )}
                />
              ))}
            </div>
          ) : null}
        </section>

        {/* ==================================================
            PRODUCT FACTS
        ================================================== */}

        <section>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Product information
          </p>

          <h3 className="mt-2 text-xl font-bold tracking-tight">Essential facts</h3>

          <dl className="mt-4 grid overflow-hidden rounded-3xl border border-border bg-background/70 md:grid-cols-2">
            <div className="flex items-center justify-between gap-4 border-b border-border p-4 md:border-r">
              <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="size-4" />
                Category
              </dt>

              <dd className="text-right text-sm font-semibold">{category.label}</dd>
            </div>

            <div className="flex items-center justify-between gap-4 border-b border-border p-4">
              <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                <Layers3 className="size-4" />
                Subcategory
              </dt>

              <dd className="text-right text-sm font-semibold">
                {product.subcategory ? formatLabel(product.subcategory) : 'General selection'}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4 border-b border-border p-4 md:border-r">
              <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                <BadgeCheck className="size-4" />
                Status
              </dt>

              <dd className="text-right text-sm font-semibold">
                {product.isNew
                  ? 'New arrival'
                  : product.featured
                    ? 'Featured selection'
                    : 'Available selection'}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4 border-b border-border p-4">
              <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="size-4" />
                Discount
              </dt>

              <dd className="text-right text-sm font-semibold">
                {product.discountPercentage > 0 ? `${product.discountPercentage}% off` : 'Standard pricing'}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4 p-4 md:border-r">
              <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarClock className="size-4" />
                Delivery
              </dt>

              <dd className="text-right text-sm font-semibold">
                {product.estimatedDelivery || 'Calculated at checkout'}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4 p-4">
              <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                <PackageCheck className="size-4" />
                Availability
              </dt>

              <dd className="text-right text-sm font-semibold">
                {availableVariants > 0
                  ? `${availableVariants} ${availableVariants === 1 ? 'option' : 'options'} in stock`
                  : 'Currently unavailable'}
              </dd>
            </div>
          </dl>
        </section>

        {/* ==================================================
            CHARACTERISTICS
        ================================================== */}

        {visibleTags.length > 0 ? (
          <section>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Characteristics
            </p>

            <h3 className="mt-2 text-xl font-bold tracking-tight">Product tags</h3>

            <div className="mt-4 flex flex-wrap gap-2">
              {visibleTags.map(tag => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-background/70 px-3 py-2 text-xs font-medium text-muted-foreground">
                  {formatLabel(tag)}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {/* ==================================================
            SHOPPING ASSURANCES
        ================================================== */}

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-border bg-background/70 p-5">
            <PackageCheck className="size-5 text-primary" />

            <h3 className="mt-4 text-sm font-semibold">Catalog availability</h3>

            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Variant prices and stock are resolved from the active AJ Logik catalog.
            </p>
          </article>

          <article className="rounded-3xl border border-border bg-background/70 p-5">
            <CalendarClock className="size-5 text-primary" />

            <h3 className="mt-4 text-sm font-semibold">Delivery awareness</h3>

            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Delivery expectations remain connected to the product and checkout experience.
            </p>
          </article>

          <article className="rounded-3xl border border-border bg-background/70 p-5">
            <ShieldCheck className="size-5 text-primary" />

            <h3 className="mt-4 text-sm font-semibold">Secure shopping</h3>

            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Cart, wishlist and checkout actions continue through the shared commerce providers.
            </p>
          </article>
        </section>

        {/* ==================================================
            CATEGORY CONTEXT
        ================================================== */}

        {categoryDescription ? (
          <section className="rounded-3xl border border-primary/10 bg-primary/5 p-5 md:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/60">
              About {category.label}
            </p>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{categoryDescription}</p>
          </section>
        ) : null}
      </div>
    </section>
  );
}
