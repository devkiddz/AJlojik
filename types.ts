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



// Types for CategoryTypes

export type CategoryType = {
  id: string;
  slug: string;
 // name: string;
  type: string;
  image: string;
  label: string;
  icon: LucideIcon;
  className?: string;
};


export type ProductsType = ProductType[];
export type CategoriesType = CategoryType[];