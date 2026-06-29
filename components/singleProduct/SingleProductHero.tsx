'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ChartColumnStacked, Star } from 'lucide-react';
import { categories } from '@/categories';
import { ProductType, ProductVariant } from '@/types';
import RatingComponent from '../shared/RatingComponent';

type Props = {
  product: ProductType;
  variant: ProductVariant;
};

const FALLBACK_BANNER =
  'https://images.unsplash.com/photo-1556740749-887f6717d7e4?q=80&w=1600&auto=format&fit=crop';

export default function SingleProductHero({ product, variant }: Props) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(variant);

  const category = useMemo(
    () => categories.find(c => c.slug === product.category) ?? categories[0],
    [product.category]
  );

  const covers = category.coverImages?.length > 0 ? category.coverImages : [FALLBACK_BANNER];
  const [currentCover, setCurrentCover] = useState(0);

  useEffect(() => {
    if (covers.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentCover(prev => (prev + 1) % covers.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [covers]);

  return (
    <section className="fixed top-0 w-full isolate overflow-hidden min-h-[500px] flex items-center">
      {/* Background Slider */}
      <div className="absolute inset-0 z-0">
        {covers.map((cover, index) => (
          <Image
            key={cover}
            src={cover}
            alt={category.label}
            fill
            className={`object-cover transition-opacity duration-1000 ${
              currentCover === index ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Content Container */}
      <div className="flex flex-col relative z-10 mx-auto max-w-[80%] w-full py-12"></div>
    </section>
  );
}
