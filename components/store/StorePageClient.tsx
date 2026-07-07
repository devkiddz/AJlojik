'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PromoModal from '@/components/promos/PromoModal';
import { promos, Promo } from '@/data/promos';
import StoreRightPannel from '@/components/store/StoreRightPannel';
import ProductModal from '@/components/shared/ProductModal';
import DiscoveryFeedsEngine from '../discovery/DiscoveryFeedsEngine';

import { collections } from '@/data/collections';
import { categories } from '@/data/categories';
import { products } from '@/data/products';
import { ProductType, ProductVariantType } from '@/types';
import { DiscoveryProvider } from '../discovery/DiscoveryProvider';

export default function StorePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get('category') ?? 'all';
  const triggerRef = useRef<HTMLDivElement>(null);

  const [storeProducts, setStoreProducts] = useState(products);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);
  const [promoOpen, setPromoOpen] = useState(false);

  const openPromoPreview = (promoId: string) => {
    const promo = promos.find(promo => promo.id === promoId);

    if (!promo) return;

    setSelectedPromo(promo);
    setPromoOpen(true);
  };

  const closePromoPreview = () => {
    setPromoOpen(false);
    setSelectedPromo(null);
  };

  const selectedPromoProducts = useMemo(() => {
    if (!selectedPromo) return [];

    return selectedPromo.productIds
      .map(id => storeProducts.find(product => product.id === id))
      .filter((product): product is ProductType => Boolean(product));
  }, [selectedPromo, storeProducts]);
  // const [showStickyPill, setShowStickyPill] = useState(false);

  // --- Query Handling ---
  const updateQuery = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === 'all') params.delete(key);
        else params.set(key, value);
      });
      router.push(`/store?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // --- Computed Data ---
  const filteredProducts = useMemo(
    () =>
      selectedCategory === 'all' ? storeProducts : storeProducts.filter(p => p.category === selectedCategory),
    [storeProducts, selectedCategory]
  );

  const featuredProducts = useMemo(() => filteredProducts.filter(p => p.featured), [filteredProducts]);

  const featuredProduct = useMemo(() => {
    const randomId = products.filter(p => p.featured)[0]?.id ?? products[0].id;
    return featuredProducts.find(p => p.id === randomId) ?? featuredProducts[0] ?? filteredProducts[0];
  }, [featuredProducts, filteredProducts]);

  const resolvedCollections = useMemo(
    () =>
      collections
        .filter(c => c.active)
        .sort((a, b) => a.priority - b.priority)
        .map(c => ({
          collection: c,
          products: c.productIds
            .map(id => storeProducts.find(p => p.id === id))
            .filter((p): p is ProductType => !!p),
          featuredProduct: storeProducts.find(p => p.id === c.featuredProductId)
        })),
    [storeProducts]
  );

  // --- Handlers ---
  const handleToggleLike = (productId: string) => {
    setStoreProducts(prev => prev.map(p => (p.id === productId ? { ...p, liked: !p.liked } : p)));
    setSelectedProduct(prev => (prev?.id === productId ? { ...prev, liked: !prev.liked } : prev));
  };

  const handleAddToCart = (product: ProductType, variant: ProductVariantType) => {
    alert(`${product.name} (${variant.label}) added to cart`);
  };

  const openPreview = (product: ProductType) => {
    setSelectedProduct(product);
    setPreviewOpen(true);
  };

  // --- Modal Navigation ---
  const selectedIndex = selectedProduct ? filteredProducts.findIndex(p => p.id === selectedProduct.id) : -1;

  const handleNext = () =>
    selectedIndex < filteredProducts.length - 1 && setSelectedProduct(filteredProducts[selectedIndex + 1]);
  const handlePrev = () => selectedIndex > 0 && setSelectedProduct(filteredProducts[selectedIndex - 1]);

  return (
    <div className="mx-auto -mt-5 px-4 py-4">
      <div className="grid min-h-screen grid-cols-12 gap-4">
        <DiscoveryProvider
          triggerRef={triggerRef}
          categories={categories}
          collections={resolvedCollections}
          selectedCategory={selectedCategory}
          featuredProduct={featuredProduct}
          featuredProducts={featuredProducts}
          filteredProducts={filteredProducts}
          onCategoryChange={updateQuery}
          onPreview={openPreview}
          onToggleLike={handleToggleLike}
          onAddToCart={handleAddToCart}
          onPromoPreview={openPromoPreview}>
          <DiscoveryFeedsEngine />
        </DiscoveryProvider>

        <aside className="col-span-12 lg:col-span-2">
          <StoreRightPannel />
        </aside>
      </div>

      <ProductModal
        product={selectedProduct}
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setSelectedProduct(null);
        }}
        onToggleLike={() => selectedProduct && handleToggleLike(selectedProduct.id)}
        onNext={handleNext}
        onPrevious={handlePrev}
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
        onSelectProduct={id => {
          const product = storeProducts.find(product => product.id === id);

          if (!product) return;

          closePromoPreview();
          openPreview(product);
        }}
      />
    </div>
  );
}
