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
      <div className="grid items-stretch gap-3 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="h-full">
          <FeaturedCollectionCard product={featuredProduct} onSelect={onSelect} />
        </div>

        <div className="relative min-w-0">
          {/* <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-8 bg-linear-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-8 bg-linear-to-l from-background to-transparent" /> */}

          <div className="flex h-full gap-3 overflow-x-auto scrollbar-hide scroll-smooth">
            {displayProducts.map(product => (
              <div key={product.id} className="w-35 shrink-0 md:w-38 lg:w-55">
                <CollectionProductCard product={product} onSelect={onSelect} onToggleLike={onToggleLike} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
