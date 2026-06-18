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

  return (
    <div className="w-full">
      <ItemsCarousel categories={categories} />

      <ProductsCarousel products={productList} onSelect={handleSelect} onToggleLike={toggleLike} />

      <ProductModal
        product={selectedProduct}
        open={open}
        onClose={handleClose}
        // FIXED: Pass current index and list length down to the modal
        currentIndex={currentIndex >= 0 ? currentIndex : 0}
        totalProducts={productList.length}
        // OPTIMIZATION: Uses selectedId directly to avoid transition lag bugs with AnimatePresence
        onToggleLike={selectedId ? () => toggleLike(selectedId) : undefined}
        onPrevious={previousProduct ? () => setSelectedId(previousProduct.id) : undefined}
        onNext={nextProduct ? () => setSelectedId(nextProduct.id) : undefined}
        hasPrevious={!!previousProduct}
        hasNext={!!nextProduct}
      />
    </div>
  );
}
