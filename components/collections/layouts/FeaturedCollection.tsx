'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { CollectionType } from '@/data/collections';
import { ProductType } from '@/types';

import CollectionProductCard from '../cards/CollectionProductCard';
import FeaturedCollectionCard from '../cards/FeaturedCollectionCard';
import { Button } from '@/components/ui/button';

type Props = {
  collection: CollectionType;
  products: ProductType[];
  featuredProduct?: ProductType;
  onSelect?: (id: string) => void;
  onToggleLike?: (id: string) => void;
};

export default function FeaturedCollection({ products, featuredProduct, onSelect, onToggleLike }: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  if (!featuredProduct) return null;

  const carouselProducts = products.filter(product => product.id !== featuredProduct.id);

  const displayProducts = carouselProducts.length > 0 ? carouselProducts : products;

  const scrollShelf = (direction: 'left' | 'right') => {
    const shelf = scrollRef.current;
    if (!shelf) return;

    shelf.scrollBy({
      left: direction === 'left' ? -320 : 320,
      behavior: 'smooth'
    });
  };

  return (
    <section className="bg-card">
      <div className="grid items-start gap-4 lg:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="h-full">
          <FeaturedCollectionCard product={featuredProduct} onSelect={onSelect} />
        </div>

        <div className="group/shelf relative min-w-0">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollShelf('left')}
            className="absolute left-2 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 opacity-0 shadow-md backdrop-blur-md transition-all hover:scale-105 group-hover/shelf:opacity-100 md:flex cursor-pointer">
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollShelf('right')}
            className="absolute right-2 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 opacity-0 shadow-md backdrop-blur-md transition-all hover:scale-105 group-hover/shelf:opacity-100 md:flex">
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-6 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-6 bg-gradient-to-l from-background to-transparent" />

          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide scroll-smooth md:gap-4">
            {displayProducts.map(product => (
              <div key={product.id} className="w-32 shrink-0 sm:w-36 md:w-40 lg:w-46 xl:w-50 2xl:w-54">
                <CollectionProductCard product={product} onSelect={onSelect} onToggleLike={onToggleLike} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
