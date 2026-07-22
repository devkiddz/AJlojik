'use client';

import Image from 'next/image';

import { useMemo } from 'react';

import { ShoppingBag, Star } from 'lucide-react';

import { useCart } from '@/features/cart';

import { cn } from '@/lib/utils';

import type { BaseProductCardProps } from './productCardTypes';

import { openProductExperience } from './productCardPresentation';

import { useProductVariant } from './useProductVariant';

export function ProductCard({ product, className, onOpenExperience, onPreview }: BaseProductCardProps) {
  const { selectedVariant } = useProductVariant(product);

  const { items: cartItems } = useCart();

  const productCartQuantity = useMemo(
    () =>
      cartItems
        .filter(item => String(item.productId) === String(product.id))
        .reduce((total, item) => total + item.quantity, 0),
    [cartItems, product.id]
  );

  if (!selectedVariant) {
    return null;
  }

  const formattedReviewCount =
    product.reviews > 999 ? `${(product.reviews / 1000).toFixed(1)}k` : product.reviews.toLocaleString();

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
        'group relative h-full w-full min-w-0',
        'min-h-48 overflow-hidden rounded-xl',
        'border border-border/60 bg-card',
        'shadow-sm transition duration-300 ease-out',
        'hover:-translate-y-0.5',
        'hover:border-border',
        'hover:shadow-md',
        'focus-within:border-ring/40',
        'focus-within:shadow-md',
        'md:min-h-56',
        className
      )}>
      <button
        type="button"
        onClick={openExperience}
        aria-label={`Open ${product.name}`}
        className="
          relative block size-full
          min-h-48 overflow-hidden
          text-left
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-inset
          focus-visible:ring-ring
          md:min-h-56
        ">
        {/* ==========================================
            AMBIENT IMAGE BACKGROUND
        ========================================== */}

        <Image
          src={selectedVariant.image}
          alt=""
          fill
          sizes="
            (max-width: 640px) 33vw,
            (max-width: 768px) 25vw,
            176px
          "
          className="
            scale-125 object-cover
            opacity-50 blur-xl
            saturate-125
          "
        />

        {/* ==========================================
            FULL PRODUCT IMAGE
        ========================================== */}

        <Image
          src={selectedVariant.image}
          alt={product.name}
          fill
          sizes="
            (max-width: 640px) 33vw,
            (max-width: 768px) 25vw,
            176px
          "
          className="
            z-10 object-cover
            object-center p-1
            transition-transform
            duration-500 ease-out
            group-hover:scale-[1.025]
          "
        />

        {/* ==========================================
            CART INDICATOR
        ========================================== */}

        {productCartQuantity > 0 ? (
          <span
            className="
              absolute right-2 top-2 z-30
              inline-flex max-w-[75%]
              items-center gap-1
              rounded-full
              border border-white/15
              bg-black/55
              px-2 py-1
              text-[8px] font-semibold
              text-white
              shadow-md backdrop-blur-md
              md:text-[9px]
            ">
            <ShoppingBag className="size-3 shrink-0" />

            <span className="truncate">
              {productCartQuantity > 99 ? '99+ added' : `${productCartQuantity} added`}
            </span>
          </span>
        ) : null}

        {/* ==========================================
            BOTTOM TEXT SHADOW
        ========================================== */}

        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute inset-x-0 bottom-0 z-20
            h-30
            bg-gradient-to-t
            from-black/85
            via-black/75
            to-transparent
          "
        />

        {/* ==========================================
            PRODUCT INFORMATION OVERLAY
        ========================================== */}

        <span
          className="
            absolute inset-x-0 bottom-0 z-30
            flex min-w-0 flex-col
            px-2.5 pb-2.5
            md:px-3 md:pb-3
          ">
          <span
            className="
              truncate
              text-[8px] font-semibold
              uppercase tracking-[0.14em]
              text-white
              md:text-[9px]
            ">
            {product.category.replaceAll('-', ' ')}
          </span>

          <span
            className="
              mt-0.5 line-clamp-1 md:line-clamp-2
              text-[11px] font-semibold
              leading-4 tracking-tight
              text-white
              md:text-xs
              md:leading-4
            ">
            {product.name}
          </span>

          <span
            className="
              mt-1.5 flex min-w-0
              items-center gap-1.5
              text-[9px] text-white
            ">
            <span className="inline-flex shrink-0 items-center gap-1">
              <Star className="size-3 fill-amber-400 text-amber-400" />

              <strong className="font-semibold text-white/85">{product.rating.toFixed(1)}</strong>
            </span>

            <span className="size-0.5 shrink-0 rounded-full bg-white/35" />

            <span className="truncate">
              {formattedReviewCount} {product.reviews === 1 ? 'rating' : 'ratings'}
            </span>
          </span>
        </span>
      </button>
    </article>
  );
}
