import { CollectionType } from '@/data/collections';
import { ProductType } from '@/types';

import CollectionBanner from './CollectionBanner';
import FeaturedCollection from './layouts/FeaturedCollection';
type Props = {
  collection: CollectionType;
  products: ProductType[];
  featuredProduct?: ProductType;
  onSelect?: (id: string) => void;
  onToggleLike?: (id: string) => void;
};

export default function CollectionSection({
  collection,
  products,
  featuredProduct,
  onSelect,
  onToggleLike
}: Props) {
  if (!collection.active || products.length === 0) {
    return null;
  }

  return (
    <section className="space-y-5">
      {collection.banner ? <CollectionBanner banner={collection.banner} /> : null}

      <FeaturedCollection
        collection={collection}
        products={products}
        featuredProduct={featuredProduct}
        onSelect={onSelect}
        onToggleLike={onToggleLike}
      />
    </section>
  );
}
