import { collections } from '@/data/collections';
import { products } from '@/data/products';
import { ProductType } from '@/types/types';
import CollectionSection from './CollectionSection';

export default function HomeCollections() {
  const resolvedCollections = collections
    .filter(collection => collection.active)
    .sort((a, b) => a.priority - b.priority)
    .map(collection => ({
      collection,
      products: collection.productIds
        .map(id => products.find(product => product.id === id))
        .filter((product): product is ProductType => Boolean(product)),
      featuredProduct: collection.featuredProductId
        ? products.find(product => product.id === collection.featuredProductId)
        : undefined
    }));

  return (
    <>
      {resolvedCollections.map(({ collection, products, featuredProduct }) => (
        <CollectionSection
          key={collection.id}
          collection={collection}
          products={products}
          featuredProduct={featuredProduct}
          onSelect={() => {}}
          onToggleLike={() => {}}
        />
      ))}
    </>
  );
}
