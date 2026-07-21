'use client';

import { useMemo } from 'react';

import { useRouter } from 'next/navigation';

import DesktopDiscoveryRail from '@/components/discovery-hub-panel/DesktopDiscoveryRail';
import MobileDiscoverySheetHost from '@/components/discovery-hub-panel/MobileDiscoverySheetHost';

import { categories } from '@/data/categories';
import { collections } from '@/data/collections';
import { hubGroups, hubWidgets } from '@/data/discoveryHubData';
import { promos } from '@/data/promos';

import { useCart } from '@/features/cart';
import { useCatalog } from '@/features/catalog';

import type { FeedActions, FeedContext, FeedIntent } from '@/features/feed-experience/contracts';

import { mockExperienceProfiles } from '@/features/feed-experience/mocks';
import { FeedExperienceProvider } from '@/features/feed-experience/providers';

import { useWishlist } from '@/features/wishlist';

type StoreExperienceSidebarProps = {
  tier?: string;
  authenticated?: boolean;
  recentProductIds?: string[];

  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;

  mobileOnly?: boolean;
  desktopOnly?: boolean;
};

export default function StoreExperienceSidebar({
  tier = 'guest',
  authenticated = false,
  recentProductIds,
  collapsed,
  onCollapsedChange,
  mobileOnly = false,
  desktopOnly = false
}: StoreExperienceSidebarProps) {
  const router = useRouter();

  const { products } = useCatalog();

  const { items: cartItems, addToCart: addProductToCart } = useCart();

  const { productIds: wishlistProductIds, toggleWishlist } = useWishlist();

  // ============================================================
  // EXPERIENCE PROFILE
  // ============================================================

  const normalizedTier = tier.toLowerCase();

  const profileId = !authenticated ? 'guest' : normalizedTier === 'premium' ? 'premium' : 'shopper';

  const profile = mockExperienceProfiles.find(item => item.id === profileId) ?? mockExperienceProfiles[0];

  /*
   * Use real recent-product IDs when supplied.
   *
   * Otherwise preserve the recent activity already
   * contained in the resolved experience profile.
   */
  const resolvedRecentProductIds = recentProductIds ?? profile.activity.viewedProductIds;

  // ============================================================
  // INITIAL INTENT
  // ============================================================

  const initialIntent = useMemo<FeedIntent>(
    () => ({
      id: `shared-sidebar:${profileId}`,
      type: 'store-discovery',
      source: 'route',
      categorySlug: 'all',
      createdAt: new Date().toISOString()
    }),
    [profileId]
  );

  // ============================================================
  // SHARED EXPERIENCE CONTEXT
  // ============================================================

  const context = useMemo<FeedContext>(
    () => ({
      catalog: {
        products,
        categories,
        collections,
        promotions: promos
      },

      user: {
        ...profile.user,

        authenticated,

        tier: !authenticated ? 'guest' : normalizedTier === 'premium' ? 'premium' : 'member',

        cartProductIds: [...new Set(cartItems.map(item => item.productId))],

        wishlistProductIds,

        recentProductIds: resolvedRecentProductIds
      },

      activity: {
        ...profile.activity,

        viewedProductIds: resolvedRecentProductIds
      },

      experience: {
        orders: profile.orders,
        rewards: profile.rewards,
        coupons: profile.coupons,
        intelligence: profile.intelligence,
        promotions: profile.promotions
      },

      environment: {
        locale: 'en-NG',
        currency: 'NGN',

        device: mobileOnly ? 'mobile' : 'desktop',

        now: new Date().toISOString()
      }
    }),
    [
      authenticated,
      cartItems,
      mobileOnly,
      normalizedTier,
      products,
      profile,
      resolvedRecentProductIds,
      wishlistProductIds
    ]
  );

  // ============================================================
  // SHARED ACTIONS
  // ============================================================

  const baseActions = useMemo<Omit<FeedActions, 'openExperience' | 'restoreExperience' | 'resetExperience'>>(
    () => ({
      changeCategory: updates => {
        const category = updates.category;

        router.push(
          category && category !== 'all' ? `/store?category=${encodeURIComponent(category)}` : '/store'
        );
      },

      previewProduct: product => {
        router.push(`/products/${product.slug}`);
      },

      toggleLike: productId => {
        const product = products.find(item => item.id === productId);

        void toggleWishlist({
          id: productId,
          name: product?.name
        });
      },

      addToCart: async (product, variant): Promise<void> => {
        await addProductToCart({
          product,
          variant
        });
      },

      previewPromotion: promoId => {
        const promotion = promos.find(item => item.id === promoId);

        if (!promotion) {
          return;
        }

        router.push(`/promos/${promotion.slug}`);
      }
    }),
    [addProductToCart, products, router, toggleWishlist]
  );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <FeedExperienceProvider initialIntent={initialIntent} context={context} baseActions={baseActions}>
      {!desktopOnly ? <MobileDiscoverySheetHost /> : null}

      {!mobileOnly ? (
        <DesktopDiscoveryRail
          groups={hubGroups}
          widgets={hubWidgets}
          collapsed={collapsed}
          onCollapsedChange={onCollapsedChange}
        />
      ) : null}
    </FeedExperienceProvider>
  );
}
