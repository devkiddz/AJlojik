import type { CollectionType } from '@/data/collections';
import type { Promo } from '@/data/promos';

import type {
  CategoriesType,
  ProductType
} from '@/types/types';

// ============================================================
// COLLECTION CONTRACTS
// ============================================================

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

// ============================================================
// CATEGORY MODULES
// ============================================================

export type CategoryRailModule = {
  id: string;
  type: 'category-rail';
  priority: number;

  data: {
    categories: CategoriesType;
    selectedCategory: string;
  };
};

export type CategoryExperienceModuleDefinition = {
  id: string;
  type: 'category-experience';
  priority: number;

  data: {
    category: CategoriesType[number];

    title: string;
    subtitle?: string;

    products: ProductType[];
  };
};

// ============================================================
// PROMOTION AND COLLECTION MODULES
// ============================================================

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

// ============================================================
// PRODUCT DISCOVERY MODULES
// ============================================================

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
     * Complete category product set used by the
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

// ============================================================
// SHOPPING JOURNEY MODULE
// ============================================================

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

// ============================================================
// PRODUCT EXPERIENCE MODULES
// ============================================================

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

/**
 * Complete product information resolved with the Product
 * Experience, but progressively disclosed by the Feed.
 */
export type ProductDetailsModuleDefinition = {
  id: string;
  type: 'product-details';
  priority: number;

  data: {
    product: ProductType;
    category: ProductExperienceCategoryPresentation;
    categoryDescription?: string;

    reviews: ReviewsModuleDefinition['data'];

    locale?: string;
    currency?: string;
  };
};

// ============================================================
// MULTIPURPOSE REVIEW CONTRACTS
// ============================================================

/**
 * Reviews are connected to a target rather than being limited
 * to products. This allows the same Reviews Engine to support
 * retail, hospitality, food, events and professional services.
 */
export type ReviewTargetType =
  | 'product'
  | 'service'
  | 'meal'
  | 'party-plan'
  | 'stay'
  | 'event'
  | 'experience'
  | 'vendor';

export type ReviewRating =
  | 1
  | 2
  | 3
  | 4
  | 5;

export type ReviewMediaType =
  | 'image'
  | 'video';

export type ReviewMedia = {
  id: string;
  type: ReviewMediaType;

  url: string;
  alt?: string;
};

export type ReviewAuthor = {
  id?: string;

  name: string;
  avatar?: string;
};

export type ExperienceReview = {
  id: string;

  workspaceId?: string;

  targetType: ReviewTargetType;
  targetId: string;

  author: ReviewAuthor;

  rating: ReviewRating;

  title?: string;
  comment: string;

  media?: ReviewMedia[];

  verified: boolean;

  helpfulCount: number;

  createdAt: string;
  updatedAt?: string;
};

export type ReviewRatingDistribution = Record<
  ReviewRating,
  number
>;

export type ReviewSortOption =
  | 'most-helpful'
  | 'most-recent'
  | 'highest-rated'
  | 'lowest-rated';

export type ReviewFilterOption =
  | 'all'
  | 'with-media'
  | 'verified';

export type ReviewsModuleDefinition = {
  id: string;
  type: 'reviews';
  priority: number;

  data: {
    targetType: ReviewTargetType;
    targetId: string;

    /**
     * Human-readable name of the reviewed product, service,
     * stay, event or other experience.
     */
    targetName: string;

    title: string;
    subtitle?: string;

    /**
     * Catalog-level aggregate rating.
     */
    averageRating: number;

    /**
     * Complete review count. The preview array may contain
     * fewer reviews than this number.
     */
    reviewCount: number;

    /**
     * Number of reviews received for each star level.
     */
    ratingDistribution: ReviewRatingDistribution;

    /**
     * Reviews currently resolved for presentation.
     */
    reviews: ExperienceReview[];

    locale?: string;

    canWriteReview: boolean;
  };
};

// ============================================================
// COMPLETE FEED MODULE UNION
// ============================================================

export type FeedModule =
  | ProductExperienceBannerModule
  | ProductDetailsModuleDefinition
  | ReviewsModuleDefinition
  | CategoryRailModule
  | CategoryExperienceModuleDefinition
  | PromotionModule
  | CollectionFeedModule
  | FeaturedProductsModule
  | ProductGridModule
  | RecentlyViewedModule
  | ProductRailModuleDefinition
  | ShoppingJourneyModuleDefinition;