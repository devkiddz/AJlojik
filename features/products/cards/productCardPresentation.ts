import type {
  ProductType
} from '@/types/types';

import type {
  ProductCardActions
} from './productCardTypes';

type OpenProductExperienceInput = Pick<
  ProductCardActions,
  | 'onOpenExperience'
  | 'onPreview'
> & {
  product: ProductType;
};

export function openProductExperience({
  product,
  onOpenExperience,
  onPreview
}: OpenProductExperienceInput): void {
  const openExperience =
    onOpenExperience ??
    onPreview;

  openExperience?.(product);
}

export function resolvePrimaryProductStatus(
  product: ProductType,
  soldOut: boolean
): string | null {
  if (soldOut) {
    return 'Sold out';
  }

  if (
    product.discountPercentage > 0
  ) {
    return `${product.discountPercentage}% off`;
  }

  if (product.isNew) {
    return 'New';
  }

  if (product.featured) {
    return 'Featured';
  }

  return null;
}

export function createProductPriceFormatter(
  locale = 'en-NG',
  currency = 'NGN'
): Intl.NumberFormat {
  try {
    return new Intl.NumberFormat(
      locale,
      {
        style: 'currency',
        currency,
        maximumFractionDigits: 0
      }
    );
  } catch {
    return new Intl.NumberFormat(
      'en-NG',
      {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0
      }
    );
  }
}
