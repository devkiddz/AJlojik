'use client';

import { Heart } from 'lucide-react';

import { useDiscovery } from '@/components/discovery/DiscoveryProvider';
import SidebarProductCard from '../cards/SidebarProductCard';

export default function DiscoverySidebarWishlist() {
  const { filteredProducts, onPreview } = useDiscovery();

  const wishlistProducts = filteredProducts.filter(product => product.liked).slice(0, 4);

  if (wishlistProducts.length === 0) return null;

  return (
    <section className="rounded-3xl border bg-card p-3">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-black">
          <Heart className="h-4 w-4 text-secondary" />
          Wishlist
        </h3>
      </div>

      <div className="space-y-1">
        {wishlistProducts.map(product => (
          <SidebarProductCard key={product.id} product={product} onSelect={onPreview} />
        ))}
      </div>
    </section>
  );
}
