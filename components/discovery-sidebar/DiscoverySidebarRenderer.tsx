'use client';

import DiscoverySidebarAdvert from './widgets/DiscoverySidebarAdvert';
import DiscoverySidebarRecentlyViewed from './widgets/DiscoverySidebarRecentlyViewed';
import DiscoverySidebarWishlist from './widgets/DiscoverySidebarWishlist';
import DiscoverySidebarTrending from './widgets/DiscoverySidebarTrending';
import DiscoverySidebarPromo from './widgets/DiscoverySidebarPromo';

export default function DiscoverySidebarRenderer() {
  return (
    <div className="max-h-[calc(100vh-6rem)] space-y-4 overflow-y-auto scrollbar-hide">
      <DiscoverySidebarAdvert />
      <DiscoverySidebarTrending />
      <DiscoverySidebarPromo />
      <DiscoverySidebarRecentlyViewed />
      <DiscoverySidebarWishlist />
    </div>
  );
}
