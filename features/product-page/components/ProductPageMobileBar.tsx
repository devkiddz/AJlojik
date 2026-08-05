'use client';

import {
  ProductActionTray
} from '@/features/products/cards';

import type {
  ProductType,
  ProductVariantType
} from '@/types/types';

import styles from './ProductPageExperience.module.css';

type ProductPageMobileBarProps = {
  product: ProductType;
  variant:
    ProductVariantType |
    undefined;
  locale: string;
  currency: string;
};

export function ProductPageMobileBar({
  product,
  variant,
  locale,
  currency
}: ProductPageMobileBarProps) {
  if (!variant) {
    return null;
  }

  const formatter =
    new Intl.NumberFormat(
      locale,
      {
        style:
          'currency',
        currency,
        maximumFractionDigits:
          0
      }
    );

  return (
    <aside
      className={
        styles.mobileBar
      }>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 pl-2">
          <p className="truncate text-[0.68rem] font-semibold text-muted-foreground">
            {
              variant.label
            }
          </p>

          <p className="truncate text-sm font-black">
            {
              formatter.format(
                variant.price
              )
            }
          </p>
        </div>

        <ProductActionTray
          product={
            product
          }
          variant={
            variant
          }
          presentation="inline"
          compact
          cartLabelOnly
          showWishlist={false}
          className="shrink-0 border-0 bg-transparent p-0 shadow-none"
        />
      </div>
    </aside>
  );
}
