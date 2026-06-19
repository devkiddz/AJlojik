import { LucideIcon } from 'lucide-react';

/**
 * Actual sellable product variation
 */
export type ProductVariant = {
  id: string;
  label: string;
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
   * Product options (sizes, volumes, packs, etc.)
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