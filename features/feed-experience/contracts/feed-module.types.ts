import type {
  CollectionType
} from '@/data/collections';

import type {
  Promo
} from '@/data/promos';

import type {
  CategoriesType,
  ProductType
} from '@/types/types';

export type ResolvedCollectionSource = {
  collection: CollectionType;
  products: ProductType[];
  featuredProduct?: ProductType;
};

export type FeaturedProductResolutionSource =
  | 'explicit'
  | 'best-selling'
  | 'featured-flag'
  | 'in-stock-fallback'
  | 'stable-fallback'
  | 'disabled'
  | 'unavailable';

export type ResolvedCollection =
  ResolvedCollectionSource & {
    presentation: {
      banner: {
        enabled: boolean;
        visible: boolean;
      };

      featured: {
        enabled: boolean;
        visible: boolean;
        source: FeaturedProductResolutionSource;
      };

      rail: {
        span: 'partial' | 'full';
      };
    };
  };


export type CategoryRailModule = {
  id: string;
  type: 'category-rail';
  priority: number;

  data: {
    categories: CategoriesType;
    selectedCategory: string;
  };
};

export type PromotionModule = {
  id: string;
  type: 'promotion';
  priority: number;

  data: {
    promotions: Promo[];
    products: ProductType[];
  };
};

export type CollectionFeedModule = {
  id: string;
  type: 'collection-feed';
  priority: number;

  data: {
    collections: ResolvedCollection[];
    fallbackProducts: ProductType[];
  };
};

export type FeaturedProductsModule = {
  id: string;
  type: 'featured-products';
  priority: number;

  data: {
    title?: string;
    subtitle?: string;

    categorySlug?: string;

    featuredProduct?: ProductType;

    /**
     * Retained for compatibility with the original
     * featured-products module.
     */
    featuredProducts: ProductType[];

    /**
     * Complete category product set used by the new
     * Category Product Experience.
     */
    products?: ProductType[];

    locale?: string;
    currency?: string;
  };
};

export type ProductGridModule = {
  id: string;
  type: 'product-grid';
  priority: number;

  data: {
    products: ProductType[];
  };
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
      | 'premium'
      | 'pairing'
      | 'similar'
      | 'continue-discovery';
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

export type ProductExperienceCategoryPresentation = {
  slug: string;
  label: string;
  coverImage?: string;
  accentColor?: string;
};

export type ProductExperienceBannerModule = {
  id: string;
  type: 'product-experience-banner';
  priority: number;

  data: {
    product: ProductType;
    category: ProductExperienceCategoryPresentation;

    initialVariantId?: string;

    eyebrow?: string;
    title: string;
    description?: string;

    locale?: string;
    currency?: string;

    showCommerceActions: boolean;
    showViewDetailsAction: boolean;
  };
};

export type FeedModule =
  | ProductExperienceBannerModule
  | CategoryRailModule
  | PromotionModule
  | CollectionFeedModule
  | FeaturedProductsModule
  | ProductGridModule
  | RecentlyViewedModule
  | ProductRailModuleDefinition
  | ShoppingJourneyModuleDefinition;