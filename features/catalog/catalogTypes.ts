import type { ProductType } from '@/types/types';

export type CatalogState = {
  products: ProductType[];
  loading: boolean;
  error: string | null;
};