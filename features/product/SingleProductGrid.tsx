'use client';

import { ProductType } from '@/types';
import SingleProductCard from './SingleProductCard';

interface SingleProductGridProps {
  products: ProductType[];
  title?: string;
  className?: string;
}

/**
 * SingleProductGrid
 * Renders a high-fidelity, responsive collection of your SingleProductCards.
 */
export default function SingleProductGrid({ products, title, className = '' }: SingleProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-3xl border border-dashed border-white/10 text-muted-foreground">
        <p className="text-sm font-bold uppercase tracking-widest">No products available</p>
      </div>
    );
  }

  return (
    <section className={`space-y-8 ${className}`}>
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tighter text-foreground">{title}</h2>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {products.map(product => (
          <SingleProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
