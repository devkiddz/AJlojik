'use client';

import ProductExperienceBanner from '@/features/products/experience/ProductExperienceBanner';

import type { FeedActions, FeedModule } from '../contracts';

import {
  CategoryExperienceModule,
  CategoryRailModule,
  CollectionFeedModule,
  CommerceStoriesModule,
  ProductGridModule,
  ProductRailModule,
  PromotionModule,
  RecentlyViewedModule,
  ShoppingJourneyModule
} from '../modules';

import { CategoryProductExperienceSection } from '../modules/category-product-experience';

import { ProductDetailsModule } from '../modules/product-details';

type FeedModuleRendererProps = {
  module: FeedModule;
  actions: FeedActions;
};

export function FeedModuleRenderer({ module, actions }: FeedModuleRendererProps) {
  switch (module.type) {
    case 'commerce-stories':
      return <CommerceStoriesModule module={module} actions={actions} />;

    case 'category-rail':
      return <CategoryRailModule module={module} actions={actions} />;

    case 'category-experience':
      return <CategoryExperienceModule key={module.id} module={module} actions={actions} />;

    case 'shopping-journey':
      return <ShoppingJourneyModule module={module} actions={actions} />;

    case 'product-experience-banner':
      return <ProductExperienceBanner module={module} actions={actions} />;

    case 'product-details':
      return <ProductDetailsModule module={module} />;

    case 'promotion':
      return <PromotionModule module={module} actions={actions} />;

    case 'collection-feed':
      return <CollectionFeedModule module={module} actions={actions} />;

    case 'featured-products':
      return <CategoryProductExperienceSection key={module.id} module={module} actions={actions} />;

    case 'product-grid':
      return <ProductGridModule module={module} actions={actions} />;

    case 'recently-viewed':
      return <RecentlyViewedModule module={module} actions={actions} />;

    case 'product-rail':
      return <ProductRailModule key={module.id} module={module} actions={actions} />;

    default:
      return null;
  }
}
