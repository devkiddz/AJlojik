'use client';

import { Flame } from 'lucide-react';

import { useDiscovery } from '@/components/discovery/DiscoveryProvider';
import SidebarProductCard from '../cards/SidebarProductCard';

export default function DiscoverySidebarTrending() {
  const { filteredProducts, onPreview } = useDiscovery();

  const trendingProducts = filteredProducts
    .slice()
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 5);

  if (trendingProducts.length === 0) return null;

  return (
    <section className="rounded-3xl border bg-card p-3">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-black">
          <Flame className="h-4 w-4 text-secondary" />
          Trending
        </h3>

        <span className="rounded-full bg-secondary/10 px-2 py-1 text-[10px] font-bold text-secondary">
          Today
        </span>
      </div>

      <div className="space-y-1">
        {trendingProducts.map((product, index) => (
          <SidebarProductCard
            key={product.id}
            product={product}
            index={index + 1}
            showRank
            onSelect={onPreview}
          />
        ))}
      </div>
    </section>
  );
}
