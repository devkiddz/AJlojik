'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import DesktopDiscoveryRail from '@/components/discovery-hub-panel/DesktopDiscoveryRail';
import PromoModal from '@/components/promos/PromoModal';
import ProductModal from '@/components/shared/ProductModal';
import { hubGroups, hubWidgets } from '@/data/discoveryHubData';
import { categories } from '@/data/categories';
import { collections } from '@/data/collections';
import { products as initialProducts } from '@/data/products';
import { promos, type Promo } from '@/data/promos';

import { ExperienceStackProvider } from '@/features/experience-stack/ExperienceStackProvider';
import { useWorkspace } from '@/features/workspace';
import { cn } from '@/lib/utils';

import type { ProductType, ProductVariantType } from '@/types/types';

import { MockExperienceSwitcher } from '../components/MockExperienceSwitcher';

import type { FeedActions, FeedContext, FeedIntent } from '../contracts';

import { mockExperienceProfiles, type MockExperienceProfileId } from '../mocks';

import { FeedExperienceProvider } from '../providers';
import { FeedRenderer } from '../renderers';

function FeedExperienceWorkspaceContent() {
  const { activeWorkspace, loading: workspaceLoading, error: workspaceError } = useWorkspace();

  // ============================================================
  // ROUTING
  // ============================================================

  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get('category') ?? 'all';

  const updateQuery = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === 'all') {
          params.delete(key);
          return;
        }

        params.set(key, value);
      });

      const query = params.toString();

      router.push(query ? `/store?${query}` : '/store', {
        scroll: false
      });
    },
    [router, searchParams]
  );

  // ============================================================
  // MOCK EXPERIENCE PROFILE
  // ============================================================

  const [activeProfileId, setActiveProfileId] = useState<MockExperienceProfileId>('guest');

  const activeProfile =
    mockExperienceProfiles.find(profile => profile.id === activeProfileId) ?? mockExperienceProfiles[0];

  // ============================================================
  // PRODUCT STATE
  // ============================================================

  const [storeProducts, setStoreProducts] = useState<ProductType[]>(initialProducts);

  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);

  const [previewOpen, setPreviewOpen] = useState(false);

  const openPreview = useCallback((product: ProductType) => {
    setSelectedProduct(product);
    setPreviewOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewOpen(false);
    setSelectedProduct(null);
  }, []);

  const toggleLike = useCallback((productId: string) => {
    setStoreProducts(currentProducts =>
      currentProducts.map(product =>
        product.id === productId
          ? {
              ...product,
              liked: !product.liked
            }
          : product
      )
    );

    setSelectedProduct(currentProduct =>
      currentProduct?.id === productId
        ? {
            ...currentProduct,
            liked: !currentProduct.liked
          }
        : currentProduct
    );
  }, []);

  const addToCart = useCallback((product: ProductType, variant: ProductVariantType) => {
    alert(`${product.name} (${variant.label}) added to cart`);
  }, []);

  // ============================================================
  // PROMOTION STATE
  // ============================================================

  const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);

  const [promoOpen, setPromoOpen] = useState(false);

  const previewPromotion = useCallback((promoId: string) => {
    const promotion = promos.find(item => item.id === promoId);

    if (!promotion) return;

    setSelectedPromo(promotion);
    setPromoOpen(true);
  }, []);

  const closePromoPreview = useCallback(() => {
    setSelectedPromo(null);
    setPromoOpen(false);
  }, []);

  // ============================================================
  // INITIAL FEED INTENT
  // ============================================================

  const initialIntent = useMemo<FeedIntent>(
    () => ({
      id: `store-discovery:${selectedCategory}`,
      type: 'store-discovery',
      source: 'route',
      categorySlug: selectedCategory,
      createdAt: new Date().toISOString()
    }),
    [selectedCategory]
  );

  // ============================================================
  // FEED CONTEXT
  // ============================================================

  const context = useMemo<FeedContext>(
    () => ({
      catalog: {
        products: storeProducts,
        categories,
        collections,
        promotions: promos
      },

      user: activeProfile.user,

      activity: activeProfile.activity,

      experience: {
        orders: activeProfile.orders,
        rewards: activeProfile.rewards,
        coupons: activeProfile.coupons,
        intelligence: activeProfile.intelligence,
        promotions: activeProfile.promotions
      },

      environment: {
        locale: 'en-NG',
        currency: 'NGN',
        device: 'desktop',
        now: new Date().toISOString()
      }
    }),
    [activeProfile, storeProducts]
  );

  // ============================================================
  // BASE ACTIONS
  // FeedExperienceProvider supplies:
  // openExperience()
  // restoreExperience()
  // resetExperience()
  // ============================================================

  const baseActions = useMemo<Omit<FeedActions, 'openExperience' | 'restoreExperience' | 'resetExperience'>>(
    () => ({
      changeCategory: updateQuery,
      previewProduct: openPreview,
      toggleLike,
      addToCart,
      previewPromotion
    }),
    [updateQuery, openPreview, toggleLike, addToCart, previewPromotion]
  );

  // ============================================================
  // DERIVED PRODUCTS
  // ============================================================

  const selectedPromoProducts = useMemo(() => {
    if (!selectedPromo) return [];

    return selectedPromo.productIds
      .map(productId => storeProducts.find(product => product.id === productId))
      .filter((product): product is ProductType => Boolean(product));
  }, [selectedPromo, storeProducts]);

  const filteredProducts = useMemo(
    () =>
      selectedCategory === 'all'
        ? storeProducts
        : storeProducts.filter(product => product.category === selectedCategory),
    [selectedCategory, storeProducts]
  );

  const selectedIndex = selectedProduct
    ? filteredProducts.findIndex(product => product.id === selectedProduct.id)
    : -1;

  const handleNextProduct = useCallback(() => {
    if (selectedIndex < 0 || selectedIndex >= filteredProducts.length - 1) {
      return;
    }

    setSelectedProduct(filteredProducts[selectedIndex + 1]);
  }, [filteredProducts, selectedIndex]);

  const handlePreviousProduct = useCallback(() => {
    if (selectedIndex <= 0) return;

    setSelectedProduct(filteredProducts[selectedIndex - 1]);
  }, [filteredProducts, selectedIndex]);

  // ============================================================
  // DISCOVERY HUB PREFERENCE
  // ============================================================

  const [hubCollapsed, setHubCollapsed] = useState(false);

  const [hubPreferenceLoaded, setHubPreferenceLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('aj_discovery_hub_collapsed');

    if (saved !== null) {
      setHubCollapsed(saved === 'true');
    }

    setHubPreferenceLoaded(true);
  }, []);

  useEffect(() => {
    if (!hubPreferenceLoaded) return;

    localStorage.setItem('aj_discovery_hub_collapsed', String(hubCollapsed));
  }, [hubCollapsed, hubPreferenceLoaded]);

  // ============================================================
  // WORKSPACE STATES
  // ============================================================

  if (workspaceLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle className="size-6 animate-spin text-primary" />

          <p className="text-sm font-medium text-muted-foreground">Loading AJ Logik</p>
        </div>
      </div>
    );
  }

  if (workspaceError) {
    return (
      <div className="grid min-h-[50vh] place-items-center px-6 text-center">
        <div>
          <p className="font-semibold">AJ Logik is temporarily unavailable</p>

          <p className="mt-2 text-sm text-muted-foreground">{workspaceError}</p>
        </div>
      </div>
    );
  }

  if (!activeWorkspace) {
    return (
      <div className="grid min-h-[50vh] place-items-center px-6 text-center">
        <p className="text-sm text-muted-foreground">AJ Logik could not prepare your shopping experience.</p>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <FeedExperienceProvider initialIntent={initialIntent} context={context} baseActions={baseActions}>
      <ExperienceStackProvider key={activeWorkspace.id} workspaceId={activeWorkspace.id}>
        <div className="min-h-dvh px-3 py-3 md:px-4 md:py-4 lg:h-[calc(100dvh-6.5rem)] lg:min-h-0 lg:overflow-hidden">
          <div className="grid h-full min-h-0 grid-cols-12 items-stretch gap-4">
            <section
              className={cn(
                'col-span-12 min-w-0 pb-6 transition-all duration-300',
                'lg:h-full lg:min-h-0 lg:overflow-y-auto',
                'lg:rounded-3xl lg:bg-card/50 lg:p-4',
                'lg:scroll-smooth lg:scrollbar-none',
                hubCollapsed ? 'lg:col-span-10' : 'lg:col-span-8'
              )}>
              <section
                className={cn(
                  'col-span-12 min-w-0 pb-6 transition-all duration-300',
                  'lg:h-full lg:min-h-0 lg:overflow-y-auto',
                  'lg:rounded-3xl lg:bg-card/50 lg:p-4',
                  'lg:scroll-smooth lg:scrollbar-none',
                  hubCollapsed ? 'lg:col-span-10' : 'lg:col-span-8'
                )}>
                <MockExperienceSwitcher
                  profiles={mockExperienceProfiles}
                  activeProfileId={activeProfileId}
                  onChange={setActiveProfileId}
                />

                <FeedRenderer />
              </section>

              <MockExperienceSwitcher
                profiles={mockExperienceProfiles}
                activeProfileId={activeProfileId}
                onChange={setActiveProfileId}
              />

              <FeedRenderer />
            </section>

            <DesktopDiscoveryRail
              groups={hubGroups}
              widgets={hubWidgets}
              collapsed={hubCollapsed}
              onCollapsedChange={setHubCollapsed}
            />
          </div>

          <ProductModal
            product={selectedProduct}
            open={previewOpen}
            onClose={closePreview}
            onToggleLike={() => {
              if (selectedProduct) {
                toggleLike(selectedProduct.id);
              }
            }}
            onNext={handleNextProduct}
            onPrevious={handlePreviousProduct}
            hasNext={selectedIndex > -1 && selectedIndex < filteredProducts.length - 1}
            hasPrevious={selectedIndex > 0}
            currentIndex={selectedIndex}
            totalProducts={filteredProducts.length}
          />

          <PromoModal
            promo={selectedPromo}
            products={selectedPromoProducts}
            open={promoOpen}
            onClose={closePromoPreview}
          />
        </div>
      </ExperienceStackProvider>
    </FeedExperienceProvider>
  );
}

export default function FeedExperienceWorkspace() {
  return <FeedExperienceWorkspaceContent />;
}
