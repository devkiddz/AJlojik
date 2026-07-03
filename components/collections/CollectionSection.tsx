import { CollectionType } from '@/data/collections';
import { ProductType } from '@/types';

import CollectionBanner from './CollectionBanner';
import FeaturedProductCard from '../shared/FeaturedProductCard';
import ProductsCarousel from '../ProductsCarousel';

type Props = {
  collection: CollectionType;
  products: ProductType[];
  featuredProduct?: ProductType;

  onSelect: (id: string) => void;
  onToggleLike: (id: string) => void;
};

export default function CollectionSection({
  collection,
  products,
  featuredProduct,
  onSelect,
  onToggleLike
}: Props) {
  // Don't render inactive or empty collections
  if (!collection.active || products.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <h1> {collection.title} </h1>
      {/* Campaign Banner */}
      {collection.banners?.length ? <CollectionBanner banners={collection.banners} /> : null}

      {/* Featured Product */}
      {featuredProduct ? <FeaturedProductCard product={featuredProduct} /> : null}

      {/* Product Carousel */}
    </section>
  );
}
