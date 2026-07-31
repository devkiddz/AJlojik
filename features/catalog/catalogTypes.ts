import type { CollectionType } from '@/data/collections';
import type { CategoryType, ProductType } from '@/types/types';

export type CatalogCategoryRecord = Omit<CategoryType, 'icon'> & {
  iconName: string | null;
};

export type CatalogPayload = {
  workspaceId: string | null;
  products: ProductType[];
  categories: CatalogCategoryRecord[];
  collections: CollectionType[];
};

export type CatalogState = {
  workspaceId: string | null;
  products: ProductType[];
  categories: CategoryType[];
  collections: CollectionType[];
  loading: boolean;
  error: string | null;
};
