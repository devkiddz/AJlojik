import type { ProductType } from '@/types/types';

export function selectProductsByIds(
  products: ProductType[],
  productIds: string[]
): ProductType[] {
  return productIds
    .map(productId =>
      products.find(product => product.id === productId)
    )
    .filter(
      (product): product is ProductType =>
        Boolean(product)
    );
}