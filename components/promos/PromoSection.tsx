'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRightCircle } from 'lucide-react';
import { Promo } from '@/data/promos';
import { ProductType } from '@/types';
import PromoCard from './PromoCard';
import { Button } from '../ui/button';
import Link from 'next/link';

type Props = {
  promos: Promo[];
  products: ProductType[];
  onSelect?: (id: string) => void;
};

export default function PromoSection({ promos, products, onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const activePromos = promos.filter(p => p.active).sort((a, b) => a.priority - b.priority);

  if (activePromos.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Promos & Deals</h2>
          <p className="text-sm text-muted-foreground">Hot picks and exclusive offers.</p>
        </div>
        <Link href="/promos" className="hidden md:block">
          <Button variant="outline" className="gap-2 rounded-full">
            All <ArrowRightCircle className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Relative container to hold buttons and scrollable area */}
      <div
        className="group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}>
        {/* Navigation Buttons (Overlay) */}
        <div
          className={`absolute inset-y-0 left-0 z-10 flex items-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full shadow-lg ml-2  cursor-pointer"
            onClick={() => scroll('left')}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>

        <div
          className={`absolute inset-y-0 right-0 z-10 flex items-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full shadow-lg mr-2  cursor-pointer"
            onClick={() => scroll('right')}>
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {activePromos.map(promo => (
            <div key={promo.id} className="min-w-[280px] sm:min-w-[320px] lg:min-w-[350px] snap-start">
              <PromoCard
                promo={promo}
                products={products.filter(p => promo.productIds.includes(p.id))}
                onSelect={onSelect}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
