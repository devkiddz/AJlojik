'use client';

import Image from 'next/image';

import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';

import { ProductActionTray } from './ProductActionTray';
import type { BaseProductCardProps } from './productCardTypes';
import { useProductVariant } from './useProductVariant';

export function ProductCard({
  product,
  className,
  onPreview,
  onOpenExperience,
  onAddToCart
}: BaseProductCardProps) {
  const { selectedVariant, soldOut } = useProductVariant(product);

  if (!selectedVariant) {
    return null;
  }

  const cardLabel = soldOut
    ? 'Sold out'
    : product.discountPercentage > 0
      ? `${product.discountPercentage}% off`
      : product.isNew
        ? 'New'
        : product.featured
          ? 'Featured'
          : null;

  return (
    <article
      className={cn(
        'group min-w-0 rounded-2xl p-2.5',
        'border border-transparent bg-card/55',
        'transition duration-300 ease-out',
        'hover:-translate-y-1 hover:border-border/70 hover:bg-card hover:shadow-xl',
        'focus-within:border-border/70 focus-within:bg-card focus-within:shadow-xl',
        className
      )}>
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted shadow-sm">
        <Image
          src={selectedVariant.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 44vw, (max-width: 1024px) 224px, 240px"
          className="object-cover object-center transition duration-500 ease-out group-hover:scale-[1.035] group-focus-within:scale-[1.035]"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10" />

        {cardLabel ? (
          <span className="absolute left-2.5 top-2.5 z-30 max-w-[calc(100%-1.25rem)] truncate rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur-md">
            {cardLabel}
          </span>
        ) : null}

        <button
          type="button"
          aria-label={`Open ${product.name} experience`}
          onClick={() => onOpenExperience?.(product)}
          className="absolute inset-0 z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/80">
          <span className="sr-only">Open {product.name}</span>
        </button>

        <ProductActionTray
          product={product}
          onPreview={onPreview}
          onAddToCart={onAddToCart}
          className="z-40 from-black/75 via-black/20"
        />
      </div>

      <button
        type="button"
        onClick={() => onOpenExperience?.(product)}
        className="mt-3 block w-full min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <h3 className="truncate text-sm font-semibold tracking-tight text-card-foreground">
          {product.name}
        </h3>

        <p className="mt-1 line-clamp-2 min-h-8 text-[11px] leading-4 text-muted-foreground">
          {product.shortDescription}
        </p>

        <div className="mt-2.5 flex min-w-0 items-center justify-between gap-2">
          <span className="truncate text-sm font-bold text-card-foreground">
            {soldOut ? 'Unavailable' : `₦${selectedVariant.price.toLocaleString()}`}
          </span>

          <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-muted-foreground">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            {product.rating.toFixed(1)}
          </span>
        </div>
      </button>
    </article>
  );
}
