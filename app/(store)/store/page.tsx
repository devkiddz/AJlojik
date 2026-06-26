'use client';

import React, { useState, useRef, useEffect } from 'react';

import StoreAside from '@/components/store/StoreAside';
import StoreCategoriesPill from '@/components/store/StoreCategoriesPill';
import StoreCategoryCard from '@/components/store/StoreCategoryCard';
import StoreRightPannel from '@/components/store/StoreRightPannel';
import StoreFeaturedProductCard from '@/components/store/StoreFeaturedProductCard';
import StoreFeaturedProductsSlide from '@/components/store/StoreFeaturedProductsSlide';
import ProductModal from '@/components/shared/ProductModal';

import { categories } from '@/categories';
import { products } from '@/data/products';

import { ProductType, ProductVariantType } from '@/types';
import StoreProductGridCard from '@/components/store/product/StoreProductGridCard';

export default function AJStorePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [storeProducts, setStoreProducts] = useState(products);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // State to track if the pill should be visible
  const [showStickyPill, setShowStickyPill] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyPill(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: '-56px 0px 0px 0px' // Clearance offset for navbar (top-14)
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
      prev.map(product => (product.id === productId ? { ...product, liked: !product.liked } : product))
    );

    setSelectedProduct(prev => (prev && prev.id === productId ? { ...prev, liked: !prev.liked } : prev));
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

  /**
   * MODAL NAVIGATION
   */
  const selectedIndex = selectedProduct
    ? filteredProducts.findIndex(product => product.id === selectedProduct.id)
    : -1;

  const handleNextProduct = () => {
    if (selectedIndex === -1) return;
    const nextIndex = selectedIndex + 1;
    if (nextIndex < filteredProducts.length) {
      setSelectedProduct(filteredProducts[nextIndex]);
    }
  };

  const handlePreviousProduct = () => {
    if (selectedIndex === -1) return;
    const previousIndex = selectedIndex - 1;
    if (previousIndex >= 0) {
      setSelectedProduct(filteredProducts[previousIndex]);
    }
  };

  return (
    <div className="mx-auto px-4 py-4 -mt-5">
      <div className="grid min-h-screen grid-cols-12 gap-4">
        {/* LEFT */}
        <aside className="hidden md:block col-span-12 lg:col-span-2">
          <StoreAside />
        </aside>

        {/* MAIN */}
        <main className="relative col-span-12 lg:col-span-8">
          <div className="bg-transparent space-y-6">
            {/* DYNAMIC HEIGHT STICKY CONTAINER */}
            {/* When hidden, h-0 minimizes layout footprint entirely */}
            <div
              className={`sticky top-14 z-50 w-full bg-muted shadow-md transition-all duration-300 ease-in-out ${
                showStickyPill
                  ? 'h-auto opacity-100 translate-y-0 pointer-events-auto px-4 py-5 mb-6'
                  : 'h-0 opacity-0 -translate-y-4 pointer-events-none p-0 overflow-hidden mb-0'
              }`}>
              <StoreCategoriesPill
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>

            {/* CATEGORY CARDS GRID CONTAINER */}
            <section ref={triggerRef} className="rounded-md bg-transparent !mt-0">
              <div className="grid grid-cols-2 gap-2 pt-2 md:grid-cols-3 xl:grid-cols-3">
                {categories.map(category => (
                  <StoreCategoryCard
                    key={category.id}
                    category={category}
                    active={selectedCategory === category.slug}
                    onClick={() => setSelectedCategory(category.slug)}
                  />
                ))}
              </div>
            </section>

            {/* FEATURED PRODUCTS */}
            <section className="grid gap-6 lg:grid-cols-5">
              <div className="min-w-0 lg:col-span-2">
                {featuredProduct && (
                  <StoreFeaturedProductCard
                    product={featuredProduct}
                    onPreview={openPreview}
                    onToggleLike={handleToggleLike}
                    onAddToCart={handleAddToCart}
                  />
                )}
              </div>

              <div className="min-w-0 lg:col-span-3">
                <StoreFeaturedProductsSlide
                  products={featuredProducts}
                  onPreview={openPreview}
                  onAddToCart={handleAddToCart}
                  onLike={product => handleToggleLike(product.id)}
                />
              </div>
            </section>

            {/* PRODUCT GRID */}
            <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map(product => (
                <StoreProductGridCard
                  key={product.id}
                  product={product}
                  onPreview={openPreview}
                  onToggleLike={handleToggleLike}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </section>
          </div>
        </main>

        {/* RIGHT */}
        <aside className="col-span-12 lg:col-span-2">
          <StoreRightPannel />
        </aside>
      </div>

      {/* MODAL */}
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
