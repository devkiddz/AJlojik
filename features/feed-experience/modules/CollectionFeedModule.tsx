"use client";

import CollectionRenderer from "@/components/discovery/renderers/CollectionRenderer";
import type { CollectionFeedModule as CollectionFeedModuleType, FeedActions } from "../contracts";

type Props = { module: CollectionFeedModuleType; actions: FeedActions };
export function CollectionFeedModule({ module, actions }: Props) {
  const { collections, fallbackProducts } = module.data;
  return <section className="space-y-5 pt-4">{collections.map(({ collection, products, featuredProduct }) => <CollectionRenderer key={collection.id} collection={collection} products={products} featuredProduct={featuredProduct} onSelect={(id) => { const product = products.find((item) => item.id === id) ?? fallbackProducts.find((item) => item.id === id); if (product) actions.previewProduct(product); }} onToggleLike={actions.toggleLike} />)}</section>;
}
