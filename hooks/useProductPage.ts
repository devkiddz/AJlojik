'use client';

import { useState, useMemo } from 'react';
import { ProductType } from '@/types';

export function useProductPage(product: ProductType) {
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? '');
  const [isWishlisted, setIsWishlisted] = useState(product.liked ?? false);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const selectedVariant = useMemo(
    () => product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0],
    [selectedVariantId, product.variants]
  );

  const handleAddToCart = () => {
    setIsAdding(true);
    setTimeout(() => {
      setIsAdding(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }, 800);
  };

  return {
    selectedVariantId,
    setSelectedVariantId,
    selectedVariant,
    isWishlisted,
    setIsWishlisted,
    isAdding,
    added,
    handleAddToCart,
  };
}