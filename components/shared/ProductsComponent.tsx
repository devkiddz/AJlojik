'use client';

import { useState } from 'react';
import { products as initialProducts } from '@/data/products';
import { categories } from '@/categories';

import ProductCard from './ProductsCards';
import ProductModal from '@/components/shared/ProductModal';
import CategoriesCarousel from './CategoriesCarousel';

export default function ProductsComponent() {
  const [productList, setProductList] = useState(initialProducts);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const selectedProduct = productList.find(p => p.id === selectedId) ?? null;

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
      <CategoriesCarousel categories={categories} />

      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {productList.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onSelect={() => handleSelect(product.id)}
            onToggleLike={() => toggleLike(product.id)}
          />
        ))}
      </div>

      <ProductModal
        product={selectedProduct}
        open={open}
        onClose={handleClose}
        onToggleLike={selectedProduct ? () => toggleLike(selectedProduct.id) : undefined}
      />
    </div>
  );
}
