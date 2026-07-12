import type { CollectionType } from "@/data/collections";
import type { Promo } from "@/data/promos";
import type { CategoriesType, ProductType } from "@/types/types";

export type ResolvedCollection = {
  collection: CollectionType;
  products: ProductType[];
  featuredProduct?: ProductType;
};

export type CategoryRailModule = {
  id: string;
  type: "category-rail";
  priority: number;
  data: { categories: CategoriesType; selectedCategory: string };
};

export type PromotionModule = {
  id: string;
  type: "promotion";
  priority: number;
  data: { promotions: Promo[]; products: ProductType[] };
};

export type CollectionFeedModule = {
  id: string;
  type: "collection-feed";
  priority: number;
  data: { collections: ResolvedCollection[]; fallbackProducts: ProductType[] };
};

export type FeaturedProductsModule = {
  id: string;
  type: "featured-products";
  priority: number;
  data: { featuredProduct?: ProductType; featuredProducts: ProductType[] };
};

export type ProductGridModule = {
  id: string;
  type: "product-grid";
  priority: number;
  data: { products: ProductType[] };
};

export type RecentlyViewedModule = {
  id: string;
  type: 'recently-viewed';
  priority: number;

  data: {
    products: ProductType[];
    title: string;
    subtitle?: string;
  };
};

export type ProductRailModuleDefinition = {
  id: string;
  type: 'product-rail';
  priority: number;

  data: {
    title: string;
    subtitle?: string;
    products: ProductType[];

    source:
      | 'cart'
      | 'wishlist'
      | 'recently-viewed'
      | 'recommended'
      | 'premium';
  };
};

export type ShoppingJourneyItemId =
  | 'cart'
  | 'wishlist'
  | 'recently-viewed';

export type ShoppingJourneyItem = {
  id: ShoppingJourneyItemId;

  title: string;
  description: string;

  image: string;

  count: number;
  badge?: string;

  target:
    | {
        type: 'product';
        productId: string;
      }
    | {
        type: 'store-discovery';
        categorySlug?: string;
      };
};

export type ShoppingJourneyModuleDefinition = {
  id: string;
  type: 'shopping-journey';
  priority: number;

  data: {
    title: string;
    subtitle?: string;

    items: ShoppingJourneyItem[];

    tone:
      | 'default'
      | 'returning'
      | 'member'
      | 'premium';
  };
};



export type FeedModule =
  | CategoryRailModule
  | PromotionModule
  | CollectionFeedModule
  | FeaturedProductsModule
  | ProductGridModule
  | RecentlyViewedModule
  | ProductRailModuleDefinition
  | ShoppingJourneyModuleDefinition;
