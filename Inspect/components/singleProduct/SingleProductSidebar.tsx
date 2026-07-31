import SingleProductWishlist from './SingleProductWishlist';
import SingleProductTrending from './SingleProductTrending';
import SingleProductRecentlyViewed from './SingleProductRecentlyViewed';

export default function SingleProductSidebar() {
  return (
    <div className="space-y-6">
      {/* <SingleProductPurchaseCard variant={selectedVariant} inStock={inStock} /> */}

      <SingleProductWishlist />

      <SingleProductTrending />

      <SingleProductRecentlyViewed />
    </div>
  );
}
