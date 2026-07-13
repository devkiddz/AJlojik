import type { CollectionType } from "@/data/collections";
import type { Promo } from "@/data/promos";
import type { CategoriesType, ProductType } from "@/types/types";

export type FeedCatalogContext = {
  products: ProductType[];
  categories: CategoriesType;
  collections: CollectionType[];
  promotions: Promo[];
};

export type FeedUserContext = {
  id?: string;
  sessionId: string;
  authenticated: boolean;
  tier: "guest" | "returning" | "member" | "premium";
  wishlistProductIds: string[];
  cartProductIds: string[];
  recentProductIds: string[];
};

export type FeedActivityContext = {
  viewedProductIds: string[];
  viewedCategorySlugs: string[];
  searchedTerms: string[];
  clickedCollectionIds: string[];
};

export type FeedEnvironmentContext = {
  locale: string;
  currency: string;
  device: "mobile" | "tablet" | "desktop";
  now: string;
};

export type FeedContext = {
  catalog: FeedCatalogContext;
  user: FeedUserContext;
  activity: FeedActivityContext;
  environment: FeedEnvironmentContext;

  experience?: FeedExperienceData;
};

import type {
  MockActiveDelivery,
  MockCouponFeed,
  MockExperienceOrder,
  MockIntelligenceFeed,
  MockPromotionFeed,
  MockRewardsFeed
} from '../mocks/mockExperienceProfiles';

export type FeedExperienceData = {
  orders: {
    recent: MockExperienceOrder[];
    activeDelivery?: MockActiveDelivery;
  };

  rewards: MockRewardsFeed;

  coupons: MockCouponFeed[];

  intelligence: MockIntelligenceFeed;

  promotions: MockPromotionFeed;
};