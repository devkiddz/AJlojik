'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { ProductCard } from '@/features/products/cards';

import type { FeedActions, ProductRailModuleDefinition } from '../contracts';

type ProductRailModuleProps = {
  module: ProductRailModuleDefinition;
  actions: FeedActions;
};

export function ProductRailModule({ module, actions }: ProductRailModuleProps) {
  const { title, subtitle, products } = module.data;

  const railRef = useRef<HTMLDivElement>(null);

  if (!products.length) {
    return null;
  }

  const scrollRail = (direction: 'left' | 'right') => {
    railRef.current?.scrollBy({
      left: direction === 'left' ? -640 : 640,
      behavior: 'smooth'
    });
  };

  return (
    <section className="space-y-4">
      <header className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">{title}</h2>

          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>

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

      <div
        ref={railRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 scrollbar-none">
        {products.map(product => (
          <div key={product.id} className="w-60 shrink-0 snap-start md:w-64">
            <ProductCard
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
