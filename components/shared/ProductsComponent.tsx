'use client';

import { useState } from 'react';

import { products as initialProducts } from '@/data/products';
import { categories } from '@/categories';

import ItemsCarousel from './ItemsCarousel';
import ProductsCarousel from '../ProductsCarousel';
import ProductModal from '@/components/shared/ProductModal';

export default function ProductsComponent() {
  const [productList, setProductList] = useState(initialProducts);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const selectedProduct = productList.find(product => product.id === selectedId) ?? null;

  const currentIndex = productList.findIndex(product => product.id === selectedId);

  const previousProduct = currentIndex > 0 ? productList[currentIndex - 1] : null;

  const nextProduct =
    currentIndex >= 0 && currentIndex < productList.length - 1 ? productList[currentIndex + 1] : null;

  const toggleLike = (productId: string) => {
    setProductList(prev =>
      prev.map(product => (product.id === productId ? { ...product, liked: !product.liked } : product))
    );
  };

  const handleSelect = (productId: string) => {
    setSelectedId(productId);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedId(null);
  };

  const featuredProducts = productList.filter(product => product.featured);

  return (
    <div className="w-full">
      {/* Categories */}
      <ItemsCarousel categories={categories} />

      {/* Featured Products */}
      <ProductsCarousel
        title="Featured Products"
        category={'featured'}
        products={featuredProducts}
        onSelect={handleSelect}
        onToggleLike={toggleLike}
      />

      {/* Example single category carousel */}
      <ProductsCarousel
        title="Wines & Liquors"
        category="wines"
        products={productList}
        onSelect={handleSelect}
        onToggleLike={toggleLike}
      />

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        open={open}
        onClose={handleClose}
        currentIndex={currentIndex >= 0 ? currentIndex : 0}
        totalProducts={productList.length}
        onToggleLike={selectedId ? () => toggleLike(selectedId) : undefined}
        onPrevious={previousProduct ? () => setSelectedId(previousProduct.id) : undefined}
        onNext={nextProduct ? () => setSelectedId(nextProduct.id) : undefined}
        hasPrevious={!!previousProduct}
        hasNext={!!nextProduct}
      />
    </div>
  );
}
