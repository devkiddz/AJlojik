'use client';

import PromoRenderer from '@/components/promos/PromoRenderer';
import { useDiscovery } from './DiscoveryProvider';
import DiscoveryCategoryRail from './DiscoveryCategoryRail';
import DiscoveryCollectionsFeed from './DiscoveryCollectionsFeed';
import DiscoveryFeaturedSection from './DiscoveryFeaturedSection';
import DiscoveryProductGrid from './DiscoveryProductGrid';

export default function DiscoveryFeedsEngine() {
  const { filteredProducts, onPromoPreview } = useDiscovery();

  return (
    <main className="relative top-3 col-span-12 lg:col-span-8 rounded-3xl bg-card/50 p-4">
      <div className="space-y-8">
        <DiscoveryCategoryRail />

        <PromoRenderer products={filteredProducts} onSelect={onPromoPreview} />

        <DiscoveryCollectionsFeed />
        <DiscoveryFeaturedSection />
        <DiscoveryProductGrid />
      </div>
    </main>
  );
}
