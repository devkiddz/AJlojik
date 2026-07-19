import type {
  CollectionType
} from '@/data/collections';

import type {
  ProductType
} from '@/types/types';

import type {
  ResolvedCollectionSource
} from '../contracts';

export function resolveCollections(
  collections: CollectionType[],
  products: ProductType[]
): ResolvedCollectionSource[] {
  return collections
    .filter(collection => collection.active)
    .sort(
      (firstCollection, secondCollection) =>
        firstCollection.priority -
        secondCollection.priority
    )
    .map(collection => {
      const resolvedProducts =
        collection.productIds
          .map(productId =>
            products.find(
              product =>
                product.id === productId
            )
          )
          .filter(
            (
              product
            ): product is ProductType =>
              Boolean(product)
          );

      const featuredProduct =
        collection.featuredProductId
          ? resolvedProducts.find(
              product =>
                product.id ===
                collection.featuredProductId
            )
          : undefined;

      return {
        collection,
        products: resolvedProducts,
        featuredProduct
      };
    });
}