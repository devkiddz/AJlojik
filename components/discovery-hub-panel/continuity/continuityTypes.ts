import type {
  ProductType
} from '@/types/types';

export type ContinuitySource =
  | 'similar'
  | 'recent'
  | 'shopping-list'
  | 'wishlist'
  | 'activity'
  | 'catalog';

export type ContinuityProduct = {
  product: ProductType;
  source: ContinuitySource;
  sourceLabel: string;
  score: number;
};

export type ResolveContinuityProductsInput = {
  products: ProductType[];
  currentProductId?: string | null;
  recentProductIds: string[];
  activityProductIds: string[];
  wishlistProductIds: string[];
  shoppingListProductIds: string[];
  stableSeed: string;
  limit?: number;
};
