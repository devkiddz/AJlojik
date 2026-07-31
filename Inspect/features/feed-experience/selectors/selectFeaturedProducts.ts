import type { ProductType } from "@/types/types";

export function selectFeaturedProducts(products: ProductType[]): ProductType[] {
  return products.filter((product) => product.featured);
}

export function selectPrimaryFeaturedProduct(featuredProducts: ProductType[], fallbackProducts: ProductType[]): ProductType | undefined {
  return featuredProducts[0] ?? fallbackProducts[0];
}
