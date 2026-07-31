'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';

import {
  categories as fallbackCategories
} from '@/data/categories';

import type {
  CollectionType
} from '@/data/collections';

import {
  useWorkspace
} from '@/features/workspace';

import type {
  CategoryType,
  ProductType
} from '@/types/types';

import {
  resolveCatalogCategoryIcon
} from './catalogCategoryIcons';

import {
  CATALOG_REFRESH_EVENT,
  CATALOG_REFRESH_STORAGE_KEY
} from './catalogEvents';

import type {
  CatalogPayload,
  CatalogState
} from './catalogTypes';

type CatalogContextValue =
  CatalogState & {
    refreshCatalog: () => Promise<void>;

    setProducts:
      React.Dispatch<
        React.SetStateAction<
          ProductType[]
        >
      >;
  };

type CatalogProviderProps = {
  children: ReactNode;

  initialProducts?: ProductType[];
  initialCategories?: CategoryType[];
  initialCollections?: CollectionType[];
};

const CatalogContext =
  createContext<
    CatalogContextValue | null
  >(null);

function mergeCatalogCategories(
  categories: CategoryType[]
): CategoryType[] {
  const incomingSlugs =
    new Set(
      categories.map(
        category =>
          category.slug
      )
    );

  const reservedFallbacks =
    fallbackCategories.filter(
      category =>
        category.slug === 'all' &&
        !incomingSlugs.has(
          category.slug
        )
    );

  return [
    ...reservedFallbacks,
    ...categories
  ];
}

async function readJsonResponse<T>(
  response: Response
): Promise<T> {
  const data =
    (await response.json()) as
      T & {
        error?: string;
      };

  if (!response.ok) {
    throw new Error(
      data.error ??
        'Unable to load catalog.'
    );
  }

  return data;
}

type InFlightCatalogRequest = {
  workspaceId: string;
  promise: Promise<void>;
};

export function CatalogProvider({
  children,
  initialProducts = [],
  initialCategories =
    fallbackCategories,
  initialCollections = []
}: CatalogProviderProps) {
  const {
    activeWorkspace,
    loading: workspaceLoading
  } = useWorkspace();

  const requestedWorkspaceId =
    activeWorkspace?.id ?? null;

  const refreshSequenceRef =
    useRef(0);

  const inFlightRequestRef =
    useRef<
      InFlightCatalogRequest | null
    >(null);

  const productsRef =
    useRef<ProductType[]>(
      initialProducts
    );

  const loadedWorkspaceIdRef =
    useRef<string | null>(null);

  const [
    workspaceId,
    setWorkspaceId
  ] =
    useState<string | null>(
      null
    );

  const [
    products,
    setProducts
  ] =
    useState<ProductType[]>(
      initialProducts
    );

  const [
    categories,
    setCategories
  ] =
    useState<CategoryType[]>(
      initialCategories
    );

  const [
    collections,
    setCollections
  ] =
    useState<CollectionType[]>(
      initialCollections
    );

  const [
    loading,
    setLoading
  ] =
    useState(
      initialProducts.length === 0
    );

  const [
    error,
    setError
  ] =
    useState<string | null>(
      null
    );

  const refreshCatalog =
    useCallback(
      async (): Promise<void> => {
        if (
          workspaceLoading ||
          !requestedWorkspaceId
        ) {
          return;
        }

        const existingRequest =
          inFlightRequestRef.current;

        if (
          existingRequest?.workspaceId ===
          requestedWorkspaceId
        ) {
          return existingRequest.promise;
        }

        const sequence =
          refreshSequenceRef.current + 1;

        refreshSequenceRef.current =
          sequence;

        const workspaceChanged =
          loadedWorkspaceIdRef.current !==
          requestedWorkspaceId;

        setLoading(
          workspaceChanged ||
            productsRef.current.length === 0
        );

        setError(null);

        const request =
          (async () => {
            try {
              const response =
                await fetch(
                  `/api/catalog?workspaceId=${encodeURIComponent(
                    requestedWorkspaceId
                  )}`,
                  {
                    method: 'GET',
                    cache: 'no-store'
                  }
                );

              const catalog =
                await readJsonResponse<
                  CatalogPayload
                >(response);

              if (
                refreshSequenceRef
                  .current !==
                sequence
              ) {
                return;
              }

              productsRef.current =
                catalog.products;

              loadedWorkspaceIdRef.current =
                requestedWorkspaceId;

              setWorkspaceId(
                catalog.workspaceId
              );

              setProducts(
                catalog.products
              );

              setCollections(
                catalog.collections
              );

              setCategories(
                mergeCatalogCategories(
                  catalog.categories.map(
                    category => ({
                      id:
                        category.id,

                      slug:
                        category.slug,

                      label:
                        category.label,

                      icon:
                        resolveCatalogCategoryIcon(
                          category.iconName
                        ),

                      image:
                        category.image,

                      coverImages:
                        category.coverImages,

                      shortDescription:
                        category.shortDescription,

                      description:
                        category.description,

                      ...(category.accentColor
                        ? {
                            accentColor:
                              category.accentColor
                          }
                        : {}),

                      subcategories:
                        category.subcategories,

                      ...(category.className
                        ? {
                            className:
                              category.className
                          }
                        : {})
                    })
                  )
                )
              );
            } catch (
              catalogError
            ) {
              if (
                refreshSequenceRef
                  .current !==
                sequence
              ) {
                return;
              }

              const message =
                catalogError instanceof
                Error
                  ? catalogError.message
                  : 'Unable to load catalog.';

              setError(message);
            } finally {
              if (
                refreshSequenceRef
                  .current ===
                sequence
              ) {
                setLoading(false);
              }
            }
          })();

        inFlightRequestRef.current = {
          workspaceId:
            requestedWorkspaceId,

          promise:
            request
        };

        try {
          await request;
        } finally {
          if (
            inFlightRequestRef
              .current?.promise ===
            request
          ) {
            inFlightRequestRef.current =
              null;
          }
        }
      },
      [
        requestedWorkspaceId,
        workspaceLoading
      ]
    );

  useEffect(() => {
    const handleRefreshRequest =
      (): void => {
        void refreshCatalog();
      };

    const handleStorage =
      (
        event: StorageEvent
      ): void => {
        if (
          event.key ===
          CATALOG_REFRESH_STORAGE_KEY
        ) {
          void refreshCatalog();
        }
      };

    const handleVisibility =
      (): void => {
        if (
          document.visibilityState ===
          'visible'
        ) {
          void refreshCatalog();
        }
      };

    window.addEventListener(
      CATALOG_REFRESH_EVENT,
      handleRefreshRequest
    );

    window.addEventListener(
      'storage',
      handleStorage
    );

    window.addEventListener(
      'focus',
      handleRefreshRequest
    );

    document.addEventListener(
      'visibilitychange',
      handleVisibility
    );

    return () => {
      window.removeEventListener(
        CATALOG_REFRESH_EVENT,
        handleRefreshRequest
      );

      window.removeEventListener(
        'storage',
        handleStorage
      );

      window.removeEventListener(
        'focus',
        handleRefreshRequest
      );

      document.removeEventListener(
        'visibilitychange',
        handleVisibility
      );
    };
  }, [
    refreshCatalog
  ]);

  /*
   * The catalog is workspace-scoped, not pathname-scoped.
   * Route and search-query changes must not create new database reads.
   */
  useEffect(() => {
    void refreshCatalog();
  }, [
    refreshCatalog
  ]);

  const value =
    useMemo<
      CatalogContextValue
    >(
      () => ({
        workspaceId,
        products,
        categories,
        collections,

        loading:
          loading ||
          workspaceLoading,

        error,
        refreshCatalog,
        setProducts
      }),
      [
        workspaceId,
        products,
        categories,
        collections,
        loading,
        workspaceLoading,
        error,
        refreshCatalog
      ]
    );

  return (
    <CatalogContext.Provider
      value={value}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context =
    useContext(
      CatalogContext
    );

  if (!context) {
    throw new Error(
      'useCatalog must be used within CatalogProvider.'
    );
  }

  return context;
}
