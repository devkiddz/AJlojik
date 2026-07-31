import type { ProductType } from '@/types/types';

export function selectRecentlyViewedProducts(
  products: ProductType[],
  recentProductIds: string[]
): ProductType[] {
  return recentProductIds
    .map(productId =>
      products.find(product => product.id === productId)
    )
    .filter(
      (product): product is ProductType =>
        Boolean(product)
    );
}