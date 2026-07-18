'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { ProductType } from '@/types/types';

import type { CatalogState } from './catalogTypes';

type CatalogContextValue = CatalogState & {
  refreshCatalog: () => Promise<void>;
  setProducts: React.Dispatch<React.SetStateAction<ProductType[]>>;
};

type CatalogProviderProps = {
  children: ReactNode;
  initialProducts?: ProductType[];
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

async function readJsonResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? 'Unable to load catalog.');
  }

  return data;
}

export function CatalogProvider({ children, initialProducts = [] }: CatalogProviderProps) {
  const [products, setProducts] = useState<ProductType[]>(initialProducts);

  const [loading, setLoading] = useState(initialProducts.length === 0);

  const [error, setError] = useState<string | null>(null);

  const refreshCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/catalog', {
        method: 'GET',
        cache: 'no-store'
      });

      const catalog = await readJsonResponse<ProductType[]>(response);

      setProducts(catalog);
    } catch (catalogError) {
      const message = catalogError instanceof Error ? catalogError.message : 'Unable to load catalog.';

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialProducts.length > 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      void refreshCatalog();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [initialProducts.length, refreshCatalog]);

  const value = useMemo<CatalogContextValue>(
    () => ({
      products,
      loading,
      error,
      refreshCatalog,
      setProducts
    }),
    [products, loading, error, refreshCatalog]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);

  if (!context) {
    throw new Error('useCatalog must be used within CatalogProvider.');
  }

  return context;
}
