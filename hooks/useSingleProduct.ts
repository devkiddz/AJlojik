'use client';

import { useMemo, useState } from 'react';

import { products } from '@/data/products';
import { ProductType } from '@/types/types';

export function useSingleProduct(product: ProductType) {
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id ?? ''
  );

  const [quantity, setQuantity] = useState(1);

  const [wishlisted, setWishlisted] = useState(product.liked);

  const selectedVariant = useMemo(() => {
    return (
      product.variants.find(v => v.id === selectedVariantId) ??
      product.variants[0]
    );
  }, [product, selectedVariantId]);

  const inStock = (selectedVariant?.stockLeft ?? 0) > 0;

  const increaseQuantity = () => {
    if (!inStock) return;

    setQuantity(prev =>
      Math.min(prev + 1, selectedVariant.stockLeft)
    );
  };

  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  const toggleWishlist = () => {
    setWishlisted(prev => !prev);
  };

  const addToCart = () => {
    console.log('Add To Cart', {
      product,
      variant: selectedVariant,
      quantity,
    });
  };

  const recommendations = products
    .filter(
      p =>
        p.category === product.category &&
        p.id !== product.id
    )
    .slice(0, 6);

  const trending = [...products]
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 5);

  const recentlyViewed = [...products]
    .filter(p => p.id !== product.id)
    .slice(0, 5);

  return {
    selectedVariant,
    selectedVariantId,
    setSelectedVariantId,

    quantity,
    increaseQuantity,
    decreaseQuantity,

    inStock,

    wishlisted,
    toggleWishlist,

    addToCart,

    recommendations,
    trending,
    recentlyViewed,
  };
}