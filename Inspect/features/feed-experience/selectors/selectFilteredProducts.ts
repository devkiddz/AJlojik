import type { ProductType } from "@/types/types";

export function selectFilteredProducts(products: ProductType[], categorySlug: string): ProductType[] {
  if (!categorySlug || categorySlug === "all") return products;
  return products.filter((product) => product.category === categorySlug);
}
