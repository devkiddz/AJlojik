'use client';

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { products } from '@/data/products';
import { ProductType } from '@/types';

type SearchContextType = {
  previewProduct: ProductType | null;
  setPreviewProduct: (product: ProductType | null) => void;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  query: string;
  debouncedQuery: string;

  setQuery: (value: string) => void;

  open: boolean;
  setOpen: (value: boolean) => void;

  loading: boolean;

  results: ProductType[];

  recentSearches: string[];
  trendingProducts: ProductType[];

  selectHistory: (value: string) => void;
  selectTrending: (value: string) => void;
  selectCategory: (value: string) => void;
  selectProduct: (product: ProductType) => void;

  removeHistory: (value: string) => void;
  clearHistory: () => void;
};

const SearchContext = createContext<SearchContextType | null>(null);

export default function SearchProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* -------------------------- */
  /* State */
  /* -------------------------- */

  const [query, setQuery] = useState(searchParams.get('q') ?? '');

  const [debouncedQuery, setDebouncedQuery] = useState(query);

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const [activeIndex, setActiveIndex] = useState(-1);
  const [previewProduct, setPreviewProduct] = useState<ProductType | null>(null);

  /* -------------------------- */
  /* Load History */
  /* -------------------------- */

  useEffect(() => {
    const saved = localStorage.getItem('aj_recent_searches');

    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery]);

  /* -------------------------- */
  /* Debounce */
  /* -------------------------- */

  useEffect(() => {
    if (query === debouncedQuery) return;

    setLoading(true);

    const timer = setTimeout(() => {
      setDebouncedQuery(query);

      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, debouncedQuery]);

  /* -------------------------- */
  /* Sync URL */
  /* -------------------------- */

  useEffect(() => {
    const current = searchParams.get('q') ?? '';

    if (current === debouncedQuery) return;

    const params = new URLSearchParams(searchParams.toString());

    if (debouncedQuery.trim()) {
      params.set('q', debouncedQuery);
    } else {
      params.delete('q');
    }

    router.replace(`${pathname}?${params.toString()}`, {
      scroll: false
    });
  }, [debouncedQuery, pathname, router]);

  /* -------------------------- */
  /* Results */
  /* -------------------------- */

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];

    const search = debouncedQuery.toLowerCase();

    return products.filter(product => {
      return (
        product.name.toLowerCase().includes(search) ||
        product.shortDescription.toLowerCase().includes(search) ||
        product.longDescription.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search)
      );
    });
  }, [debouncedQuery]);

  useEffect(() => {
    if (!results.length) {
      setPreviewProduct(null);
      return;
    }

    setPreviewProduct(results[activeIndex] ?? results[0]);
  }, [results, activeIndex]);

  /* -------------------------- */
  /* Trending */
  /* -------------------------- */

  const trendingProducts = useMemo(() => {
    return products.filter(product => product.featured).slice(0, 6);
  }, []);

  /* -------------------------- */
  /* History Helpers */
  /* -------------------------- */

  const saveHistory = (value: string) => {
    if (!value.trim()) return;

    const next = [value, ...recentSearches.filter(item => item !== value)].slice(0, 8);

    setRecentSearches(next);

    localStorage.setItem('aj_recent_searches', JSON.stringify(next));
  };

  const removeHistory = (value: string) => {
    const next = recentSearches.filter(item => item !== value);

    setRecentSearches(next);

    localStorage.setItem('aj_recent_searches', JSON.stringify(next));
  };

  const clearHistory = () => {
    setRecentSearches([]);

    localStorage.removeItem('aj_recent_searches');
  };

  /* -------------------------- */
  /* Actions */
  /* -------------------------- */

  const selectHistory = (value: string) => {
    setQuery(value);
    saveHistory(value);
    setOpen(false);
  };

  const selectTrending = (value: string) => {
    setQuery(value);
    saveHistory(value);
    setOpen(false);
  };

  const selectCategory = (category: string) => {
    router.push(`/store?category=${category}`);

    setOpen(false);
  };

  const selectProduct = (product: ProductType) => {
    saveHistory(product.name);

    router.push(`/store/${product.category}/${product.id}`);

    setOpen(false);
  };

  return (
    <SearchContext.Provider
      value={{
        previewProduct,
        setPreviewProduct,
        query,
        debouncedQuery,

        setQuery,

        open,
        setOpen,

        loading,

        results,

        recentSearches,

        trendingProducts,

        selectHistory,

        selectTrending,

        selectCategory,

        selectProduct,

        removeHistory,
        activeIndex,
        setActiveIndex,

        clearHistory
      }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error('useSearch must be used inside SearchProvider.');
  }

  return context;
}
