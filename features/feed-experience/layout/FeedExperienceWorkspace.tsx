'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { LoaderCircle } from 'lucide-react';
import { useActionFeedback } from '@/features/action-feedback';
import DesktopDiscoveryRail from '@/components/discovery-hub-panel/DesktopDiscoveryRail';
import MobileDiscoverySheetHost from '@/components/discovery-hub-panel/MobileDiscoverySheetHost';
import PromoModal from '@/components/promos/PromoModal';

import { categories } from '@/data/categories';
import { collections } from '@/data/collections';
import { hubGroups, hubWidgets } from '@/data/discoveryHubData';
import { promos, type Promo } from '@/data/promos';

import { useCart } from '@/features/cart';
import { useCatalog } from '@/features/catalog';
import { ExperienceStackProvider } from '@/features/experience-stack/ExperienceStackProvider';
import { RegularProductPreviewModal } from '@/features/products/modals';
import { useWishlist } from '@/features/wishlist';
import { useWorkspace } from '@/features/workspace';

import { cn } from '@/lib/utils';

import { useIdentity } from '@/providers/IdentityProvider';

import type { ProductType, ProductVariantType } from '@/types/types';

import type { FeedActions, FeedContext, FeedIntent } from '../contracts';

import { mockExperienceProfiles, type MockExperienceProfileId } from '../mocks';

import { FeedExperienceProvider } from '../providers';
import { FeedRenderer } from '../renderers';

function FeedExperienceWorkspaceContent() {
  const { activeWorkspace, loading: workspaceLoading, error: workspaceError } = useWorkspace();
  const { error } = useActionFeedback();

  const { user, isAuthenticated } = useIdentity();

  const { items: cartItems, addToCart: addCartItem } = useCart();

  const { productIds: wishlistProductIds, toggleWishlist } = useWishlist();

  const { products: catalogProducts, loading: catalogLoading, error: catalogError } = useCatalog();

  // ============================================================
  // CART
  // ============================================================

  const handleAddToCart = useCallback(
    async (product: ProductType, variant: ProductVariantType): Promise<void> => {
      const addedItem = await addCartItem({
        product,
        variant,
        quantity: 1
      });

      if (!addedItem) {
        error({
          title: 'Unable to add product',
          description: 'AJ Logik could not add this product to your cart. Please try again.'
        });

        return;
      }
    },
    [addCartItem, error]
  );
  const cartProductIds = useMemo(() => [...new Set(cartItems.map(item => item.productId))], [cartItems]);

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
  // IDENTITY-BASED EXPERIENCE PROFILE
  // ============================================================

  const normalizedTier = user?.tier?.toLowerCase() ?? 'guest';

  const activeProfileId: MockExperienceProfileId = !isAuthenticated
    ? 'guest'
    : normalizedTier === 'premium'
      ? 'premium'
      : 'shopper';

  const activeProfile =
    mockExperienceProfiles.find(profile => profile.id === activeProfileId) ?? mockExperienceProfiles[0];

  // ============================================================
  // PRODUCT PREVIEW
  // ============================================================

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

  const toggleLike = useCallback(
    (productId: string) => {
      const product = catalogProducts.find(item => item.id === productId);

      const currentlyWishlisted = wishlistProductIds.includes(productId);

      void toggleWishlist({
        id: productId,
        name: product?.name
      });

      /*
       * Temporary compatibility for the
       * existing preview modal.
       *
       * The real source of truth remains
       * WishlistProvider.
       */
      setSelectedProduct(currentProduct =>
        currentProduct?.id === productId
          ? {
              ...currentProduct,
              liked: !currentlyWishlisted
            }
          : currentProduct
      );
    },
    [catalogProducts, toggleWishlist, wishlistProductIds]
  );

  // ============================================================
  // PROMOTION PREVIEW
  // ============================================================

  const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);

  const [promoOpen, setPromoOpen] = useState(false);

  const previewPromotion = useCallback((promoId: string) => {
    const promotion = promos.find(item => item.id === promoId);

    if (!promotion) {
      return;
    }

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
        products: catalogProducts,
        categories,
        collections,
        promotions: promos
      },

      user: {
        ...activeProfile.user,

        authenticated: isAuthenticated,

        tier: !isAuthenticated ? 'guest' : normalizedTier === 'premium' ? 'premium' : 'member',

        cartProductIds,

        wishlistProductIds
      },

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
    [activeProfile, catalogProducts, cartProductIds, isAuthenticated, normalizedTier, wishlistProductIds]
  );

  // ============================================================
  // BASE ACTIONS
  // ============================================================

  const baseActions = useMemo<Omit<FeedActions, 'openExperience' | 'restoreExperience' | 'resetExperience'>>(
    () => ({
      changeCategory: updateQuery,

      previewProduct: openPreview,

      toggleLike,

      addToCart: handleAddToCart,

      previewPromotion
    }),
    [updateQuery, openPreview, toggleLike, handleAddToCart, previewPromotion]
  );

  // ============================================================
  // DERIVED PRODUCTS
  // ============================================================

  const selectedPromoProducts = useMemo(() => {
    if (!selectedPromo) {
      return [];
    }

    return selectedPromo.productIds
      .map(productId => catalogProducts.find(product => product.id === productId))
      .filter((product): product is ProductType => Boolean(product));
  }, [selectedPromo, catalogProducts]);

  const filteredProducts = useMemo(
    () =>
      selectedCategory === 'all'
        ? catalogProducts
        : catalogProducts.filter(product => product.category === selectedCategory),
    [selectedCategory, catalogProducts]
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
    if (selectedIndex <= 0) {
      return;
    }

    setSelectedProduct(filteredProducts[selectedIndex - 1]);
  }, [filteredProducts, selectedIndex]);

  // ============================================================
  // DISCOVERY HUB PREFERENCE
  // ============================================================

  const [hubCollapsed, setHubCollapsed] = useState(false);

  const [hubPreferenceLoaded, setHubPreferenceLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem('aj_discovery_hub_collapsed');

      if (saved !== null) {
        setHubCollapsed(saved === 'true');
      }

      setHubPreferenceLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hubPreferenceLoaded) {
      return;
    }

    window.localStorage.setItem('aj_discovery_hub_collapsed', String(hubCollapsed));
  }, [hubCollapsed, hubPreferenceLoaded]);

  // ============================================================
  // LOADING AND ERROR STATES
  // ============================================================

  if (workspaceLoading || catalogLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle className="size-6 animate-spin text-primary" />

          <p className="text-sm font-medium text-muted-foreground">Loading AJ Logik</p>
        </div>
      </div>
    );
  }

  if (workspaceError || catalogError) {
    return (
      <div className="grid min-h-[50vh] place-items-center px-6 text-center">
        <div>
          <p className="font-semibold">AJ Logik is temporarily unavailable</p>

          <p className="mt-2 text-sm text-muted-foreground">{workspaceError ?? catalogError}</p>
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
      <MobileDiscoverySheetHost />

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
              <FeedRenderer />
            </section>

            <DesktopDiscoveryRail
              groups={hubGroups}
              widgets={hubWidgets}
              collapsed={hubCollapsed}
              onCollapsedChange={setHubCollapsed}
            />
          </div>

          <RegularProductPreviewModal
            product={selectedProduct}
            open={previewOpen}
            onClose={closePreview}
            onToggleLike={toggleLike}
            onAddToCart={handleAddToCart}
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
