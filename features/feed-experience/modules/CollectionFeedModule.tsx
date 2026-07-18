'use client';

import CollectionRenderer from '@/components/discovery/renderers/CollectionRenderer';

import type { CollectionFeedModule as CollectionFeedModuleType, FeedActions } from '../contracts';

type CollectionFeedModuleProps = {
  module: CollectionFeedModuleType;
  actions: FeedActions;
};

export function CollectionFeedModule({ module, actions }: CollectionFeedModuleProps) {
  const { collections } = module.data;

  if (!collections.length) {
    return null;
  }

  return (
    <section className="space-y-6 pt-4">
      {collections.map(({ collection, products, featuredProduct }) => (
        <CollectionRenderer
          key={collection.id}
          collection={collection}
          products={products}
          featuredProduct={featuredProduct}
          onPreview={actions.previewProduct}
          onToggleLike={actions.toggleLike}
          onAddToCart={actions.addToCart}
        />
      ))}
    </section>
  );
}
