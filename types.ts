// 


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
 * Subcategory structure
 */
export type SubcategoryType = {
  label: string;
  slug: string;
};

/**
 * category structure
 */
export type categoryType = {
  id: string;
  slug: string;
  label: string;
  icon: LucideIcon;
  image: string;
  subcategories: SubcategoryType[];
  className?: string;
  accentColor?: string;
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

  /**
   * Relationship to categoryType.slug
   */
  category: string;

  /**
   * Optional relationship to a subcategory
   */
  subcategory?: string;

  tags: string[];

  variants: ProductVariant[];

  rating: number;
  reviews: number;
  soldCount: number;

  liked: boolean;

  /**
   * Store merchandising flags
   */
  featured: boolean;
  isNew: boolean;

  estimatedDelivery: string;
  discountPercentage: number;
};

/**
 * Discovery Section
 * Used for the Spotify-style:
 * Featured category + Product Carousel
 */
export type DiscoverySectionType = {
  category: categoryType;
  products: ProductType[];
};

/**
 * Collections
 */

/**
 * User's Dummy Types
 */

export type UserType = {
  id: string;
  name: string;
  email: string;
  avatar?: string;

  wishlist: string[]; // product IDs
  cart: {
    productId: string;
    quantity: number;
  }[];
};

export type ProductVariantType = {
  id: string | number;
  label: string;       // e.g., "750ml", "1 Litre", "Box of 6"
  price: number;       // Base price for this specific variant option
};


export type ProductsType = ProductType[];
export type CategoriesType = categoryType[];