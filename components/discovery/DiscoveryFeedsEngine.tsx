'use client';

import DiscoveryCategoryRail from './DiscoveryCategoryRail';
import DiscoveryCollectionsFeed from './DiscoveryCollectionsFeed';
import DiscoveryFeaturedSection from './DiscoveryFeaturedSection';
import DiscoveryProductGrid from './DiscoveryProductGrid';

export default function DiscoveryFeedsEngine() {
  return (
    <main className="relative col-span-12 lg:col-span-10">
      <div className="space-y-8">
        <DiscoveryCategoryRail />
        <DiscoveryCollectionsFeed />
        <DiscoveryFeaturedSection />
        <DiscoveryProductGrid />
      </div>
    </main>
  );
}
