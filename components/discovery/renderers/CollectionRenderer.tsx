'use client';

import { CollectionType } from '@/data/collections';
import CollectionSection from '@/features/collection/CollectionSection';
import { ProductType } from '@/types';

type Props = {
  collection: CollectionType;
  products: ProductType[];
  featuredProduct?: ProductType;
  onSelect?: (productId: string) => void;
  onToggleLike?: (productId: string) => void;
};

export default function CollectionRenderer({
  collection,
  products,
  featuredProduct,
  onSelect,
  onToggleLike
}: Props) {
  if (!collection.active || products.length === 0) return null;

  return (
    <CollectionSection
      collection={collection}
      products={products}
      featuredProduct={featuredProduct}
      onSelect={onSelect}
      onToggleLike={onToggleLike}
    />
  );
}
