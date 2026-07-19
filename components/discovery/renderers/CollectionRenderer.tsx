'use client';

import CollectionSection from '@/features/collection/CollectionSection';

import type { ResolvedCollection } from '@/features/feed-experience/contracts';

import type { ProductType, ProductVariantType } from '@/types/types';

export type CollectionRendererProps = {
  experience: ResolvedCollection;

  onPreview?: (product: ProductType) => void;

  onOpenExperience?: (product: ProductType) => void;

  onAddToCart?: (product: ProductType, variant: ProductVariantType) => void;
};

export default function CollectionRenderer({
  experience,
  onPreview,
  onOpenExperience,
  onAddToCart
}: CollectionRendererProps) {
  const { collection, products } = experience;

  if (!collection.active || products.length === 0) {
    return null;
  }

  return (
    <CollectionSection
      experience={experience}
      onPreview={onPreview}
      onOpenExperience={onOpenExperience}
      onAddToCart={onAddToCart}
    />
  );
}
