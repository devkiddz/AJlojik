'use client';

import StoreProductGridCard from '@/features/product/StoreProductGridCard';
import { useDiscovery } from '../../providers/DiscoveryProvider';

export default function DiscoveryProductGrid() {
  const { filteredProducts, onPreview, onToggleLike, onAddToCart } = useDiscovery();

  if (filteredProducts.length === 0) {
    return (
      <section className="rounded-2xl border border-border bg-card p-8 text-center">
        <h3 className="text-sm font-semibold text-card-foreground">No products found</h3>
        <p className="mt-1 text-xs text-muted-foreground">Try another category or collection.</p>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-2 gap-3 rounded-xl bg-background p-2 shadow-md md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7">
      {filteredProducts.map(product => (
        <StoreProductGridCard
          key={product.id}
          product={product}
          onPreview={onPreview}
          onToggleLike={onToggleLike}
          onAddToCart={onAddToCart}
        />
      ))}
    </section>
  );
}
