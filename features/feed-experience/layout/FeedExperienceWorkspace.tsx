'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import DiscoveryHubPanel from '@/components/discovery-hub-panel/DiscoveryHubPanel';
import { DiscoveryHubProvider } from '@/components/discovery-hub-panel/DiscoveryHubProvider';
import ProductModal from '@/components/shared/ProductModal';
import PromoModal from '@/components/promos/PromoModal';
import { cn } from '@/lib/utils';

import { hubGroups, hubWidgets } from '@/data/discoveryHubData';
import { categories } from '@/data/categories';
import { collections } from '@/data/collections';
import { products as initialProducts } from '@/data/products';
import { promos, type Promo } from '@/data/promos';

import type { ProductType, ProductVariantType } from '@/types/types';

import type { FeedActions, FeedContext, FeedIntent } from '../contracts';
import { FeedExperienceProvider } from '../providers';
import { FeedRenderer } from '../renderers';

import { mockExperienceProfiles, type MockExperienceProfileId } from '../mocks';

import { MockExperienceSwitcher } from '../components/MockExperienceSwitcher';

export default function FeedExperienceWorkspace() {
  // ============================================================
  // ROUTING
  // ============================================================

  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get('category') ?? 'all';

  // ============================================================
  // MOCK EXPERIENCE PROFILE
  // ============================================================

  const [activeProfileId, setActiveProfileId] = useState<MockExperienceProfileId>('guest');

  const activeProfile =
    mockExperienceProfiles.find(profile => profile.id === activeProfileId) ?? mockExperienceProfiles[0];

  // ============================================================
  // PRODUCT STATE
  // Temporary local state until ProductsProvider/database wiring
  // ============================================================

  const [storeProducts, setStoreProducts] = useState<ProductType[]>(initialProducts);

  // ============================================================
  // PRODUCT PREVIEW STATE
  // ============================================================

  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);

  const [previewOpen, setPreviewOpen] = useState(false);

  // ============================================================
  // PROMOTION PREVIEW STATE
  // ============================================================

  const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);

  const [promoOpen, setPromoOpen] = useState(false);

  // ============================================================
  // ROUTE ACTIONS
  // ============================================================

  const updateQuery = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === 'all') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      const query = params.toString();

      router.push(query ? `/store?${query}` : '/store', {
        scroll: false
      });
    },
    [router, searchParams]
  );

  // ============================================================
  // PRODUCT ACTIONS
  // ============================================================

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
  // PROMOTION ACTIONS
  // ============================================================

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
  // ROUTE-BASED INITIAL INTENT
  // This is the starting intent given to the provider.
  // The provider can later replace it through openExperience().
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
  // SHARED FEED CONTEXT
  // This is the unified reality consumed by the engine.
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
  // BASE APPLICATION ACTIONS
  // openExperience() and resetExperience() are added internally
  // by FeedExperienceProvider.
  // ============================================================

  const baseActions = useMemo<Omit<FeedActions, 'openExperience' | 'resetExperience'>>(
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
  // DERIVED PROMOTION PRODUCTS
  // Used by PromoModal.
  // ============================================================

  const selectedPromoProducts = useMemo(() => {
    if (!selectedPromo) return [];

    return selectedPromo.productIds
      .map(productId => storeProducts.find(product => product.id === productId))
      .filter((product): product is ProductType => Boolean(product));
  }, [selectedPromo, storeProducts]);

  // ============================================================
  // DERIVED CATEGORY PRODUCTS
  // Used by ProductModal navigation.
  // ============================================================

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

  // ============================================================
  // PRODUCT MODAL NAVIGATION
  // ============================================================

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
  // WORKSPACE
  // ============================================================

  return (
    <FeedExperienceProvider initialIntent={initialIntent} context={context} baseActions={baseActions}>
      <div className="h-screen overflow-hidden px-4 py-4 scrollbar-none self-start">
        <main className="grid min-h-screen grid-cols-12 items-start gap-4">
          {/* ====================================================
              CENTRAL FEED EXPERIENCE
          ==================================================== */}

          <main className="col-span-12 min-w-0 pb-6 lg:sticky lg:top-26 lg:max-h-screen lg:self-start lg:overflow-y-scroll lg:rounded-3xl lg:bg-card/50 lg:p-4 lg:scroll-smooth lg:scrollbar-none lg:col-span-8">
            <MockExperienceSwitcher
              profiles={mockExperienceProfiles}
              activeProfileId={activeProfileId}
              onChange={setActiveProfileId}
            />

            <FeedRenderer />
          </main>

          {/* ====================================================
              DISCOVERY HUB / EXPERIENCE RAIL
          ==================================================== */}

          <aside
            className={cn(
              'col-span-12 max-h-[calc(100vh-7rem)] self-start overflow-hidden bg-card pb-24 scrollbar-none lg:sticky lg:top-0 lg:col-span-4 lg:block lg:max-h-[calc(100vh-5rem)] lg:pb-0'
            )}>
            <DiscoveryHubProvider groups={hubGroups} widgets={hubWidgets}>
              <DiscoveryHubPanel />
            </DiscoveryHubProvider>
          </aside>
        </main>

        {/* ======================================================
            PRODUCT QUICK PREVIEW
        ====================================================== */}

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

        {/* ======================================================
            PROMOTION QUICK PREVIEW
        ====================================================== */}

        <PromoModal
          promo={selectedPromo}
          products={selectedPromoProducts}
          open={promoOpen}
          onClose={closePromoPreview}
        />
      </div>
    </FeedExperienceProvider>
  );
}
