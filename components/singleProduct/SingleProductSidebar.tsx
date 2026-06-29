import { ProductType, ProductVariant } from '@/types';

import SingleProductPurchaseCard from './SingleProductPurchaseCard';
import SingleProductWishlist from './SingleProductWishlist';
import SingleProductTrending from './SingleProductTrending';
import SingleProductRecentlyViewed from './SingleProductRecentlyViewed';

type Props = {
  product: ProductType;
  selectedVariant: ProductVariant;
  inStock: boolean;
};

export default function SingleProductSidebar({ selectedVariant, inStock }: Props) {
  return (
    <div className="space-y-6">
      {/* <SingleProductPurchaseCard variant={selectedVariant} inStock={inStock} /> */}

      <SingleProductWishlist />

      <SingleProductTrending />

      <SingleProductRecentlyViewed />
    </div>
  );
}
