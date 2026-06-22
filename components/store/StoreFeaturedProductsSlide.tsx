'use client';

import { useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductType, ProductVariantType } from '@/types';
import StoreProductCard from '@/components/store/StoreProductCard';

type Props = {
  products: ProductType[];
  // UPDATED: Replaced onPreview with onAddToCart to lock in type alignment
  onAddToCart?: (product: ProductType, variant: ProductVariantType) => void;
  onLike?: (product: ProductType) => void;
};

export default function StoreFeaturedProductsSlide({ products, onAddToCart, onLike }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const featuredProducts = useMemo(() => products.filter(product => product.featured), [products]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;

    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <section className="w-full overflow-hidden">
      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between px-2 mt-5">
        <div className="flex items-baseline gap-2">
          <h2 className="text-md md:text-xl font-semibold tracking-tight">Featured Products</h2>
          <span className="text-xs md:text-md text-rose-400 py-1 px-2 rounded-sm bg-rose-900/20 relative md:bottom-1">
            ({featuredProducts.length})
          </span>
        </div>

        {/* NAVIGATION */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:bg-muted hover:text-foreground active:scale-95 cursor-pointer"
            aria-label="Scroll left">
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={() => scroll('right')}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:bg-muted hover:text-foreground active:scale-95 cursor-pointer"
            aria-label="Scroll right">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* SLIDER CONTAINER */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-2 px-2 w-full min-w-0">
        {featuredProducts.map(product => (
          <div
            key={product.id}
            className="w-[40vw] sm:w-[240px] max-w-[240px] flex-shrink-0 snap-start min-w-0">
            <StoreProductCard
              product={product}
              // PASSED DOWN: Wire up the active variant addition
              onAddToCart={onAddToCart}
              onToggleLike={() => onLike?.(product)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
