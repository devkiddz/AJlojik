'use client';

import { useCallback, useEffect, useMemo, useState, type ReactElement, type ReactNode } from 'react';
import type {
  WorkspaceCommerceProjection,
  WorkspaceCommerceProjectionResponse
} from './commerceProjectionTypes';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  readCustomerDashboardRuntime,
  subscribeCustomerDashboardRuntime
} from '@/features/customer-experience/customerDashboardBridge';
import {
  CUSTOMER_EXPERIENCE_INTENT_EVENT,
  type CustomerExperienceIntentEventDetail
} from '@/features/customer-experience/customerExperienceEvents';
import { resolveCustomerRouteIntent } from '@/features/customer-experience/resolveCustomerRouteIntent';

import { collections } from '@/data/collections';

import { promos } from '@/data/promos';

import { useCart } from '@/features/cart';

import { useCatalog } from '@/features/catalog';
import { openCustomerProductExperience } from '@/features/customer-experience';

import { useWishlist } from '@/features/wishlist';

import { useWorkspace } from '@/features/workspace';

import { useIdentity } from '@/providers/IdentityProvider';

import type { ProductType, ProductVariantType } from '@/types/types';

import type { FeedActions, FeedContext, FeedIntent } from '../contracts';

import { FeedExperienceProvider } from '../providers';

type GlobalExperienceRuntimeProps = {
  children: ReactNode;
};

type FeedDevice = FeedContext['environment']['device'];

type FeedTier = FeedContext['user']['tier'];

function resolveTier({ authenticated, tier }: { authenticated: boolean; tier?: string | null }): FeedTier {
  if (!authenticated) {
    return 'guest';
  }

  const normalizedTier = tier?.trim().toLowerCase();

  if (normalizedTier === 'premium') {
    return 'premium';
  }

  if (normalizedTier === 'returning') {
    return 'returning';
  }

  return 'member';
}

function resolveDevice(): FeedDevice {
  if (typeof window === 'undefined') {
    return 'desktop';
  }

  if (window.matchMedia('(max-width: 639px)').matches) {
    return 'mobile';
  }

  if (window.matchMedia('(max-width: 1023px)').matches) {
    return 'tablet';
  }

  return 'desktop';
}

export default function GlobalExperienceRuntime({
  children
}: GlobalExperienceRuntimeProps): ReactElement | null {
  const router = useRouter();

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { user, isAuthenticated } = useIdentity();
  const userId = user?.id ? String(user.id) : undefined;

  const userTier = typeof user?.tier === 'string' ? user.tier : null;

  const { activeWorkspace, loading: workspaceLoading } = useWorkspace();
  const activeWorkspaceId = activeWorkspace?.id ?? null;

  const { products, categories: catalogCategories, loading: catalogLoading } = useCatalog();

  const { items: cartItems, addToCart } = useCart();

  const { productIds: wishlistProductIds, toggleWishlist } = useWishlist();

  const [device, setDevice] = useState<FeedDevice>('desktop');
  const [commerceProjection, setCommerceProjection] = useState<WorkspaceCommerceProjection | null>(null);
  const [publishedIntent, setPublishedIntent] = useState<CustomerExperienceIntentEventDetail | null>(null);
  const [dashboardRecentProductIds, setDashboardRecentProductIds] = useState<string[]>(
    () => readCustomerDashboardRuntime()?.recentProductIds ?? []
  );

  useEffect(() => {
    const handlePublishedIntent = (event: Event) => {
      const customEvent = event as CustomEvent<CustomerExperienceIntentEventDetail>;

      if (!customEvent.detail?.intent || !customEvent.detail.pathname) {
        return;
      }

      setPublishedIntent(customEvent.detail);
    };

    const handleDashboardResolution = (event: Event) => {
      const customEvent = event as CustomEvent<{
        assistant?: {
          recentProductIds?: unknown;
        };
      }>;

      const recentProductIds = customEvent.detail?.assistant?.recentProductIds;

      if (!Array.isArray(recentProductIds)) {
        return;
      }

      setDashboardRecentProductIds(
        recentProductIds.filter((value): value is string => typeof value === 'string')
      );
    };

    const unsubscribeDashboardRuntime = subscribeCustomerDashboardRuntime(snapshot => {
      setDashboardRecentProductIds(snapshot.recentProductIds);
    });

    window.addEventListener(CUSTOMER_EXPERIENCE_INTENT_EVENT, handlePublishedIntent);
    window.addEventListener('rcentz:customer-dashboard-resolved', handleDashboardResolution);

    return () => {
      unsubscribeDashboardRuntime();
      window.removeEventListener(CUSTOMER_EXPERIENCE_INTENT_EVENT, handlePublishedIntent);
      window.removeEventListener('rcentz:customer-dashboard-resolved', handleDashboardResolution);
    };
  }, []);

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 639px)');

    const tabletQuery = window.matchMedia('(max-width: 1023px)');

    const synchronizeDevice = () => {
      setDevice(resolveDevice());
    };

    synchronizeDevice();

    mobileQuery.addEventListener('change', synchronizeDevice);

    tabletQuery.addEventListener('change', synchronizeDevice);

    return () => {
      mobileQuery.removeEventListener('change', synchronizeDevice);

      tabletQuery.removeEventListener('change', synchronizeDevice);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !userId || !activeWorkspaceId) {
      setCommerceProjection(null);

      return;
    }

    const controller = new AbortController();

    void fetch(`/api/experience/runtime?workspaceId=${encodeURIComponent(activeWorkspaceId)}`, {
      cache: 'no-store',

      signal: controller.signal
    })
      .then(async response => {
        if (!response.ok) {
          throw new Error('Commerce projection request failed.');
        }

        return response.json() as Promise<WorkspaceCommerceProjectionResponse>;
      })
      .then(response => {
        if (!controller.signal.aborted) {
          setCommerceProjection(response.projection);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setCommerceProjection(null);
        }
      });

    return () => {
      controller.abort();
    };
  }, [activeWorkspaceId, isAuthenticated, pathname, userId]);

  const cartProductIds = useMemo(
    () => [...new Set(cartItems.map(item => String(item.productId)))],
    [cartItems]
  );

  const routeIntent = useMemo<FeedIntent>(
    () => resolveCustomerRouteIntent(pathname, searchParams),
    [pathname, searchParams]
  );

  const initialIntent = useMemo<FeedIntent>(() => {
    if (publishedIntent?.pathname === pathname) {
      return publishedIntent.intent;
    }

    return routeIntent;
  }, [pathname, publishedIntent, routeIntent]);

  const handleCategoryChange = useCallback<FeedActions['changeCategory']>(
    updates => {
      const categorySlug = updates.category;

      const destination =
        categorySlug && categorySlug !== 'all'
          ? `/store?category=${encodeURIComponent(categorySlug)}`
          : '/store';

      router.push(destination, {
        scroll: false
      });
    },
    [router]
  );

  /**
   * FeedExperienceProvider replaces this with its own
   * intent-aware product experience action.
   *
   * This remains a safe route fallback for the base
   * FeedActions contract.
   */
  const handleProductPreview = useCallback<FeedActions['previewProduct']>(
    product => {
      openCustomerProductExperience({
        id: String(product.id),
        name: product.name,
        shortDescription: product.shortDescription
      });
    },
    []
  );

  const handleToggleLike = useCallback<FeedActions['toggleLike']>(
    productId => {
      const product = products.find(item => String(item.id) === String(productId));

      void toggleWishlist({
        id: String(productId),

        name: product?.name
      });
    },
    [products, toggleWishlist]
  );

  const handleAddToCart = useCallback(
    async (product: ProductType, variant: ProductVariantType): Promise<void> => {
      await addToCart({
        product,

        variant,

        quantity: 1
      });
    },
    [addToCart]
  );

  const handlePromotionPreview = useCallback(
    (_promoId: string): void => {
      router.push('/promos');
    },
    [router]
  );

  const baseActions = useMemo<Omit<FeedActions, 'openExperience' | 'restoreExperience' | 'resetExperience'>>(
    () => ({
      changeCategory: handleCategoryChange,

      previewProduct: handleProductPreview,

      toggleLike: handleToggleLike,

      addToCart: handleAddToCart,

      previewPromotion: handlePromotionPreview
    }),
    [handleAddToCart, handleCategoryChange, handleProductPreview, handlePromotionPreview, handleToggleLike]
  );

  const context = useMemo<FeedContext | null>(() => {
    if (!activeWorkspace) {
      return null;
    }

    const normalizedTier = resolveTier({
      authenticated: isAuthenticated,

      tier: userTier
    });

    return {
      catalog: {
        products,

        categories: catalogCategories,

        collections,

        promotions: promos
      },

      user: {
        ...(userId
          ? {
              id: userId
            }
          : {}),

        sessionId: `${activeWorkspace.id}:${userId ?? 'guest'}`,

        authenticated: isAuthenticated,

        tier: normalizedTier,

        wishlistProductIds: wishlistProductIds.map(productId => String(productId)),

        cartProductIds,

        recentProductIds: dashboardRecentProductIds
      },

      activity: {
        viewedProductIds: [],

        viewedCategorySlugs: [],

        searchedTerms: [],

        clickedCollectionIds: []
      },

      ...(commerceProjection
        ? {
            commerce: commerceProjection
          }
        : {}),

      /**
       * Deliberately omitted:
       *
       * experience.orders
       * experience.delivery
       * experience.rewards
       * experience.intelligence
       *
       * Those values must come from the workspace-scoped
       * server projection—not mock customer profiles.
       */

      environment: {
        locale: 'en-NG',

        currency: activeWorkspace.wallet?.currency ?? 'NGN',

        device,

        now: new Date().toISOString()
      }
    };
  }, [
    activeWorkspace,
    catalogCategories,
    cartProductIds,
    commerceProjection,
    dashboardRecentProductIds,
    device,
    isAuthenticated,
    products,
    userId,
    userTier,
    wishlistProductIds
  ]);

  if (workspaceLoading || catalogLoading || !context) {
    return null;
  }

  return (
    <FeedExperienceProvider initialIntent={initialIntent} context={context} baseActions={baseActions}>
      {children}
    </FeedExperienceProvider>
  );
}
