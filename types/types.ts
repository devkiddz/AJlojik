import type { LucideIcon } from 'lucide-react';

export type SubcategoryType = {
  label: string;
  slug: string;
};

export type CategoryType = {
  id: string;
  slug: string;
  label: string;
  icon: LucideIcon;
  image: string;
  coverImages: string[];
  shortDescription: string;
  description: string;
  accentColor?: string;
  subcategories: SubcategoryType[];
  className?: string;
};

/**
 * Backward-compatible alias retained while older category consumers
 * migrate to the canonical PascalCase type name.
 */
export type categoryType = CategoryType;

export type ProductVariantType = {
  id: string;
  label: string;
  image: string;
  price: number;
  stockLeft: number;
};

export type ProductType = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  subcategory?: string;
  tags: string[];
  variants: ProductVariantType[];
  rating: number;
  reviews: number;
  soldCount: number;
  liked: boolean;
  featured: boolean;
  isNew: boolean;
  estimatedDelivery: string;
  discountPercentage: number;
};

export type DiscoverySectionType = {
  category: CategoryType;
  products: ProductType[];
};

export type UserType = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  wishlist: string[];
  cart: Array<{
    productId: string;
    quantity: number;
  }>;
};

export type ProductsType = ProductType[];
export type CategoriesType = CategoryType[];
