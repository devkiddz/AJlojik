'use client';

import type { CollectionType } from '@/data/collections';

import CollectionSection from '@/features/collection/CollectionSection';

import type { ProductType, ProductVariantType } from '@/types/types';

export type CollectionRendererProps = {
  collection: CollectionType;

  products: ProductType[];

  featuredProduct?: ProductType;

  onPreview?: (product: ProductType) => void;

  onOpenExperience?: (product: ProductType) => void;

  onAddToCart?: (product: ProductType, variant: ProductVariantType) => void;
};

export default function CollectionRenderer({
  collection,
  products,
  featuredProduct,
  onPreview,
  onOpenExperience,
  onAddToCart
}: CollectionRendererProps) {
  if (!collection.active || products.length === 0) {
    return null;
  }

  return (
    <CollectionSection
      collection={collection}
      products={products}
      featuredProduct={featuredProduct}
      onPreview={onPreview}
      onOpenExperience={onOpenExperience}
      onAddToCart={onAddToCart}
    />
  );
}
