'use client';

import {
  useRouter
} from 'next/navigation';

import type {
  KeyboardEvent,
  MouseEvent,
  SyntheticEvent
} from 'react';

import type {
  ProductType
} from '@/types/types';

export function useProductNavigation() {
  const router = useRouter();

  const openProductPage = (
    product: ProductType
  ) => {
    router.push(
      `/products/${product.slug}`
    );
  };

  const handleProductClick = (
    product: ProductType
  ) => {
    openProductPage(product);
  };

  const handleProductKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    product: ProductType
  ) => {
    if (
      event.key !== 'Enter' &&
      event.key !== ' '
    ) {
      return;
    }

    event.preventDefault();

    openProductPage(product);
  };

  const stopProductNavigation = (
    event: SyntheticEvent
  ) => {
    event.stopPropagation();
  };

  const handleNestedAction = (
    event: MouseEvent<HTMLElement>,
    action: () => void
  ) => {
    event.preventDefault();
    event.stopPropagation();

    action();
  };

  return {
    openProductPage,
    handleProductClick,
    handleProductKeyDown,
    stopProductNavigation,
    handleNestedAction
  };
}