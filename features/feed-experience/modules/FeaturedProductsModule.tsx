'use client';

import { useEffect, useRef, useState } from 'react';

import { FeaturedProductCard, ProductCard } from '@/features/products/cards';

import type { FeedActions, FeaturedProductsModule as FeaturedProductsModuleType } from '../contracts';

type FeaturedProductsModuleProps = {
  module: FeaturedProductsModuleType;
  actions: FeedActions;
};

const MINIMUM_CARDS_PER_VIEW = 3;
const PREFERRED_CARD_WIDTH = 176;
const CARD_GAP = 12;

export function FeaturedProductsModule({ module, actions }: FeaturedProductsModuleProps) {
  const { featuredProduct, featuredProducts } = module.data;

  const railRef = useRef<HTMLDivElement>(null);

  const [cardsPerView, setCardsPerView] = useState(MINIMUM_CARDS_PER_VIEW);

  const remainingProducts = featuredProduct
    ? featuredProducts.filter(product => product.id !== featuredProduct.id)
    : featuredProducts;

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

      const calculatedCount = Math.floor((availableWidth + CARD_GAP) / (PREFERRED_CARD_WIDTH + CARD_GAP));

      const responsiveCount = Math.max(MINIMUM_CARDS_PER_VIEW, calculatedCount);

      /*
       * Avoid leaving unnecessary empty spaces when
       * fewer products exist than the calculated count.
       */
      setCardsPerView(Math.max(1, Math.min(responsiveCount, remainingProducts.length)));
    };

    updateCardsPerView();

    const resizeObserver = new ResizeObserver(updateCardsPerView);

    resizeObserver.observe(rail);

    return () => {
      resizeObserver.disconnect();
    };
  }, [remainingProducts.length]);

  if (!featuredProduct && !featuredProducts.length) {
    return null;
  }

  const visibleCardCount = Math.max(1, Math.min(cardsPerView, remainingProducts.length || 1));

  const occupiedGapSpace = CARD_GAP * (visibleCardCount - 1);

  const productSlideWidth = `calc((100% - ${occupiedGapSpace}px) / ${visibleCardCount})`;

  return (
    <section className="min-w-0 space-y-5">
      {/* ============================================
          PRIMARY FEATURED PRODUCT
      ============================================ */}

      {featuredProduct ? (
        <FeaturedProductCard
          product={featuredProduct}
          onPreview={actions.previewProduct}
          onToggleLike={actions.toggleLike}
          onAddToCart={actions.addToCart}
        />
      ) : null}

      {/* ============================================
          FEATURED PRODUCT RAIL
      ============================================ */}

      {remainingProducts.length ? (
        <div
          ref={railRef}
          role="region"
          aria-label="Featured products"
          data-cards-per-view={visibleCardCount}
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
          {remainingProducts.map(product => (
            <div
              key={product.id}
              data-featured-product-slide
              className="
                  min-w-0 shrink-0
                  snap-start
                "
              style={{
                width: productSlideWidth,

                flexBasis: productSlideWidth
              }}>
              <ProductCard product={product} onPreview={actions.previewProduct} className="h-full" />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
