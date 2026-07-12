'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import StoreProductGridCard from '@/features/product/StoreProductGridCard';

import type { FeedActions, ProductRailModuleDefinition } from '../contracts';

type ProductRailModuleProps = {
  module: ProductRailModuleDefinition;
  actions: FeedActions;
};

export function ProductRailModule({ module, actions }: ProductRailModuleProps) {
  const { title, subtitle, products } = module.data;

  const railRef = useRef<HTMLDivElement>(null);

  if (!products.length) return null;

  const scrollRail = (direction: 'left' | 'right') => {
    railRef.current?.scrollBy({
      left: direction === 'left' ? -520 : 520,
      behavior: 'smooth'
    });
  };

  return (
    <section className="space-y-4">
      {/* Module Header */}
      <header className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>

          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>

        {/* Desktop Rail Controls */}
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={`Scroll ${title} left`}
            onClick={() => scrollRail('left')}
            className="size-9 rounded-full">
            <ChevronLeft className="size-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={`Scroll ${title} right`}
            onClick={() => scrollRail('right')}
            className="size-9 rounded-full">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </header>

      {/* Product Rail */}
      <div
        ref={railRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 scrollbar-none">
        {products.map(product => (
          <div
            key={product.id}
            role="button"
            tabIndex={0}
            className="w-44 shrink-0 snap-start cursor-pointer md:w-48"
            onClick={() =>
              actions.openExperience({
                type: 'product',
                productId: product.id
              })
            }
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();

                actions.openExperience({
                  type: 'product',
                  productId: product.id
                });
              }
            }}>
            <StoreProductGridCard
              product={product}
              onPreview={actions.previewProduct}
              onToggleLike={actions.toggleLike}
              onAddToCart={actions.addToCart}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
