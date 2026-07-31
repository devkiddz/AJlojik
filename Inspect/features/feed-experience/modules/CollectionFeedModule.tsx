'use client';

import CollectionRenderer from '@/components/discovery/renderers/CollectionRenderer';

import type { CollectionFeedModule as CollectionFeedModuleType, FeedActions } from '../contracts';

import { useProductCardActions } from '../hooks/useProductCardActions';

type CollectionFeedModuleProps = {
  module: CollectionFeedModuleType;
  actions: FeedActions;
};

export function CollectionFeedModule({ module, actions }: CollectionFeedModuleProps) {
  const { collections } = module.data;

  const productActions = useProductCardActions(actions);

  if (collections.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6 pt-4 md:space-y-8">
      {collections.map(experience => (
        <CollectionRenderer
          key={experience.collection.id}
          experience={experience}
          onPreview={productActions.onPreview}
          onOpenExperience={productActions.onOpenExperience}
          onAddToCart={productActions.onAddToCart}
        />
      ))}
    </section>
  );
}
