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
  likes: number;
  liked: boolean;
  stockLeft: number;
  featured: boolean;
  isNew: boolean;
  estimatedDelivery: string;
};

export type ProductsType = ProductType[];