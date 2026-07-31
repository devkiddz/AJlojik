import type { ProductType } from '@/types/types';

type SelectRecommendedProductsOptions = {
  products: ProductType[];
  preferredCategorySlugs: string[];
  excludedProductIds?: string[];
  limit?: number;
};

export function selectRecommendedProducts({
  products,
  preferredCategorySlugs,
  excludedProductIds = [],
  limit = 8
}: SelectRecommendedProductsOptions): ProductType[] {
  const preferredCategories =
    new Set(preferredCategorySlugs);

  const excludedIds =
    new Set(excludedProductIds);

  const preferredProducts = products.filter(product => {
    return (
      preferredCategories.has(product.category) &&
      !excludedIds.has(product.id)
    );
  });

  const fallbackProducts = products.filter(product => {
    return (
      product.featured &&
      !excludedIds.has(product.id) &&
      !preferredProducts.some(
        preferredProduct =>
          preferredProduct.id === product.id
      )
    );
  });

  return [
    ...preferredProducts,
    ...fallbackProducts
  ].slice(0, limit);
}