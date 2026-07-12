'use client';

import { createContext, useContext, ReactNode, RefObject } from 'react';

import { CollectionType } from '@/data/collections';
import { CategoriesType, ProductType, ProductVariantType } from '@/types/types';

export type ResolvedCollectionType = {
  collection: CollectionType;
  products: ProductType[];
  featuredProduct?: ProductType;
};

type DiscoveryContextType = {
  triggerRef: RefObject<HTMLDivElement | null>;

  categories: CategoriesType;
  collections: ResolvedCollectionType[];

  selectedCategory: string;

  featuredProduct?: ProductType;
  featuredProducts: ProductType[];
  filteredProducts: ProductType[];

  onCategoryChange: (updates: Record<string, string | null>) => void;
  onPreview: (product: ProductType) => void;
  onToggleLike: (productId: string) => void;
  onAddToCart: (product: ProductType, variant: ProductVariantType) => void;
  onPromoPreview?: (promoId: string) => void;
};

const DiscoveryContext = createContext<DiscoveryContextType | null>(null);

type DiscoveryProviderProps = DiscoveryContextType & {
  children: ReactNode;
};

export function DiscoveryProvider({
  children,
  triggerRef,
  categories,
  collections,
  selectedCategory,
  featuredProduct,
  featuredProducts,
  filteredProducts,
  onCategoryChange,
  onPreview,
  onToggleLike,
  onAddToCart,
  onPromoPreview
}: DiscoveryProviderProps) {
  return (
    <DiscoveryContext.Provider
      value={{
        triggerRef,
        onPromoPreview,
        categories,
        collections,
        selectedCategory,
        featuredProduct,
        featuredProducts,
        filteredProducts,
        onCategoryChange,
        onPreview,
        onToggleLike,
        onAddToCart
      }}>
      {children}
    </DiscoveryContext.Provider>
  );
}

export function useDiscovery() {
  const context = useContext(DiscoveryContext);

  if (!context) {
    throw new Error('useDiscovery must be used inside DiscoveryProvider');
  }

  return context;
}
