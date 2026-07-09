'use client';

import { Clock3 } from 'lucide-react';

import { useDiscovery } from '@/components/discovery/DiscoveryProvider';
import SidebarProductCard from '../cards/SidebarProductCard';

export default function DiscoverySidebarRecentlyViewed() {
  const { filteredProducts, onPreview } = useDiscovery();

  const recentProducts = filteredProducts.slice(0, 4);

  return (
    <section className="rounded-3xl border bg-card p-3">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-black">
          <Clock3 className="h-4 w-4 text-secondary" />
          Recently Viewed
        </h3>
      </div>

      <div className="space-y-1">
        {recentProducts.map(product => (
          <SidebarProductCard key={product.id} product={product} onSelect={onPreview} />
        ))}
      </div>
    </section>
  );
}
