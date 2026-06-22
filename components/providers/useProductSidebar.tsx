'use client';

import { useMemo } from 'react';

export function useProductSidebar(productId: string) {
  return useMemo(() => {
    return {
      showRecentlyViewed: true,
      showWishlist: true,
      showPurchased: true
    };
  }, [productId]);
}
