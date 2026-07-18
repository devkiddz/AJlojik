'use client';

import type { FeedActions, FeedModule } from '../contracts';
import ProductExperienceBanner from '@/features/products/experience/ProductExperienceBanner';

import {
  CategoryRailModule,
  CollectionFeedModule,
  ProductGridModule,
  ProductRailModule,
  PromotionModule,
  RecentlyViewedModule,
  ShoppingJourneyModule
} from '../modules';
import { CategoryProductExperienceSection } from '../modules/category-product-experience';

type FeedModuleRendererProps = {
  module: FeedModule;
  actions: FeedActions;
};

export function FeedModuleRenderer({ module, actions }: FeedModuleRendererProps) {
  switch (module.type) {
    case 'category-rail':
      return <CategoryRailModule module={module} actions={actions} />;

    case 'shopping-journey':
      return <ShoppingJourneyModule module={module} actions={actions} />;

    case 'product-experience-banner':
      return <ProductExperienceBanner module={module} actions={actions} />;

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
      return <ProductRailModule module={module} actions={actions} />;

    default:
      return null;
  }
}
