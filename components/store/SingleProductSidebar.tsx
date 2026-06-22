'use client';

import RecentlyViewed from './modules/RecentlyViewed';
import WishlistPreview from './modules/WishlistPreview';
import PurchasedPreview from './modules/PurchasedPreview';
import { useProductSidebar } from '@/components/providers/useProductSidebar';

type Props = {
  productId: string;
};

export default function ProductSidebar({ productId }: Props) {
  const config = useProductSidebar(productId);

  return (
    <aside className="space-y-6 border-l border-white/10 pl-6">
      {config.showRecentlyViewed && <RecentlyViewed />}
      {config.showWishlist && <WishlistPreview />}
      {config.showPurchased && <PurchasedPreview />}
    </aside>
  );
}
