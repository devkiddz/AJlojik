'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { usePathname } from 'next/navigation';

import { categories as fallbackCategories } from '@/data/categories';
import type { CategoryType, ProductType } from '@/types/types';

import { resolveCatalogCategoryIcon } from './catalogCategoryIcons';
import { CATALOG_REFRESH_EVENT, CATALOG_REFRESH_STORAGE_KEY } from './catalogEvents';
import type { CatalogPayload, CatalogState } from './catalogTypes';

type CatalogContextValue = CatalogState & {
  refreshCatalog: () => Promise<void>;
  setProducts: React.Dispatch<React.SetStateAction<ProductType[]>>;
};

type CatalogProviderProps = {
  children: ReactNode;
  initialProducts?: ProductType[];
  initialCategories?: CategoryType[];
};

const CatalogContext = createContext<CatalogContextValue | null>(null);


function mergeCatalogCategories(categories: CategoryType[]): CategoryType[] {
  const incomingSlugs = new Set(categories.map(category => category.slug));

  const reservedFallbacks = fallbackCategories.filter(
    category => category.slug === 'all' && !incomingSlugs.has(category.slug)
  );

  return [...reservedFallbacks, ...categories];
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? 'Unable to load catalog.');
  }

  return data;
}

export function CatalogProvider({
  children,
  initialProducts = [],
  initialCategories = fallbackCategories
}: CatalogProviderProps) {
  const pathname = usePathname();
  const refreshSequenceRef = useRef(0);
  const productsRef = useRef<ProductType[]>(initialProducts);

  const [products, setProducts] = useState<ProductType[]>(initialProducts);
  const [categories, setCategories] = useState<CategoryType[]>(initialCategories);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [error, setError] = useState<string | null>(null);

  const refreshCatalog = useCallback(async () => {
    const sequence = refreshSequenceRef.current + 1;
    refreshSequenceRef.current = sequence;

    setLoading(productsRef.current.length === 0);
    setError(null);

    try {
      const response = await fetch('/api/catalog', {
        method: 'GET',
        cache: 'no-store'
      });

      const catalog = await readJsonResponse<CatalogPayload>(response);

      if (refreshSequenceRef.current !== sequence) {
        return;
      }

      productsRef.current = catalog.products;
      setProducts(catalog.products);
      setCategories(
        mergeCatalogCategories(
          catalog.categories.map(category => ({
            id: category.id,
            slug: category.slug,
            label: category.label,
            icon: resolveCatalogCategoryIcon(category.iconName),
            image: category.image,
            coverImages: category.coverImages,
            shortDescription: category.shortDescription,
            description: category.description,
            ...(category.accentColor ? { accentColor: category.accentColor } : {}),
            subcategories: category.subcategories,
            ...(category.className ? { className: category.className } : {})
          }))
        )
      );
    } catch (catalogError) {
      if (refreshSequenceRef.current !== sequence) {
        return;
      }

      const message = catalogError instanceof Error ? catalogError.message : 'Unable to load catalog.';
      setError(message);
    } finally {
      if (refreshSequenceRef.current === sequence) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const handleRefreshRequest = () => {
      void refreshCatalog();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === CATALOG_REFRESH_STORAGE_KEY) {
        void refreshCatalog();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void refreshCatalog();
      }
    };

    window.addEventListener(CATALOG_REFRESH_EVENT, handleRefreshRequest);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleRefreshRequest);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener(CATALOG_REFRESH_EVENT, handleRefreshRequest);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleRefreshRequest);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refreshCatalog]);

  useEffect(() => {
    void refreshCatalog();
  }, [pathname, refreshCatalog]);

  const value = useMemo<CatalogContextValue>(
    () => ({
      products,
      categories,
      loading,
      error,
      refreshCatalog,
      setProducts
    }),
    [products, categories, loading, error, refreshCatalog]
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
