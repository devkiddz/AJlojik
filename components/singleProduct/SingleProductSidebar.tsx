import { ProductType, ProductVariantType } from '@/types/types';

import SingleProductPurchaseCard from './SingleProductPurchaseCard';
import SingleProductWishlist from './SingleProductWishlist';
import SingleProductTrending from './SingleProductTrending';
import SingleProductRecentlyViewed from './SingleProductRecentlyViewed';

type Props = {
  product: ProductType;
  selectedVariant: ProductVariantType;
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
