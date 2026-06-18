'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import ProductCard from './shared/ProductsCards';
import { ProductType } from '@/types';

type Props = {
  products: ProductType[];
  onSelect: (id: string) => void;
  onToggleLike: (id: string) => void;
};

export default function ProductsCarousel({ products, onSelect, onToggleLike }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const scroll = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;

    el.scrollBy({
      left: direction === 'left' ? -400 : 400,
      behavior: 'smooth'
    });
  };

  const handleWheel = (e: React.WheelEvent) => {
    const el = containerRef.current;
    if (!el) return;

    el.scrollLeft += e.deltaY;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;

    isDragging.current = true;
    startX.current = e.pageX;
    scrollLeft.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el || !isDragging.current) return;
    e.preventDefault();
    const walk = (e.pageX - startX.current) * 1.2;
    el.scrollLeft = scrollLeft.current - walk;
  };

  const stopDragging = () => {
    isDragging.current = false;
  };

  return (
    <section className="mt-4 rounded-2xl bg-muted p-4">
      <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
        <h2 className="text-lg font-semibold">Featured Products</h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scroll('left')}
            className="flex h-10 w-10 items-center justify-center rounded-full border transition hover:bg-background">
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scroll('right')}
            className="flex h-10 w-10 items-center justify-center rounded-full border transition hover:bg-background">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 cursor-grab select-none active:cursor-grabbing [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {products.map(product => (
          <div key={product.id} className="w-[260px] shrink-0">
            <ProductCard
              product={product}
              onSelect={() => onSelect(product.id)}
              onToggleLike={() => onToggleLike(product.id)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
