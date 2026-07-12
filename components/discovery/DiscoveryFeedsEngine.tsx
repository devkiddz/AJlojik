'use client';

import PromoRenderer from '@/components/promos/PromoRenderer';
import { useDiscovery } from '@/providers/DiscoveryProvider';
import DiscoveryCategoryRail from './DiscoveryCategoryRail';
import DiscoveryCollectionsFeed from './DiscoveryCollectionsFeed';
import DiscoveryFeaturedSection from './DiscoveryFeaturedSection';
import DiscoveryProductGrid from './DiscoveryProductGrid';

export default function DiscoveryFeedsEngine() {
  const { filteredProducts, onPromoPreview } = useDiscovery();

  return (
    <main className="">
      <div className="space-y-4 md:space-y-8">
        <DiscoveryCategoryRail />

        <PromoRenderer products={filteredProducts} onSelect={onPromoPreview} />

        <DiscoveryCollectionsFeed />
        <DiscoveryFeaturedSection />
        <DiscoveryProductGrid />
      </div>
    </main>
  );
}
