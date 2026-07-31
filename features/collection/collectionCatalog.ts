import type { CollectionType } from '@/data/collections';
import type { ProductType } from '@/types/types';

export function resolveCollectionProducts(
  collection: CollectionType,
  products: ProductType[]
): ProductType[] {
  const productMap = new Map(products.map(product => [String(product.id), product]));

  return collection.productIds
    .map(productId => productMap.get(String(productId)))
    .filter((product): product is ProductType => Boolean(product));
}

export function sortCollections(
  collections: CollectionType[]
): CollectionType[] {
  return [...collections]
    .filter(collection => collection.active)
    .sort(
      (firstCollection, secondCollection) =>
        firstCollection.priority - secondCollection.priority
    );
}
