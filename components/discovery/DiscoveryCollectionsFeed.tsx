'use client';

import CollectionRenderer from './renderers/CollectionRenderer';
import { useDiscovery } from '../../providers/DiscoveryProvider';

export default function DiscoveryCollectionsFeed() {
  const { collections, filteredProducts, onPreview, onToggleLike } = useDiscovery();

  return (
    <section className="space-y-5 pt-4">
      {collections.map(({ collection, products, featuredProduct }) => (
        <CollectionRenderer
          key={collection.id}
          collection={collection}
          products={products}
          featuredProduct={featuredProduct}
          onSelect={id => {
            const product = products.find(p => p.id === id) ?? filteredProducts.find(p => p.id === id);

            if (product) onPreview(product);
          }}
          onToggleLike={onToggleLike}
        />
      ))}
    </section>
  );
}
