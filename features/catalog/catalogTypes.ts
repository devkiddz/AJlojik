import type { CategoryType, ProductType } from '@/types/types';

export type CatalogCategoryRecord = Omit<CategoryType, 'icon'> & {
  iconName: string | null;
};

export type CatalogPayload = {
  products: ProductType[];
  categories: CatalogCategoryRecord[];
};

export type CatalogState = {
  products: ProductType[];
  categories: CategoryType[];
  loading: boolean;
  error: string | null;
};
