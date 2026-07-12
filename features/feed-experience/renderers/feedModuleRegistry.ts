import type { ComponentType } from 'react';

import type {
  CategoryRailModule as CategoryRailModuleType,
  CollectionFeedModule as CollectionFeedModuleType,
  FeaturedProductsModule as FeaturedProductsModuleType,
  ProductGridModule as ProductGridModuleType,
  PromotionModule as PromotionModuleType,
  RecentlyViewedModule as RecentlyViewedModuleType,
  FeedActions
} from '../contracts';

import {
  CategoryRailModule,
  CollectionFeedModule,
  FeaturedProductsModule,
  ProductGridModule,
  PromotionModule,
  RecentlyViewedModule
} from '../modules';

type ModuleComponentProps<TModule> = {
  module: TModule;
  actions: FeedActions;
};

export type FeedModuleRegistry = {
  'category-rail': ComponentType<
    ModuleComponentProps<CategoryRailModuleType>
  >;

  promotion: ComponentType<
    ModuleComponentProps<PromotionModuleType>
  >;

  'collection-feed': ComponentType<
    ModuleComponentProps<CollectionFeedModuleType>
  >;

  'featured-products': ComponentType<
    ModuleComponentProps<FeaturedProductsModuleType>
  >;

  'product-grid': ComponentType<
    ModuleComponentProps<ProductGridModuleType>
  >;

  'recently-viewed': ComponentType<
    ModuleComponentProps<RecentlyViewedModuleType>
  >;
};

export const feedModuleRegistry: FeedModuleRegistry = {
  'category-rail': CategoryRailModule,
  promotion: PromotionModule,
  'collection-feed': CollectionFeedModule,
  'featured-products': FeaturedProductsModule,
  'product-grid': ProductGridModule,
  'recently-viewed': RecentlyViewedModule
};