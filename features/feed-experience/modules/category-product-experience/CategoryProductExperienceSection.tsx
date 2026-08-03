'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { FeedActions, FeaturedProductsModule } from '@/features/feed-experience/contracts';

import {
  EXPERIENCE_PRODUCT_RAIL_CLASS,
  getProductRailScrollStep
} from '@/features/products/productRailPresentation';

import { cn } from '@/lib/utils';

import type { ProductType } from '@/types/types';

import FeaturedProductExperienceCard from './FeaturedProductExperienceCard';
import ProductExperienceCard from './ProductExperienceCard';

type CategoryProductExperienceSectionProps = {
  module: FeaturedProductsModule;
  actions: FeedActions;
};

function uniqueProducts(products: ProductType[]): ProductType[] {
  return Array.from(new Map(products.map(product => [product.id, product])).values());
}

export default function CategoryProductExperienceSection({
  module,
  actions
}: CategoryProductExperienceSectionProps) {
  const { title, subtitle, categorySlug, featuredProduct, featuredProducts, products, locale, currency } =
    module.data;

  const railRef = useRef<HTMLDivElement | null>(null);

  const [canScrollPrevious, setCanScrollPrevious] = useState(false);

  const [canScrollNext, setCanScrollNext] = useState(false);

  const resolvedProducts = useMemo(
    () =>
      uniqueProducts([
        ...(products ?? []),
        ...(featuredProduct ? [featuredProduct] : []),
        ...featuredProducts
      ]),
    [featuredProduct, featuredProducts, products]
  );

  const resolvedFeaturedProduct =
    featuredProduct ?? resolvedProducts.find(product => product.featured) ?? resolvedProducts[0];

  const railProducts = useMemo(() => {
    if (!resolvedFeaturedProduct) {
      return resolvedProducts;
    }

    return resolvedProducts.filter(product => product.id !== resolvedFeaturedProduct.id);
  }, [resolvedFeaturedProduct, resolvedProducts]);

  const synchronizeControls = useCallback(() => {
    const viewport = railRef.current;

    if (!viewport) {
      setCanScrollPrevious(false);
      setCanScrollNext(false);
      return;
    }

    const maximumScroll = Math.max(viewport.scrollWidth - viewport.clientWidth, 0);

    setCanScrollPrevious(viewport.scrollLeft > 4);

    setCanScrollNext(viewport.scrollLeft < maximumScroll - 4);
  }, []);

  useEffect(() => {
    const viewport = railRef.current;

    if (!viewport) {
      return;
    }

    const frame = window.requestAnimationFrame(synchronizeControls);

    viewport.addEventListener('scroll', synchronizeControls, {
      passive: true
    });

    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(synchronizeControls);

    observer?.observe(viewport);

    return () => {
      window.cancelAnimationFrame(frame);

      viewport.removeEventListener('scroll', synchronizeControls);

      observer?.disconnect();
    };
  }, [railProducts.length, synchronizeControls]);

  if (!resolvedFeaturedProduct) {
    return null;
  }

  const resolvedTitle =
    title ??
    (categorySlug && categorySlug !== 'all' ? `Featured in ${categorySlug}` : 'Featured across AJ Logik');

  const resolvedSubtitle =
    subtitle ?? 'A premium product story supported by more selections from the current experience.';

  const scrollRail = (direction: 'previous' | 'next') => {
    const viewport = railRef.current;

    if (!viewport) {
      return;
    }

    const distance = getProductRailScrollStep(viewport) * 2;

    viewport.scrollBy({
      left: direction === 'next' ? distance : -distance,
      behavior: 'smooth'
    });
  };

  console.count('CategoryProductExperienceSection render');

  return (
    <section className="min-w-0 overflow-hidden rounded-[2rem] border border-border/60 bg-background/70 p-3 shadow-sm sm:p-4">
      <header className="mb-4 flex min-w-0 items-end justify-between gap-4 px-1">
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Featured by AJ Logik
          </p>

          <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">{resolvedTitle}</h2>

          <p className="mt-1 line-clamp-2 max-w-2xl text-xs leading-5 text-muted-foreground sm:text-sm">
            {resolvedSubtitle}
          </p>
        </div>

        {railProducts.length > 0 ? (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={!canScrollPrevious}
              onClick={() => scrollRail('previous')}
              aria-label="Show previous featured products"
              className="grid size-9 place-items-center rounded-full border border-border/70 bg-foreground text-background shadow-sm transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-30">
              <ChevronLeft className="size-4" />
            </button>

            <button
              type="button"
              disabled={!canScrollNext}
              onClick={() => scrollRail('next')}
              aria-label="Show next featured products"
              className="grid size-9 place-items-center rounded-full border border-border/70 bg-foreground text-background shadow-sm transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-30">
              <ChevronRight className="size-4" />
            </button>
          </div>
        ) : null}
      </header>

      <div
        className={cn(
          'grid min-w-0 items-stretch gap-3',
          railProducts.length > 0 ? 'lg:grid-cols-[34rem_minmax(0,1fr)]' : 'grid-cols-1'
        )}>
        <div className="w-full min-w-0 lg:w-[34rem] lg:min-w-[34rem] lg:max-w-[34rem]">
          <FeaturedProductExperienceCard
            product={resolvedFeaturedProduct}
            actions={actions}
            locale={locale}
            currency={currency}
          />
        </div>

        {railProducts.length > 0 ? (
          <div className="min-w-0 overflow-hidden rounded-3xl border border-border/70 bg-card/45 p-2.5 shadow-sm sm:p-3">
            <div
              ref={railRef}
              role="region"
              aria-label={`${resolvedTitle} products`}
              data-product-count={railProducts.length}
              className={cn(EXPERIENCE_PRODUCT_RAIL_CLASS, 'h-full items-stretch pb-0')}>
              {railProducts.map(product => (
                <div
                  key={product.id}
                  data-product-experience-slide
                  data-experience-product-item
                  className="w-[46%] min-w-[46%] max-w-[46%] flex-none snap-start sm:w-36 sm:min-w-36 sm:max-w-36 md:w-36 md:min-w-36 md:max-w-36 xl:w-40 xl:min-w-40 xl:max-w-40 [&>*]:h-full [&>*]:w-full [&>*]:min-w-0 [&>*]:max-w-none">
                  <ProductExperienceCard
                    product={product}
                    actions={actions}
                    locale={locale}
                    currency={currency}
                    presentation="featured-rail"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
