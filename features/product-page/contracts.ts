import type {
  ReviewsModuleDefinition
} from '@/features/feed-experience/contracts';

import type {
  ProductType
} from '@/types/types';

export type ProductPageCategory = {
  slug: string;
  label: string;
  description?: string;
  shortDescription?: string;
  coverImage?: string;
  accentColor?: string;
};

export type ProductPageBrand = {
  slug: string;
  name: string;
  description?: string;
  logo?: string;
};

export type ProductPageRelationships = {
  pairings: ProductType[];
  similar: ProductType[];
  continueDiscovery: ProductType[];
};

export type ProductPageData = {
  workspace: {
    id: string;
    name: string;
  };

  product: ProductType;
  category: ProductPageCategory;
  brand?: ProductPageBrand;

  reviews:
    ReviewsModuleDefinition['data'];

  relationships:
    ProductPageRelationships;

  locale: string;
  currency: string;
};
