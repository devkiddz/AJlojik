'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { products as initialProducts } from '@/data/products';
import { categories } from '@/categories';

import ItemsCarousel from './ItemsCarousel';
import ProductsCarousel from '../ProductsCarousel';
import ProductModal from '@/components/shared/ProductModal';

export default function ProductsComponent() {
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get('category') ?? 'all';
  const searchQuery = (searchParams.get('q') ?? '').toLowerCase();

  const [productList, setProductList] = useState(initialProducts);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  /**
   * FILTERED PRODUCTS
   */
  const filteredProducts = useMemo(() => {
    return productList.filter(product => {
      const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;

      const searchMatch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery) ||
        product.shortDescription.toLowerCase().includes(searchQuery);

      return categoryMatch && searchMatch;
    });
  }, [productList, selectedCategory, searchQuery]);

  /**
   * FEATURED
   */
  const featuredProducts = filteredProducts.filter(product => product.featured);

  /**
   * MODAL
   */
  const selectedProduct = filteredProducts.find(product => product.id === selectedId) ?? null;

  const currentIndex = filteredProducts.findIndex(product => product.id === selectedId);

  const previousProduct = currentIndex > 0 ? filteredProducts[currentIndex - 1] : null;

  const nextProduct =
    currentIndex >= 0 && currentIndex < filteredProducts.length - 1
      ? filteredProducts[currentIndex + 1]
      : null;

  /**
   * LIKE
   */
  const toggleLike = (productId: string) => {
    setProductList(prev =>
      prev.map(product =>
        product.id === productId
          ? {
              ...product,
              liked: !product.liked
            }
          : product
      )
    );
  };

  /**
   * MODAL
   */
  const handleSelect = (productId: string) => {
    setSelectedId(productId);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedId(null);
  };

  return (
    <div className="w-full">
      {/* CATEGORY STRIP */}
      <ItemsCarousel categories={categories} />
      FEATURED
      <ProductsCarousel
        title="Featured Products"
        category="featured"
        products={featuredProducts}
        onSelect={handleSelect}
        onToggleLike={toggleLike}
      />
      {/* FILTERED PRODUCTS */}
      {/* <ProductsCarousel
        title={
          selectedCategory === 'all'
            ? 'All Products'
            : (categories.find(c => c.slug === selectedCategory)?.label ?? 'Products')
        }
        category={selectedCategory}
        products={filteredProducts}
        onSelect={handleSelect}
        onToggleLike={toggleLike}
      /> */}
      {/* MODAL */}
      <ProductModal
        product={selectedProduct}
        open={open}
        onClose={handleClose}
        currentIndex={currentIndex >= 0 ? currentIndex : 0}
        totalProducts={filteredProducts.length}
        onToggleLike={selectedId ? () => toggleLike(selectedId) : undefined}
        onPrevious={previousProduct ? () => setSelectedId(previousProduct.id) : undefined}
        onNext={nextProduct ? () => setSelectedId(nextProduct.id) : undefined}
        hasPrevious={!!previousProduct}
        hasNext={!!nextProduct}
      />
    </div>
  );
}
