import { LucideIcon } from "lucide-react";

export type ProductType = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  tags: string[];
  images: string;
  price: number;
  discountPercentage: number;
  rating: number;
  reviews: number;
  soldCount: number;
  liked: boolean;
  stockLeft: number;
  featured: boolean;
  isNew: boolean;
  estimatedDelivery: string;
};

// Subcategory Structure Definition
export type SubcategoryType = {
  label: string;
  slug: string;
};

// Updated Category Structure
export type CategoryType = {
  id: string;
  slug: string;
  label: string;
  icon: LucideIcon;
  image: string;
  subcategories: SubcategoryType[]; // Replaced 'type: string' with your subcategory array
  className?: string;
};

export type ProductsType = ProductType[];
export type CategoriesType = CategoryType[];