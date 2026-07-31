'use client';

import CollectionProductRail from '@/features/collection/components/CollectionProductRail';
import CollectionProductsHeader from '@/features/collection/components/CollectionProductsHeader';

import type { ResolvedCollection } from '@/features/feed-experience/contracts';

import type { ProductType, ProductVariantType } from '@/types/types';

type FeaturedCollectionProps = {
  experience: ResolvedCollection;

  onPreview?: (product: ProductType) => void;

  onOpenExperience?: (product: ProductType) => void;

  onAddToCart?: (product: ProductType, variant: ProductVariantType) => void;
};

export default function FeaturedCollection({
  experience,
  onPreview,
  onOpenExperience,
  onAddToCart
}: FeaturedCollectionProps) {
  const { collection, products, featuredProduct, presentation } = experience;

  if (products.length === 0) {
    return null;
  }

  const featuredProductId =
    presentation.featured.visible && featuredProduct
      ? featuredProduct.id
      : undefined;

  return (
    <section className="min-w-0">
      <CollectionProductsHeader
        title={collection.title}
        subtitle={collection.subtitle}
        productCount={collection.productIds.length}
        href={`/collections/${encodeURIComponent(collection.slug)}`}
      />

      <div className="mt-4 min-w-0">
        <CollectionProductRail
          title={collection.title}
          subtitle={collection.subtitle}
          showHeader={false}
          products={products}
          featuredProductId={featuredProductId}
          onPreview={onPreview}
          onOpenExperience={onOpenExperience}
          onAddToCart={onAddToCart}
        />
      </div>
    </section>
  );
}
