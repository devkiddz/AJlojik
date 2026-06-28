'use client';

import Image from 'next/image';
import { TrendingUp } from 'lucide-react';
import { ProductType } from '@/types';

type Props = {
  products: ProductType[];
  onSelect: (product: ProductType) => void;
};

export default function SearchTrending({ products, onSelect }: Props) {
  if (!products.length) return null;

  return (
    <section className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-secondary" />
        <h3 className="text-sm font-semibold">Trending Products</h3>
      </div>

      {/* Products */}
      <div className="space-y-2">
        {products.slice(0, 5).map(product => {
          const variant = product.variants[0];

          return (
            <button
              key={product.id}
              type="button"
              onClick={e => {
                e.stopPropagation(); // 🚀 Safely intercepts the click before it leaks to backdrops!
                onSelect(product);
              }}
              className="group flex w-full items-center gap-3 rounded-xl p-2 transition-all hover:bg-muted">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={variant.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium">{product.name}</p>
                <p className="truncate text-xs text-muted-foreground">{product.shortDescription}</p>
              </div>

              <span className="text-sm font-semibold text-primary">₦{variant.price.toLocaleString()}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
