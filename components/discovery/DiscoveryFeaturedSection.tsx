'use client';

import StoreFeaturedProductCard from '../store/StoreFeaturedProductCard';
import StoreFeaturedProductsSlide from '../store/StoreFeaturedProductsSlide';
import { useDiscovery } from './DiscoveryProvider';

export default function DiscoveryFeaturedSection() {
  const { featuredProduct, featuredProducts, onPreview, onToggleLike, onAddToCart } = useDiscovery();

  if (!featuredProduct && featuredProducts.length === 0) return null;

  return (
    <section>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4">
          {featuredProduct && (
            <StoreFeaturedProductCard
              product={featuredProduct}
              onPreview={onPreview}
              onToggleLike={onToggleLike}
              onAddToCart={onAddToCart}
            />
          )}
        </div>

        <div className="col-span-12 min-w-0 lg:col-span-8">
          <StoreFeaturedProductsSlide
            products={featuredProducts}
            onPreview={onPreview}
            onAddToCart={onAddToCart}
            onLike={product => onToggleLike(product.id)}
          />
        </div>
      </div>
    </section>
  );
}
