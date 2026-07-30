'use client';

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useCatalog } from '@/features/catalog';

import { openCustomerProductExperience } from '@/features/customer-experience';

import type { ProductType } from '@/types/types';

type SearchContextType = {
  previewProduct: ProductType | null;

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
  submitSearch: () => void;
  removeHistory: (value: string) => void;
  clearHistory: () => void;
};

const SearchContext = createContext<SearchContextType | null>(null);

const RECENT_SEARCHES_STORAGE_KEY = 'aj_recent_searches';
const SEARCH_DEBOUNCE_MS = 300;

function filterSearchProducts(products: ProductType[], value: string): ProductType[] {
  const normalizedQuery = value.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  return products.filter(product => {
    return (
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.shortDescription.toLowerCase().includes(normalizedQuery) ||
      product.longDescription.toLowerCase().includes(normalizedQuery) ||
      product.category.toLowerCase().includes(normalizedQuery) ||
      product.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))
    );
  });
}

type SearchUrlSynchronizerProps = {
  debouncedQuery: string;
  syncFromUrl: (value: string) => void;
};

function SearchUrlSynchronizer({
  debouncedQuery,
  syncFromUrl
}: SearchUrlSynchronizerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const routeQuery = searchParams.get('q') ?? '';
  const pendingRouteQueryRef = useRef<string | null>(null);
  const lastObservedRouteQueryRef = useRef<string | null>(null);
  const skipNextRouteWriteRef = useRef(false);

  useEffect(() => {
    const pendingRouteQuery = pendingRouteQueryRef.current;

    /*
     * A router.replace call is asynchronous. While it is pending, the URL may
     * still expose the previous q value. Never hydrate that stale value back
     * into the input or the customer's search will appear to clear itself.
     */
    if (pendingRouteQuery !== null) {
      if (routeQuery === pendingRouteQuery) {
        pendingRouteQueryRef.current = null;
        lastObservedRouteQueryRef.current = routeQuery;
      }

      return;
    }

    if (lastObservedRouteQueryRef.current === null) {
      lastObservedRouteQueryRef.current = routeQuery;
      skipNextRouteWriteRef.current = true;
      syncFromUrl(routeQuery);
      return;
    }

    if (routeQuery !== lastObservedRouteQueryRef.current) {
      lastObservedRouteQueryRef.current = routeQuery;
      skipNextRouteWriteRef.current = true;
      syncFromUrl(routeQuery);
    }
  }, [routeQuery, syncFromUrl]);

  useEffect(() => {
    if (skipNextRouteWriteRef.current) {
      skipNextRouteWriteRef.current = false;
      return;
    }

    if (routeQuery === debouncedQuery) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (debouncedQuery.trim()) {
      params.set('q', debouncedQuery.trim());
    } else {
      params.delete('q');
    }

    const nextQuery = params.toString();

    pendingRouteQueryRef.current = debouncedQuery.trim();

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false
    });
  }, [debouncedQuery, pathname, routeQuery, router, searchParams]);

  return null;
}

function readStoredSearches(): string[] {
  try {
    const stored = window.localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === 'string')
      : [];
  } catch {
    return [];
  }
}

export default function SearchProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const { products } = useCatalog();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [open, setOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const [activeSelection, setActiveSelection] = useState<{
    query: string;
    index: number;
  }>({
    query: '',
    index: 0
  });

  const activeIndex = activeSelection.query === debouncedQuery ? activeSelection.index : 0;

  const setActiveIndex = useCallback(
    (index: number): void => {
      setActiveSelection({
        query: debouncedQuery,
        index
      });
    },
    [debouncedQuery]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRecentSearches(readStoredSearches());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (query === debouncedQuery) {
      return;
    }

    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [debouncedQuery, query]);

  const syncFromUrl = useCallback((value: string): void => {
    setQuery(current => (current === value ? current : value));
    setDebouncedQuery(current => (current === value ? current : value));
  }, []);

  const results = useMemo(
    () => filterSearchProducts(products, debouncedQuery),
    [debouncedQuery, products]
  );

  const resolvedActiveIndex =
    results.length > 0 ? Math.min(Math.max(activeIndex, 0), results.length - 1) : -1;

  const previewProduct = resolvedActiveIndex >= 0 ? results[resolvedActiveIndex] : null;

  const trendingProducts = useMemo(
    () => products.filter(product => product.featured).slice(0, 6),
    [products]
  );

  const persistHistory = useCallback((next: string[]): void => {
    setRecentSearches(next);
    window.localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(next));
  }, []);

  const saveHistory = useCallback(
    (value: string): void => {
      const normalizedValue = value.trim();

      if (!normalizedValue) {
        return;
      }

      const next = [
        normalizedValue,
        ...recentSearches.filter(item => item !== normalizedValue)
      ].slice(0, 8);

      persistHistory(next);
    },
    [persistHistory, recentSearches]
  );

  const removeHistory = useCallback(
    (value: string): void => {
      persistHistory(recentSearches.filter(item => item !== value));
    },
    [persistHistory, recentSearches]
  );

  const clearHistory = useCallback((): void => {
    setRecentSearches([]);
    window.localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
  }, []);

  const selectHistory = useCallback(
    (value: string): void => {
      setQuery(value);
      saveHistory(value);
    },
    [saveHistory]
  );

  const selectTrending = useCallback(
    (value: string): void => {
      setQuery(value);
      saveHistory(value);
    },
    [saveHistory]
  );

  const selectCategory = useCallback(
    (category: string): void => {
      router.push(`/store?category=${category}`);
      setOpen(false);
    },
    [router]
  );

  const selectProduct = useCallback(
    (product: ProductType): void => {
      saveHistory(product.name);
      setOpen(false);
      openCustomerProductExperience({
        id: product.id,
        name: product.name,
        shortDescription: product.shortDescription
      });
    },
    [saveHistory]
  );

  const submitSearch = useCallback((): void => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return;
    }

    saveHistory(normalizedQuery);

    const submissionResults = filterSearchProducts(products, normalizedQuery);
    const submissionIndex = Math.min(
      Math.max(activeIndex, 0),
      Math.max(submissionResults.length - 1, 0)
    );
    const product = submissionResults[submissionIndex] ?? submissionResults[0];

    if (!product) {
      setOpen(true);
      return;
    }

    setOpen(false);

    openCustomerProductExperience({
      id: product.id,
      name: product.name,
      shortDescription: product.shortDescription
    });
  }, [activeIndex, products, query, saveHistory]);

  const value = useMemo<SearchContextType>(
    () => ({
      previewProduct,
      activeIndex: resolvedActiveIndex,
      setActiveIndex,
      query,
      debouncedQuery,
      setQuery,
      open,
      setOpen,
      loading: query !== debouncedQuery,
      results,
      recentSearches,
      trendingProducts,
      selectHistory,
      selectTrending,
      selectCategory,
      selectProduct,
      submitSearch,
      removeHistory,
      clearHistory
    }),
    [
      clearHistory,
      debouncedQuery,
      open,
      previewProduct,
      query,
      recentSearches,
      removeHistory,
      resolvedActiveIndex,
      results,
      selectCategory,
      selectHistory,
      selectProduct,
      selectTrending,
      submitSearch,
      setActiveIndex,
      trendingProducts
    ]
  );

  return (
    <SearchContext.Provider value={value}>
      <Suspense fallback={null}>
        <SearchUrlSynchronizer
          debouncedQuery={debouncedQuery}
          syncFromUrl={syncFromUrl}
        />
      </Suspense>

      {children}
    </SearchContext.Provider>
  );
}

export function useSearch(): SearchContextType {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error('useSearch must be used inside SearchProvider.');
  }

  return context;
}
