'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Imports premium toggle arrows

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
import { cn } from '@/lib/utils';

export default function DiscoverExperienceShell() {
  const router = useRouter();

  // Desktop Sidebar Layout Collapse State Management
  const [isCollapsed, setIsCollapsed] = useState(false);

  // High-End UX: Listen for Ctrl + B keyboard shortcut to quickly toggle the panel open/close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const toggleLike = useCallback((_productId: string) => {}, []);
  const addToCart = useCallback((_product: ProductType, _variant: ProductVariantType) => {}, []);

  const previewPromotion = useCallback(
    (promoId: string) => {
      router.push(`/store?promotion=${promoId}`);
    },
    [router]
  );

  const baseActions = useMemo<Omit<FeedActions, 'openExperience' | 'restoreExperience' | 'resetExperience'>>(
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
        <div className="relative flex h-full min-h-0 w-full overflow-hidden">
          {/* Desktop Discovery Rail */}
          <aside
            className={`
            relative hidden min-h-0 shrink-0 flex-col overflow-hidden
            border-r border-border/40 bg-background/60 backdrop-blur-md
            transition-all duration-300 ease-in-out
            lg:flex lg:h-[calc(100dvh-5rem)] lg:max-h-[calc(100dvh-5rem)]
            ${isCollapsed ? 'w-16' : 'w-80'}
          `}>
            <button
              type="button"
              onClick={() => setIsCollapsed(current => !current)}
              className="absolute -right-3 top-6 z-50 flex size-6 items-center justify-center rounded-full border bg-background text-foreground shadow-sm transition hover:bg-accent"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              {isCollapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
            </button>

            <div
              className={`
              h-full min-h-0 w-full overflow-hidden
              transition-opacity duration-200
              ${isCollapsed ? 'pointer-events-none opacity-0' : 'opacity-100'}
            `}>
              <DiscoveryHubPanel className="h-full" />
            </div>
          </aside>

          {/* Mobile full-screen Discovery */}
          <div className="h-full min-h-0 w-full flex-1 overflow-hidden lg:hidden">
            <DiscoveryHubPanel className="h-full" />
          </div>
        </div>
      </DiscoveryHubProvider>
    </FeedExperienceProvider>
  );
}
