'use client';

import { CollectionType } from '@/data/collections';
import { ProductType } from '@/types';

import CollectionProductCard from '../cards/CollectionProductCard';
import FeaturedCollectionCard from '../cards/FeaturedCollectionCard';

type Props = {
  collection: CollectionType;
  products: ProductType[];
  featuredProduct?: ProductType;
  onSelect?: (id: string) => void;
  onToggleLike?: (id: string) => void;
};

export default function FeaturedCollection({
  collection,
  products,
  featuredProduct,
  onSelect,
  onToggleLike
}: Props) {
  if (!featuredProduct) return null;

  const carouselProducts = products.filter(product => product.id !== featuredProduct.id);

  const displayProducts = carouselProducts.length > 0 ? carouselProducts : products;

  return (
    <section className="bg-card">
      {/* Content */}
      <div className="grid items-stretch gap-6 xl:grid-cols-[470px_minmax(0,1fr)]">
        {/* Featured Hero */}
        <div className="h-full">
          <FeaturedCollectionCard product={featuredProduct} onSelect={onSelect} />
        </div>

        {/* Product Shelf */}
        <div className="relative min-w-0">
          {/* Left Fade */}
          <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-10 bg-gradient-to-r from-background to-transparent" />

          {/* Right Fade */}
          <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-10 bg-gradient-to-l from-background to-transparent" />

          <div className="flex h-full gap-2 overflow-x-auto pb-3 scrollbar-hide scroll-smooth">
            {displayProducts.map(product => (
              <div key={product.id} className="w-[245px] shrink-0">
                <CollectionProductCard product={product} onSelect={onSelect} onToggleLike={onToggleLike} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
