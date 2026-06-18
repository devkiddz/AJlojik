import { LucideIcon } from "lucide-react";

/**
 * Variant = actual sellable unit
 * (size, image, price, stock are tied together)
 */
export type ProductVariant = {
  size: string; // dynamic (S, M, L, XL, 40, etc.)
  image: string;
  price: number;
  stockLeft: number;
};

/**
 * Main Product Model
 */
export type ProductType = {
  id: string;
  slug: string;
  name: string;

  shortDescription: string;
  longDescription: string;

  category: string;
  tags: string[];

  /**
   * All purchasable options live here
   */
  variants: ProductVariant[];

  rating: number;
  reviews: number;
  soldCount: number;

  liked: boolean;
  featured: boolean;
  isNew: boolean;

  estimatedDelivery: string;
  discountPercentage: number;
};

/**
 * Subcategory structure
 */
export type SubcategoryType = {
  label: string;
  slug: string;
};

/**
 * Category structure
 */
export type CategoryType = {
  id: string;
  slug: string;
  label: string;
  icon: LucideIcon;
  image: string;
  subcategories: SubcategoryType[];
  className?: string;
};

/**
 * Collections
 */
export type ProductsType = ProductType[];
export type CategoriesType = CategoryType[];