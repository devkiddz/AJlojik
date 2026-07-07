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
    <main className="relative col-span-12 lg:col-span-10">
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
