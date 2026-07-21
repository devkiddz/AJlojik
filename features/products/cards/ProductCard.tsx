'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ProductActionTray } from './ProductActionTray';
import type { BaseProductCardProps } from './productCardTypes';
import {
  createProductPriceFormatter,
  openProductExperience,
  resolvePrimaryProductStatus
} from './productCardPresentation';
import { useProductVariant } from './useProductVariant';

export function ProductCard({
  product,
  className,
  locale = 'en-NG',
  currency = 'NGN',
  onOpenExperience,
  onPreview,
  onAddToCart
}: BaseProductCardProps) {
  const { selectedVariant, soldOut } = useProductVariant(product);

  const priceFormatter = useMemo(() => createProductPriceFormatter(locale, currency), [currency, locale]);

  if (!selectedVariant) {
    return null;
  }

  const status = resolvePrimaryProductStatus(product, soldOut);
  const outOfStock = selectedVariant.stockLeft <= 0;
  const lowStock = !outOfStock && selectedVariant.stockLeft <= 5;

  const openExperience = (): void => {
    openProductExperience({
      product,
      onOpenExperience,
      onPreview
    });
  };

  return (
    <article
      className={cn(
        'group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl',
        'border border-border/60 bg-card',
        'shadow-sm transition duration-300 ease-out',
        'hover:-translate-y-0.5 hover:border-border hover:shadow-lg',
        'focus-within:border-ring/40 focus-within:shadow-md',
        className
      )}>
      {/* ====================================================
          PRODUCT IMAGE SURFACES & OVERLAYS
      ==================================================== */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={selectedVariant.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 72vw, (max-width: 1024px) 32vw, 240px"
          className="
            object-cover
            transition duration-500 ease-out
            group-hover:scale-[1.025]
          "
        />

        {/* Primary Status Badge */}
        {status ? (
          <span
            className="
              pointer-events-none absolute left-3 top-3 z-30
              rounded-full border border-white/20
              bg-background/80 px-2.5 py-1
              text-[10px] font-semibold text-foreground
              shadow-sm backdrop-blur-md dark:border-white/10
            ">
            {status}
          </span>
        ) : null}

        {/* Bottom Overlay: Rating (Left) & Action Tray (Right) */}
        <div className="pointer-events-none absolute bottom-3 inset-x-3 z-30 flex items-center justify-between gap-2">
          {/* Glass Rating Badge */}
          <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/20 bg-background/60 px-2.5 py-1.5 shadow-md backdrop-blur-md dark:border-white/10 dark:bg-background/40">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-foreground">{product.rating.toFixed(1)}</span>
          </div>

          {/* Action Tray on Image */}
          <ProductActionTray
            product={product}
            onAddToCart={onAddToCart}
            className="static translate-x-0 translate-y-0 w-auto sm:translate-y-0"
          />
        </div>

        {/* Click Target Overlay for Experience/Preview */}
        <button
          type="button"
          aria-label={`Open ${product.name} experience`}
          onClick={openExperience}
          className="
            absolute inset-0 z-20
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-inset
            focus-visible:ring-ring
          ">
          <span className="sr-only text-sm">Open {product.name}</span>
        </button>
      </div>

      {/* ====================================================
          PRODUCT DETAILS CONTENT
      ==================================================== */}
      <button
        type="button"
        onClick={openExperience}
        className="
          flex flex-1 flex-col p-4 text-left
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-inset
          focus-visible:ring-ring
        ">
        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {product.category.replaceAll('-', ' ')}
        </p>

        <h3 className="mt-1.5 line-clamp-2 min-h-10 text-[15px] font-semibold leading-5 tracking-tight text-card-foreground">
          {product.name}
        </h3>
        {/* 
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div className="min-w-0">
            <p className="truncate text-base font-bold tracking-tight text-card-foreground">
              {soldOut ? 'Unavailable' : priceFormatter.format(Number(selectedVariant.price))}
            </p>

            <p
              className={cn(
                'mt-0.5 truncate text-[10px] font-medium',
                outOfStock
                  ? 'text-destructive'
                  : lowStock
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-muted-foreground'
              )}>
              {outOfStock
                ? 'Out of stock'
                : lowStock
                  ? `Only ${selectedVariant.stockLeft} left`
                  : selectedVariant.label}
            </p>
          </div>
        </div> */}
      </button>
    </article>
  );
}
