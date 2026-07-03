'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import StoreRightPannel from '@/components/store/StoreRightPannel';
import ProductModal from '@/components/shared/ProductModal';
import { collections } from '@/data/collections';
import { categories } from '@/categories';
import { products } from '@/data/products';

import { ProductType, ProductVariantType } from '@/types';
import StoreContent from '../discovery/DiscoveryFeedsEngine';

export default function StorePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get('category') ?? 'all';

  const [storeProducts, setStoreProducts] = useState(products);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showStickyPill, setShowStickyPill] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

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

      router.push(`/store?${params.toString()}`, {
        scroll: false
      });
    },
    [router, searchParams]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyPill(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: '-56px 0px 0px 0px'
      }
    );

    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  /**
   * FILTER PRODUCTS
   */
  const filteredProducts =
    selectedCategory === 'all'
      ? storeProducts
      : storeProducts.filter(product => product.category === selectedCategory);

  /**
   * FEATURED PRODUCTS
   */
  const featuredProducts = filteredProducts.filter(product => product.featured);

  /**
   * KEEP RANDOM FEATURED PRODUCT STABLE
   */
  const [featuredProductId] = useState(() => {
    const featured = products.filter(product => product.featured);

    return featured.length ? featured[Math.floor(Math.random() * featured.length)].id : products[0].id;
  });

  const featuredProduct =
    featuredProducts.find(product => product.id === featuredProductId) ??
    featuredProducts[0] ??
    filteredProducts[0];

  /**
   * LIKE
   */
  const handleToggleLike = (productId: string) => {
    setStoreProducts(prev =>
      prev.map(product =>
        product.id === productId
          ? {
              ...product,
              liked: !product.liked
            }
          : product
      )
    );

    setSelectedProduct(prev =>
      prev && prev.id === productId
        ? {
            ...prev,
            liked: !prev.liked
          }
        : prev
    );
  };

  /**
   * CART
   */
  const handleAddToCart = (product: ProductType, variant: ProductVariantType) => {
    console.log(product.name);
    console.log(variant.label);

    alert(`${product.name} added to cart`);
  };

  /**
   * PREVIEW
   */
  const openPreview = (product: ProductType) => {
    setSelectedProduct(product);
    setPreviewOpen(true);
  };

  /** Receive
   * Colections
   * **/

  const resolvedCollections = collections
    .filter(collection => collection.active)
    .sort((a, b) => a.priority - b.priority)
    .map(collection => ({
      collection,
      products: collection.productIds
        .map(id => storeProducts.find(product => product.id === id))
        .filter((product): product is ProductType => Boolean(product)),
      featuredProduct: collection.featuredProductId
        ? storeProducts.find(product => product.id === collection.featuredProductId)
        : undefined
    }));

  /**
   * MODAL NAVIGATION
   */
  const selectedIndex = selectedProduct
    ? filteredProducts.findIndex(product => product.id === selectedProduct.id)
    : -1;

  const handleNextProduct = () => {
    if (selectedIndex === -1) return;

    const next = selectedIndex + 1;

    if (next < filteredProducts.length) {
      setSelectedProduct(filteredProducts[next]);
    }
  };

  const handlePreviousProduct = () => {
    if (selectedIndex === -1) return;

    const previous = selectedIndex - 1;

    if (previous >= 0) {
      setSelectedProduct(filteredProducts[previous]);
    }
  };

  return (
    <div className="mx-auto -mt-5 px-4 py-4">
      <div className="grid min-h-screen grid-cols-12 gap-4">
        {/* THE MAIN STORE CONTENTS ENGINE COMPONENT */}
        <StoreContent
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
        />

        {/* RIGHT */}
        <aside className="col-span-12 lg:col-span-2">
          <StoreRightPannel />
        </aside>
      </div>

      {/* PRODUCT MODAL */}
      <ProductModal
        product={selectedProduct}
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setSelectedProduct(null);
        }}
        onToggleLike={() => {
          if (selectedProduct) {
            handleToggleLike(selectedProduct.id);
          }
        }}
        onNext={handleNextProduct}
        onPrevious={handlePreviousProduct}
        hasNext={selectedIndex > -1 && selectedIndex < filteredProducts.length - 1}
        hasPrevious={selectedIndex > 0}
        currentIndex={selectedIndex}
        totalProducts={filteredProducts.length}
      />
    </div>
  );
}
