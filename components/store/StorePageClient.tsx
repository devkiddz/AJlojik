'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import StoreAside from '@/components/store/StoreAside';
import StoreCategoriesPill from '@/components/store/StoreCategoriesPill';
import StoreCategoryCard from '@/components/store/StoreCategoryCard';
import StoreRightPannel from '@/components/store/StoreRightPannel';
import StoreFeaturedProductCard from '@/components/store/StoreFeaturedProductCard';
import StoreFeaturedProductsSlide from '@/components/store/StoreFeaturedProductsSlide';
import StoreProductGridCard from '@/components/store/product/StoreProductGridCard';
import ProductModal from '@/components/shared/ProductModal';

import { categories } from '@/categories';
import { products } from '@/data/products';

import { ProductType, ProductVariantType } from '@/types';

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
        {/* LEFT */}
        <aside className="col-span-12 hidden lg:col-span-2 md:block">
          <StoreAside />
        </aside>

        {/* MAIN */}
        <main className="relative col-span-12 lg:col-span-8">
          <div className="space-y-6">
            {/* STICKY FILTER */}
            <div
              className={`sticky top-15 z-50 w-full bg-background ${
                showStickyPill
                  ? 'mb-6 h-auto translate-y-0 px-4 py-2 opacity-100m'
                  : 'mb-0 h-0 -translate-y-4 overflow-hidden p-0 opacity-0 pointer-events-none'
              }`}>
              <StoreCategoriesPill
                selectedCategory={selectedCategory}
                onSelectCategory={category =>
                  updateQuery({
                    category
                  })
                }
              />
            </div>

            {/* CATEGORY GRID */}
            <section ref={triggerRef} className="!mt-0 rounded-md bg-transparent">
              <div className="grid grid-cols-2 gap-2 pt-2 md:grid-cols-3 xl:grid-cols-3">
                {categories.map(category => (
                  <StoreCategoryCard
                    key={category.id}
                    category={category}
                    active={selectedCategory === category.slug}
                    onClick={() =>
                      updateQuery({
                        category: category.slug
                      })
                    }
                  />
                ))}
              </div>
            </section>

            {/* FEATURED */}
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
