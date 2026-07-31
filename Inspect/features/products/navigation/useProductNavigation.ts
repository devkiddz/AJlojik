'use client';

import type {
  KeyboardEvent,
  MouseEvent,
  SyntheticEvent
} from 'react';

import { openCustomerProductExperience } from '@/features/customer-experience';
import type { ProductType } from '@/types/types';

export function useProductNavigation() {
  const openProductPage = (product: ProductType) => {
    openCustomerProductExperience({
      id: product.id,
      name: product.name,
      shortDescription: product.shortDescription
    });
  };

  const handleProductClick = (product: ProductType) => {
    openProductPage(product);
  };

  const handleProductKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    product: ProductType
  ) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    openProductPage(product);
  };

  const stopProductNavigation = (event: SyntheticEvent) => {
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
