import type {
  ComponentType
} from 'react';

import type {
  CategoryExperienceModuleDefinition as CategoryExperienceModuleType,
  CategoryRailModule as CategoryRailModuleType,
  CommerceStoriesModuleDefinition as CommerceStoriesModuleType,
  CollectionFeedModule as CollectionFeedModuleType,
  FeaturedProductsModule as FeaturedProductsModuleType,
  ProductGridModule as ProductGridModuleType,
  ProductRailModuleDefinition as ProductRailModuleType,
  PromotionModule as PromotionModuleType,
  RecentlyViewedModule as RecentlyViewedModuleType,
  ShoppingJourneyModuleDefinition as ShoppingJourneyModuleType,
  FeedActions
} from '../contracts';

import {
  CategoryExperienceModule,
  CategoryRailModule,
  CommerceStoriesModule,
  CollectionFeedModule,
  ProductGridModule,
  ProductRailModule,
  PromotionModule,
  RecentlyViewedModule,
  ShoppingJourneyModule
} from '../modules';

import {
  CategoryProductExperienceSection
} from '../modules/category-product-experience';

type ModuleComponentProps<TModule> = {
  module: TModule;
  actions: FeedActions;
};

export type FeedModuleRegistry = {
  'category-rail': ComponentType<
    ModuleComponentProps<
      CategoryRailModuleType
    >
  >;

  'commerce-stories': ComponentType<
    ModuleComponentProps<
      CommerceStoriesModuleType
    >
  >;

  'category-experience': ComponentType<
    ModuleComponentProps<
      CategoryExperienceModuleType
    >
  >;

  promotion: ComponentType<
    ModuleComponentProps<
      PromotionModuleType
    >
  >;

  'collection-feed': ComponentType<
    ModuleComponentProps<
      CollectionFeedModuleType
    >
  >;

  'featured-products': ComponentType<
    ModuleComponentProps<
      FeaturedProductsModuleType
    >
  >;

  'product-grid': ComponentType<
    ModuleComponentProps<
      ProductGridModuleType
    >
  >;

  'product-rail': ComponentType<
    ModuleComponentProps<
      ProductRailModuleType
    >
  >;

  'recently-viewed': ComponentType<
    ModuleComponentProps<
      RecentlyViewedModuleType
    >
  >;

  'shopping-journey': ComponentType<
    ModuleComponentProps<
      ShoppingJourneyModuleType
    >
  >;
};

export const feedModuleRegistry:
  FeedModuleRegistry = {
    'category-rail':
      CategoryRailModule,

    'commerce-stories':
      CommerceStoriesModule,

    'category-experience':
      CategoryExperienceModule,

    promotion:
      PromotionModule,

    'collection-feed':
      CollectionFeedModule,

    'featured-products':
      CategoryProductExperienceSection,

    'product-grid':
      ProductGridModule,

    'product-rail':
      ProductRailModule,

    'recently-viewed':
      RecentlyViewedModule,

    'shopping-journey':
      ShoppingJourneyModule
  };