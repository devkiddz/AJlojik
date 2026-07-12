'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { categories } from '@/data/categories';
import { collections } from '@/data/collections';
import { hubGroups, hubWidgets } from '@/data/discoveryHubData';
import { products } from '@/data/products';
import { promos } from '@/data/promos';

import type { FeedActions, FeedContext, FeedIntent } from '@/features/feed-experience/contracts';

import { FeedExperienceProvider } from '@/features/feed-experience/providers';

import type { ProductType, ProductVariantType } from '@/types/types';

import DiscoveryHubPanel from './DiscoveryHubPanel';
import { DiscoveryHubProvider } from './DiscoveryHubProvider';

export default function DiscoverExperienceShell() {
  const router = useRouter();

  // ------------------------------------------------------------
  // Starting experience for the standalone Discovery workspace
  // ------------------------------------------------------------

  const initialIntent = useMemo<FeedIntent>(
    () => ({
      id: 'mobile-discovery',
      type: 'store-discovery',
      source: 'navigation',
      categorySlug: 'all',
      createdAt: new Date().toISOString()
    }),
    []
  );

  // ------------------------------------------------------------
  // Temporary mock context
  // Later this will come from the authenticated application layer.
  // ------------------------------------------------------------

  const context = useMemo<FeedContext>(
    () => ({
      catalog: {
        products,
        categories,
        collections,
        promotions: promos
      },

      user: {
        sessionId: 'mobile-discovery-session',
        authenticated: false,
        tier: 'guest',

        wishlistProductIds: [],
        cartProductIds: [],
        recentProductIds: []
      },

      activity: {
        viewedProductIds: [],
        viewedCategorySlugs: [],
        searchedTerms: [],
        clickedCollectionIds: []
      },

      environment: {
        locale: 'en-NG',
        currency: 'NGN',
        device: 'mobile',
        now: new Date().toISOString()
      }
    }),
    []
  );

  // ------------------------------------------------------------
  // Temporary application actions
  // ------------------------------------------------------------

  const changeCategory = useCallback(
    (updates: Record<string, string | null>) => {
      const category = updates.category;

      router.push(category && category !== 'all' ? `/store?category=${category}` : '/store');
    },
    [router]
  );

  const previewProduct = useCallback(
    (product: ProductType) => {
      router.push(`/store?product=${product.id}`);
    },
    [router]
  );

  const toggleLike = useCallback((_productId: string) => {
    // Temporary until wishlist state becomes global.
  }, []);

  const addToCart = useCallback((_product: ProductType, _variant: ProductVariantType) => {
    // Temporary until cart state becomes global.
  }, []);

  const previewPromotion = useCallback(
    (promoId: string) => {
      router.push(`/store?promotion=${promoId}`);
    },
    [router]
  );

  const baseActions = useMemo<Omit<FeedActions, 'openExperience' | 'resetExperience'>>(
    () => ({
      changeCategory,
      previewProduct,
      toggleLike,
      addToCart,
      previewPromotion
    }),
    [changeCategory, previewProduct, toggleLike, addToCart, previewPromotion]
  );

  return (
    <FeedExperienceProvider initialIntent={initialIntent} context={context} baseActions={baseActions}>
      <DiscoveryHubProvider groups={hubGroups} widgets={hubWidgets}>
        <DiscoveryHubPanel />
      </DiscoveryHubProvider>
    </FeedExperienceProvider>
  );
}
