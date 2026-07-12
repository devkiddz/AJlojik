import type { CollectionType } from "@/data/collections";
import type { ProductType } from "@/types/types";
import type { ResolvedCollection } from "../contracts";

export function resolveCollections(collections: CollectionType[], products: ProductType[]): ResolvedCollection[] {
  return collections
    .filter((collection) => collection.active)
    .sort((a, b) => a.priority - b.priority)
    .map((collection) => ({
      collection,
      products: collection.productIds
        .map((id) => products.find((product) => product.id === id))
        .filter((product): product is ProductType => Boolean(product)),
      featuredProduct: collection.featuredProductId
        ? products.find((product) => product.id === collection.featuredProductId)
        : undefined,
    }));
}
