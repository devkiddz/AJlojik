'use client';

import Image from 'next/image';

import { ArrowUpRight, Star } from 'lucide-react';

import { cn } from '@/lib/utils';

import { ProductActionTray } from './ProductActionTray';
import type { BaseProductCardProps } from './productCardTypes';
import { useProductVariant } from './useProductVariant';

const currency = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0
});

export function ProductCard({ product, className, onPreview, onOpenExperience, onAddToCart }: BaseProductCardProps) {
  const { selectedVariant, soldOut } = useProductVariant(product);

  if (!selectedVariant) return null;

  const label = soldOut
    ? 'Sold out'
    : product.discountPercentage > 0
      ? `Save ${product.discountPercentage}%`
      : product.isNew
        ? 'New'
        : product.featured
          ? 'Featured'
          : null;

  return (
    <article className={cn(
      'group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[1.35rem] border border-border/60 bg-card shadow-[0_8px_30px_-24px_rgba(0,0,0,.5)]',
      'transition-all duration-300 ease-out hover:-translate-y-1 hover:border-border hover:shadow-[0_24px_55px_-28px_rgba(0,0,0,.55)]',
      'focus-within:-translate-y-1 focus-within:border-ring/40 focus-within:shadow-xl',
      className
    )}>
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={selectedVariant.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 72vw, (max-width: 1024px) 32vw, 240px"
          className="object-cover transition duration-500 ease-out group-hover:scale-[1.045]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-white/5" />

        {label ? (
          <span className="absolute left-3 top-3 z-30 rounded-md bg-amber-400 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-black shadow-sm">
            {label}
          </span>
        ) : null}

        <button
          type="button"
          aria-label={`Open ${product.name}`}
          onClick={() => onOpenExperience?.(product)}
          className="absolute inset-0 z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white">
          <span className="sr-only">Open {product.name}</span>
        </button>

        <ProductActionTray product={product} onPreview={onPreview} onAddToCart={onAddToCart} className="z-40" />
      </div>

      <button
        type="button"
        onClick={() => onOpenExperience?.(product)}
        className="flex flex-1 flex-col p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
        <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          <span className="truncate">{product.category.replaceAll('-', ' ')}</span>
          <span className="inline-flex shrink-0 items-center gap-1 normal-case tracking-normal">
            <Star className="size-3 fill-amber-400 text-amber-400" /> {product.rating.toFixed(1)}
          </span>
        </div>

        <h3 className="mt-2 line-clamp-2 min-h-10 text-[15px] font-bold leading-5 tracking-tight text-card-foreground">{product.name}</h3>
        <p className="mt-1.5 line-clamp-2 min-h-9 text-xs leading-[1.125rem] text-muted-foreground">{product.shortDescription}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="text-[10px] text-muted-foreground">From</p>
            <p className="text-base font-black tracking-tight">{soldOut ? 'Unavailable' : currency.format(selectedVariant.price)}</p>
          </div>
          <span className="grid size-8 shrink-0 place-items-center rounded-full border border-border/70 transition group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
            <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </button>
    </article>
  );
}
